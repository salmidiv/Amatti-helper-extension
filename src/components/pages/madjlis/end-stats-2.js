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
const categories = _.isPrimary()
  ? [
      { key: "less_height", label: "أقل من 3" },
      { key: "less_ten", label: "3 - 4,99" },
      { key: "less_twelve", label: "5 - 5,99" },
      { key: "less_fourteen", label: "6 - 6,99" },
      { key: "less_sexteen", label: "7 - 7,99" },
      { key: "less_seven", label: "أكبر من 8" },
    ]
  : [
      { key: "less_height", label: "أقل من 8" },
      { key: "less_ten", label: "8 - 9,99" },
      { key: "less_twelve", label: "10 - 10,99" },
      { key: "less_fourteen", label: "11 - 11,99" },
      { key: "less_sexteen", label: "12 - 12,99" },
      { key: "less_seven", label: "13 - 13,99" },
      { key: "less_eigth", label: "14 - 14,99" },
      { key: "big_sexteen", label: "أكبر من 15" },
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
  [
    "finalstudentslists",
    "taqwiimState",
    "generatState",
    "s-note-table",
    "ijaza-section",
    "averages-range-section",
  ].forEach((tag) => (_.getid(tag).innerHTML = ""));
  if ($divi.value) load_data($anneschool.value, $divi.value);
});
async function fetchData(division, annee) {
  try {
    // Perform a transaction with read access
    return await db.transaction("r", StatisTable, studentsTable, async () => {
      const divisionStr = division.toString();
      const anneeNum = Number(annee);

      // Fetch statis data matching the criteria
      const statisData = await StatisTable.where({
        division: divisionStr,
        annee: anneeNum,
      }).toArray();

      if (!statisData.length) return []; // Early return if no data found

      // Extract unique student IDs from statis data
      const studentMatts = [
        ...new Set(statisData.map((record) => Number(record.matt))),
      ];

      // Fetch student data matching these IDs
      const studentsData = await studentsTable
        .where("s_matt")
        .anyOf(studentMatts)
        .toArray();

      // Combine statis and student data
      return statisData.map((statisRecord) => ({
        ...statisRecord,
        student:
          studentsData.find(
            (student) => student.s_matt === Number(statisRecord.matt)
          ) || null,
      }));
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Return an empty array in case of an error
  }
}

async function load_data(annee, niv) {
  const helperData = await fetchData(niv, annee);
  const results = await finalResTable
    .where({ niv: niv, annee: annee })
    .toArray();

  const cols = await mawadTable.where({ niv: niv, annee: annee }).toArray();
  showStudentsList(cols[0], results, helperData);
  tagwiimState();
  genaralState();
  byModule();
  countIjaza();
  averages_range();
  // buildTable(cols[0], res, helperData);
}

function sortArray(arr) {
  return arr.sort((a, b) => {
    const parseLastValue = (item) => {
      const lastValue = JSON.parse(item.data).at(-1); // Use `.at(-1)` to get the last element
      return lastValue.includes("غ") ? 0 : parseFloat(lastValue) || 0;
    };

    return parseLastValue(b) - parseLastValue(a);
  });
}

function createTable(id, place) {
  const table = document.createElement("table");
  Object.assign(table, {
    id,
    className: "-100 fs-4",
    border: "1",
    align: "center",
    dir: "rtl",
  });

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  table.append(thead, tbody);
  document.getElementById(place)?.appendChild(table);
}

function showStudentsList(cols, results, helperData) {
  const { niv, annee, data } = cols;
  let header = JSON.parse(data || "[]");
  header = header.map((item) =>
    item.includes("اﻷمازيغية") ? "مازيغية" : item
  );
  // Set up the container and create the table
  const container = _.qSel("#finalstudentslists");
  container.innerHTML = `<h2 class="hacen fw-bold mb-3">1 - قائمة التلاميذ ${s_o(
    $divi
  )}</h2>`;
  createTable("lists", "finalstudentslists");

  // Generate the table header
  const headers = [
    `<th class="rotate" style="width:2%" align="center"><div>${header[0]}</div></th>`,
    `<th width="12%">${header[1]}</th>`,
    `<th class="rotate" style="width:2%" align="center"><div>العمر</div></th>`,
    `<th class="rotate" style="width:2%" align="center"><div>${header[3]}</div></th>`,
    `<th class="rotate" style="width:2%" align="center"><div>${header[4]}</div></th>`,
    ...header
      .slice(5)
      .map(
        (el) =>
          `<th class="rotate" style="width:2%" align="center"><div>${el}</div></th>`
      ),
    `<th width="5%">الإجازة</th>`,
  ].join("");

  document.querySelector("#lists thead").innerHTML = `<tr>${headers}</tr>`;

  // Sort results and generate table rows
  const sortedResults = sortArray(results);
  const rows = sortedResults.map((result, i) => {
    const dr = JSON.parse(result.data);
    const age = _.age(dr[2].trim(), this_year);
    const genderClass = dr[3].includes("أنثى") ? "girl" : "";
    const moiidClass = dr[4].includes("نعم") ? "moiid" : "";
    const studentRows = dr.slice(5).map((elm, r) => {
      const find = helperData.find(
        (data) =>
          +data.division === +niv &&
          +data.annee === +annee &&
          dr[1].includes(data.nom) &&
          dr[1].includes(data.prenom) &&
          data.matiere_name.includes(header[r + 5])
      );
      const cellValue = find?.exam.includes("معفى") ? "معفى" : elm;
      const cellClass = cellValue.includes("معفى")
        ? "moafa"
        : elm < Maxmoy && !cellValue.includes("معفى")
        ? "moy"
        : "";

      return `<td class="colorise ${cellClass}">${cellValue}</td>`;
    });

    return `
      <tr>
        <td>${i + 1}</td>
        <td class="colorise ${genderClass}">${dr[1]}</td>
        <td>${age}</td>
        <td>${dr[3]}</td>
        <td class="colorise ${moiidClass}">${dr[4]}</td>
        ${studentRows.join("")}
        <td>${add_ijaza(Number(dr.pop()))}</td>
      </tr>
    `;
  });

  document.querySelector("#lists tbody").innerHTML = rows.join("");
}

function tagwiimState() {
  const table = document.getElementById("lists");
  if (!table) {
    alert("لا توجد بيانات");
    return;
  }

  const container = _.qSel("#taqwiimState");
  container.innerHTML = `<h2 class="hacen fw-bold mb-3">2 - حصيلة نتائج التقويم</h2>
          <table class="table hacen fs-3">
            <thead>
              <tr>
                <th rowspan="2">عدد التلاميذ</th>
                <th rowspan="2">الحاصلين على المعدل</th>
                <th rowspan="2">معدل القسم</th>
                <th colspan="3" id="$bys">الذكور</th>
                <th colspan="3" id="$gls">الإناث</th>
                <th colspan="3" id="$mis">المعيدين</th>
              </tr>
              <tr>
                <th>العدد</th>
                <th id="$mmmm">&gt;=10</th>
                <th>%</th>
                <th>العدد</th>
                <th id="$mmm">&gt;=10</th>
                <th>%</th>
                <th>العدد</th>
                <th id="$mm">&gt;=10</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody id="gStats" class="text-center"></tbody>
          </table>`;

  let maleCount = 0,
    hasMoyen = 0,
    femaleCount = 0,
    repeatersCount = 0,
    maleAboveThreshold = 0,
    femaleAboveThreshold = 0,
    repeatersAboveThreshold = 0,
    totalAverage = 0;

  let rows = table.querySelectorAll("tbody tr");

  if (rows.length === 0) return;
  const rowsData = Array.from(rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.textContent.trim()))
    .filter((s) => !s[s.length - 2].includes("غ"));
  rowsData.forEach((data) => {
    const gender = data[3];
    const repeaterStatus = data[4];
    const grade = parseFloat(data[data.length - 2]);
    totalAverage += grade;

    if (gender.includes("ذكر")) maleCount++;
    if (gender.includes("أنثى")) femaleCount++;
    if (repeaterStatus.includes("نعم")) repeatersCount++;
    if (gender.includes("ذكر") && grade >= Maxmoy) maleAboveThreshold++;
    if (gender.includes("أنثى") && grade >= Maxmoy) femaleAboveThreshold++;
    if (repeaterStatus.includes("نعم") && grade >= Maxmoy)
      repeatersAboveThreshold++;
    if (grade >= Maxmoy) hasMoyen++;
  });

  const totalStudents = rows.length;
  if (totalStudents === 0) return;
  totalAverage /= totalStudents;

  const statsContainer = document.getElementById("gStats");
  statsContainer.innerHTML = `
    <tr>
      <td>${totalStudents}</td>
      <td>${hasMoyen}</td>
      <td>${totalAverage.toFixed(2)}</td>
      <td>${maleCount}</td>
      <td>${maleAboveThreshold}</td>
      <td>${
        maleCount ? ((maleAboveThreshold * 100) / maleCount).toFixed(2) : "0.00"
      }</td>
      <td>${femaleCount}</td>
      <td>${femaleAboveThreshold}</td>
      <td>${
        femaleCount
          ? ((femaleAboveThreshold * 100) / femaleCount).toFixed(2)
          : "0.00"
      }</td>
      <td>${repeatersCount}</td>
      <td>${repeatersAboveThreshold}</td>
      <td>${
        repeatersCount
          ? ((repeatersAboveThreshold * 100) / repeatersCount).toFixed(2)
          : "0.00"
      }</td>
    </tr>`;
}

function genaralState() {
  const table = document.getElementById("lists");
  if (!table) {
    alert("لا توجد بيانات");
    return;
  }

  const container = _.qSel("#generatState");
  container.innerHTML = `<h2 class="hacen fw-bold mb-3">3 - احصائيات عامة</h2>`;
  createTable("stat-tabl", "generatState");

  let headerData = Array.from(table.querySelector("thead tr").cells).map(
    (cell) => cell.textContent.trim()
  );
  let rows = table.querySelectorAll("tbody tr");

  const rowsData = Array.from(rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.textContent.trim()))
    .filter((s) => !s[s.length - 2].includes("غ"));
  let tr = [
    `<tr><th width="9%"> عدد المتمدرسين: ${rowsData.length}</th>`,
    headerData
      .slice(5)
      .map(
        (h) =>
          `<th class="rotate" style = "width:2%" align = "center" > <div> ${h}</div></th> `
      )
      .join(""),
    "</tr>",
  ].join("");
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
    "boys",
    "girls",
    "stdev",
    "mada",
    "tachatot",
    "mode",
    "median",
  ];
  var results = calc(table, Maxmoy);
  console.log(results);
  for (let index = 0; index < cells_name.length; index++) {
    add_row(results, cells_code[index], cells_name[index], "stat-tabl");
  }
  noteTable(tr, results);
}

