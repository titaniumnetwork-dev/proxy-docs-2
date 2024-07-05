---
title: Ultraviolet Changelogs
description: A list of all the changes made to Ultraviolet
sidebar:
    order: 2
---



## Changelog

# 3.0.0

-   This version of Ultraviolet has support for using [bare-mux](https://github.com/MercuryWorkshop/bare-mux) transports, allowing for use for other implementations like [EpoxyTransport](https://github.com/MercuryWorkshop/EpoxyTransport), [CurlTransport](https://github.com/MercuryWorkshop/CurlTransport), and the existing implementation [Bare-Client](https://github.com/MercuryWorkshop/Bare-as-module3).

# v2.0.0

-   This version of Ultraviolet has support for Bare server v3
-   Support for older Bare servers was dropped.

# v1.0.10

-   This version of Ultraviolet fixes an NPM versioning error.

# v1.0.8

-   This version of Ultraviolet improves error messages.

# v1.0.7

-   This version of Ultraviolet correctly sets the `cache` option when making a request.

# v1.0.6

-   This version of Ultraviolet upgrades [@tomphttp/bare-client](https://www.npmjs.com/package/@tomphttp/bare-client). As a result, refreshing can fix errors with the Bare metadata being fetched.

# v1.0.5

-   This version of Ultraviolet fixes a minor bug with `blob:` URLs.

### v1.0.4

Massive rework for Ultraviolet! Improvements to resource usage, performance and overall site support.
TODO!

### v1.0.2

This package now targets CommonJS.

### v1.0.1

In your `sw.js` script, you MUST import `uv.bundle.js` then `uv.config.js` in order. This is because we can no longer hard-code the paths. Ideally, we would import `uv.config.js` then use the config.bundle path in the serviceworker, however the config is dependant on `uv.bundle.js`, which we don't know the location to.

Old:

```js
importScripts("./uv/uv.sw.js");

const sw = new UVServiceWorker();

self.addEventListener("fetch", (event) => event.respondWith(sw.fetch(event)));
```

New:

```diff
+ importScripts('./uv/uv.bundle.js');
+ importScripts('./uv/uv.config.js');
importScripts('./uv/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', event =>
    event.respondWith(
        sw.fetch(event)
    )
);
```

You are still required to specify all paths in `uv.config.js`.
