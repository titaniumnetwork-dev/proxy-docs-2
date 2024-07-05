---
title: Multiple proxies
description: put whatever you want here ig
sidebar: 
    order: 1
---

## Setting up Multiple Proxies

If you want to have something where users can change a setting to swap what proxy does the proxying. There is multiple ways to do it.

#### Single ServiceWorker

Its possible to combine all of your proxies into 1 ServiceWorker. However if it is not done correctly, it can cause your entire proxy system to become broken. The way this functions is it checks the path you are requesting to, and determines the proxy to be used from there.
A typical setup looks like this:

*sw.js*
```javascript
importScripts('/dynamic/dynamic.config.js');
importScripts('/dynamic/dynamic.worker.js');
importScripts('dist/uv.bundle.js');
importScripts('dist/uv.config.js');
importScripts(__uv$config.sw || 'dist/uv.sw.js');

const uv = new UVServiceWorker();
const dynamic = new Dynamic();

self.dynamic = dynamic;

self.addEventListener('fetch',
    event => {
        event.respondWith(
            (async function() {
                if (await dynamic.route(event)) {
                    return await dynamic.fetch(event);
                }

                if (event.request.url.startsWith(location.origin + "/service/uv/")) {
                    return await uv.fetch(event);
                }

                return await fetch(event.request);
            })()
        );
    }
);
```
The example above was found [here](https://github.com/NebulaServices/Dynamic/tree/main/docs/examples/uv-dynamic-multi).
An example of a Proxy site that uses this system is [Nebula](https://https://nebulaproxy.io/)
#### Many ServiceWorkers, 1 Register

This system works like this, you have multiple proxies with each of them having their own ServiceWorker. What changes the Proxy is something like a LocalStorage variable. This is usually a safer method as long as the list is formatted correctly and all the information that it uses for it is correct. A typical setup looks like this: 

*index.js*
```javascript
const form = document.getElementById("uv-form");
const address = document.getElementById("uv-address");
const input = document.querySelector("input");

class crypts {
  static encode(str) {
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }

  static decode(str) {
    if (str.charAt(str.length - 1) === "/") {
      str = str.slice(0, -1);
    }
    return decodeURIComponent(
      str
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }
}

const proxySetting = localStorage.getItem("proxy") ?? 'uv'; // Using nullish coalescing operator for default value

const swConfig = {
  'uv': { file: '/@/sw.js', config: __uv$config },
  'scramjet': { file: '/$/sw.js', config: __scramjet$config }
};

const { file: swFile, config: swConfigSettings } = swConfig[proxySetting] ?? { file: '/@/sw.js', config: __uv$config };


var wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

async function setTransports() {
  const transports = localStorage.getItem("transports") || "epoxy";
  if (transports === "epoxy") {
    await BareMux.SetTransport("EpxMod.EpoxyClient", { wisp: wispUrl });
  } else if (transports === "libcurl") {
    await BareMux.SetTransport("CurlMod.LibcurlClient", { wisp: wispUrl });
  } else {
    await BareMux.SetTransport("EpxMod.EpoxyClient", { wisp: wispUrl });
  }
}

// Search function definition
function search(input) {
  input = input.trim();  // Trim the input to remove any whitespace
  // Retrieve the search engine URL template from localStorage or use default
  const searchTemplate = localStorage.getItem("search") || 'https://google.com/search?q=%s';

  try {
    // Try to treat the input as a URL
    return new URL(input).toString();
  } catch (err) {
    // The input was not a valid URL; attempt to prepend 'http://'
    try {
      const url = new URL(`http://${input}`);
      if (url.hostname.includes(".")) {
        return url.toString();
      }
      throw new Error('Invalid hostname');  // Force jump to the next catch block
    } catch (err) {
      // The input was not a valid URL - treat as a search query
      return searchTemplate.replace("%s", encodeURIComponent(input));
    }
  }
}
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(async () => {
      await setTransports()
    })
    navigator.serviceWorker.register(swFile, { scope: swConfigSettings.prefix })
      .then( async (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        form.addEventListener('submit', async (event) => {
          event.preventDefault();

          let encodedUrl = swConfigSettings.prefix + crypts.encode(search(address.value));
          location.href = encodedUrl;
        });
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  }
```

##### Ways to use the Many ServiceWorkers, 1 Register System with non-SW Proxies
Usually if you want to use a non-SW proxy like [Rammerhead](/rh/gettingstarted) with this system, you'd have to use a if, then, else statement and do something like this:

*index.js*
```javascript
const proxySetting = localStorage.getItem("proxy") ?? 'uv'; // Using nullish coalescing operator for default value

const swConfig = {
  'uv': { file: '/@/sw.js', config: __uv$config },
  'scramjet': { file: '/$/sw.js', config: __scramjet$config }
};

const { file: swFile, config: swConfigSettings } = swConfig[proxySetting] ?? { file: '/@/sw.js', config: __uv$config };


// Search function definition
function search(input) {
  input = input.trim();  // Trim the input to remove any whitespace
  // Retrieve the search engine URL template from localStorage or use default
  const searchTemplate = localStorage.getItem("search") || 'https://google.com/search?q=%s';

  try {
    // Try to treat the input as a URL
    return new URL(input).toString();
  } catch (err) {
    // The input was not a valid URL; attempt to prepend 'http://'
    try {
      const url = new URL(`http://${input}`);
      if (url.hostname.includes(".")) {
        return url.toString();
      }
      throw new Error('Invalid hostname');  // Force jump to the next catch block
    } catch (err) {
      // The input was not a valid URL - treat as a search query
      return searchTemplate.replace("%s", encodeURIComponent(input));
    }
  }
}

if (localStorage.getItem("proxy") === "rammerhead") {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
      const encodedUrl = await RammerheadEncode(search(address.value));
      location.href = encodedUrl;
  });
} else {
  //Use the normal version of this system in here
}
```

This method and example was made by [Night Network](https://discord.night-x.com). An example Proxy that uses an advanced version of this system is [Light](https://lightgo.app)