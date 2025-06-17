import {
  exambuilderTable,
  examDistributionTable,
  examStudentsTable,
  hallsTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import {
  MOTAMADRIS,
  segments,
  this_year,
} from "../../../../core/helpers/const.js";
import { footer, header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

const id = _.decodeURL(segments[2]);
const type = _.decodeURL(segments[3]);
let school_type;
_.html(_.getid("header"), header);
_.html(_.getid("footer"), footer);

load_exam();

async function load_exam() {
  const exam = await exambuilderTable.where({ id: Number(id) }).first();
  console.log(exam);
  const examData = await examDistributionTable
    .where({ examId: exam.id })
    .first();
  console.log(examData);
  const exam_students = await examStudentsTable
    .where({ examId: Number(id) })
    .toArray();
  const students = exam_students.map((e) => e.studentId);
  const students_list = await studentsTable
    .where("s_matt")
    .anyOf(students)
    .toArray();
  console.log(students_list);
  const boys = students_list.filter((e) => e.s_gender.includes("ذكر"));
  const girls = students_list.filter((e) => e.s_gender.includes("أنثى"));
  const halls = await hallsTable
    .where("id")
    .anyOf(exam.selectedHalls.map(Number))
    .toArray();
  const table = {
    title: exam.title,
    students: students_list.length,
    excluded: 0,
    boys: boys.length,
    girls: girls.length,
    sections: exam.sections.map((e) => e.split("-").join(" ")).join(" <br>"),
    halls: halls.map((e) => e.name).join(" <br>"),
  };
  console.log(table);
  $studentsNbr.innerHTML = table.students;
  $boysNbr.innerHTML = table.boys;
  $girlsNbr.innerHTML = table.girls;
  $titleBitaka.innerHTML = table.title;
  $excStudents.innerHTML = table.excluded;
  $nivs.innerHTML = table.sections;
  $cham.innerHTML = table.halls;
  nextTable(halls, exam_students, students_list, examData);
  /*
  load_student(
    result.niv,
    result.choaba,
    result.sallnbr,
    _.empty(result.excStudents) ? [] : result.excStudents,
    result.surplus,
    result.sallnbr,
    result.sallsize,
    result.studentsStartNum,
    result.section,
    result.salleStartNum
  );
  */
}
async function nextTable(halls, exam_students, students_list, examData) {
  console.log(exam_students);
  let currentNumber = examData.startNumber;
  const data = halls.map((e, index) => {
    const students = exam_students.filter((eleve) => eleve.hallId == e.id);
    console.log(students);
    const students_list_table = students.map((e) => {
      const student = students_list.find(
        (eleve) => eleve.s_matt == e.studentId
      );
      return student;
    });
    const sections = new Set(
      students_list_table.map((e) => `${e.s_niv} ${e.s_choaba} ${e.s_section}`)
    );
    console.log(sections);
    const startNumber = currentNumber;
    const endNumber = currentNumber + students_list_table.length - 1;
    currentNumber = endNumber + 1;
    return {
      index: index + 1,
      hall: e.name,
      students: students_list_table.length,
      sections: Array.from(sections).join(" <br>"),
      numbers: `${startNumber} - ${endNumber}`,
    };
  });
  const tr = data
    .map((e) => htm(e.index, e.hall, e.students, e.sections, e.numbers))
    .join("");

  $chunks.innerHTML = tr;
  console.log(data);
}
function htm(index, sall, studentsNbr, mostawa, nbrtas) {
  return `
     <tr>
        <td align="center">${index}</td>
        <td align="center">${sall}</td>
        <td align="center">${studentsNbr}</td>
        <td align="center"> ${mostawa}  </td>
        <td align="center"> ${nbrtas} </td>
        <td></td>
    </tr>`;
}
/*
async function load_student(
  result.niv,
  result.choaba,
  result.sallnbr,
  _.empty(result.excStudents) ? [] : result.excStudents,
  result.surplus,
  result.sallnbr,
  result.sallsize,
  result.studentsStartNum,
  choaba,
  sallnbr,
  exc,
  surplus,
  sections,
  sectionN,
  studentsStartNum,
  section,
  salleStartNum
) {
  const students = await studentsTable
    .where({ s_niv: `${niv.trim()}`, s_annee: this_year, is_study: MOTAMADRIS })
    .and((eleve) => (section != 0 ? Number(eleve.s_section) === section : true))
    .and((eleve) => (_.isLycee() ? eleve.s_choaba.includes(choaba) : true))
    .toArray();
  console.log(exc);
  $studentsNbr.innerHTML = students.length - exc.length;
  let new_ar =
    exc.length != 0
      ? students.filter((e) => !exc.includes(e.s_matt.toString()))
      : students;
  console.log(new_ar);
  console.log(students);
  $boysNbr.innerHTML = new_ar.filter((e) => e.s_gender.includes("ذكر")).length;
  $girlsNbr.innerHTML = new_ar.filter((e) =>
    e.s_gender.includes("أنثى")
  ).length;
  create_table(
    new_ar,
    niv,
    choaba,
    section,
    surplus,
    sections,
    sectionN,
    studentsStartNum,
    salleStartNum
  );
}
function create_table(
  new_ar,
  niv,
  choaba,
  fawj,
  surplusO,
  sections,
  sectionN,
  studentsStartNum,
  salleStartNum
) {
  let arr = [];
  let tr = "";
  let star = studentsStartNum;
  let sall = salleStartNum;
  let index = salleStartNum;
  let chunkSize;
  console.log(surplusO, sections);
  if (surplusO == 1) {
    console.log("new_ar", new_ar);
    chunkSize = Math.round(new_ar.length / sections);
  }
  if (surplusO == 2) {
    chunkSize = new_ar.length / sectionN;
    chunkSize = Math.round(new_ar.length / chunkSize);
  }
  chunkSize = chunkSize % 2 == 0 ? chunkSize : chunkSize + 1;
  console.log(chunkSize);
  for (let i = 0; i < new_ar.length; i += chunkSize) {
    const chunk = new_ar.slice(i, i + chunkSize);
    arr.push(chunk);
    const nbrtas = star + chunk.length - 1 + "-" + star;
    tr += htm(
      index,
      sall,
      chunk.length,
      `${niv} ${choaba} ${fawj ? fawj : ""}`,
      nbrtas
    );
    star = star + chunk.length;
    index++;
    sall++;
  }
  $chunks.innerHTML = tr;
}
function htm(index, sall, studentsNbr, mostawa, nbrtas) {
  return `
     <tr>
        <td align="center">${index}</td>
        <td align="center">${sall}</td>
        <td align="center">${studentsNbr}</td>
        <td align="center"> ${mostawa}  </td>
        <td align="center"> ${nbrtas} </td>
        <td></td>
    </tr>`;
}
*/
