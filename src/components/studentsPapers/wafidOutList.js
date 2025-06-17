import { db } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";

let params = segments[1].includes("wafid")
  ? { text: "الوافدين", type: "IN", t_type: "الدخول", school: "الأصلية" }
  : { text: "المغادرين", type: "OUT", t_type: "الخروج", school: "المستقبلة" };
document.title = `قوائم التلاميذ ${params.text}`;
load_data();
const thead = `<tr>
                <th class=" th_s" style="width: 50px;">الرقم </th>
                <th class="th_s">الاسم واللقب </th>
                <th class="th_s" style="width: 100px;">تاريخ الميلاد</th>
                <th class="th_s" style="width: 110px;">المستوى</th>
                <th class="th_s" style="width: 55px;">المؤسسة الأصلية</th>
                <th class="th_s" style="width: 80px;">الصفة</th>
                <th class="th_s" style="width: 40px;">السن</th>
            </tr>`;
async function load_data() {
  const response = await db.inoutstudents
    .where({ s_annee: this_year })
    .and((eleve) => eleve.s_type == params.type)
    .toArray();
  groupedData(response);
}
function groupedData(response) {
  const groupedData = response.reduce((groups, item) => {
    const { s_niv } = item;
    const groupKey = `${s_niv}`;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
  print(groupedData);
}

function print(groupedData) {
  let html = `<div class="sheet p-5mm h-auto">
            <div>${header}</div>`;
  let i = 0;
  for (const key in groupedData) {
    html += `
            <h1 class="m-0 p-0 hacen fs-2 text-center">قوائم التلاميذ ${
              params.text
            } لقسم: ${key.split("-").join(" ")}</h1>
            <div class="content">
            <table class="table mb-3 fs-4 hacen text-center">
                <thead>
                    <tr>
                        <th class=" th_s" style="width: 50px;">الرقم </th>
                        <th class="th_s">الاسم واللقب </th>
                        <th class="th_s" style="width: 100px;">تاريخ الميلاد</th>
                        <th class="th_s">المؤسسة ${params.school}</th>
                        <th class="th_s" style="width: 100px;">تاريخ ${
                          params.t_type
                        }</th>
                        <th class="th_s" style="width: 40px;">السن</th>
                    </tr>
                </thead>
                <tbody id="$studentsList">
        `;
    html += create_table(groupedData[key]);
    html += `</tbody></table></div>`;
  }
  html += `<div>${footer}</div></div>`;
  document.body.innerHTML = html;
}
function create_table(group) {
  let tr = "";
  let index = 1;
  for (const item of group) {
    tr += `<tr><td>${index++}</td>
    <td>${item.s_nom} ${item.s_prenom}</td>
    <td>${item.s_birthday}</td>
    <td>${item.distination}</td>
    <td>${item.date_transfer ?? ""}</td>
    <td>${_.age(item.s_birthday, this_year)}</td></tr>`;
  }
  return tr;
}
