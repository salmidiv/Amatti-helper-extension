import {
  db,
  finalResTable,
  mawadTable,
  StatisTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { this_trim, this_year } from "../../../../core/helpers/const.js";
if (
  !localStorage.lawha ||
  !localStorage.tchjia ||
  !localStorage.thniaa ||
  !localStorage.imtiyaz
) {
  _.qSel(".wrapper").innerHTML = `<h1 class="text-center">
  يجب حجز معدلات الاجازات أولا من صفحة قرار مجلس القسم ،أيقونة إدراج معدلات الإجازات والملاحظات الموجوجدة في شريط الإضافة
</h1>`;
}
let trim = Number(this_trim.toString().slice(-1));
const Maxmoy = _.Mmoy();

const moys = _.isPrimary()
  ? [
      "تعداد>=5",
      "0-2.99",
      "3-3.99",
      "4-4.99",
      "5-5.99",
      "6-6.99",
      "7-7.99",
      "8-10",
    ]
  : [
      "تعداد>= 10",
      "0-8.99",
      "9-9.99",
      "10-11.99",
      "12-13.99",
      "14-15.99",
      "16-17.99",
      "18-20",
    ];
function s_o(elm) {
  return elm.options[elm.selectedIndex].text;
}
$anneschool.addEventListener("change", async () => {
  update_mark();
});

async function update_mark() {
  const year = $anneschool.value;
  if (year) {
    const res = await _.fetchData(
      "scolarite/en_chiffre/analyse_class/get_division",
      { annee: year, isAjax: true },
      "text"
    );
    $divi.innerHTML = res;
  }
}

$divi.addEventListener("change", async () => {
  if ($divi.value) load_data($anneschool.value, $divi.value);
});
async function fetchData(division, annee) {
  try {
    // Perform an inner join between "statis" and "students" tables
    const result = await db.transaction(
      "r",
      StatisTable,
      studentsTable,
      async () => {
        const statisData = await StatisTable.where({
          division: division.toString(),
          annee: Number(annee),
        }).toArray();

        const studentMatts = statisData.map((record) => Number(record.matt));
        const studentsData = await studentsTable
          .where("s_matt")
          .anyOf(studentMatts)
          .toArray();

        // Combine the data from both tables based on the join condition
        const joinedData = statisData.map((statisRecord) => {
          const studentRecord = studentsData.find(
            (student) => student.s_matt === Number(statisRecord.matt)
          );
          return {
            ...statisRecord,
            student: studentRecord,
          };
        });

        return joinedData;
      }
    );
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
function otherAnne(str) {
  let lastDigit = str.at(-1);

  let result =
    lastDigit === "2"
      ? str.slice(0, -1) + "1"
      : lastDigit === "1"
      ? str.slice(0, -1) + "2"
      : str;

  return result;
}
async function load_data(annee, niv) {
  const other_annee = otherAnne(annee);
  const helperData = await fetchData(niv, annee);
  const res = await finalResTable.where({ niv: niv, annee: annee }).toArray();
  const cols = await mawadTable.where({ niv: niv, annee: annee }).toArray();
  const res2 = await finalResTable
    .where({ niv: niv, annee: other_annee })
    .toArray();
  const cols2 = await mawadTable
    .where({ niv: niv, annee: other_annee })
    .toArray();

  document.getElementById("success-rates-section").innerHTML = "";
  document.getElementById("stat-table").innerHTML = "";
  document.getElementById("s-note-table").innerHTML = "";
  document.getElementById("ijaza-section").innerHTML = "";
  document.getElementById("averages-range-section").classList.add("d-none");
  document.getElementById("stat-by-module").classList.add("d-none");
  buildTable(cols[0], res, cols2[0], res2, helperData);
  stat_one(JSON.parse(cols[0]?.data), res, helperData);
  genaral_state(JSON.parse(cols[0]?.data), res, helperData);
  four(cols[0], res, helperData);
  five(JSON.parse(cols[0]?.data), res, helperData);
  count_ijaza();
  averages_range(res);
}
function buildTable(cols, d, cols2, d2, helperData) {
  const niv = cols.niv;
  const annee = cols.annee;
  const c = JSON.parse(cols?.data);
  _.qSel(
    "#finalstudentslists"
  ).innerHTML = `<h2 class="hacen fw-bold mb-3">1 - قائمة التلاميذ  ${s_o(
    $divi
  )}</h2>`;
  createTable("lists", "success-rates-section");
  let tr = `<tr>
    <th class="rotate" style="width:2%" align="center"><div> ${c[0]}</div></th>
    <th width="12%">${c[1]}</th>
    <th class="rotate" style="width:2%" align="center"><div> العمر</div></th>
    <th class="rotate" style="width:2%" align="center"><div> ${c[3]}</div></th>
    <th class="rotate" style="width:2%" align="center"><div> ${c[4]}</div></th>
    `;
  for (let index = 5; index < c.length; index++) {
    let element = c[index];
    element = element.includes("الفيزيائية") ? "الفيزياء 0" : element;
    tr += `<th class="rotate" style="width:2%" align="center"><div> ${
      element.slice(0, -1) + "1+2"
    }</div></th>`;
  }
  tr += `<th width="5%">الإجازة</th></tr>`;
  const tableHead = document
    .getElementById("lists")
    .getElementsByTagName("thead")[0];
  tableHead.innerHTML = tr;
  d = sortArray(d);
  let trs = "";
  for (let i = 0; i < d.length; i++) {
    let dr = JSON.parse(d[i].data);
    let findDr2 = d2.find((student) => {
      return JSON.parse(student.data)[1].includes(dr[1]);
    });
    let dr2 = JSON.parse(findDr2.data);
    trs += `<tr>`;
    trs += `<td>${i + 1}</td>`;
    trs += `<td  class="colorise ${dr[3].includes("أنثى") ? "girl" : ""}">${
      dr[1]
    }</td>`;
    trs += `<td>${_.age(dr[2].trim(), this_year)}</td>`;
    trs += `<td >${dr[3]}</td>`;
    trs += `<td class="colorise ${dr[4].includes("نعم") ? "moiid" : ""}">${
      dr[4]
    }</td>`;
    for (let r = 5; r < dr.length; r++) {
      const find = helperData.find(
        (data) =>
          +data.division === +niv &&
          +data.annee === +annee &&
          dr[1].includes(data.nom) &&
          dr[1].includes(data.prenom) &&
          data.matiere_name.includes(c[r])
      );
      var elm = find?.exam.includes("معفى") ? "معفى" : dr[r];
      var elm2 = find?.exam.includes("معفى") ? "معفى" : dr2[r];
      const moyen =
        elm.includes("معفى") && elm2.includes("معفى")
          ? "معفى"
          : ((Number(elm) + Number(elm2)) / 2).toFixed(2);
      let css =
        r == elm < Maxmoy && r != 0
          ? "moy"
          : elm.includes("معفى")
          ? "moafa"
          : "";
      elm = r == 1 ? `${elm}[${d[i].niv_sec}]` : moyen;
      trs += `<td class="colorise ${css}">${elm}</td>`;
    }

    trs += `<td>${add_ijaza(
      ((Number(dr.pop()) + Number(dr2.pop())) / 2).toFixed(2)
    )}</td></tr>`;

    // Append the <tr> element to the <thead> element
  }
  const tableBody = document
    .getElementById("lists")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = trs; //insertAdjacentHTML("beforeend", trs);
}
function createTable(id, place) {
  const tables = document.createElement("table");
  tables.id = id;
  tables.className = "-100 fs-4";
  tables.border = "1";
  tables.align = "center";
  tables.dir = "rtl";
  const theads = document.createElement("thead");
  const tbodys = document.createElement("tbody");
  tables.append(theads, tbodys);
  document.getElementById(place).appendChild(tables);
}

function sortArray(arr) {
  return arr.sort((a, b) => {
    const getValue = (item) => {
      const data = JSON.parse(item.data);
      const lastValue = data[data.length - 1];
      if (!lastValue.includes("غ")) {
        return parseFloat(lastValue); // Convert to float if not containing 'غ'
      } else {
        return 0; // Return 0 if containing 'غ'
      }
    };

    return getValue(b) - getValue(a);
  });
}
function z(e, x) {
  const splitValues = moys[e].split("-");
  return Number(splitValues[x]) + (x !== 0 && e !== 7 ? 0.01 : 0);
}

function isNull(object) {
  return typeof object === "null" || object === null;
}

function getStandardDeviation(array) {
  const n = array.length;
  if (n == 0) return 0;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}
const median = (arr) => {
  arr.sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
};

const mode = (arr) => {
  const mode = {};
  let max = 0,
    count = 0;
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    mode[item] = (mode[item] || 0) + 1;
    if (count < mode[item]) {
      max = item;
      count = mode[item];
    }
  }
  return max;
};
function add_ijaza(grade) {
  // Convert grade to number (works with "14.00" format)
  const numericGrade = Number(grade);

  // Parse ranges from localStorage
  const lawhaRange = localStorage.lawha.split("-").map(Number);
  const tchjiaRange = localStorage.tchjia.split("-").map(Number);
  const thniaaRange = localStorage.thniaa.split("-").map(Number);
  const imtiyazRange = localStorage.imtiyaz.split("-").map(Number);
  let ijaza;
  switch (true) {
    case numericGrade >= lawhaRange[0] && numericGrade < lawhaRange[1]:
      ijaza = "لوحة شرف";
      break;
    case numericGrade >= tchjiaRange[0] && numericGrade < tchjiaRange[1]:
      ijaza = "تشجيع";
      break;
    case numericGrade >= thniaaRange[0] && numericGrade < thniaaRange[1]:
      ijaza = "تهنئة";
      break;
    case numericGrade >= imtiyazRange[0] && numericGrade < imtiyazRange[1]:
      ijaza = "امتياز";
      break;
    default:
      ijaza = "";
      break;
  }
  return ijaza;
}

function stat_one(c, d) {
  const table = document.getElementById("lists");
  if (!table) {
    alert("لا توجد بيانات");
    return;
  }

  document.getElementById("general-stat").classList.remove("d-none");

  $t2.innerHTML = "2 - حصيلة نتائج التقويم";

  let boy = 0,
    girl = 0,
    moid = 0,
    boy_t = 0,
    girl_t = 0,
    moid_t = 0,
    t_moy = 0,
    moye = 0;

  const stude = d.filter((s) => !JSON.parse(s.data).pop().includes("غ"));
  const row_len = stude.length;

  if (row_len === 0) return;

  stude.forEach((value) => {
    const data = JSON.parse(value.data);
    const gen = data[3];
    const moi = data[4];
    const mm = data.pop();
    moye = Number(mm);
    t_moy += moye;
    if (gen.includes("ذكر")) boy++;
    if (gen.includes("أنثى")) girl++;
    if (moi.includes("نعم")) moid++;
    if (gen.includes("ذكر") && moye >= Maxmoy) boy_t++;
    if (gen.includes("أنثى") && moye >= Maxmoy) girl_t++;
    if (moi.includes("نعم") && moye >= Maxmoy) moid_t++;
  });
  t_moy /= row_len;
  $gStats.innerHTML = `
    <tr>
      <td>${row_len}</td>
      <td>${t_moy.toFixed(2)}</td>
      <td>${boy}</td>
      <td>${boy_t}</td>
      <td>${boy != 0 ? ((boy_t * 100) / boy).toFixed(2) : "0.00"}</td>
      <td>${girl}</td>
      <td>${girl_t}</td>
      <td>${girl != 0 ? ((girl_t * 100) / girl).toFixed(2) : "0.00"}</td>
      <td>${moid}</td>
      <td>${moid_t}</td>
      <td>${moid != 0 ? ((moid_t * 100) / moid).toFixed(2) : "0.00"}</td>
    </tr>`;
}

function genaral_state(c, d) {
  let table = document.getElementById("lists");

  $t1.innerHTML = "3 - احصائيات عامة";
  createTable("stat-tabl", "stat-table");
  const stude = d.filter((s) => !JSON.parse(s.data).pop().includes("غ"));
  const row_len = stude.length;

  let tr = `<tr><th width="9%"> عدد المتمدرسين: ${row_len}</th>
    `;
  for (let index = 5; index < c.length; index++) {
    let element = c[index];
    element = element.includes("الفيزيائية") ? "الفيزياء 0" : element;
    tr += `<th class="rotate" style="width:2%" align="center"><div> ${
      element.slice(0, -1) + "1+2"
    }</div></th>`;
  }
  tr += `</tr> `;
  // Get the <thead> element of the table with id "lists"
  const tableHead = document
    .getElementById("stat-tabl")
    .getElementsByTagName("thead")[0];

  tableHead.innerHTML = tr;

  let cells_name = [
    "عدد الناجحين",
    "المعدل",
    "نسبةالنجاح",
    "أعلى معدل",
    "أدنى معدل",
    "عدد الذكور",
    "عدد الإناث",
    "الانحراف المعياري",
    "المدى",
    "معامل التشتت",
    "المنوال",
    "الوسيط",
  ];
  let cells_code = [
    "najah",
    "average",
    "bigten",
    "max",
    "min",
    "boy",
    "girl",
    "stdev",
    "mada",
    "tachatot",
    "mode",
    "median",
  ];
  var { new_one, new_note } = calc(table, Maxmoy);
  for (let index = 0; index < cells_name.length; index++) {
    add_row(new_one, cells_code[index], cells_name[index], "stat-tabl");
  }
}

function add_row(arr, najah, text, pos, nisba = "") {
  let tr = `<tr> <th width="265px">${text}</th>`;
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index][najah];

    const css = najah == "bigten" && Number(element) < 50 ? "moy" : "";
    tr += `<td class="${css}"> ${isNaN(element) ? 0 : element}${nisba}${
      najah == "bigten" ? "%" : ""
    }</td> `;
  }
  tr += `</tr> `;
  document
    .getElementById(pos)
    .getElementsByTagName("tbody")[0]
    .insertAdjacentHTML("beforeend", tr);
  //$(`#${pos} tbody`).append(tr);
}

