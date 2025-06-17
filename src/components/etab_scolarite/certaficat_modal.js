import { studentsTable } from "../../../core/db/conn.js";
import {
  AMATTI_HOST,
  MOTAMADRIS,
  load_sections,
  this_year,
} from "../../../core/helpers/const.js";
import DownloadPDF from "../../../core/helpers/donwload-pdf.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
const downloadPDF = new DownloadPDF();

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("certaficatModal"):
      load_sections("divsData", "divsData1");
      break;
    case classList.contains("certSubmit"):
      get_results();
      break;
    case classList.contains("printCertByClass"):
      getData("download");
      break;
    case classList.contains("showCertByClass"):
      getData("show");
      break;
    case classList.contains("showStudents"):
      makeHtml();
      break;
    case classList.contains("printMultipeSelected"):
      printMultipeSelected();
      break;
    case classList.contains("printTwoSelectedInOne"):
      printTwoSelectedInOne();
      break;
  }
});

const get_results = async () => {
  const year = _.getid("certYear").value;
  if (year === "") {
    notify.toast({
      type: "error",
      color: "danger",
      message: "اختر السنة الدراسية أولا",
    });
    return;
  }
  const selectedRadio = _.qSel('input[name="searchType"]:checked');
  if (!selectedRadio) return;

  const selectedValue = selectedRadio.value;
  let cond = {};
  if (selectedValue === "withName") {
    const db_students = await studentsTable
      .filter(
        (student) =>
          student.s_nom.includes(
            _.getid("studentNom").value.replace(/\s+/g, " ").trim()
          ) &&
          student.s_prenom.includes(
            _.getid("studentPrenom").value.replace(/\s+/g, " ").trim()
          ) &&
          student.s_annee === Number(year)
      )
      .toArray();
    _.qSel("#searchResults").innerHTML = renderStudentList(
      db_students,
      year,
      this_year
    );
    const buttons = _.qSelAll(".printTwoInOne");

    buttons.forEach((button) => {
      _.btnEvent(button, "click", (ev) => {
        notify.toast({
          type: "warning",
          color: "warning",
          message: "الرجاء الانتظار حتى اكتمال العملية",
        });
        const matt = ev.target.dataset.matt;
        const annee = _.getid("certYear").value;
        downloadPDF.TwoFace(matt, annee, "");
      });
    });
  } else if (selectedValue === "withSerial") {
    cond = {
      s_matt: Number($studentSerial.value),
      s_annee: Number(year),
    };
    const db_students = await studentsTable.where(cond).toArray();
    _.qSel("#searchResults").innerHTML = renderStudentList(db_students, year);
  }

  // printOptions
  const selectElements = _.qSelAll(".printOptions");
  selectElements.forEach((select) => {
    select.addEventListener("change", (event) => {
      const id = event.target.value;
      const matt = event.target.dataset.matt;
      makeAction(Number(id), matt);
    });
  });
};
function makeAction(id, matt) {
  console.log(id, matt);
  const year = _.getid("certYear").value;
  console.log(year);
  const generateURL = (type) => {
    const baseRoute = "scolarite/dossier_eleves/etats_imp";
    const prefix = year.includes(this_year) ? "attestation" : "certificat";
    return `${baseRoute}/${prefix}/${matt}/${year}`;
  };

  switch (id) {
    case 1:
      _.to(generateURL("matt"));
      break;
    case 2:
      downloadPDF.TwoFace(matt, year, "");
      break;
    case 3:
      _.to(`istida/${matt}`);
      break;
    case 4:
      _.to(`indar/${matt}`);
      break;
    case 5:
      _.to(`tawbikh/${matt}`);
      break;
    default:
      // Handle any other cases if needed
      break;
  }
}

const renderStudentList = (students, year) => {
  const url =
    Number(year) === this_year
      ? "scolarite/dossier_eleves/etats_imp/attestation"
      : "scolarite/dossier_eleves/etats_imp/certificat";

  return students
    .map(
      (s) => `
      <tr>
        <td>${s.s_nom} ${s.s_prenom}</td>
        <td>${s.s_birthday}</td>
        <td>${_.shortName(`${s.s_choaba} ${s.s_niv} ${s.s_section}`)}</td>
        <td class="flex gap-1">
          <select class="h-38 p-1 px-3 hacen w-100 printOptions" data-matt="${
            s.s_matt
          }">
            <option value="">- اختر الوثيقة--</option>
            <option value="1">شهادة مدرسية A4</option>
            <option value="2">شهادة مدرسية نسختين في A4</option>
            <option value="3">استدعاء ولي تلميذ</option>
            <option value="4">انذار كتابي</option>
            <option value="5">توبيخ</option>
              
          </select>
         
        </td>
        </tr>
  `
    )
    .join(" ");
};

