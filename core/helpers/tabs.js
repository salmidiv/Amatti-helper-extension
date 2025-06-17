class Tabs {
  constructor(tabSelector) {
    this.tabs = document.querySelectorAll(tabSelector);
    this.init();
  }

  init() {
    this.tabs.forEach((tab) => {
      const tabId = tab.getAttribute("data-tab-id");
      const tabs = tab.querySelectorAll(".tab");
      const panels = document.querySelectorAll(
        `[data-tab-id="${tabId}"] .panel`
      );

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          this.activateTab(tab, tabs, panels, tabId);
        });
      });
    });
  }

  activateTab(selectedTab, allTabs, allPanels, tabId) {
    const tabTarget = selectedTab.getAttribute("data-target");

    allTabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    const tabsToActivate = Array.from(allTabs).filter(
      (tab) => tab.getAttribute("data-target") === tabTarget
    );

    const panels = Array.from(allPanels).filter(
      (panel) => panel.getAttribute("data-tab-id") === tabId
    );

    tabsToActivate.forEach((tab) => {
      tab.classList.remove("active");
    });

    panels.forEach((panel) => {
      panel.classList.remove("active");
    });

    selectedTab.classList.add("active");

    const target = selectedTab.getAttribute("data-target");
    const panelToActivate = panels.find((panel) =>
      panel.classList.contains(target)
    );

    if (panelToActivate) {
      panelToActivate.classList.add("active");
    }
  }
}

export default Tabs;
