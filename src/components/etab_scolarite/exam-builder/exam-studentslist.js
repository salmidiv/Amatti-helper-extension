import {
  exambuilderTable,
  examDistributionTable,
  examStudentsTable,
  hallsTable,
  moyexambuilderTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import {
  MOTAMADRIS,
  last_year,
  segments,
  this_year,
  this_year_text,
} from "../../../../core/helpers/const.js";
import { footer, header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

const id = _.decodeURL(segments[2]);
const type = _.decodeURL(segments[3]);

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
  let currentNumber = examData.startNumber;
  const data = halls.map((e, index) => {
    const students = exam_students.filter((eleve) => eleve.hallId == e.id);
    console.log(students);
    const students_list_table = students.map((e) => {
      const student = students_list.find(
        (eleve) => eleve.s_matt == e.studentId
      );
      return { ...e, ...student };
    });
    console.log(students_list_table);
    const sections = new Set(
      students_list_table.map((e) => `${e.s_niv} ${e.s_choaba}-${e.s_section}`)
    );
    console.log(sections);
    const startNumber = currentNumber;
    const endNumber = currentNumber + students_list_table.length - 1;
    currentNumber = endNumber + 1;
    return {
      index: index + 1,
      hall: e.name,
      students: students_list_table,
      total: students_list_table.length,
      sections: Array.from(sections).join("، "),
      numbers: `${startNumber} - ${endNumber}`,
    };
  });
  console.log(data);
  let heade = "";
  for (const hall of data) {
    console.log(hall);
    let trs = "";
    const stidentsList = hall.students;
    for (let i = 0; i < stidentsList.length; i++) {
      const stu = stidentsList[i];
      const c = `${stu.s_niv} ${stu.s_choaba} ${stu.s_section}`;
      trs += `<tr>
                            <td align="center">${stu.number}</td>
                            <td align="center">${stu.s_regester_nbr}</td>
                            <td> ${stu.s_nom} ${stu.s_prenom} </td>
                            <td>${stu.s_birthday}</td>
                            <td> ${_.shortName(c)} </td>
                            <td></td>
                        </tr>`;
    }
    heade += template(
      head(hall.hall, hall.sections, hall.total),
      htm(hall.index, trs)
    );
  }
  $content.innerHTML += heade;
  /*
  load_students(
    result.niv,
    result.choaba,
    result.sallnbr,
    _.empty(result.excStudents) ? [] : result.excStudents,
    result.surplus,
    result.sallnbr,
    result.sallsize,
    result.studentsStartNum,
    result.rankingOption,
    result.rankingSort,
    result.section,
    result.salleStartNum,
    result.tri
  );*/
}

async function load_students(
  niv,
  choaba,
  sallnbr,
  exc,
  surplus,
  sections,
  sectionN,
  studentsStartNum,
  rankingOption,
  rankingSort,
  section,
  salleStartNum,
  tri
) {
  const students = await studentsTable
    .where({ s_niv: `${niv.trim()}`, s_annee: this_year, is_study: MOTAMADRIS })
    .and((eleve) =>
      section && section != 0 ? Number(eleve.s_section) === section : true
    )
    .and((eleve) => (_.isLycee() ? eleve.s_choaba.includes(choaba) : true))
    .toArray();
  console.log(students);
  const year = rankingOption == 6 ? last_year : this_year;

  // const this_tri = rankingOption != 6 ? tri : "";
  var this_tri = rankingOption != 6 ? rankingOption : "";
  this_tri = rankingOption == 7 ? 1 : this_tri;
  this_tri = rankingOption == 8 ? 2 : this_tri;
  this_tri = rankingOption == 9 ? 3 : this_tri;

  const studentsWithNotes = await Promise.all(
    students.map(async (student) => {
      const note = await moyexambuilderTable
        .where({ matt: student.s_matt, annee: year, tri: this_tri })
        .first();
      return {
        ...student,
        moyen: getFromRankingOption(rankingOption, note), // Assuming you want to retrieve the 'note' field
      };
    })
  );
  const orderBy = get_order(rankingOption);

  let sortred;
  if (rankingOption <= 5 && rankingOption != 3) {
    sortred =
      rankingSort == 1
        ? studentsWithNotes.sort((a, b) =>
            a[orderBy].localeCompare(b[orderBy], "ar")
          )
        : studentsWithNotes.sort((a, b) =>
            b[orderBy].localeCompare(a[orderBy], "ar")
          );
  } else {
    sortred =
      rankingSort == 1
        ? orderASC(studentsWithNotes, orderBy)
        : orderDESC(studentsWithNotes, orderBy);
  }

  let chunks = [];
  let heade = "";
  let new_ar =
    exc.length != 0
      ? sortred.filter((e) => !exc.includes(e.s_matt.toString()))
      : sortred;
  let chunkSize;
  if (surplus == 1) {
    chunkSize = Math.round(new_ar.length / sections);
  }
  if (surplus == 2) {
    chunkSize = new_ar.length / sectionN;
    chunkSize = Math.round(new_ar.length / chunkSize);
  }
  //const chunkSize = Math.round(new_ar.length / sections);
  for (let i = 0; i < new_ar.length; i += chunkSize) {
    const chunk = new_ar.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  let nbr = 0;
  for (let index = 0; index < chunks.length; index++) {
    let chunk = chunks[index];
    const sall = index + salleStartNum;
    let trs = "";
    for (let i = 0; i < chunk.length; i++) {
      nbr = studentsStartNum + i;
      if (i == chunk.length - 1) studentsStartNum = nbr + 1;
      const stu = chunk[i];
      const c = `${stu.s_niv} ${stu.s_choaba} ${stu.s_section}`;
      trs += `<tr>
                            <td align="center">${i + 1}</td>
                            <td align="center">${nbr}</td>
                            <td> ${stu.s_nom} ${stu.s_prenom} </td>
                            <td>${stu.s_birthday}</td>
                            <td> ${_.shortName(c)} </td>
                            <td></td>
                        </tr>`;
      if (i == chunk.length - 1) nbr = i + studentsStartNum;
    }
    heade += template(
      head(sall, niv, choaba, section, chunk.length),
      htm(index, trs)
    );
    $content.innerHTML += heade;
    heade = "";
  }
}
function template(head, table) {
  return `<div class="sheet hacen h-auto p-5mm fs-3">
    ${head}
    ${table}
    ${footer}
    </div>`;
}
function head(sallNbr, sections, studentsNbr) {
  return `
  ${header}
  <h1 class="text-center fs-1"> 
      قائمة تلاميذ القاعة  
                    -
                    <input value="${sallNbr}" readOnly type="text" class="hacen" style="font-size:1rem;font-weight: bold;" placeholder="أكتب اسم القاعة">
</h1>
          <div class="flex between-content">
                        <span style="font-size: 16px; font-weight: bold;">
                        الأقسام: ${sections}
                        </span>
                 
                        <span style="font-size: 16px; font-weight: bold;">
                        عدد التلاميذ: ${studentsNbr}
                        </span>
                        </div>
                      
                   `;
}

function Footer(set) {
  return `
        <p style="font-weight: bold;" align="left">
            حرّر في:
            <span>${set.commune} </span>
            بتاريخ:
            <span>${set.day}</span>
        </p>
        <p style=" font-weight: bold;" align="left">مدير(ة) المؤسسة:</p>`;
}

function htm(index, trs) {
  return `
        <table dir="rtl" style="font-size: 14px; width: 100%;" border="1" cellpadding="1" cellspacing="0" align="center"
            nobr="true">
            <thead>
                <tr>
                    <th style="width:5%" align="center">
                        <div> الترتيب </div>
                    </th>
                    <th style="width:7%" align="center">
                        <div> ر.التسجيل </div>
                    </th>
                    <th style="width:25%" align="center">
                        <div> اللقب والاسم </div>
                    </th>
                    <th style="width:12%" align="center">
                        <div> تاريخ الميلاد</div>
                    </th>
                    <th style="width:24%" align="center">
                        <div> القسم</div>
                    </th>
                    <th style="width:35%" align="center">
                        <div> الملاحظات</div>
                    </th>
                </tr>
            </thead>
            <tbody id="$studentsList${index}">${trs}</tbody>
        </table>
    `;
}

function get_order(index) {
  const newIndex = index === 7 || index === 8 || index === 9 ? 6 : index;
  let sor = [
    "s_prenom",
    "s_nom",
    "s_matt",
    "s_gender",
    "s_regester_nbr",
    "moyen",
  ];
  return sor[newIndex - 1];
}
function getFromRankingOption(rankingOption, note) {
  const ar = [6, 7, 8, 9];
  return ar.includes(rankingOption) && note?.moy ? note.moy : "";
}
function orderASC(arrayOfObjects, key) {
  return arrayOfObjects.sort((a, b) => a[key] - b[key]);
}
function orderDESC(arrayOfObjects, key) {
  return arrayOfObjects.sort((a, b) => b[key] - a[key]);
}
