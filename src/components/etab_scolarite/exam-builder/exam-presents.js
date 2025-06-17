import {
  exambuilderTable,
  moyexambuilderTable,
  settingsTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import {
  MOTAMADRIS,
  last_year,
  segments,
  this_year,
  this_year_text,
} from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { header, footer } from "../../../../core/helpers/header.js";

const id = _.decodeURL(segments[2]);
const type = _.decodeURL(segments[3]);
let mardasa;
init();
async function init() {
  const setting = await settingsTable.toArray();
  mardasa = `   ${
    _.isPrimary() ? setting[0].school_type : setting[0].school_type + "ة"
  }  ${setting[0].school_name}`;
  load_exam();
}
async function load_exam() {
  const result = await exambuilderTable.where({ id: Number(id) }).first();
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

  const year = rankingOption == 6 ? last_year : this_year;

  //tri = rankingOption != 6 ? rankingOption : "";
  tri = rankingOption != 6 ? rankingOption : "";
  tri = rankingOption == 7 ? 1 : tri;
  tri = rankingOption == 8 ? 2 : tri;
  tri = rankingOption == 9 ? 3 : tri;
  const studentsWithNotes = await Promise.all(
    students.map(async (student) => {
      const note = await moyexambuilderTable
        .where({ matt: student.s_matt, annee: year, tri: tri })
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
  let new_ar = sortred.filter((e) => !exc.includes(e.s_matt));

  let chunks = [];
  let heade = "";
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
    //heade += head(sall, niv, choaba, section, chunk.length);
    let trs = "";
    for (let i = 0; i < chunk.length; i++) {
      nbr = studentsStartNum + i;
      if (i == chunk.length - 1) studentsStartNum = nbr + 1;
      const stu = chunk[i];
      trs += `<tr>
                            <td align="center">${i + 1}</td>
                            <td>  ${stu.s_nom} ${stu.s_prenom}</td>
                            <td></td><td></td><td></td>
                            <td></td><td></td><td></td>
                            <td></td><td></td><td></td>
                            <td></td>
                        </tr>`;
      if (i == chunk.length - 1) nbr = i + studentsStartNum;
    }
    trs += `<tr>
                            <td align="center">#</td>
                            <td>
                            </br>
                            </br>
                             ملاحظات عن سير الاختبار، اسم ولقب الأستاذ الحارس 
                            </br>
                            </br>
                            </br>
                            </br>
                               </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>`;
    //heade += htm(index, trs);
    // heade += footer;
    $content.innerHTML += template(
      head(sall, niv, choaba, section, chunk.length),
      htm(index, trs)
    );
    //$content.innerHTML += `<div class="page">${heade} </div><div style="page-break-after:always"></div>`;
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
function head(sallNbr, mostawa, choba, fawj, studentsNbr) {
  return `
  ${header}
   <div class="text-center felx ">
    
    <div class="fs-2 text-center" style=" font-weight: bold;">
    تأكيد الحضور لاختبار الفصل الأول بالتوقيع
                -
    <input type="text" class="hacen" style="font-size:1rem;font-weight: bold;" placeholder="أكتب اسم القاعة">
    </div>

    <div class="fs-4" style=" font-weight: bold;">
            المؤسسة: ${mardasa}
    </div>
           </div>         
    <div class="fs-4 flex between-content" style=" font-weight: bold;">
       
            <span style="font-size: 16px; font-weight: bold;">
            القاعة: 
            <input value="${sallNbr}" type="text" class="hacen w-80" style="font-size:1rem;font-weight: bold" placeholder=" رقم القاعة">

            </span>
        
            <span style="font-size: 16px; font-weight: bold;">
            المستوى: ${mostawa}
            </span>
        
            <span style="font-size: 16px; font-weight: bold;">
                الشعبة: ${choba} ${fawj}
            </span>
        
            <span style="font-size: 16px; font-weight: bold;">
            عدد التلاميذ: ${studentsNbr}
            </span>
                 
        </div>`;
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
                    <th style="width:18%" align="center">
                        <div> اللقب والاسم </div>
                    </th>
                    <th colspan="2">الأحد</th>
                    <th colspan="2">الاثنين</th>
                    <th colspan="2">الثلاثاء</th>
                    <th colspan="2">الأربعاء</th>
                    <th colspan="2">الخميس</th>
                </tr>
            </thead>
            <tbody id="$studentsList${index}">${trs}</tbody>
        </table>
    `;
}

// surplus الفائض
//sections عدد القاعات
//sectionN سعة القاعة
function create_table(new_ar, niv, choaba, exc, surplus, sections, sectionN) {
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

function orderASC(arrayOfObjects, key) {
  return arrayOfObjects.sort((a, b) => a[key] - b[key]);
}
function orderDESC(arrayOfObjects, key) {
  return arrayOfObjects.sort((a, b) => b[key] - a[key]);
}
function getFromRankingOption(rankingOption, note) {
  const ar = [6, 7, 8, 9];
  return ar.includes(rankingOption) && note?.moy ? note.moy : "";
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

function load_student(
  niv,
  choaba,
  exc,
  surplus,
  sections,
  sectionN,
  studentsStartNum,
  rankingOption,
  rankingSort
) {
  let whe = "";
  let fawj_where = fawj != "" ? `AND s_section=${fawj}` : "";
  if (school_type == "ثانوي") whe = `AND s_choaba like "%${choaba.trim()}%"`;
  db.selectwithqueryss(
    `SELECT * FROM students WHERE s_niv='${niv.trim()}' ${fawj_where} ${whe} ORDER BY ${get_order(
      rankingOption
    )} ${rankingSort == 1 ? "ASC" : "DESC"}`
  ).then(
    function (res) {
      let tr = "";
      let start = 0;
      let slr = 1;
      chunk = 0;
      $studentsNbr.innerHTML = res.rows.length - exc.split(",").length;
      let new_ar = res.rows.filter((e) => !exc.split(",").includes(e.s_matt));
      chunks = Math.round(new_ar.length / sections);
      chun = Math.round(new_ar.length / sections);
      for (let i = 0; i < new_ar.length; i++) {
        start = studentsStartNum + start;
        if (i == chunks) {
          slr++;
          chunks = chunks + chun;
          chunk++;
        }
        tr += htm(
          i + 1,
          start,
          `${new_ar[i].s_nom} ${new_ar[i].s_prenom}`,
          `${new_ar[i].s_niv} ${new_ar[i].s_choaba}`,
          slr
        );
      }
      $studentsList.innerHTML = tr;
    },
    function (err) {
      console.error(err);
    }
  );
}
