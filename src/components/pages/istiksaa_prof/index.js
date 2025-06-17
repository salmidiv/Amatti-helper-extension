import { personalsTable } from "../../../../core/db/conn.js";
import { this_year } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";

var titlesL = [
  "1- أستاذ مبرز.",
  "2- الأستاذ المكون في التعليم الثانوي.",
  "3- أستاذ رئيسي للتعليم الثانوي.",
  "4- أستاذ منسق للتعليم الثانوي .",
  "5- أستاذ التعليم الثانوي .",
  "6- أساتذة التعليم المتوسـط.",
  "7- منهم الأساتذة الأجانب",
];

var titlesP = [
  "1-  الاستاذ المكون  في  المدرسة الإبتدائية",
  "2- أستاذ رئيسي للمدرسة الإبتدائية",
  "3- أستاذ المدرسة الابتدائية .",
  "4-  معلم مدرسة إبتدائية.",
  "5- منهم الأساتذة الأجانب",
];

var titlesC = [
  "1- الأستاذ المكون في التعليم المتوسط.",
  "2- أستاذ رئيسي للتعليم المتوسط.",
  "3- أستاذ التعليم المتوسط .",
  "4- أساتذة المدرسة الابتدائية.",
  "5- منهم الأساتذة الأجانب",
];

function unique(array, key) {
  const uniqueKeys = new Set();
  return array.reduce((uniqueObjects, obj) => {
    if (!uniqueKeys.has(obj[key])) {
      uniqueKeys.add(obj[key]);
      uniqueObjects.push(obj);
    }
    return uniqueObjects;
  }, []);
}

const showMada = async () => {
  const rows = await personalsTable.where("mada").notEqual("").toArray();
  //const res = await db.selectwithqueryss(
  //  `SELECT p_mada FROM personnels where p_mada != ""`
  //);
  // const rows = res.rows;
  const mawad = unique(rows, "mada");
  $mada.innerHTML =
    `<option value="">اختر المادة</option>` +
    mawad.map((mada) => {
      return `<option value="${mada.mada}">${mada.mada}</option>`;
    });
};
showMada();

$showResult.addEventListener("click", async () => {
  const mada = $mada.value;
  if (mada == "") alert("يجب اختيار المادة أولا");
  collectData(mada);
});

const collectData = async (mada) => {
  const rows = await personalsTable.where("mada").startsWith(mada).toArray();
  console.log(rows);
  if (_.isLycee()) {
    const mobriz = rows.filter((prof) => prof.rotba.includes("مبرز"));
    fill_table(mobriz, "mobriz", 0);
    console.log(mobriz);
  }
  const index_mokawin = _.isLycee() ? 1 : 0;
  const mokawin = rows.filter((prof) => prof.rotba.includes("مكون"));
  fill_table(mokawin, "mokawin", index_mokawin);
  console.log(mokawin);
  const index_raiis = _.isLycee() ? 2 : 1;
  const raiis = rows.filter((prof) => prof.rotba.includes("رئيسي"));
  fill_table(raiis, "raiis", index_raiis);
  console.log(raiis);
  if (_.isLycee()) {
    const monasik = rows.filter((prof) => prof.rotba.includes("منسق"));
    fill_table(monasik, "monasik", 3);
  }
  const index_normal = _.isLycee() ? 4 : 2;
  var text = "أستاذ التعليم الثانوي";
  if (_.isCem()) {
    text = "أستاذ التعليم المتوسط";
  }
  if (_.isPrimary()) {
    text = "أستاذ المدرسة  الإبتدائية";
  }
  const normal = rows.filter((prof) => prof.rotba.includes(text));
  fill_table(normal, "normal", index_normal);
  console.log(normal);
  const index_cem = _.isLycee() ? 5 : 3;
  const search2 = _.isLycee() ? "متوسط" : _.isCem() ? "ابتدائية" : "معلم";
  const cem = rows.filter((prof) => prof.rotba.includes(search2));
  fill_table(cem, "cem", index_cem);
  console.log(cem);
  const index_emi = _.isLycee() ? 6 : 4;
  const emi = rows.filter(
    (prof) => prof.jinsiya && !prof.jinsiya.includes("الجزائرية")
  );
  fill_table(emi, "emi", index_emi);
  console.log(emi);
};