function byModule() {
  const table = document.getElementById("lists");
  if (!table) {
    alert("لا توجد بيانات");
    return;
  }
  let res = [];
  const container = _.qSel("#stat-by-module");
  container.innerHTML = `
    <h2 class="hacen fw-bold mb-3">5 - حصيلة نتائج التقويم حسب المواد</h2>
          <table class="table hacen fs-4">
            <thead align="center">
              <tr>
                <th rowspan="2">المادة</th>
                <th rowspan="2">معفى</th>
                <th colspan="2" id="$one">&gt;=10</th>
                <th colspan="2" id="$two">0-8.99</th>
                <th colspan="2" id="$three">9-9.99</th>
                <th colspan="2" id="$four">10-11.99</th>
                <th colspan="2" id="$five">12-13.99</th>
                <th colspan="2" id="$six">14-15.99</th>
                <th colspan="2" id="$seven">16-17.99</th>
                <th colspan="2" id="$eight">18-20</th>
              </tr>
              <tr>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
                <th>العدد</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody id="$cont" class="text-center"></tbody>
          </table>
  `;
  createTable("stat-tabl", "generatState");

  let headerData = Array.from(table.querySelector("thead tr").cells).map(
    (cell) => cell.textContent.trim()
  );
  const modules = headerData.slice(5);
  let rows = table.querySelectorAll("tbody tr");

  const rowsData = Array.from(rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.textContent.trim()))
    .filter((s) => !s[s.length - 2].includes("غ"));

  const row_len = rowsData.length;
  for (let index = 5; index < headerData.length; index++) {
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
      let dr = rowsData[i];
      const row_data = dr[index];

      // var elm = find?.exam.includes("معفى") ? "معفى" : dr[r];
      console.log(row_data);
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
            <th>${modules[index]}</th>
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
function noteTable(tr, results) {
  const container = _.qSel("#s-note-table");
  container.innerHTML += ` <h2  class="hacen fw-bold mb-3">
          4 - حصيلة نتائج التقويم حسب مجالات المعدلات
        </h2>`;
  console.log(container);
  createTable("s-note-tabl", "s-note-table");
  const tableHead = document
    .getElementById("s-note-table")
    .querySelector("thead");
  tableHead.innerHTML = tr;

  categories.forEach(({ key, label }) => {
    add_row2(results, key, label, "s-note-tabl");
  });
}
function countIjaza() {
  const table = document.getElementById("lists");
  if (!table) return;

  const rows = Array.from(table.rows).slice(1); // Skip header row
  const awards = rows
    .map((row) => row.cells[row.cells.length - 1].innerText)
    .filter(Boolean);

  const awardCounts = awards.reduce((counts, award) => {
    counts[award] = (counts[award] || 0) + 1;
    return counts;
  }, {});

  const ijazaSection = document.getElementById("ijaza-section");
  ijazaSection.innerHTML = `<h2 class="hacen fw-bold mb-3">6 - عرض 5 تلاميذ الأوائل</h2>`;

  if (!Object.keys(awardCounts).length) {
    ijazaSection.innerHTML += `<p class="hacen fs-4 fw-bold mb-3"> لا توجد لهذا القسم إجازات، أو لم تقم بإظهارها بعد.</p>`;
    return;
  }

  createTable("first-five-table", "ijaza-section");

  const topStudentsHtml = `
    <tr style="text-align: center;">
      <th colspan="4">المرتبة</th>
      ${Array.from(
        { length: 5 },
        (_, i) => `<td colspan="3">المرتبة ${i + 1}</td>`
      ).join("")}
    </tr>
    <tr style="text-align: center;">
      <th colspan="4">اسم ولقب التلميذ</th>
      ${rows
        .slice(0, 5)
        .map((row) => `<td colspan="3">${row.cells[1].innerHTML}</td>`)
        .join("")}
    </tr>`;

  document.getElementById("first-five-table").innerHTML = topStudentsHtml;

  ijazaSection.innerHTML += `<h2 class="hacen fw-bold mb-3 mt-3">7 - احصائيات حول الإجازات</h2>`;

  createTable("ijaza-table", "ijaza-section");
  const ijazaTable = document.getElementById("ijaza-table");
  ijazaTable.classList.add("mt-3");

  const awardsHtml = `
    <tr style="text-align: center;">
      <th colspan="4">الإجازات</th>
      ${Object.keys(awardCounts)
        .map((award) => `<th colspan="3">${award}</th>`)
        .join("")}
    </tr>
    <tr style="text-align: center;">
      <td colspan="4">العدد</td>
      ${Object.values(awardCounts)
        .map((count) => `<td colspan="3">${count}</td>`)
        .join("")}
    </tr>
    <tr style="text-align: center;">
      <td colspan="4">أسماء التلاميذ</td>
      ${Object.keys(awardCounts)
        .map((award) => {
          const students = rows
            .filter((row) =>
              row.cells[row.cells.length - 1].innerHTML.includes(award)
            )
            .map((row) => `- ${row.cells[1].innerHTML}`)
            .join("<br>");
          return `<td colspan="3" class="top-right">${students}</td>`;
        })
        .join("")}
    </tr>`;

  ijazaTable.innerHTML = awardsHtml;
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
  const thresholds = [
    { key: "lawha", label: "لوحة شرف" },
    { key: "tchjia", label: "تشجيع" },
    { key: "thniaa", label: "تهنئة" },
    { key: "imtiyaz", label: "امتياز" },
  ];

  for (const { key, label } of thresholds) {
    const [min, max] = localStorage[key].split("-").map(Number);
    if (grade >= min && grade <= max) {
      return label;
    }
  }

  return "";
}

function add_row(arr, najah, text, pos, nisba = "") {
  console.log(arr);
  let tr = `<tr> <th width="265px">${text}</th>`;
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index].stats[najah];

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
}
function add_row2(arr, categoryKey, label, tableId) {
  const tbody = document.getElementById(tableId).querySelector("tbody");
  const percentageRow = arr
    .map((item) => {
      const subItem = item.noteCategories.find((c) => c.key == categoryKey);
      return `<td>${isNaN(subItem.moy) ? 0 : subItem.moy}%</td>`;
    })
    .join("");
  const countRow = arr
    .map((item) => {
      const subItem = item.noteCategories.find((c) => c.key == categoryKey);

      return `<td>${subItem.nbr}</td>`;
    })
    .join("");

  const tr = `
    <tr>
      <th width="265px" rowspan="2">${label}</th>
      ${percentageRow}
    </tr>
    <tr>
      ${countRow}
    </tr>
  `;

  tbody.insertAdjacentHTML("beforeend", tr);
}
function calc(table, moyen) {
  const rows = Array.from(table.rows).slice(1); // Skip header row
  const results = [];

  const calculateStats = (notes) => {
    if (notes.length === 0) return {};
    const max = Math.max(...notes);
    const min = Math.min(...notes);
    const average = notes.reduce((sum, n) => sum + n, 0) / notes.length;
    return {
      max,
      min,
      najah: notes.filter((item) => item >= moyen).length,
      average: average.toFixed(2),
      stdev: getStandardDeviation(notes).toFixed(2),
      mode: mode(notes).toFixed(2),
      mada: (max - min).toFixed(2),
      median: median(notes).toFixed(2),
      tachatot: ((getStandardDeviation(notes) / average) * 100).toFixed(2),
    };
  };

  const categorizeNotes = (notes, thresholds) => {
    return thresholds.map(([low, high], index) => {
      const filtered = notes.filter((n) => n >= low && n < high);
      return {
        key: categories[index].key,
        nbr: filtered.length,
        moy: ((filtered.length / notes.length) * 100).toFixed(2),
      };
    });
  };

  for (
    let colIndex = 5;
    colIndex < table.rows[0].cells.length - 1;
    colIndex++
  ) {
    let notes = [];
    let boys = 0,
      girls = 0;

    rows.forEach((row) => {
      const cells = row.cells;
      const gender = cells[3].textContent.includes("أنثى") ? "girl" : "boy";
      const note = parseFloat(cells[colIndex].textContent) || 0;
      if (
        !cells[colIndex].textContent.includes("غ") &&
        !cells[colIndex].textContent.includes("معفى")
      ) {
        notes.push(note);
        if (gender === "girl" && note >= moyen) girls++;
        if (gender === "boy" && note >= moyen) boys++;
      }
    });

    const stats = calculateStats(notes);
    const thresholds = _.isPrimary()
      ? [
          [0, 3],
          [3, 5],
          [5, 6],
          [6, 7],
          [7, 8],
        ]
      : [
          [0, 8],
          [8, 10],
          [10, 11],
          [11, 12],
          [12, 13],
          [13, 14],
          [14, 15],
          [15, 16],
        ];
    const noteCategories = categorizeNotes(notes, thresholds);

    results.push({
      stats: {
        ...stats,
        boys,
        girls,
        bigten: (
          (notes.filter((n) => n >= moyen).length / notes.length) *
          100
        ).toFixed(2),
      },
      noteCategories,
    });
  }

  return results;
}