function calc(table, moyen) {
  let aray = [],
    new_one = [],
    new_note = [],
    girls = 0,
    boys = 0,
    rows = table.rows,
    rows_len = rows.length;
  for (let index = 5; index < rows[0].cells.length - 1; index++) {
    for (let e = 1; e < rows_len; e++) {
      let gender = table.rows[e].cells[3].innerHTML;
      let note = table.rows[e].cells[index].innerHTML;
      const isNot = note.toString().includes("غ");
      if (!isNot && gender.includes("أنثى") && note >= moyen) girls++;
      if (!isNot && gender.includes("ذكر") && note >= moyen) boys++;
      if (!isNot && !note.includes("معفى")) aray.push(Number(note));
    }
    const najah_a = aray.filter((item) => item >= moyen);
    const failed_a = aray.filter((item) => item < moyen);
    const max_note = aray.length > 0 ? Math.max(...aray) : 0;
    const min_note = aray.length > 0 ? Math.min(...aray) : 0;
    const inhiraf = getStandardDeviation(aray);
    const average = aray.reduce((a, b) => a + b, 0) / aray.length;
    var new_re = {
      fail: failed_a.length,
      najah: najah_a.length,
      max: max_note,
      min: min_note,
      boy: boys,
      girl: girls,
      average: average.toFixed(2),
      bigten: ((najah_a.length / aray.length) * 100).toFixed(2),
      stdev: inhiraf.toFixed(2),
      mada: (max_note - min_note).toFixed(2),
      tachatot: ((inhiraf / average) * 100).toFixed(2),
      mode: mode(aray).toFixed(2),
      median: median(aray).toFixed(2),
    };
    new_one.push(new_re);
    let one = _.isPrimary() ? 3 : 8;
    let two = _.isPrimary() ? 5 : 10;
    let three = _.isPrimary() ? 6 : 11;
    let four = _.isPrimary() ? 7 : 12;
    let five = _.isPrimary() ? 8 : 13;
    let six = _.isPrimary() ? 8 : 14;
    let seven = _.isPrimary() ? 8 : 15;
    const less_height = aray.filter((item) => item < one);
    const less_ten = aray.filter((item) => item < two && item >= one);
    const less_twelve = aray.filter((item) => item < three && item >= two);
    const less_fourteen = aray.filter((item) => item < four && item >= three);
    const less_sexteen = aray.filter((item) => item < five && item >= four);
    const less_seven = aray.filter((item) => item < six && item >= five);
    const less_eigth = aray.filter((item) => item < seven && item >= six);
    const big_sexteen = aray.filter((item) => item >= seven);
    var note_array = {
      less_height: {
        nbr: less_height.length,
        moy: ((less_height.length / aray.length) * 100).toFixed(2),
      },
      less_ten: {
        nbr: less_ten.length,
        moy: ((less_ten.length / aray.length) * 100).toFixed(2),
      },
      less_twelve: {
        nbr: less_twelve.length,
        moy: ((less_twelve.length / aray.length) * 100).toFixed(2),
      },
      less_fourteen: {
        nbr: less_fourteen.length,
        moy: ((less_fourteen.length / aray.length) * 100).toFixed(2),
      },
      less_sexteen: {
        nbr: less_sexteen.length,
        moy: ((less_sexteen.length / aray.length) * 100).toFixed(2),
      },
      less_seven: {
        nbr: less_seven.length,
        moy: ((less_seven.length / aray.length) * 100).toFixed(2),
      },
      less_eigth: {
        nbr: less_eigth.length,
        moy: ((less_eigth.length / aray.length) * 100).toFixed(2),
      },
      big_sexteen: {
        nbr: big_sexteen.length,
        moy: ((big_sexteen.length / aray.length) * 100).toFixed(2),
      },
    };
    new_note.push(note_array);
    // mise a ziro
    girls = boys = 0;
    aray = [];
  }
  return { new_one, new_note };
}

