import { studentsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import {
  footer,
  footer2,
  header,
  header2,
} from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
async function getStudents(id, dbindex) {
  return await studentsTable
    .where({ s_annee: this_year })
    // .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) => eleve?.s_sifa?.includes("نصف داخلي"))
    //.and((eleve) =>
    //  _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    //)
    .toArray();
}

async function init() {
  let id = _.decodeURL(segments[2]);
  let dbindex = _.isLycee() ? 2 : 1;
  id = id.split("-");
  const students = await getStudents(id, dbindex);
  const studentsByPages = _.splitArray(students, 8);
  const html = templet(studentsByPages);
  _.qSel("#content").innerHTML = html;
}
function templet(pages) {
  var htmlPage = "";
  for (const page of pages) {
    htmlPage += `
        <div class="sheet p-5mm hacen">
          ${makeCards(page)}
        </div>
        `;
  }
  return htmlPage;
}
function makeCards(list) {
  console.log(list);
  const html = list
    .map(
      (s) => `
      <div class="border w-50 fl p-3 pb-5">
     ${header2}
      <div class="text-center fw-bold fs-2">بطاقـــــة المطعم</div>
      <div style="display: flex; justify-content: space-between">
        <div style="width: 120px; height: 100px; border: 1px solid ; display: flex;
    justify-content: center;
    align-items: center;">الصورة</div>
        <div class="w-100 mr-2">
          <div class="mt-2">  اللقب والاسم: <b> ${s.s_nom} ${
        s.s_prenom
      } </b></div>
          <div>تاريخ الميلاد: <b>${s.s_birthday}</b></div>
          <div>القسم: <b>${
            _.isLycee()
              ? _.shortName(`${s.s_niv} ${s.s_choaba} ${s.s_section}`)
              : `${s.s_niv} ${s.s_choaba} ${s.s_section}`
          }</b></div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between">
        ${footer2}
        <p class="m-0 d-block fw-bold">المقتصد</p>
      </div>
    </div>
  `
    )
    .join("");
  return html;
}

init();

/*
import { studentsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
async function getStudents(id, dbindex) {
  return await studentsTable
    .where({ s_niv: `${id[0].trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) => eleve?.s_sifa?.includes("نصف داخلي"))
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .toArray();
}

async function init() {
  let id = _.decodeURL(segments[2]);
  let dbindex = _.isLycee() ? 2 : 1;
  id = id.split("-");
  const students = await getStudents(id, dbindex);
  const studentsByPages = _.splitArray(students, 8);
  const html = templet(studentsByPages);
  _.qSel("#content").innerHTML = html;
}
function templet(pages) {
  var htmlPage = "";
  for (const page of pages) {
    htmlPage += `
        <div class="sheet p-5mm hacen">
          ${makeCards(page)}
        </div>
        `;
  }
  return htmlPage;
}
function makeCards(list) {
  console.log(list);
  const html = list
    .map(
      (s) => `
     <div class="border w-50 p-2 fl">
      <div class="fs-c">
        ${header}
      </div>
      <div class="fl w-60">
        <div class="text-center fw-bold fs-1">بطاقـــــة المطعــــم</div>
        <div class="mt-2">
          اللقب والاسم: <b> ${s.s_nom} ${s.s_prenom} </b>
        </div>
        <div>
          تاريخ الميلاد: <b>${s.s_birthday}</b>
        </div>
        <div>
          القسم: <b>${s.s_niv} ${s.s_choaba} ${s.s_section}</b>
        </div>
      </div>
       <div class="fl w-40">
          <div class="image">
          </div>

      </div>
    </div>
  `
    )
    .join("");
  return html;
}

init();
*/
