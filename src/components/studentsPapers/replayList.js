import { db } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
document.title = `قوائم التلاميذ المعيدين`;
load_data();
async function load_data() {
  const response = await db.students
    .where({ s_annee: this_year, s_moiid: 1 })
    .toArray();
  groupedData(response);
}
function groupedData(response) {
  const groupedData = response.reduce((groups, item) => {
    const { s_niv, s_choaba, s_section } = item;
    const groupKey = `${s_niv} ${s_choaba} ${s_section}`;
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
            <h1 class="m-0 p-0 hacen fs-2 text-center">قوائم التلاميذ المعيدين لقسم: ${key
              .split("-")
              .join(" ")}</h1>
            <div class="content">
            <table class="table mb-3 fs-4 hacen text-center">
                <thead>
                    <tr>
                        <th class=" th_s" style="width: 35px;">الرقم  </th>
                        <th class=" th_s" style="width: 130px;">رقم التعريف </th>
                        <th class="th_s">الاسم واللقب </th>
                        <th class="th_s" style="width: 50px;">الجنس</th>
                        <th class="th_s" style="width: 100px;">تاريخ الميلاد</th>
                        <th class="th_s" style="width:135px">اسم الأب</th>
                        <th class="th_s">الصفة </th>
                        <th class="th_s" style="width: 80px;">السن </th>
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
    tr += `
        <tr>
            <td>${index++}</td>
            <td>${item.s_matt}</td>
            <td>${item.s_nom} ${item.s_prenom}</td>
            <td>${item.s_gender}</td>
            <td>${item.s_birthday}</td>
            <td>${item.nom_pere ?? ""}</td>
             <td>${
               _.isNull(item.s_sifa) ? "" : item.s_sifa.replace("نصف ", "ن.")
             }</td>
            <td>${_.age(item.s_birthday, this_year)}</td>
        </tr>`;
  }
  return tr;
}