function four(cols, d, helperData) {
  const niv = cols.niv;
  const annee = cols.annee;
  const c = JSON.parse(cols?.data);
  let modules = [];
  let res = [];
  modules.push(c.slice(5));
  let culmn_len = c.length;
  const stude = d.filter((s) => !JSON.parse(s.data).pop().includes("غ"));
  const row_len = stude.length;
  for (let index = 5; index < culmn_len; index++) {
    let big_ten = 0,
      ziro_to_none = 0,
      nine_to_ten = 0,
      ten_to_twelve = 0,
      twelve_to_fourteen = 0,
      fourteen_to_sixteen = 0,
      sixteen_to_eighteen = 0,
      ghteen_to_twenty = 0,
      eighteen_to_twenty = 0,
      moafa = 0;
    for (let i = 0; i < row_len; i++) {
      d[i] = stude[i] || {};
      let dr = JSON.parse(stude[i].data);
      const row_data = dr[index];
      const find = helperData.find(
        (data) =>
          +data.division === +niv &&
          +data.annee === +annee &&
          dr[1].includes(data.nom) &&
          dr[1].includes(data.prenom) &&
          data.matiere_name.includes(c[i + 5])
      );
      // var elm = find?.exam.includes("معفى") ? "معفى" : dr[r];

      big_ten = row_data >= Maxmoy ? big_ten + 1 : big_ten;
      ziro_to_none =
        row_data >= z(1, 0) && row_data < z(1, 1) && !isNull(row_data)
          ? ziro_to_none + 1
          : ziro_to_none;
      nine_to_ten =
        row_data >= z(2, 0) && row_data < z(2, 1) && !isNull(row_data)
          ? nine_to_ten + 1
          : nine_to_ten;
      ten_to_twelve =
        row_data >= z(3, 0) && row_data < z(3, 1) && !isNull(row_data)
          ? ten_to_twelve + 1
          : ten_to_twelve;
      twelve_to_fourteen =
        row_data >= z(4, 0) && row_data < z(4, 1) && !isNull(row_data)
          ? twelve_to_fourteen + 1
          : twelve_to_fourteen;
      fourteen_to_sixteen =
        row_data >= z(5, 0) && row_data < z(5, 1) && !isNull(row_data)
          ? fourteen_to_sixteen + 1
          : fourteen_to_sixteen;
      sixteen_to_eighteen =
        row_data >= z(6, 0) && row_data < z(6, 1) && !isNull(row_data)
          ? sixteen_to_eighteen + 1
          : sixteen_to_eighteen;
      eighteen_to_twenty =
        row_data >= z(7, 0) && row_data <= z(7, 1) && !isNull(row_data)
          ? eighteen_to_twenty + 1
          : eighteen_to_twenty;
      moafa = row_data.includes("معفى") ? moafa + 1 : moafa + 0;
    }
    let row_leng = Number(row_len) - Number(moafa);
    res.push({
      moafa: moafa,
      big_ten_nbr: big_ten,
      n_big_ten_nbr:
        row_leng != 0 ? ((big_ten * 100) / row_leng).toFixed(2) : "0.00",
      ziro_to_none: ziro_to_none,
      n_ziro_to_none:
        row_leng != 0 ? ((ziro_to_none * 100) / row_leng).toFixed(2) : "0.00",
      nine_to_ten: nine_to_ten,
      n_nine_to_ten:
        row_leng != 0 ? ((nine_to_ten * 100) / row_leng).toFixed(2) : "0.00",
      ten_to_twelve: ten_to_twelve,
      n_ten_to_twelve:
        row_leng != 0 ? ((ten_to_twelve * 100) / row_leng).toFixed(2) : "0.00",
      twelve_to_fourteen: twelve_to_fourteen,
      n_twelve_to_fourteen:
        row_leng != 0
          ? ((twelve_to_fourteen * 100) / row_leng).toFixed(2)
          : "0.00",
      fourteen_to_sixteen: fourteen_to_sixteen,
      n_fourteen_to_sixteen:
        row_leng != 0
          ? ((fourteen_to_sixteen * 100) / row_leng).toFixed(2)
          : "0.00",
      sixteen_to_eighteen: sixteen_to_eighteen,
      n_sixteen_to_eighteen:
        row_leng != 0
          ? ((sixteen_to_eighteen * 100) / row_leng).toFixed(2)
          : "0.00",
      eighteen_to_twenty: eighteen_to_twenty,
      n_eighteen_to_twenty:
        row_leng != 0
          ? ((eighteen_to_twenty * 100) / row_leng).toFixed(2)
          : "0.00",
    });
  }

  let tr = "";
  for (let index = 0; index < res.length; index++) {
    tr += `
        <tr>
            <th>${modules[0][index].slice(0, -1) + "1+2"}</th>
            <td>${res[index].moafa}</td>
            <td>${res[index].big_ten_nbr}</td>
            <td>${res[index].n_big_ten_nbr}</td>
            <td>${res[index].ziro_to_none}</td>
            <td>${res[index].n_ziro_to_none}</td>
            <td>${res[index].nine_to_ten}</td>
            <td>${res[index].n_nine_to_ten}</td>
            <td>${res[index].ten_to_twelve}</td>
            <td>${res[index].n_ten_to_twelve}</td>
            <td>${res[index].twelve_to_fourteen}</td>
            <td>${res[index].n_twelve_to_fourteen}</td>
            <td>${res[index].fourteen_to_sixteen}</td>
            <td>${res[index].n_fourteen_to_sixteen}</td>
            <td>${res[index].sixteen_to_eighteen}</td>
            <td>${res[index].n_sixteen_to_eighteen}</td>
            <td>${res[index].eighteen_to_twenty}</td>
            <td>${res[index].n_eighteen_to_twenty}</td>
        </tr>
    `;
  }
  _.qSel("#stat-by-module").classList.remove("d-none");
  $cont.innerHTML = tr;
}

