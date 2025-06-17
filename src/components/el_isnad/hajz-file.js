import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";

class FileDownloadManager {
  constructor() {
    this.selectedTeachers = new Set();
    this.professorList = [];
    this.baseDownloadUrl = "https://amatti.education.dz/saisie_excel";
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener("click", (event) => this.handleClick(event));
    document.addEventListener("change", (event) => {
      if (event.target.classList.contains("teacher-select")) {
        this.handleTeacherSelection(event);
      }
    });
  }

  async handleClick(event) {
    const { classList } = event.target;

    const actions = {
      hajzFileModal: () => this.loadProfessorList(),
      multipleDownloadBtn: () => this.downloadSelectedFiles(),
      allDownloadBtn: () => this.downloadAllFiles(),
      oneDownloadBtn: (e) => this.downloadSingleFile(e),
    };

    for (const [className, action] of Object.entries(actions)) {
      if (classList.contains(className)) {
        try {
          await action(event);
        } catch (error) {
          this.handleError(error);
        }
        break;
      }
    }
  }

  async fetchProfessorData() {
    try {
      const trim = document.querySelector("#annee_school").value;
      const response = await _.fetchData("combo_prof", { annee: trim }, "text");
      const parser = new DOMParser();
      const options = Array.from(
        parser.parseFromString(response, "text/html").querySelectorAll("option")
      ).slice(1);
      return options;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  async loadProfessorList() {
    try {
      const data = await this.fetchProfessorData();
      this.professorList = data;

      const tableRows = data
        .map(
          (option, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${option.textContent}</td>
          <td>
            <button class="h-28 btn btn-dark oneDownloadBtn" data-value="${
              option.value
            }">تحميل</button>
          </td>
          <td>
            <input 
              class="teacher-select" 
              type="checkbox" 
              value="${option.value}"
              style="width: 20px; height: 20px;"
            >
          </td>
        </tr>
      `
        )
        .join("");

      document.getElementById("teacherList").innerHTML = tableRows;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleTeacherSelection(event) {
    const { value, checked } = event.target;
    if (checked) {
      this.selectedTeachers.add(value);
    } else {
      this.selectedTeachers.delete(value);
    }
  }

  async downloadSelectedFiles() {
    if (this.selectedTeachers.size === 0) {
      notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء تحديد الأساتذة أولاً",
      });
      return;
    }

    await this.downloadFiles([...this.selectedTeachers]);
    this.clearSelection();
  }

  async downloadAllFiles() {
    const values = this.professorList.map((item) => item.value);
    await this.downloadFiles(values);
  }

  downloadSingleFile(event) {
    const value = event.target.dataset.value;
    const trim = document.querySelector("#annee_school").value;
    console.log(trim);
    this.initiateDownload(`${trim}/${value}`);
  }

  async downloadFiles(items) {
    notify.toast({
      type: "warning",
      color: "warning",
      message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    const trim = document.querySelector("#annee_school").value;

    try {
      for (const item of items) {
        this.initiateDownload(`${trim}/${item}`);
        await _.sleep(1000);
      }

      notify.toast({
        type: "done",
        color: "success",
        message: "انتهت العملية بنجاح",
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  initiateDownload(path) {
    console.log(path);
    const link = document.createElement("a");
    link.href = `${this.baseDownloadUrl}/${path}`;
    link.download = "download";
    link.click();
  }

  clearSelection() {
    this.selectedTeachers.clear();
    document.querySelectorAll(".teacher-select").forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  handleError(error) {
    console.error("Error:", error);
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء العملية",
    });
  }
}

// Initialize the file download manager
new FileDownloadManager();
