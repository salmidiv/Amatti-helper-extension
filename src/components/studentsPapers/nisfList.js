import { moreInfoTable, studentsTable } from "../../../core/db/conn.js";
import {
  MOTAMADRIS,
  segments,
  this_year,
} from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";

const typeT = segments[1].includes("external") ? "الخارجيين" : "النصف داخلي";
document.title = `قوائم تلاميذ ${typeT}`;
loadData();

async function loadData() {
  const type = segments[1].includes("external") ? "خارجي" : "نصف داخلي";
  const response = await studentsTable
    .where({ s_annee: this_year, is_study: MOTAMADRIS, s_sifa: type })
    .toArray();
  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(response, moreInfo);
  const groupedData = lists.reduce((groups, item) => {
    const { s_niv, s_choaba, s_section } = item;
    const groupKey = `${s_niv}-${s_choaba.trim()}-${s_section}`;
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {});
  print(groupedData);
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
function print(groupedData) {
  let html = "";
  for (const key in groupedData) {
    const sectionTitle = key.split("-").join(" ");
    html += `
        <div class="sheet p-5mm ${
          groupedData[key].length > 30 ? "h-auto" : ""
        }">
            <div>${header}</div>
            <h1 class="m-0 p-0 hacen fs-2 text-center">قوائم تلاميذ ${typeT} لقسم: ${sectionTitle}</h1>
            <div class="content">
                <table class="table mb-0 fs-4 hacen text-center">
                    <thead>
                        <tr>
                            <th class="th_s" style="width: 50px;">الرقم </th>
                            <th class="th_s">الاسم واللقب </th>
                            <th class="th_s" style="width: 50px;">الجنس</th>
                            <th class="th_s" style="width: 100px;">تاريخ الميلاد</th>
                            <th class="th_s" style="width: 110px;">اسم الأب</th>
                            <th class="th_s" style="width: 55px;">الإعادة</th>
                            <th class="th_s" style="width: 80px;">الصفة</th>
                            <th class="th_s" style="width: 40px;">السن</th>
                        </tr>
                    </thead>
                    <tbody id="$studentsList">
    `;
    html += createTable(groupedData[key]);
    html += `</tbody></table></div> <div>${footer}</div></div>`;
  }
  document.body.innerHTML = html;
}

function createTable(group) {
  let tr = "";
  let index = 1;
  for (const item of group) {
    tr += `<tr><td>${index++}</td>
    <td>${item.s_nom} ${item.s_prenom}</td>
    <td>${item.s_gender}</td>
    <td>${item.s_birthday}</td>
    <td>${item.nom_pere ?? ""}</td>
    <td>${item.s_moiid == 1 ? "نعم" : "لا"}</td>
    <td>${_.isNull(item.s_sifa) ? "" : item.s_sifa.replace("نصف ", "ن.")}</td>
    <td>${_.age(item.s_birthday, this_year)}</td></tr>`;
  }
  return tr;
}