function five(c, d) {
  let table = document.getElementById("lists");

  let modules = [];
  let res = [];
  modules.push(c.slice(5));
  let culmn_len = c.length;
  const stude = d.filter((s) => !JSON.parse(s.data).pop().includes("غ"));
  const row_len = stude.length;
  $tit.classList.remove("d-none");
  createTable("s-note-tabl", "s-note-table");

  let tr = `<tr><th width="9%"> عدد المتمدرسين: ${row_len}</th>
    `;
  for (let index = 5; index < c.length; index++) {
    let element = c[index];
    tr += `<th class="rotate" style = "width:2%" align = "center" > <div> ${element}</div></th> `;
  }
  tr += `</tr> `;
  // Get the <thead> element of the table with id "lists"
  const tableHead = document
    .getElementById("s-note-table")
    .getElementsByTagName("thead")[0];
  tableHead.innerHTML = tr;

  let a_no = [
    "less_height",
    "less_ten",
    "less_twelve",
    "less_fourteen",
    "less_sexteen",
    "less_seven",
    "less_eigth",
    "big_sexteen",
  ];
  let a_no_t = [
    "أقل من 8",
    "8 - 9,99",
    "10 - 10,99",
    "11 - 11,99",
    "12 - 12,99",
    "13 - 13,99",
    "14 - 14,99",
    "أكبر من 15",
  ];
  let a_no_tp = [
    "أقل من 3",
    "3 - 4,99",
    "5 - 5,99",
    "6 - 6,99",
    "7 - 7,99",
    "أكبر من 8",
  ];
  var { new_one, new_note } = calc(table, Maxmoy);
  let ara1 = _.isPrimary() ? a_no_tp : a_no_t;
  for (let index = 0; index < a_no.length; index++) {
    add_row2(new_note, a_no[index], ara1[index], "s-note-tabl");
  }
}
function add_row2(arr, najah, text, pos) {
  let tr = `<tr> <th width="265px" rowspan="2">${text}</th>`;
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index][najah].moy;
    tr += `<td> ${isNaN(element) ? 0 : element}%</td> `;
  }
  tr += `</tr><tr>`;
  for (let index = 0; index < arr.length; index++) {
    const elm = arr[index][najah].nbr;
    tr += `<td> ${elm}</td> `;
  }
  tr += `</tr> `;
  document
    .getElementById(pos)
    .getElementsByTagName("tbody")[0]
    .insertAdjacentHTML("beforeend", tr);
  // $(`#${pos} tbody`).append(tr);
}

