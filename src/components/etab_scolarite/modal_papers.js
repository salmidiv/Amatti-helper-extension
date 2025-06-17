import { personalsTable, studentsTable } from "../../../core/db/conn.js";
import { load_sections, this_year } from "../../../core/helpers/const.js";
import DownloadPDF from "../../../core/helpers/donwload-pdf.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
const downloadPDF = new DownloadPDF();

function checkDivs() {
  if ($subDiv.value == "") {
    notify.toast({
      type: "warning",
      color: "danger",
      message: "ﻯﻮﺘﺴﻤﻟا ﺭﺎﻴﺘﺧا ﻰﺟﺮﻳ",
    });
    return false;
  }
  return true;
}

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  const subDivValue = $subDiv.value;
  switch (true) {
    case classList.contains("papersModal"):
      load_sections("divsPapper");
      teachersL();
      break;
    case classList.contains("printDivisionList"):
      checkAndNavigate(`printDivisionList/${subDivValue}`);
      break;
    case classList.contains("printDivisionNoteList"):
      checkAndNavigate(`printNotesList/${subDivValue}`);
      break;
    case classList.contains("downloadDivisionCertaficate"):
      downloadAction(subDivValue, "chahada");
      break;
    case classList.contains("downloadDivisionIstimara"):
      downloadAction(subDivValue, "istimara");
      break;
    case classList.contains("scrapsniv"):
      checkAndNavigate(`scrapsniv/${subDivValue}`);
      break;
    case classList.contains("restoCards"):
      _.to("risto-cards");
      break;
    case classList.contains("printAllScraps"):
      _.to("all-scraps");
      break;
    case classList.contains("printNisfList"):
      _.to("nisf-list");
      break;
    case classList.contains("printExternal"):
      _.to("external-list");
      break;
    case classList.contains("printWafid"):
      _.to("wafid-list");
      break;
    case classList.contains("printStundentsOut"):
      _.to("out-list");
      break;
    case classList.contains("printStundentsStop"):
      _.to("stop-list");
      break;
    case classList.contains("printReplay"):
      _.to("replay-list");
      break;
    case classList.contains("teacherChahada"):
      teacherChahada();
      break;
    case classList.contains("teacherKhadamat"):
      teacherKhadamat();
      break;
    case classList.contains("scrapsTeachers"):
      _.to("scraps-teachers/teachers");
      break;
    case classList.contains("scrapsTeachers"):
      _.to("scraps-teachers/teachers");
      break;
    case classList.contains("nisfBitaka"):
      _.to("nisfBitaka");
      break;
      case classList.contains("print-no-sport"):
      console.log("no sport")
      _.to("no-sport");
      break;
  }
});
async function downloadAction(subDivValue, type) {
  if (checkDivs())
    downloadPDF.margeFiles({
      lists: await getStudentIDs(subDivValue), // Replace with your list of IDs
      type: "byClass",
      display: "show",
      targetClass: "progress-papper",
      cert: type,
    });
}
async function getStudentIDs(subDivValue) {
  const studentList = await get_student_list(subDivValue);
  return studentList.map((student) => student.s_matt);
}
function checkAndNavigate(url) {
  if (checkDivs()) {
    _.to(url);
  }
}
async function get_student_list(id) {
  const dbindex = _.isLycee() ? 2 : 1;
  id = id.split("-");
  return await studentsTable
    .where({ s_niv: `${id[0].trim()}` })
    .and(
      (eleve) =>
        eleve.s_section === id[dbindex] &&
        eleve.s_type !== 3 &&
        eleve.s_annee === this_year
    )
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .toArray();
}
async function teachersL() {
  const teachers = await personalsTable
    .filter((u) => u.rotba.includes("أستاذ"))
    .toArray();
  var op = ` <option value="" selected="">-- اختر الأستاذ --</option>`;
  op += teachers
    .map(
      (t) =>
        `<option value="${t.matt}">${t.nom} ${t.prenom} [${t.mada}]</option>`
    )
    .join("");
  _.qSel(".teachersL").innerHTML = op;
}

function teacherChahada() {
  const matt = _.qSel(".teachersL").value;
  _.to(`pers/personnel/attestation/${matt}`);
}
function teacherKhadamat() {
  const matt = _.qSel(".teachersL").value;
  _.to(`pers/personnel/etat_service/${matt}`);
}
