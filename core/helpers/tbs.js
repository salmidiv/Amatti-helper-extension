class Tabs {
  constructor(menu, content) {
    this.tabs = document.querySelectorAll(menu); // menu
    this.tab = document.querySelectorAll(menu + ".tab-link "); // links
    this.panel = document.querySelectorAll(content); // content
    this.init();
  }

  init() {
    this.tab.forEach((tab) => {
      tab.addEventListener("click", this.onTabClick.bind(this));
    });
  }

  onTabClick(event) {
    // Deactivate existing active tabs and panels
    this.tab.forEach((tab) => {
      tab.classList.remove("active");
    });

    this.panel.forEach((panel) => {
      panel.classList.remove("active");
    });

    // Activate new tab and panel
    event.target.classList.add("active");
    let classString = event.target.getAttribute("data-tab");
    document
      .getElementById("panels")
      .getElementById(classString)
      .classList.add("active");
  }
}

const tabsInstance = new Tabs();
