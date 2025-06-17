import { extension_url, segments } from "../helpers/const.js";
import { _ } from "../helpers/helpers.js";
import { temp } from "../helpers/template.js";

export class Route {
  constructor() {
    this.routes = {};
    this.bodyTag = document.documentElement;
    this.body = document.body;
    this.amattiTag = "";
  }

  addRoutes(routes) {
    this.routes = { ...this.routes, ...routes };
  }

  async handleRoute(pathname) {
    pathname = _.decodeURL(pathname);
    const matchedRoute = this.findMatchingRoute(pathname);
    if (!matchedRoute) return null;

    const route = this.routes[matchedRoute];

    const html = await this.loadFile(`views/${route.Path}.html`);

    return { html, route };
  }

  findMatchingRoute(pathname) {
    return Object.keys(this.routes).find((route) => {
      const value = this.routes[route];
      let routeSegments = "";
      let segments = "";
      if (value.amatti && pathname.includes(route)) {
        segments = [pathname.split("/").filter((segment) => segment !== "")[0]];
        routeSegments = route.split("/").filter((segment) => segment !== "");
      } else {
        segments = pathname.split("/").filter((segment) => segment !== "");
        segments =
          typeof value.uri === "number"
            ? segments.slice(0, value.uri)
            : segments;
        routeSegments = route.split("/").filter((segment) => segment !== "");
      }
      if (segments.length !== routeSegments.length) return false;
      const params = {};
      for (let i = 0; i < segments.length; i++) {
        if (routeSegments[i][0] === ":") {
          params[routeSegments[i].slice(1)] = segments[i];
        } else if (segments[i] !== routeSegments[i]) {
          return false;
        }
      }

      return params;
    });
  }

  async loadFile(filePath, type = "text") {
    try {
      const response = await fetch(`${extension_url}/src/${filePath}`);
      return type === "text" ? await response.text() : await response.json();
    } catch (error) {
      console.error(`Error fetching file ${filePath}:`, error);
      // Handle the error appropriately
    }
  }

  async fetchUrl(url, type = "json") {
    try {
      const response = await fetch(url);
      return type === "text"
        ? await response.text()
        : type === "json"
        ? await response.json()
        : await response.arrayBuffer();
    } catch (error) {
      console.error(`Error fetching URL ${url}:`, error);
      // Handle the error appropriately
    }
  }

  async loadJS(filePath, defer = "") {
    const script = document.createElement("script");
    script.src = `${extension_url}/src/components/${filePath}.js`;
    script.classList.add("myModal");
    script.type = "module";
    // if (defer) script.defer = true;
    document.head.appendChild(script);
  }
  async loadJQuery() {
    const script = document.createElement("script");
    script.src = `${extension_url}/assets/js/jquery-3.6.2.min.js`;
    // if (defer) script.defer = true;
    document.head.appendChild(script);
  }

  async fetchFile(path) {
    const html = await this.loadFile(`views/${path}.html`, "text");
    return html;
  }

  async loadModal(filePath, id, idInsideFile) {
    const content = await this.fetchFile(filePath);
    id.innerHTML += content;
    if (id.innerHTML.trim().includes(idInsideFile)) {
      await this.loadJS(filePath);
    }
  }
  build(id) {
    _.afterbody(id, temp);
    _.html(version, localStorage.app_version);
  }

  run() {
    if (segments[1] !== "") {
      const id = segments[1] === "home_page" ? "hosting" : "principle";
      if (_.getid(id)) {
        _.afterbody(id, temp);
        _.html(version, localStorage.app_version);
      }
    }
  }

  async start() {
    const routeData = await this.handleRoute(window.location.pathname);
    if (!routeData) return;
    if (routeData.route.amatti) {
      this.build(this.body);
    }
    const amattiTag = document.getElementById("amattiContent");
    const element = routeData.route.page ? this.bodyTag : amattiTag;
    element.innerHTML = routeData.html;
    const modals = _.qSelAll(".myModal");
    if (routeData.route.jquery) this.loadJQuery();
    this.loadJS(routeData.route.Path, "defer");
  }
}
const route = new Route();
export { route };