function count_ijaza() {
  let table = document.getElementById("lists");

  let rows = table.rows;
  let ija = [];
  for (let index = 1; index < rows.length; index++) {
    let ijaza = rows[index].cells[rows[index].cells.length - 1].innerText;
    if (!_.empty(ijaza)) ija.push(ijaza);
  }
  var map = ija.reduce((cnt, cur) => ((cnt[cur] = cnt[cur] + 1 || 1), cnt), {});
  document.getElementById(
    "ijaza-section"
  ).innerHTML = `<h2 class="hacen fw-bold mb-3">6 - عرض 5 تلاميذ الأوائل</h2>`;
  //scroll_to('#ijaza-section')
  if (Object.keys(map).length == 0) {
    document.getElementById(
      "ijaza-section"
    ).innerHTML += `<p class="hacen fs-4 fw-bold mb-3"> لا توجد لهذا القسم إجازات، أو لم تقم بإظهارها بعد.</h2>`;
    return;
  }
  createTable("first-five-table", "ijaza-section");
  let tr = `<tr style="text-align: center;"><th colspan="4">المرتبة</th>`;
  for (let j = 1; j < 6; j++) {
    tr += `<td colspan="3">المرتبة ${j}</td>`;
  }
  tr += `</tr><tr style="text-align: center;"><th colspan="4">اسم ولقب التلميذ</th>`;
  for (let j = 1; j < 6; j++) {
    tr += `<td colspan="3">${rows[j] ? rows[j].cells[1].innerHTML : ""}</td>`;
  }
  tr += `</tr>`;
  document.getElementById("first-five-table").innerHTML = tr;
  document.getElementById(
    "ijaza-section"
  ).innerHTML += `<h2 class="hacen fw-bold mb-3 mt-3">7 - احصائيات حول الإجازات</h2>`;
  createTable("ijaza-table", "ijaza-section");
  document.getElementById("ijaza-table").classList.add("mt-3");
  tr = `<tr style="text-align: center;"><th colspan="4">الإجازات</th>`;
  for (let j = 0; j < Object.keys(map).length; j++) {
    tr += `<th colspan="3">${Object.keys(map)[j]}</th>`;
  }
  tr += `</tr><tr style="text-align: center;"><td colspan="4">العدد</td>`;
  for (let j = 0; j < Object.keys(map).length; j++) {
    tr += `<td colspan="3">${Object.values(map)[j]}</td>`;
  }
  tr += `</tr><tr style="text-align: center;"><td colspan="4">أسماء التلاميذ</td>`;
  for (let j = 0; j < Object.keys(map).length; j++) {
    tr += `<td colspan="3" class="top-right">`;
    for (let index = 0; index < rows.length; index++) {
      if (
        rows[index].cells[rows[index].cells.length - 1].innerHTML.includes(
          Object.keys(map)[j]
        )
      )
        tr += `- ${rows[index].cells[1].innerHTML}<br>`;
    }
    tr += `</td>`;
  }
  tr += `</tr>`;

  document.getElementById("ijaza-table").innerHTML = tr;
  // color_less_ten();
}

