// basic data
localStorage.extension_id = chrome.runtime.id;
var manifestData = chrome.runtime.getManifest();
var app_version = manifestData.version;
localStorage.app_version = app_version;

/* first inject module scripts */
const nullthrows = (v) => {
  if (v == null) throw new Error("it's a null");
  return v;
};
function inject(src) {
  const script = document.createElement("script");
  script.src = src;
  script.type = "module";
  script.onload = function () {
    this.remove();
  };
  nullthrows(document.head || document.documentElement).appendChild(script);
}
inject(chrome.runtime.getURL("/assets/js/pdf-lib.min.js"));
inject(chrome.runtime.getURL("/assets/js/xlsx.full.min.js"));
inject(chrome.runtime.getURL("/core/db/conn.js"));
inject(chrome.runtime.getURL("/core/route/router.js"));
