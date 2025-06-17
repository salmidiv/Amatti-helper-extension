import { db, settingsTable, studentsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";

async function init() {
  const id = _.decodeURL(segments[2]).split("-");
  setDocumentTitle(id);
  initializeElements();
  const dbindex = _.isLycee() ? 2 : 1;
  const students = await getStudents(id, dbindex);
  const newList = orderASC(students, "s_nom");
  appendTableHeader("one", getSubjectList());
  renderStudentRows(newList, 1);

  if (_.isPrimary()) {
    _.remClass(_.qSel("#math"), "d-none");
    appendTableHeader("two", math());
    renderStudentRows(newList, 2);
  }
}

function setDocumentTitle(id) {
  $title2.innerHTML =
    $title.innerHTML =
    document.title =
      `قائمة التنقيط لتلاميذ قسم ${id.join(" ")}`;
}

function initializeElements() {
  ["header", "header2"].forEach((element) => _.afterbegin(element, header));
  ["footer", "footer2"].forEach((element) => _.afterbegin(element, footer));
}

async function getStudents(id, dbindex) {
  return await db.students
    .where({ s_niv: `${id[0].trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .toArray();
}

function orderASC(arrayOfObjects, orderBy) {
  return arrayOfObjects.sort((a, b) =>
    a[orderBy].localeCompare(b[orderBy], "ar")
  );
}

function appendTableHeader(id, lists) {
  _.qSel(`#${id} tr`).innerHTML += lists
    .map((elm) => `<th style="width: 12mm;">${elm}</th>`)
    .join("");
}

function renderStudentRows(students, t) {
  let tr = "";
  students.forEach((student, index) => {
    tr += generateStudentRow(student, index, t);
  });

  const tableId = t === 1 ? "one" : "two";
  _.qSel("#" + tableId + " tbody").innerHTML = tr;

  // Check and remove extra td elements if needed
  checkAndRemoveExtraTD(tableId);
}
function checkAndRemoveExtraTD(tableId) {
  const thCount = _.qSel("#" + tableId + " th").length;
  const trList = Array.from(
    _.qSel("#" + tableId + " tbody").querySelectorAll("tr")
  );
  trList.forEach((tr) => {
    const tdCount = tr.querySelectorAll("td").length;

    // If there are more td elements than th elements, remove the extra td elements
    if (tdCount > thCount) {
      const diff = tdCount - thCount;
      const closingTagsToRemove = new RegExp(
        `</td>${"\\s*".repeat(diff)}</tr>$`
      );
      tr.innerHTML = tr.innerHTML.replace(closingTagsToRemove, "</tr>");
    }
  });
}
//function renderStudentRows(students, t) {
//  let tr = "";
//  students.forEach((student, index) => {
//    tr += generateStudentRow(student, index, t);
//  });
//  $studentsList.innerHTML = t === 1 ? tr : ($studentsList2.innerHTML = tr);
//}

function generateStudentRow(student, index, t) {
  const tdList = appendTableCells(t);

  return `
    <tr>
        <td>${index + 1}</td>
        <td>${student.s_nom} ${student.s_prenom}</td>
        <td>${student.s_birthday}</td>
        <td>${student.s_moiid == 1 ? "نعم" : "لا"}</td>
        ${tdList}
    </tr>`;
}

function appendTableCells(t) {
  const lists = t === 1 ? getSubjectList() : math();
  const maxCells = lists.length;
  return lists
    .slice(0, maxCells)
    .map(() => "<td></td>")
    .join("");
}

function getSubjectList() {
  return _.isPrimary()
    ? ["تعبير وتواصل", "قراءة ومحفوظات", "كتابة واملاء", "الاختبار", "المعدل"]
    : _.isCem()
    ? ["ت.مستمر", "الفرض", "الاختبار", "المعدل"]
    : ["ت.مستمر", "أ.تطبيقية", "م.الفروض", "الاختبار", "المعدل"];
}

function math() {
  return [
    "الأعداد والحساب",
    "المقادير والقياس",
    "تنظيم معطيات",
    "الفضاء والهندسة",
    "الإختبار",
    "المعدل",
  ];
}

// Call the init function when needed
init();