function averages_range(data) {
  let ranges = [
    { range: [0, 9], arr: [] },
    { range: [9, 10], arr: [] },
    { range: [10, 11], arr: [] },
    { range: [11, 12], arr: [] },
    { range: [12, 13], arr: [] },
    { range: [13, 14], arr: [] },
    { range: [14, 15], arr: [] },
    { range: [15, 16], arr: [] },
    { range: [16, 17], arr: [] },
    { range: [17, 18], arr: [] },
    { range: [18, 19], arr: [] },
    { range: [19, 20], arr: [] },
  ];
  let ranges_primary = [
    { range: [0, 1], arr: [] },
    { range: [1, 2], arr: [] },
    { range: [2, 3], arr: [] },
    { range: [3, 4], arr: [] },
    { range: [4, 5], arr: [] },
    { range: [5, 6], arr: [] },
    { range: [6, 7], arr: [] },
    { range: [7, 8], arr: [] },
    { range: [8, 9], arr: [] },
    { range: [9, 10], arr: [] },
  ];

  ranges = _.isPrimary() ? ranges_primary : ranges;
  const moyIndex = $anneschool.value.toString().slice(-1) == 3 ? -2 : -1;
  for (const key in data) {
    const value = data[key];
    //}
    //$.each(data, function (key, value) {
    let lmoy = Number(JSON.parse(value.data).at(moyIndex));
    for (let i = 0; i < ranges.length; i++) {
      if (lmoy >= ranges[i].range[0] && lmoy < ranges[i].range[1]) {
        ranges[i].arr.push(value);
        break;
      }
    }
  }
  //);
  document.getElementById("averages-range-section").classList.remove("d-none");
  let tr = "";
  for (let i = ranges.length - 1; i >= 0; i--) {
    tr += ` <tr class="b-${i + 1}"><th colspan="6"> ${
      ranges[i].range[0]
    } <------> ${ranges[i].range[1] - 0.01}</th></tr>`;
    if (ranges[i].arr.length != 0) tr += trs(ranges[i].arr);
    else tr += '<td colspan="6">--- لا يوجد ---</td>';
  }
  $dataTab.innerHTML = tr;
  //scroll_to('#averages-range-section')
}
function trs(a) {
  const moyIndex = $anneschool.value.toString().slice(-1) == 3 ? -2 : -1;
  let tr = "";
  for (let index = 0; index < a.length; index++) {
    const st = JSON.parse(a[index]?.data);
    tr += `<tr>
                <td>
                    ${index + 1}
                </td>
                <td>
                    ${st[1]}
                </td>
                <td>
                    ${st[2]}
                </td>
                <td>
                    ${_.age(st[2], this_year)}
                </td>
                <td>
                    ${st.at(moyIndex)}
                </td>
                <td>
                ${add_ijaza(Number(st.at(moyIndex)))}
                </td>
            </tr>`;
  }
  return tr;
}