const fill_table = (rows, id, inde) => {
  const titles_array = _.isLycee() ? titlesL : _.isCem() ? titlesC : titlesP;
  let ara = [35, "35-39", "40-44", "45-49", "50-54", 55, 56, 57, 58, 59, 60];
  const table = document.querySelector("#" + id);
  table.innerHTML = "";
  document.querySelector("#" + id + "Title").innerHTML = titles_array[inde];
  $madaName.innerHTML = $mada.value;
  var th = `<tr><th>السن</th>`;
  for (let index = 0; index < ara.length; index++) {
    th += `<th>${ara[index]}</th>`;
  }
  th += `<th>المجموع</th></tr>`;
  table.innerHTML = th;

  let totla = [];
  let girl = [];

  if (rows.length < 1) {
    table.innerHTML +=
      '<tr><th>مجموع</th><td colspan="12" class="m-0 text-center fw-bold fs-3">لا يوجد</td></tr>';
  }
  if (rows.length > 0) {
    for (let i = 0; i < ara.length; i++) {
      let d = 0,
        g = 0;
      for (let index = 0; index < rows.length; index++) {
        if (i == 0) {
          if (calc_age(rows[index].birthday) < Number(ara[i])) d++;
        }
        if (i == ara.length - 1) {
          if (calc_age(rows[index].birthday) >= Number(ara[i])) d++;
        }
        if (i != 0 && i != ara.length - 1) {
          if (Number(ara[i])) {
            if (_.age(rows[index].birthday, this_year) == Number(ara[i])) d++;
          } else {
            if (
              calc_age(rows[index].birthday) >= Number(ara[i].split("-")[0]) &&
              calc_age(rows[index].birthday) <= Number(ara[i].split("-")[1])
            )
              d++;
          }
        }
      }
      totla[i] = d;
      girl[i] = g;
    }

    var tr = `<tr><th>مجموع</th>`;
    for (let index = 0; index < totla.length; index++) {
      tr += `<td>${totla[index]}</td>`;
    }
    tr += `<th>${count(totla)}</th>`;
    tr += `</tr>`;
    table.innerHTML += tr;
  }
};
function calc_age(birthday, old = 0) {
  const type = localStorage.dateType;
  let time;
  switch (type) {
    case "1":
      time = new Date();
      break;
    case "2":
      time = new Date().getFullYear();
      time = old == 1 ? time - 1 : time;
      return time - new Date(birthday).getFullYear();
    case "3":
      time = old == 1 ? new Date("2022-12-31") : new Date("2023-12-31");
      break;
    case "4":
      const custom_date = localStorage.cusTime;
      time = new Date(custom_date);
      break;
    default:
      return 0; // Handle unsupported type or other cases
  }
  const month_diff = time.getTime() - new Date(birthday).getTime();
  var year = new Date(month_diff).getUTCFullYear();
  year = old == 1 ? year - 1 : year;
  return Math.abs(year - 1970);
}

function count(array) {
  //s = 0;
  //for (let index = 0; index < array.length; index++) {
  //  s = s + array[index];
  //}
  //return s;
  return array.reduce((acc, currentValue) => acc + currentValue, 0);
}

/*
function calc_age(birthday) {
  const type = localStorage.dateType;
  let time;
  switch (type) {
    case 1:
      time = new Date();
      break;
    case 2:
      time = new Date();
      return time.getFullYear() - new Date(birthday).getFullYear();
    case 3:
      time = new Date("2023-12-31");
      break;
    case 4:
      const custom_date = localStorage.cusTime;
      time = new Date(custom_date);
      break;
    default:
      return 0; // Handle unsupported type or other cases
  }

  const month_diff = time.getTime() - new Date(birthday).getTime();
  const year = new Date(month_diff).getUTCFullYear();
  return Math.abs(year - 1970);
}
*/
