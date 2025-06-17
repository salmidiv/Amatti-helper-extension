import { db, moreInfoTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
let id = _.decodeURL(segments[2]);
if (segments[1] == "scrapsniv") students_niv();
if (segments[1] == "all-scraps") all_students();
if (segments[1] == "one-scrap") one_student();
if (segments[1] == "scraps-nisf") nisf_students();

async function nisf_students() {
  document.title = `جذاذات تلاميذ النصف داخلي لقسم ${id.split("-").join(" ")}`;
  let dbindex = _.isLycee() ? 2 : 1;
  console.log(dbindex);
  id = id.split("-");
  const response = await db.students
    .where({ s_niv: `${id[0].trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .and((eleve) => eleve?.s_sifa?.includes("نصف"))
    .toArray();

  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(response, moreInfo);
  init(lists);
}
async function students_niv() {
  document.title = `جذاذات تلاميذ قسم ${id.split("-").join(" ")}`;
  let dbindex = _.isLycee() ? 2 : 1;
  id = id.split("-");
  const response = await db.students
    .where({ s_niv: `${id[0].trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .toArray();
  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(response, moreInfo);
  init(lists);
}
function mergedArray(array1, array2) {
  const mergedArray = array1.map((item1) => {
    const matchingItem2 = array2.find(
      (item2) => Number(item2.matricule) === item1.s_matt
    );
    return { ...item1, ...matchingItem2 };
  });
  return mergedArray;
}
async function all_students() {
  document.title = "جذاذات جميع التلاميذ";
  const response = await db.students.where({ s_annee: this_year }).toArray();
  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(response, moreInfo);
  init(lists);
}

async function one_student() {
  _.addClass($action, "d-none");
  const response = await db.students
    .where({ s_matt: segments[2], s_annee: this_year })
    .toArray();
  document.title = `جذاذة التلميذ${
    response[0].s_gender.includes("أنثى") ? "ة" : ""
  }: ${response[0].s_nom} ${response[0].s_prenom}`;

  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(response, moreInfo);
  init(lists);
}
function init(response) {
  response.sort((a, b) =>
    a.s_regester_nbr < b.s_regester_nbr
      ? -1
      : a.s_regester_nbr > b.s_regester_nbr
      ? 1
      : 0
  );
  let boys = [...response].filter((e) => e.s_gender.includes("ذكر"));
  let girls = [...response].filter((e) => e.s_gender.includes("أنثى"));

  const pageSize = 9;
  const pages_boys = Array.from(
    { length: Math.ceil(boys.length / pageSize) },
    (_, index) => boys.slice(index * pageSize, (index + 1) * pageSize)
  );

  const pages_girls = Array.from(
    { length: Math.ceil(girls.length / pageSize) },
    (_, index) => girls.slice(index * pageSize, (index + 1) * pageSize)
  );

  var sheet = template(pages_boys, "boys");
  sheet += template(pages_girls, "girls");
  _.getid("content").innerHTML = sheet;
  action();
}
function template(pages, className) {
  let sheet = "";
  for (let index = 0; index < pages.length; index++) {
    sheet += `<div class="sheet p-5mm page ${className}">`;
    const page = pages[index];
    for (let i = 0; i < page.length; i++) {
      const student = page[i];
      sheet += ` <div class="w-1-3 ${
        student.s_sifa == "خارجي" ? "extern" : "intern"
      }">
                    <div class="scrap">
                        <div class="head">
                            <h2 class="m-0 fs-3 text-center">
                                    <strong>
                               ${student.s_nom} ${student.s_prenom}  
                                    </strong>
                            </h2>
                        </div>
                        <div class="cont">
                            <span class="fs-5">
                            القيد:
                                    <strong>
                                ${student.s_regester_nbr}
                                    </strong>
                                 |
                                الجنس:
                                    <strong>
                                ${student.s_gender}
                                    </strong>
                            </span>
                               <span class="fs-5">
                               الإعادة:
                                <strong>
                                ${student.s_moiid == 1 ? "نعم" : "لا"}
                                </strong>
                                    |
                                       الصفة:
                                <strong>
                                ${student?.s_sifa.replace("نصف ", "ن.") ?? ""}
                                </strong>
                            </span>
                             <span class="fs-5">
                                القسم: 
                                    <strong>
                                ${student.s_niv} ${student.s_choaba} ${
        student.s_section
      }
                                    </strong>
                            </span>
                            <span class="fs-5">
                                ت.م:
                                    <strong>
                                ${student.s_birthday}
                                    </strong>
                            </span>
                              <span class="fs-5">
                                    بـ
                                    <strong>
                                ${student?.lieun ?? ""}
                                    </strong>
                            </span>
                            <span class="fs-5">
                                 ع.ش:
                                <strong>
                                 ${student?.adresse ?? ""} 
                                    </strong>
                            </span>
                            <span class="fs-5">
                                الأب:
                                <strong>${student?.nom_pere ?? ""}</strong>
                            </span>
                            <span class="fs-5">
                                الأم:
                                <strong>
                                ${student?.nom_mere ?? ""}
                                ${student?.prenom_mere ?? ""}
                                </strong>
                            </span>
                            <span class="fs-5">
                                رقم الهاتف:
                                <strong>
                                ${student?.tel ?? ""}
                                </strong>
                            </span>
                            <span class="fs-5">
                             
                            </span>
                            
                        </div>
                    </div>
                </div>`;
    }
    sheet += "</div>";
  }

  return sheet;
}
function action() {
  _.btnEvent(_.getid("boys"), "change", () => {
    const elements = _.qSelAll(".boys");
    elements.forEach((element) => element.classList.toggle("d-none"));
  });
  _.btnEvent(_.getid("girls"), "change", () => {
    const elements = _.qSelAll(".girls");
    elements.forEach((element) => element.classList.toggle("d-none"));
  });

  _.btnEvent(_.getid("intern"), "change", () => {
    const elements = _.qSelAll(".intern");
    elements.forEach((element) => element.classList.toggle("d-none"));
  });
  _.btnEvent(_.getid("extern"), "change", () => {
    const elements = _.qSelAll(".extern");
    elements.forEach((element) => element.classList.toggle("d-none"));
  });
}
