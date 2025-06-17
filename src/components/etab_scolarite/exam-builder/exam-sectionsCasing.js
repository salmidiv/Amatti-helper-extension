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
import { header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

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
    result.tri,
    result.title
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
  tri,
  title
) {
  const students = await studentsTable
    .where({ s_niv: `${niv.trim()}`, s_annee: this_year, is_study: MOTAMADRIS })
    .and((eleve) =>
      section && section != 0 ? Number(eleve.s_section) === section : true
    )
    .and((eleve) => (_.isLycee() ? eleve.s_choaba.includes(choaba) : true))
    .toArray();
  let new_ar = students.filter((e) => !exc.includes(e.s_matt));

  create_table(
    new_ar,
    niv,
    choaba,
    section,
    surplus,
    sections,
    sectionN,
    studentsStartNum,
    title,
    salleStartNum
  );
}
function create_table(
  new_ar,
  niv,
  choaba,
  fawj,
  surplus,
  sections,
  sectionN,
  studentsStartNum,
  title,
  salleStartNum
) {
  let arr = [];
  console.log(surplus);
  let tr = "";
  let star = studentsStartNum;
  let sall = salleStartNum;
  let index = salleStartNum;
  let chunkSize;
  let chunks = [];
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
  for (let i = 0; i < new_ar.length; i += chunkSize) {
    const chunk = new_ar.slice(i, i + chunkSize);
    arr.push(chunk);
    const nbrtas = star + " إلى: " + (star + chunk.length - 1);
    tr += htm(
      index,
      sall,
      chunk.length,
      `${niv} ${choaba} ${fawj ? fawj : ""}`,
      nbrtas,
      title
    );
    star = star + chunk.length;
    index++;
    sall++;
  }
  $content.innerHTML = tr;
  console.log(arr);
}
function htm(index, sall, studentsNbr, mostawa, nbrtas, title) {
  return `
        <div class="sheet h-auto p-5mm hacen">
            <div class="bg-cover-po bg-cover-2 p-6rem">
               ${header}
                <div class="d-flex section">
                    <div style="font-size: 2rem">
                    ${title}
                    </div>
                    <div class="fs-3 ">
                    ${mostawa}
                    </div>
                    <div style="font-size: 7rem; line-height: 14rem;">
                        القـاعة: ${sall}
                    </div>
                     <div>
                    <input type="text" class="hacen mb-4 text-center" style="font-size:4rem" placeholder="اسم القاعة(اترك الحقل فارغا في حال عدم التعديل)">
                </div>
                    <div style="font-size: 1.7rem">
                        عدد التلاميذ: ${studentsNbr} من: ${nbrtas}
                    </div>
                </div>
            </div>
        </div>
        <div style="page-break-after:always"></div>`;
}
