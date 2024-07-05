export const singleSw = `importScripts('/dynamic/dynamic.config.js');
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
)`
export const multipleSW = `
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
      const url = new URL(\`http://\${input}\`); 
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
`;
export const multipleSW2 = `const proxySetting = localStorage.getItem("proxy") ?? 'uv'; // Using nullish coalescing operator for default value

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
      const url = new URL(\`http://\${input}\`
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
`