function getData(display) {
  const div = $divs2.value;
  if (div === "") {
    notify.toast({
      type: "error",
      color: "danger",
      message: "اختر القسم أولا",
    });
    return;
  }
  notify.toast({
    type: "done",
    color: "success",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  getPdfs(div, display);
  _.qSel(".progress-data-by-class .title").innerHTML =
    "جاري تجهيز الشهادات المدرسية لقسم: " + div.replace("-", " ");
}
async function getByClass(nivId) {
  let dbindex = _.isLycee() ? 2 : 1;
  let id = nivId.split("-");
  let students = await studentsTable
    .where({ s_niv: `${id[0].trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .toArray();
  return students;
}
async function getPdfs(nivId, display) {
  let students = await getByClass(nivId);
  const selectedClass = students.map((student) => student.s_matt);
  const time = _.convertMsToTime(selectedClass.length * 900 + 8000);
  _.qSel(".progress-data-by-class .time").innerHTML = time;
  downloadPDF.margeFiles({
    lists: selectedClass, // Replace with your list of IDs
    type: "byClass",
    display: display,
    targetClass: "progress-data-by-class",
    cert: "chahada",
    title: `شهادات مدرسية لقسم [${nivId.replace("-", " ")}]`,
  });
}

// multiple
let selectedIds = [];

async function makeHtml() {
  const div = $divs3.value;
  if (div === "") {
    notify.toast({
      type: "error",
      color: "danger",
      message: "اختر القسم أولا",
    });
    return;
  }
  const students = await getByClass(div);
  const html = students
    .map((user) => {
      const isSelected = selectedIds.some((e) => Number(e.matt) == user.s_matt);
      return `<tr>
                <td class="p-1 text-center">
                  <input style="width:16px; height: 16px"
                          type="checkbox"
                          data-info="${user.s_nom} ${user.s_prenom} [${
        user.s_niv
      } ${user.s_choaba} ${user.s_section}]" 
                          class="student-selct"
                          value="${user.s_matt}"
                          ${isSelected ? "checked" : ""}></td >
                <td class="p-1">${user.s_matt}</td >
                <td class="p-1">${user.s_nom} ${user.s_prenom}</td >
                <td class="p-1">${user.s_birthday}</td >
              </tr>`;
    })
    .join("");
  $sudentsListMulti.innerHTML = html;
  const links = _.qSelAll(".student-selct");
  links.forEach((link) => _.btnEvent(link, "click", selectedList));
}

function selectedList(ev) {
  const target = ev.target;
  if (target.tagName === "TD" && target.hasAttribute("data-matt")) {
    const dataMatt = target.getAttribute("data-matt");
    selectedIds = selectedIds.filter((e) => e.matt !== dataMatt);
    toggleCheckbox(dataMatt, false);
  } else if (target.tagName === "INPUT" && target.type === "checkbox") {
    const matt = target.value;
    const info = target.dataset.info;
    if (target.checked) {
      selectedIds.push({ matt, info });
    } else {
      selectedIds = selectedIds.filter((e) => e.matt !== matt);
      toggleCheckbox(matt, false);
    }
  }
  if (selectedIds.length == 2) {
    _.remClass($printTwoSelectedInOne, "d-none");
  } else {
    _.addClass($printTwoSelectedInOne, "d-none");
  }
  //
  showSelectedStudents(selectedIds);
}

function toggleCheckbox(value, checked) {
  const checkboxes = document.querySelectorAll(
    `input[type="checkbox"][value="${value}"]`
  );
  checkboxes.forEach((checkbox) => (checkbox.checked = checked));
}

function showSelectedStudents(students) {
  const html = students
    .map(
      (user) => `<tr>
                <td  class="p-1 remove-selected" data-matt="${user.matt}">${user.info}</td>
              </tr>`
    )
    .join("");
  $selectedStudents.innerHTML = html;

  const links = _.qSelAll(".remove-selected");
  links.forEach((link) => _.btnEvent(link, "click", selectedList));
}
function printMultipeSelected() {
  if (selectedIds.length == 0) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "لم تقم بإختيار تلاميذ لطباعة شهاداتهم المدرسية",
    });
    return;
  }
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  const selectedClass = selectedIds.map((student) => student.matt);
  downloadPDF.margeFiles({
    lists: selectedClass, // Replace with your list of IDs
    type: "byClass",
    display: "show",
    targetClass: "progress-data-multiple",
    cert: "chahada",
    title: `شهادات مدرسية لمجموعة من التلاميذ`,
  });
}
function printTwoSelectedInOne() {
  const matt = selectedIds.map((e) => e.matt);
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  downloadPDF.TwoFace(matt, this_year, "");
}
