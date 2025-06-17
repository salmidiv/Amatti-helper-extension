import { db, personalsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
let id = _.decodeURL(segments[2]);
if (id == "teachers") teachers_S();

async function teachers_S() {
  const response = await personalsTable
    .filter((e) => e.rotba.includes("أستاذ"))
    .toArray();
  init(response);
}

function init(response) {
  //response.sort((a, b) =>
  //  a.s_regester_nbr < b.s_regester_nbr
  //    ? -1
  //    : a.s_regester_nbr > b.s_regester_nbr
  //    ? 1
  //    : 0
  //);
  let boys = response.filter((e) => e?.gender === "ذكر");
  let girls = response.filter((e) => e.gender != "ذكر");

  const pageSize = 6;
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
  return pages
    .map(
      (page) =>
        `<div class="sheet p-5mm page ${className}">
      ${page
        .map(
          (u) =>
            `<div class="w-1-3">
          <div class="scrap">
            <div class="head">
              <h2 class="m-0 fs-3 text-center">
                <strong>${u.nom} ${u.prenom}</strong>
              </h2>
            </div>
            <div class="cont">
              <span class="fs-5">
                الرقم الوظيفي: <strong>${u.matt}</strong> 
              </span>
              <span class="fs-5">
                الجنس: <strong>${u.gender ?? "أنثى"}</strong> 
              </span>
              <span class="fs-5">
                ت.م: <strong>${u.birthday}</strong> بـ
                <strong>${u?.birthplace ?? ""}</strong>
              </span>
              <span class="fs-5">
                ع.ش: <strong>${u?.private_adress ?? ""}</strong>
              </span>
              <span class="fs-5">الرتبة: <strong>${
                u?.rotba ?? ""
              }</strong></span>
               <span class="fs-5">المادة: <strong>${
                 u?.mada ?? ""
               }</strong></span>
              <span class="fs-5">
                ح.اجتماعية: <strong>${u?.family_status ?? ""}</strong>
                                 |
                عدد أولاد: <strong>${u.nbrenf}</strong>
              </span>
              
              <span class="fs-5">تاريخ التوظيف: <strong>${
                u?.tawdif_date ?? ""
              }</strong></span>
              <span class="fs-5">ت.ت في المؤسسة: <strong>${
                u?.current_school_date ?? ""
              }</strong></span>
              <span class="fs-5">ح.ب: <strong>${u?.ccp ?? ""}</strong></span>
              <span class="fs-5">ض.أ: <strong>${u?.nss ?? ""}</strong></span>
              <span class="fs-5"> رقم الهاتف: <strong>${
                u?.port ?? ""
              }</strong></span>
              <span class="fs-5"> الدرجة الحالية : <strong>${
                u?.corrant_daraja ?? ""
              }</strong></span>
              <span class="fs-5"> تاريخها: <strong>${
                u?.corrant_daraja_date ?? ""
              }</strong></span>
              


              
            </div>
          </div>
        </div>`
        )
        .join("")}
    </div>`
    )
    .join("");
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
}
