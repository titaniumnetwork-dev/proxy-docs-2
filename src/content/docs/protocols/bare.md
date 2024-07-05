---
title: TompHTTP Bare
description: All about the Bare protocols
sidebar: 
    order: 1
---

## TOMPHTTP Specifications
# NOTE: TompHTTP IS NO LONGER SUPPORTED BY US IN FAVOR OF [**Wisp**](/protocols/wisp/)

[**GitHub**](https://github.com/tomphttp)

## What is TOMP?

TOMP (acronym for Too Many Proxies) is an organization containing new standards and implementations for web proxies built on Service Workers.

## Why should I use the TOMP specifications?

Many proxies have been successful without following any specifications. Although the proxies may run very well, there is no unified backend or protocol. Prior to the TOMP model, if you wanted to set up 10 proxies, you needed to set up 10 servers. The TOMP model accomplishes a unified backend. In practice, you can have 10 implementations that use only one bare server, saving not only resources but the maintenance required for multiple servers.

Creating specifications allows for productivity. One developer can implement the TOMP model without having to write an entire backend, instead they can set up a Bare Server. This not only saves valuable time but allows the developer to focus more on the code they write, not HTTP/S frameworks or URL parsing libraries.

### Listing

[Bare Server](#bare-server)

[Proxy Model](#proxy-model)

[WebSocket Protocol](#websocket-protocol-encoding)

## Planning

Although we take issues and pull requests, a lot of planning for new specifications happens in our [Discord server](https://discord.gg/6m9saxJQPh).

## List of implementations

https://github.com/tomphttp/implementations

# Bare Server

The TompHTTP Bare Server is a server that will receive requests from a service worker (or any client) and forward a request to the specified URL.

Bare Servers can run on directories. For example, if the directory was `/bare/` then the bare origin would look like `http://example.org/bare/`. The bare origin is passed to clients.

- [Errors](#errors)
- [V1 Endpoints](#bare-server-v1-endpoints)
- [V2 Endpoints](#bare-server-v2-endpoints)
- [V3 Endpoints](#bare-server-v3-endpoints)

# Considerations when running an implementation under NGINX, Apache2, or Lighttpd

Due to the nature of header values being large, you must configure your web server to allow these large headers.

NGINX:

```
server {
	# ...
	# Upgrade WebSockets
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection 'Upgrade';
	# Increase header buffer
	proxy_connect_timeout 10;
	proxy_send_timeout 90;
	proxy_read_timeout 90;
	proxy_buffer_size 128k;
	proxy_buffers 4 256k;
	proxy_busy_buffers_size 256k;
	proxy_temp_file_write_size 256k;
	# proxy_pass http://localhost:8001;
	# ...
}
```

## Request server info

| Method | Endpoint |
| ------ | -------- |
| `GET`  | /        |

This endpoint is not subject to change. It will remain the same across versions.

Response Headers:

```
Content-Type: application/json
```

Response Body:

```json
{
  "versions": ["v1", "v2"],
  "language": "NodeJS",
  "memoryUsage": 1.04,
  "maintainer": {
    "email": "maintenance@example.org",
    "website": "https://projects.example.org/"
  },
  "project": {
    "name": "Project",
    "description": "Unique TOMP implementation",
    "email": "development@example.org",
    "website": "https://git.example.org/",
    "repository": "https://git.example.org/dev/project.git",
    "version": "1.0.0"
  }
}
```

A ? after the property indicates it's optional.

- maintainer {Object}?
  - email {String}?
  - website {String}?
- project {Object}?: The project's information.
  - name {String}?
  - description {String}?
  - email {String}?
  - website {String}?
  - repository {String}?: A link to the project's .git file.
  - version {String}?: The [semver](https://semver.org/) version number of this project's backend.
- versions {Array{String}}: A list of version names this server supports. (resolvable to http://server/versionName/)
- language {String{NodeJS,Deno,Bun,ServiceWorker,Java,PHP,Rust,C,C++,C#,Ruby,Go,Crystal,Shell}}: The runtime. "language" is kept for legacy purposes.
- memoryUsage {Number}?: The memory used by the server in base MB.

In NodeJS, memoryUsage should be calculated by:

```js
Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
```

## Proxy Model

This is merely a guideline for how you should create your service worker. As long as you follow the Bare server specifications, any implementation is fine.

The TompHTTP Proxy Model has 3 components:

### Bare Server

See [BareServer.md](https://github.com/tomphttp/specifications/blob/master/BareServer.md) for specifications.

The Bare server must provide an origin that will faciliate making requests to a remote server. The server will return unmodified data (i.e no decompression, the content-encoding header is passed directly to the response), leaving the work of rewriting and processing headers to the service worker.

### Service worker

The Service worker will intercept requests from the client. The requests will either contain a directive or be part of a directive to a certiain resource. For example, in Stomp:

`/${SCOPE}/${ASSET}/${URL}`

- scope: `/service/`
- asset: `html`
- url: `https://sys32.dev/`

`/service/html/https%3A%2F%2Fsys32.dev%2F`

The URL was encoded using `encodeURIComponent` for safety with various webservers such as NGINX, Heroku, Repl.it, etc... These services may replace `https://sys32.dev` with `https:/sys32.dev`, breaking the URL.

The URL should contain fields that correspond to fields used when making a request to the Bare server:

- Host: `sys32.dev`
- Port: `443`
- Protocol: `https:`
- Path: `/`

Some logic used to match these components may look like:

```js
// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/registration
// Find out our current scope.
const { scope } = registration;

const splitURL = /^(js|css)\/(.*?)$/;

async function onFetch(request) {
  // isolate the content after /scope/ in the URL
  const sliced = request.url.slice(scope);
  // request.url = `http://localhost/scope/js/https%3A%2F%2Fsys32.dev%2F`
  // sliced = `js/https%3A%2F%2Fsys32.dev%2F`
  const [, service, url] = sliced.match(splitURL) || [];

  if (!service || !url) return new Response("Unknown URL", { status: 404 });

  const decodedURL = new URL(decodeURIComponent(url));

  // Do logic according to service...
}
```

### How it will look

You should attempt to produce an identical website (CSS, HTML, JS) by leveraging rewriting scripts. We recommend the following libraries:

- [parse5](https://www.npmjs.com/package/parse5)
- [meriyah](https://www.npmjs.com/package/meriyah)
- [acorn-loose](https://www.npmjs.com/package/acorn-loose)
- [magic-string](https://www.npmjs.com/package/magic-string) (used with acorn-loose)
- [@javascript-obfuscator/escodegen](https://www.npmjs.com/package/@javascript-obfuscator/escodegen)

Ideally, you want to take an approach where you only replace portions of the JavaScript code, instead of wasting resources re-generating it. Acorn-loose will sometimes produce invalid JS, however you will end up only replacing the JavaScript that is valid, which works flawlessly with magic-string.

You will end up rewriting request/response headers to produce an identical request/response as if the website were natively running.

#### Utilizing the Bare server

We recommend our official [Bare client package on NPM](https://www.npmjs.com/package/@tomphttp/bare-client). You may use this library in a variety of ways:

- import/require via modular service workers, rollup, and webpack 👍
- `<script>`/`importScripts()` 👍
- Embed in your service worker... 👎

We HIGHLY encourage you to make the Bare server URL configurable. If possible, allow the configuration to run logic in order to produce a Bare server URL.

### Client

Hook JavaScript functions that will create a request.

Such as `fetch(url, opts)`, `XMLHttpRequest.prototype.open(method, url, ...etc)`.

JS apis will have their responses unrewritten, and may contain data that calling `res.text()` will result in being lost. Run logic to determine what to convert the response to.

Example:

- `/xhr/`: Don't touch the response. Use `new Response(res.body)` to produce a response with the body being piped. Loads `fetch()`, `XMLHttpRequest`, and images.
- `/js/`: Covert to a string using `res.text()` then rewrite.
- `/css/`: Covert to a string using `res.text()` then rewrite.
- `/html/`: Covert to a string using `res.text()` then rewrite.

## WebSocket Protocol Encoding

[Implementation](https://github.com/tomphttp/specifications/blob/master/encodeProtocol.js)

This encoding is similar to URIComponent encoding.

The `Sec-WebSocket-Protocol` header contains protocols. Protocol values have a [character set](#websocket-protocol-characters). In cases when TompHTTP requires characters outside this range in protocols, this encoding is used.

### Encoding

Each character in a string is checked if its in the [character set](#websocket-protocol-characters) or a [reserved character](#reserved-characters).

If this condition is met, the character is replaced with an escaped value. An escaped value is a percent symbol (`0x37`, ASCII) followed by the characters hexadecimal code. For example: the string `1/100%` would become `1%2F100%25`.

### Decoding

Each character in a string is iterated over. If the character begins with `%` then it is assumed the next 2 characters will be a hexadecimal code. The hexadecimal will be read then the `%` symbol and the next 2 characters will be replaced with the character belonging to the hexadecimal code.

## Reserved Characters

`%`

## WebSocket Protocol Characters

```
!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ^_`abcdefghijklmnopqrstuvwxyz|~
```

ASCII characters. 77 Total.

## Errors

Errors returned by the Bare Server are returned when the server cannot process the request or ran into an error.

Identifying errors:

- Not a 2xx/3xx status code
- `Content-Type: application/json`

### Format

```json
{
  "code": "UNKNOWN",
  "id": "request",
  "message": "The Bare Server encountered an unknown error relating to the request."
}
```

A ? after the property indicates it's optional.

- code {String}
- id {String}
- message {String}?
- stack {String}?: An optional stack trace.

### Error Codes

Error codes prefixed with `IMPL_` are not part of this specification. The implementer decides what the code represents.

- `UNKNOWN` {500}: The Bare Server could not identify the cause of the issue. This error is a fallback.
- `MISSING_BARE_HEADER` {400}: The request did not include a required bare header such as X-Bare-Host. `error.id` will contain the expected header.
- `INVALID_BARE_HEADER` {400}: A header such as X-Bare-Port contained an unparsable/invalid value.
- `FORBIDDEN_BARE_HEADER` {401}: A forbidden value such as `Host` in x-bare-pass-headers was specified.
- `UNKNOWN_BARE_HEADER` {400}: An unknown header beginning with `X-Bare-` was sent to the server.
- `FORBIDDEN_BARE_HEADER` {403}: A header such as X-Bare-Pass-Headers contained a forbidden value.
- `INVALID_HEADER` {400}: The Bare Server's HTTP implementation forbids a header value. `error.id` will contain the expected header.
- `HOST_NOT_FOUND` {500}: The DNS lookup for the host failed.
- `CONNECTION_RESET` {500}: The connection to the remote was closed before receving the response headers. This occurs after connecting to the socket or after sending the request headers.
- `CONNECTION_REFUSED` {500}: The connection to the remote was refused.
- `CONNECTION_TIMEOUT` {500}: The remote didn't respond with headers/body in time.

### Error IDs

Error IDs are in `<object>?.<key>` format.

### Objects

- `error`: A container for types such as Exception,TypeError,Error,SyntaxError
- `unknown`
- `request`: The client's HTTP implementation.
- `request.headers`
- `request.body` {No key}
- `bare`: The Bare fields provided by the request headers.
- `bare.headers`
- `bare.forward_headers`
- `response`: The remote's HTTP implementation.
- `response.headers`
- `response.body` {No key}

### Keys

Keys are optional. The object could be `request.headers` and this will reference the headers, not any in specific. `request.headers.host` will refer to the host header.

### Example of keys

- `request.headers.x-bare-headers`
  - Object: `request.headers`
  - Key: `x-bare-headers`
- `bare.headers.x-custom_header`
  - Object: `bare.headers`
  - Key: `x-custom_header`
- `bare.headers.x-custom.header.a`
  - Object: `bare.headers`
  - Key: `x-custom.header.a`

## Bare Server V1 Endpoints

All endpoints are prefixed with `/v{version}/`

The endpoint `/` on V1 would be `/v1/`

### Request the server to fetch a URL from the remote.

| Method | Endpoint |
| ------ | -------- |
| `*`    | /        |

Request Body:

The body will be ignored if the request was made as `GET`. The request body will be forwarded to the remote request made by the bare server.

Request Headers:

```
X-Bare-Host: example.org
X-Bare-Port: 80
X-Bare-Protocol: http:
X-Bare-Path: /index.php
X-Bare-Headers: {"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"}
X-Bare-Forward-Headers: ["accept-encoding","accept-language"]
```

The headers below are required. Not specifying a header will result in a 400 status code. All headers are not tampered with, whatever is specified will go directly to the destination.

- X-Bare-Host: The host of the destination WITHOUT the port. This would be equivalent to `URL.hostname` in JavaScript.
- X-Bare-Port: The port of the destination. This must be a valid number. This is not `URL.port`, rather the client needs to determine what port a URL goes to. An example of logic done a the client: the protocol `http:` will go to port 80 if no port is specified in the URL.
- X-Bare-Protocol: The protocol of the destination. V1 bare servers support `http:` and `https:`. If the protocol is not either, this will result in a 400 status code.
- X-Bare-Path: The path of the destination. Be careful when specifying a path without `/` at the start. This may result in an error from the remote.
- X-Bare-Headers: A JSON-serialized object containing request headers. Request header names may be capitalized. When making the request to the remote, capitalization is kept. Consider the header capitalization on `HTTP/1.0` and `HTTP/1.1`. Sites such as Discord check for header capitalization to make sure the client is a web browser.
- X-Bare-Forward-Headers: A JSON-serialized array containing names of case-insensitive request headers to forward to the remote. For example, if the client's useragent automatically specified the `Accept` header and the client can't retrieve this header, it will set X-Bare-Forwarded-Headers to `["accept"]`. The Bare Server will read the `accept` header from the request headers (not X-Bare-Headers`) and add it to the headers sent to the remote. The server will automatically forward the following headers: Content-Encoding, Content-Length, Transfer-Encoding

The headers below are optional and will default to `[]` if they are not specified. They are intended to be used for caching purposes.

- X-Bare-Pass-Headers: A JSON-serialized array of case-insensitive headers. If these headers are present in the remote response, the values will be added to the server response.
  The list must not include the following: `vary`, `connection`, `transfer-encoding`, `access-control-allow-headers`, `access-control-allow-methods`, `access-control-expose-headers`, `access-control-max-age`, `access-control-request-headers`, `access-control-request-method`.
- X-Bare-Pass-Status: A JSON-serialized array of HTTP status codes, like 204 and 304. If the remote response status code is present in this list, the server response status will be set to the remote response status.

Response Headers:

```
Content-Encoding: ...
Content-Length: ...
X-Bare-Status: 200
X-Bare-Status-text: OK
X-Bare-Headers: {"Content-Type": "text/html"}
```

- Content-Encoding: The remote body's content encoding.
- Content-Encoding: The remote body's content length.
- X-Bare-Status: The status code of the remote.
- X-Bare-Status-Text: The status text of the remote.
- X-Bare-Headers: A JSON-serialized object containing remote response headers. Response headers may be capitalized if the remote sent any capitalized headers.

Response Body:

The remote's response body will be sent as the response body.

A random character sequence used to identify the WebSocket and it's metadata.

### Request a new WebSocket ID.

| Method | Endpoint     |
| ------ | ------------ |
| `GET`  | /ws-new-meta |

Response Headers:

```
Content-Type: text/plain
```

Response Body:

The response is a unique sequence of hex encoded bytes.

```
ABDCFE009023
```

### Request the server to create a WebSocket tunnel to the remote.

| Method | Endpoint |
| ------ | -------- |
| `GET`  | /        |

Request Headers:

```
Upgrade: websocket
Sec-WebSocket-Protocol: bare, ...
```

- Sec-WebSocket-Protocol: This header contains 2 values: a dummy protocol named `bare` and an encoded, serialized, JSON object.

The JSON object looks like:

```json
{
  "remote": {
    "host": "example.org",
    "port": 80,
    "path": "/ws-path",
    "protocol": "ws:"
  },
  "headers": {
    "Origin": "http://example.org",
    "Sec-WebSocket-Protocol": "original_websocket_protocol"
  },
  "forward_headers": [
    "accept-encoding",
    "accept-language",
    "sec-websocket-extensions",
    "sec-websocket-key",
    "sec-websocket-version"
  ],
  "id": "UniqueID_123"
}
```

This serialized JSON is then encoded. See [WebSocketProtocol.md](https://github.com/tomphttp/specifications/blob/master/WebSocketProtocol.md) for in-depth on this encoding.

- remote {Object}: An object similar to `X-Bare-` headers used when making a request.
- headers {Object}: An object similar to `X-Bare-headers`
- forward_headers {Array}: An array similar to `X-Bare-Forward-Headers`. These are all lowercase but may reference capitalized headers.
- id {String}?: The unique id generated by the server. If this field isn't specified, no meta data will be stored, making the response headers inaccessible to the client.

Response Headers:

```
Sec-WebSocket-Accept: bare
```

Sec-WebSocket-Accept: The remote's accept header.

Sec-WebSocket-Protocol: The first value in the list of protocols the client sent.

All headers that aren't listed above are irrelevant. The WebSocket class in browsers can't access response headers.

Response Body:

The response is a stream, forwading bytes from the remote to the client. Once either the remote or client close, the remote and client will close.

### Request the metadata for a specific WebSocket

| Method | Endpoint |
| ------ | -------- |
| `GET`  | /ws-meta |

Request Headers:

```
X-Bare-ID: UniqueID_123
```

- X-Bare-ID: The unique ID returned by the server in the pre-request.

> ⚠ All WebSocket metadata is cleared after requesting the metadata or 30 seconds after the connection was established.

An expired or invalid X-Bare-ID will result in a 400 status code.

Response Headers:

```
Content-Type: application/json
```

Response Body:

```json
{
  "headers": {
    "Set-Cookie": ["Cookie", "Cookie"],
    "Sec-WebSocket-Accept": "original_websocket_protocol"
  }
}
```

## Bare Server V2 Endpoints

All endpoints are prefixed with `/v{version}/`

The endpoint `/` on V2 would be `/v2/`

### Header Lists

Bare Server V2 adapts header lists.

See [RFC 8941: Structured Field Values for HTTP](https://www.rfc-editor.org/rfc/rfc8941.html#section-3.1)

### Split Headers

See implementation at https://github.com/tomphttp/bare-server-node/blob/master/splitHeaderUtil.js

Due to very popular webservers forbidding very long header values, headers on V2 will be split. If x header value is over **3072** Bytes (3.5 KB), **do not expect a response from the server**. If the server receives the large header, it will send a a [`INVALID_BARE_HEADER`](#errors) error. If the server doesn't receive the header, the response may vary in status codes depending on the server.

Currently, header splitting only applies to X-Bare-Headers. Headers are split in both requests and responses. Split headers IDs begin from 0. A split header name looks like X-Bare-Split-ID. Every split value must begin with a semicolon, otherwise whitespace may be lost.

Example:

```
X-Bare-Headers-0: ;{"accept":"*/*","host":"example.com","sec-ch-ua":"\"(Not(A:Brand\";v=\"8\", \"Chromium\";v=\"100\""
X-bare-Headers-1: ;,"sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Linux\"","user-agent":"Mozilla/5.0 (X11; Linux x8
X-Bare-Headers-2: ;6_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4890.0 Safari/537.36"}
```

The receiver should iterate over the headers, sort by ID, then combine all the values into the target header.

### Forbidden values

X-Bare-Forward-Headers:

`connection`, `transfer-encoding`, `host`, `connection`, `origin`, `referer`

X-Bare-Pass-Headers:

`vary`, `connection`, `transfer-encoding`, `access-control-allow-headers`, `access-control-allow-methods`, `access-control-expose-headers`, `access-control-max-age`, `access-control-request-headers`, `access-control-request-method`

### Default values

Cache: If the query key `cache` is passed to any request endpoint, cache will be enabled. An effective query key value is a checksum of the protocol, host, port, and path. Any value is accepted.

X-Bare-Pass-Headers:

Cache:

`last-modified`, `etag`, `cache-control`

X-Bare-Forward-Headers:

`accept-encoding`, `accept-language`, `sec-websocket-extensions`, `sec-websocket-key`, `sec-websocket-version`

Cache:

`if-modified-since`, `if-none-match`, `cache-control`

X-Bare-Pass-Status:

Cache:

`304`

## Bare Request Headers v2

Example:

```
X-Bare-Port: 80
X-Bare-Protocol: http:
X-Bare-Path: /index.php
X-Bare-Headers: {"Host":"example.org","Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"}
```

- X-Bare-Port: The port of the destination. This must be a valid number and cannot be empty. An example of logic the client must do is: `const short port = protocol == "http:" ? 80 : 443;`
- X-Bare-Protocol: The protocol the server will use when creating a request. Valid values are: `http:`, `https:`
- X-Bare-Path: The server request path.
- X-Bare-Headers: A JSON-serialized object containing the server request headers. Request header names may be capitalized. When making the request to the remote, capitalization is kept. Consider the header capitalization on `HTTP/1.0` and `HTTP/1.1`. Sites such as Discord check for header capitalization to make sure the client is a web browser.
- **Optional:** X-Bare-Forward-Headers: A [list](#header-lists) of case-insensitive request headers to forward to the remote. For example, if the client's useragent automatically specified the `Accept` header and the client can't retrieve this header, the client should specify `Accept` as a forwarded header.
- **Optional:** X-Bare-Pass-Headers: A [list](#header-lists) of case-insensitive headers. If these headers are present in the remote response, the values will be added to the server response.
- **Optional:** X-Bare-Pass-Status: A [list](#header-lists) of HTTP status codes. If the remote response status code is present in this list, the server response status will be set to the remote response status.

## Bare Response Headers v2

```
Cache-Control: ...
ETag: ...
Content-Encoding: ...
Content-Length: ...
X-Bare-Status: 200
X-Bare-Status-text: OK
X-Bare-Headers: {"Content-Type": "text/html"}
```

- Content-Encoding: The remote body's content encoding.
- Content-Encoding: The remote body's content length.
- X-Bare-Status: The status code of the remote.
- X-Bare-Status-Text: The status text of the remote.
- X-Bare-Headers: A JSON-serialized object containing remote response headers. Response headers may be capitalized if the remote sent any capitalized headers.

## Send and receive data from a remote v2

| Method | Endpoint |
| ------ | -------- |
| `*`    | /        |

Request Body:

Request Headers:

See [Bare Request Headers](#bare-request-headers)

Response Headers:

See [Bare Response Headers](#bare-response-headers)

Response Body:

The remote's response body will be sent as the response body.

## Request a new WebSocket ID v2

Request headers are almost identical to `/` with the exception of protocol.

| Method | Endpoint     |
| ------ | ------------ |
| `GET`  | /ws-new-meta |

See [Bare Request Headers](#bare-request-headers)

Example:

```
X-Bare-Host: example.org
X-Bare-Port: 80
X-Bare-Protocol: ws:
X-Bare-Path: /websocket
X-Bare-Headers: {"Host":"example.org","Upgrade":"WebSocket","Origin":"http://example.org","Connection":"upgrade"}
```

Response Headers:

```
Content-Type: text/plain
```

Response Body:

A random WebSocket-protocol-safe character sequence used to identify the WebSocket and it's metadata.

```
ABDCFE009023
```

## Create a WebSocket tunnel to a remote v2

| Method | Endpoint |
| ------ | -------- |
| `GET`  | /        |

Request Headers:

```
Upgrade: websocket
Sec-WebSocket-Protocol: bare, ...
```

Sec-WebSocket-Protocol: The protocol is the meta ID.

Response Body:

The response is a stream, forwading bytes from the remote to the client. Once either the remote or client close, the remote and client will close.

## Receive metadata for a specific WebSocket v2

| Method | Endpoint |
| ------ | -------- |
| `GET`  | /ws-meta |

Request Headers:

```
X-Bare-ID: UniqueID_123
```

- X-Bare-ID: The unique ID returned by the server in the pre-request.

> ⚠ All WebSocket metadata is cleared after requesting the metadata or 30 seconds after the connection was established.

An expired or invalid X-Bare-ID will result in a 400 status code.

Response Headers:

See [Bare Response Headers](#bare-response-headers)

## Bare Server V3 Endpoints

All endpoints are prefixed with `/v{version}/`

The endpoint `/` on v3 would be `/v3/`

This is an extension of [V2](#bare-server-v2-endpoints).

## Endpoints dropped from V2

- `/ws-new-meta`
- `/ws-meta`

## Header Lists

See [V2 Header Lists](#bare-server-v2-endpoints)

## Split Headers

See [V2 Split Headers](#bare-server-v2-endpoints)

## Forbidden Values

See [V2 Forbidden Values](#bare-server-v2-endpoints)

## Base Values

All headers here are the base values. If a request specifies any of these headers, their value will add onto the base values (depending on if caching is enabled).

> Cache: If the query key `cache` is passed to any request endpoint, cache will be enabled. An effective query key value is a checksum of the protocol, host, port, and path. Any value is accepted.

- X-Bare-Pass-Headers:

  Value: `content-encoding`, `content-length`, `last-modified`

  Value with caching: `content-encoding`, `content-length`, `last-modified`, `if-modified-since`, `if-none-match`, `cache-control`

- X-Bare-Forward-Headers:

  Headers dropped from V2: `sec-websocket-extensions`, `sec-websocket-key`, `sec-websocket-version`

  Value: `accept-encoding`, `accept-language`

  Value with caching: `accept-encoding`, `accept-language`, `if-modified-since`, `if-none-match`, `cache-control`

- X-Bare-Pass-Status:

  Value: none

  Value with caching: `304`

### Example

See [V2 Base Values Example](#bare-server-v2-endpoints)

## Bare Request Headers

Headers dropped from V2: X-Bare-Host, X-Bare-Port, X-Bare-Protocol, X-Bare-Path

These headers have been replaced with X-Bare-URL

Example:

```
X-Bare-URL: http://example.org/index.php
X-Bare-Headers: {"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"}
```

- X-Bare-URL: A URL to the destination in accordance with [RFC1738](https://www.rfc-editor.org/rfc/rfc1738). Only accepted protocols are: `http:` and `https:`.
- X-Bare-Headers: A JSON-serialized object containing the server request headers. Request header names may be capitalized. When making the request to the remote, capitalization is kept. Consider the header capitalization on `HTTP/1.0` and `HTTP/1.1`. Sites such as Discord check for header capitalization to make sure the client is a web browser. Headers correspond to this TypeScript type: `Record<string, string | string[]>`.
- **Optional:** X-Bare-Forward-Headers: A [list](#header-lists) of case-insensitive request headers to forward to the remote. For example, if the client's useragent automatically specified the `Accept` header and the client can't retrieve this header, the client should specify `Accept` as a forwarded header.
- **Optional:** X-Bare-Pass-Headers: A [list](#header-lists) of case-insensitive headers. If these headers are present in the remote response, the values will be added to the server response.
- **Optional:** X-Bare-Pass-Status: A [list](#header-lists) of HTTP status codes. If the remote response status code is present in this list, the server response status will be set to the remote response status.

## Bare Response Headers

```
Cache-Control: ...
ETag: ...
Content-Encoding: ...
Content-Length: ...
X-Bare-Status: 200
X-Bare-Status-text: OK
X-Bare-Headers: {"Content-Type": "text/html"}
```

- Content-Encoding: The remote body's content encoding.
- Content-Length: The remote body's content length.
- X-Bare-Status: The status code of the remote.
- X-Bare-Status-Text: The status text of the remote.
- X-Bare-Headers: A JSON-serialized object containing remote response headers. Response headers may be capitalized if the remote sent any capitalized headers.

## Send and receive data from a remote

| Method | Endpoint |
| ------ | -------- |
| `*`    | /        |

Request Body:

Request Headers:

See [Bare Request Headers](#bare-request-headers)

Response Headers:

See [Bare Response Headers](#bare-response-headers)

Response Body:

The remote's response body will be sent as the response body.

## Create a WebSocket tunnel to a remote

| Method | Endpoint |
| ------ | -------- |
| `GET`  | /        |

Request Headers:

```
Upgrade: websocket
```

Response Body:

The response is a WebSocket. The server will accept the WebSocket and begin doing a handshake.

A handshake will look like this:

1. The client will inform the server of the destination it wants to connect to and provide request headers and headers to forward.

   ```json
   {
     "type": "connect",
     "remote": "ws://localhost:8000/ws",
     "protocols": [],
     "headers": {
       "Origin": "http://localhost:8000",
       "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
       "Host": "localhost:8000",
       "Pragma": "no-cache",
       "Cache-Control": "no-cache",
       "Upgrade": "websocket",
       "Connection": "Upgrade"
     },
     "forwardHeaders": []
   }
   ```

   This message must be sent as a text frame, not binary data. Any other type of WebSocket frame is considered invalid and the server should terminate the connection.

   - `type`: The type of message. Only accepted value is `"connect"`.
   - `remote`: A WebSocket URL to the destination in accordance with [RFC1738](https://www.rfc-editor.org/rfc/rfc1738). Only accepted protocols are: `ws:` and `wss:`
   - `protocols`: A string array of all the protocols that the client supports.
   - `headers`: An object containing the server request headers. See X-Bare-Headers in [Bare Request Headers](#bare-request-headers).
   - `forwardHeaders`: A string array containing all the headers to forward from the request to the remote. See X-Bare-Forward-Headers in [Bare Request Headers](#bare-request-headers).

   > If this message is not received after an amount of time (determined by the implementation), the connection may be terminated by the server.

   > The server must terminate the connection if this message contains invalid JSON/is invalid (eg. type isn't "connect" or the types don't validate)

2. The server will establish a connection to the remote based on the values sent by the client in #1.

3. Once established, the server will send a message to the client informing it that it's now open.

   ```json
   {
     "type": "open",
     "protocol": "",
     "setCookies": []
   }
   ```

   - `type`: The type of message. Only accepted value is `"open"`.
   - `protocol`: The accepted protocol.
   - `setCookies`: A string array containing all the `set-cookie` headers sent by the remote. If there's no headers, this array is empty. If there's one, this array has one element. If there's multiple, this array has multiple elements.

4. **Pipe mode**

   Once the server has sent the "open" message to the client, it will begin forwarding messages from the destination back to the client. No acknowledgement is required because the server should be sending messages in order until it's at this stage.

   Closing:

   - When the destination WebSocket is closed, the server will close the client WebSocket. Close codes are ignored.
   - When the client WebSocket is closed, the server will close the destination WebSocket. Close codes are ignored.

   Messages:

   Message types must be preserved. If text is sent to the server, text will be sent to the client. If binary data is sent to the server, binary data will be sent to the client. Visa versa.

   - When the destination WebSocket sends a message to the server, the server will send the message to the client.
   - When the client WebSocket sends a message to the server, the server will send the message to the destination.

