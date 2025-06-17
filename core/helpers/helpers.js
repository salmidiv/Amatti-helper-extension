import { segments, full_link, extension_url, AMATTI_HOST } from "./const.js";
import { temp } from "../helpers/template.js";
import Tabs from "../../core/helpers/tabs.js";
import { notify } from "./notify.js";

export var PuSet = {
  noInternet: {
    enablePopup: "false",
    enableToast: "true",
    offlineMes: "هناك انقطاع في شبكة الأنترنيت",
    onlineMes: "تم الاتصال بشبكة الأنترنيت",
  },
};
class Helpers {
  set(name, value) {
    return localStorage.setItem(name, value);
  }
  get(name) {
    return localStorage.getItem(name);
  }
  check_online_connection() {
    this.btnEvent(window, "offline", () => {
      notify.toast({ type: "offline", message: PuSet.noInternet.offlineMes });
    });
    this.btnEvent(window, "online", () => {
      notify.toast({ type: "online", message: PuSet.noInternet.onlineMes });
    });
  }

  btnEvent(btn, type, fn) {
    btn.addEventListener(type, fn);
  }
  insertAfter(id, temp) {
    const element = document.getElementById(id);
    if (element) {
      // Check if element is found
      element.insertAdjacentHTML("afterbegin", `${temp}`);
    } else {
      id.insertAdjacentHTML("afterbegin", `${temp}`);
    }
  }
  afterbody(id, temp) {
    this.addNotify();
    return this.insertAfter(id, `${temp}`);
    // return this.insertAfter(id, `${temp}`);
  }
  insertBeforeBody(temp) {
    // Get reference to the <body> element
    var bodyElement = document.getElementsByTagName("body")[0];

    // Create a reference to the <html> element
    var htmlElement = document.getElementsByTagName("html")[0];

    // Insert the new element before the <body> tag
    htmlElement.insertBefore(temp, bodyElement);
  }
  addNotify() {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div id="notify" class="notify" style ="z-index:1000"></div>`
    );
  }
  afterbegin(id, temp) {
    return this.insertAfter(id, `${temp}`);
  }
  qSel = (t) => {
    return document.querySelector(t);
  };
  qSelAll = (t) => {
    return document.querySelectorAll(t);
  };
  getid = (t) => {
    return document.getElementById(t);
  };
  getclass = (t) => {
    return document.getElementsByClassName(t);
  };
  gAtr = (element, attribute) => {
    return element.getAttribute(attribute);
  };
  data = (element, attr) => {
    return this.qSel(element).dataset[attr];
  };
  tabs(tabs, tabs_content) {
    new Tabs(tabs, tabs_content);
  }
  html(b, d) {
    b.innerHTML = d;
  }
  equal(f, l) {
    return f == l;
  }
  notEqual(f, l) {
    return f != l;
  }
  unique(arr1, arr2, fields) {
    return arr1.filter(
      (item) => !arr2.some((other) => other[fields] === item[fields])
    );
  }
  unique_with_number(arr1, arr2, fields) {
    return arr1.filter(
      (item) =>
        !arr2.some((other) => Number(other[fields]) == Number(item[fields]))
    );
  }

  less(f, l) {
    return f < l;
  }
  big(f, l) {
    return f > l;
  }
  isNull(object) {
    return typeof object === "null" || object === null;
  }
  empty(data) {
    return data == "";
  }
  has(event, className) {
    const target = event.target;
    return target.classList.contains(className);
  }
  addClass = (e, c) => {
    return e.classList.add(c);
  };
  remClass = (e, c) => {
    return e.classList.remove(c);
  };
  toggle = (e, c) => {
    return e.classList.toggle(c);
  };
  remFromALL(element, className) {
    element.forEach((box) => {
      box.classList.remove(className);
    });
  }

  scrollTo = (t) => {
    window.scroll({
      top: getid(t).offsetTop - 20,
      left: 0,
      behavior: "smooth",
    });
  };

  info_note(notifyID, text) {
    notifyID.innerHTML += `<div class="note hacen d-flex p-2 fs-2 w-100 mb-2">
                    <div class="pr-6">${text}</div>
                </div>`;
  }

  isLycee() {
    return localStorage.schoolType == "ثانوي";
  }
  isCem() {
    return localStorage.schoolType == "متوسط";
  }
  isPrimary() {
    return localStorage.schoolType == "مدرسة";
  }

  Mmoy() {
    return this.isPrimary() ? 5 : 10;
  }
  micro() {
    const timestampMicroseconds = Date.now() * 1000;
    return timestampMicroseconds;
  }

  to(url) {
    var link = document.createElement("a");
    link.href = `${AMATTI_HOST}${url}`;
    link.target = "_blank";
    link.click();
  }
  decodeURL(arabic) {
    return decodeURIComponent(arabic);
  }
  age(birthday, year) {
    var time = new Date(birthday);
    return Math.abs(year - time.getFullYear());
  }
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  today_date() {
    const date = new Date();
    const months = [
      "جانفي",
      "فيفري",
      "مارس",
      "أفريل",
      "ماي",
      "جوان",
      "جويلية",
      "أوت",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formatter = new Intl.DateTimeFormat("ar", options);
    const formattedDateString = formatter.replace(
      `/${date.getMonth() + 1}/`,
      monthName
    );

    return formattedDateString;
  }

  today() {
    const date = new Date();
    const months = [
      "جانفي",
      "فيفري",
      "مارس",
      "أفريل",
      "ماي",
      "جوان",
      "جويلية",
      "أوت",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const day = date.toLocaleDateString("ar", { weekday: "long" });
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return ` ${day} ${date.getDate()} ${monthName} ${year}`;
  }
  loading = (id) => {
    _.html(id, '<div class="lds-dual-ring"></div>');
  };
  endLoading = (id) => {
    _.html(id, "");
  };
  convertMsToTime = (ms) => {
    return new Date(ms).toISOString().substr(11, 8);
  };

  async fetchData(url, params = {}, type = "json") {
    try {
      const response = await fetch(`${AMATTI_HOST}${url}`, {
        method: "POST",
        body: new URLSearchParams(params),
      });
      return type == "json" ? await response.json() : await response.text();
    } catch (error) {
      notify.toast({
        type: "done",
        color: "success",
        message: "حدث خطأ غير معروف أعد المحاولة من جديد",
      });
      console.error("Error in fetchData:", error);
      throw error;
    }
  }
  shortName(name) {
    const rankMap = {
      أولى: 1,
      ثانية: 2,
      ثالثة: 3,
      رابعة: 4,
      خامسة: 5,
    };

    const parts = name.split(/[\s-]+/); // Skip first two parts using destructuring

    const [gradeWord, ...remainingParts] = parts;
    const cleanGradeWord = gradeWord.replace(/\s+/g, "");
    const number = rankMap[cleanGradeWord] || 0;
    remainingParts.shift();
    const section = remainingParts.pop();
    const lastWord = remainingParts.pop();

    const initials = remainingParts.map((word) => word[0]).join(" ");
    const truncatedLastWord = lastWord.slice(0, 3);

    return `${number} ${initials} ${truncatedLastWord} ${section}`;
  }

  splitArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  }

  async readMXls(ev, callback = () => {}) {
    const files = ev?.target?.files || ev; // Handle both event and array input
    if (!files || files.length === 0) return;

    const results = [];

    const readFile = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        const result = { fileName: file.name, content: [] };

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          workbook.SheetNames.forEach((sheetName) => {
            const sheetData = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheetName],
              {
                header: 1,
                defval: "",
              }
            );

            if (sheetData.length && !sheetName.includes("Worksheet")) {
              result.content.push({ sheetName, sheetData });
            }
          });

          resolve(result);
        };

        reader.readAsArrayBuffer(file);
      });
    };

    // Process each file and wait for all to complete
    for (const file of files) {
      results.push(await readFile(file));
    }

    callback(results);
    return results;
  }

  async readXls(ev, callback = () => {}) {
    const oFile = ev?.target?.files[0] || ev[0];
    if (!oFile) return;

    const reader = new FileReader();
    const results = [];

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      workbook.SheetNames.forEach((sheetName) => {
        const result = {};
        const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
          defval: "",
        });

        if (roa.length) result[sheetName] = roa;
        if (!sheetName.includes("Worksheet")) results.push(result);
      });

      callback(results);
    };

    reader.readAsArrayBuffer(oFile);
    return results;
  }
  async readXlss(ev) {
    const oFile = ev?.target?.files[0] || ev[0];
    if (!oFile) return [];

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const results = [];

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          workbook.SheetNames.forEach((sheetName) => {
            const result = {};
            const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
              header: 1,
              defval: "",
            });

            if (roa.length) result[sheetName] = roa;
            if (!sheetName.includes("Worksheet")) results.push(result);
          });

          resolve(results);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(oFile);
    });
  }
  re_order(nbr) {
    const table = document.getElementsByTagName("table");
    for (let index = 0; index < table.length; index++) {
      let headerCell = null;

      for (let row of table[index].rows) {
        const firstCell = row.cells[nbr];

        if (
          headerCell === null ||
          firstCell.innerText !== headerCell.innerText
        ) {
          headerCell = firstCell;
        } else {
          headerCell.rowSpan++;
          firstCell.remove();
        }
      }
    }
  }
}
let _ = new Helpers();
export { _ };