function averages_range() {
  const table = document.getElementById("lists");
  if (!table) {
    alert("لا توجد بيانات");
    return;
  }
  let rows = table.querySelectorAll("tbody tr");
  const container = document.getElementById("averages-range-section");

  container.innerHTML = `<h2 class="hacen fw-bold mb-3">
            8 - تحليل معدلات التلاميذ حسب المجالات
          </h2>
          <table class="table fs-4">
            <thead>
              <tr>
                <th>الرقم</th>
                <th>لقب واسم التلميذ</th>
                <th>العمر</th>
                <th>الجنس</th>
                <th>الإعادة</th>
                <th>المعدل</th>
                <th>الإجازة</th>
              </tr>
            </thead>
            <tbody id="$dataTab"></tbody>
          </table>`;

  if (rows.length === 0) return;
  const data = Array.from(rows)
    .map((row) => Array.from(row.cells).map((cell) => cell.textContent.trim()))
    .filter((s) => !s[s.length - 2].includes("غ"));
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
  const moyIndex = $anneschool.value.toString().slice(-1) == 3 ? -2 : -2;
  for (const key in data) {
    const value = data[key];
    console.log(value.at(moyIndex));

    let lmoy = Number(value.at(moyIndex));
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
    tr += ` <tr class="b-${i + 1}"><th colspan="7"> ${
      ranges[i].range[0]
    } <------> ${ranges[i].range[1] - 0.01}</th></tr>`;
    if (ranges[i].arr.length != 0) tr += trs(ranges[i].arr);
    else tr += '<td colspan="7">--- لا يوجد ---</td>';
  }
  $dataTab.innerHTML = tr;
  //scroll_to('#averages-range-section')
}
function trs(a) {
  const moyIndex = $anneschool.value.toString().slice(-1) == 3 ? -2 : -2;
  let tr = "";
  for (let index = 0; index < a.length; index++) {
    const st = a[index];
    console.log(st);
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
                    ${st[3]}
                </td>
                <td>
                    ${st[4]}
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
