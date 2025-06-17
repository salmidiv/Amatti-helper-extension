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
} from "../../../../core/helpers/const.js";
import { footer, header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

const id = _.decodeURL(segments[2]);
const type = _.decodeURL(segments[3]);
let school_type;

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
  );
  */
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
    .and((eleve) => (section != 0 ? Number(eleve.s_section) === section : true))
    .and((eleve) => (_.isLycee() ? eleve.s_choaba.includes(choaba) : true))
    .toArray();
  let chunks = [];
  let heade = "";
  const year = rankingOption == 6 ? last_year : this_year;

  //const this_tri = rankingOption != 6 ? tri : "";
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

  let new_ar = sortred.filter((e) => !exc.includes(e.s_matt.toString()));
  // let new_ar = students.filter((e) => !exc.split(",").includes(e.s_matt));
  let chunkSize;
  if (surplus == 1) {
    chunkSize = Math.round(new_ar.length / sections);
  }
  if (surplus == 2) {
    chunkSize = new_ar.length / sectionN;
    chunkSize = Math.round(new_ar.length / chunkSize);
  }
  for (let i = 0; i < new_ar.length; i += chunkSize) {
    const chunk = new_ar.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  let nbr = 0;
  for (let index = 0; index < chunks.length; index++) {
    let chunk = chunks[index];
    const sall = index + 1;
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
function template(head, table) {
  return `<div class="sheet hacen h-auto p-5mm fs-3">
    ${head}
    ${table}
    ${footer}
    </div>`;
}
function head(sallNbr, mostawa, studentsNbr) {
  return `
  ${header}
  <h1 class="text-center fs-1"> 
      قائمة تلاميذ القاعة  
                    -
                    <input value="${sallNbr}" type="text" class="hacen" style="font-size:1rem;font-weight: bold;" placeholder="أكتب اسم القاعة">
</h1>
          <div class="flex between-content">
                        <span style="font-size: 16px; font-weight: bold;">
                        المستوى: ${mostawa}
                        </span>
                 
                        <span style="font-size: 16px; font-weight: bold;">
                        عدد التلاميذ: ${studentsNbr}
                        </span>
                        </div>
                      
                   `;
}

function htm(index, trs) {
  return `
            <table dir="rtl" width="100%" align="center">	
                <tbody>
                    <tr>
                        <td width="60%">	
                            <table dir="rtl" width="99%" border="1" cellpadding="1" cellspacing="0" align="center" nobr="true">					
                                <tbody>
                                    <tr height="40">
                                        <td width="50%">المادة :................................</td>
                                        <td width="50%">التاريخ:................................</td>
                                    </tr>
                                    <tr height="40">
                                        <td width="50%">التوقيت: من: ........ إلى: ........</td>
                                        <td width="50%">ملاحظات:.............................</td>								
                                    </tr>							
                                    <tr height="40">
                                        <td width="50%">عدد الحضور:</td>
                                        <td width="50%">عدد الغياب:</td>								
                                    </tr>														
                                </tbody>
                            </table>					
                        </td>
                        <td width="40%">	
                            <table dir="rtl" width="99%" align="center" border="1" cellpadding="1" cellspacing="0" nobr="true">
                                <thead>
                                    <tr>
                                        <td style="font-size: 16px; font-weight: bold;text-align:center"><span>الحارس</span></td>
                                        <td style="font-size: 16px; font-weight: bold;text-align:center"><span>التوقيع</span></td>
                                    </tr>
                                </thead>					
                                <tbody>
                                    <tr>
                                        <td height="30">1-........................................</td>
                                        <td height="30"></td>
                                    </tr>
                                    <tr>
                                        <td height="30">2-........................................</td>
                                        <td height="30"></td>
                                    </tr>
                                    <tr>
                                        <td height="30">3-........................................</td>
                                        <td height="30"></td>
                                    </tr>						
                                </tbody>
                            </table>									
                        </td>				
                    </tr>
                </tbody><tbody>
                	
            </tbody></table>
            	</br>
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
                    <th style="width:17%" align="center">
                        <div> اللقب والاسم </div>
                    </th>
                    <th style="width:14%" align="center">
                        <div> تاريخ الميلاد</div>
                    </th>
                    <th style="width:29%" align="center">
                        <div> القسم</div>
                    </th>
                    <th style="width:12%" align="center">
                        <div> التوقيع</div>
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

function create_table(new_ar, niv, choaba, sections) {
  let tr = "";
  let star = 1;
  let sall = (index = 1);
  const chunkSize = Math.round(new_ar.length / sections);
  for (let i = 0; i < new_ar.length; i += chunkSize) {
    const chunk = new_ar.slice(i, i + chunkSize);
    nbrtas = chunk.length + "-" + star;
    tr += htm(index, sall, chunk.length, `${niv} ${choaba} `, chunkSize);
    star = chunk.length;
    index++;
    sall++;
  }
  $chunks.innerHTML = tr;
}
