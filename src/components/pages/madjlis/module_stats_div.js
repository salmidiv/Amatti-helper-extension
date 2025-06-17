import { db, studentsTable, StatisTable } from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { this_trim, this_year } from "../../../../core/helpers/const.js";
import { notify } from "../../../../core/helpers/notify.js";

let moy = _.Mmoy();
let moys = _.isPrimary()
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
$preloader.classList.remove("d-flex");

$anneschool.addEventListener("change", async () => {
  $preloader.classList.add("d-flex");
  setTimeout(update_mark, 350);
});
async function update_mark() {
  const year = $anneschool.value;
  $divi.innerHTML = '<option value="all">تحميل الجميع</option>';
  if (year) {
    const data = await _.fetchData(
      "scolarite/en_chiffre/analyse_class/get_division",
      { annee: year, isAjax: true },
      "text"
    );
    $divi.innerHTML += data;
  }
}

$divi.addEventListener("change", async () => {
  $className2.innerHTML = $divi.options[$divi.selectedIndex].text;
  const type = $ty.value;
  get_cr($divi.value, $anneschool.value, type);
});
$ty.addEventListener("change", async () => {
  $className2.innerHTML = $divi.options[$divi.selectedIndex].text;
  const type = $ty.value;
  get_cr($divi.value, $anneschool.value, type);
});
let g_type;
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

function emptyTables() {
  $the.innerHTML = "";
  document.querySelector("#data").innerHTML = "";
  document.querySelector("#stat-table").innerHTML = "";
  document.querySelector("#students-list-table").innerHTML = "";
}
async function get_cr(division, annee, type) {
  emptyTables();
  const data = await fetchData(division, annee);
  if (data.length == 0) {
    alert("لا توجد بيانات حاليا");
    return;
  }
  search_result(data, type);
  //g_type = type
  //let where = type == 1 ? ',tag' : type == 2 ? ',dev' : type == 3 ? ',exam' : type == 4 ? ',tath' : ''
  /*
  db.selectwithqueryss(
    `SELECT * FROM statis INNER JOIN students ON students.s_matt = statis.matt where division =${division} AND annee=${annee}`
  ).then(function (res) {
    let result = res.rows;
    if (result.length == 0) {
      alert("لا توجد بيانات حاليا");
      return;
    }
    search_result(result);
  });
  */
}
function isset(ref) {
  return typeof ref !== "undefined";
}

async function search_result(rows, type) {
  //let where = g_type == 1 ? 'tag' : g_type == 2 ? 'dev' : g_type == 3 ? 'exam' : g_type == 4 ? 'tath' : ''
  let where = "exam";
  //$gTy.innerHTML = g_type == 1 ? 'التقويم' : g_type == 2 ? 'الفروض' : g_type == 3 ? 'الاختبار' : g_type == 4 ? 'تثمين المشاريع' : ''
  $gTy.innerHTML = type === "1" ? "الاختبار" : "معدل الفرض + الاختبار";
  let result = [];
  rows.forEach((row) => {
    const index = row["matt"];
    const existingRow = result.find((r) => r["matt"] === index);
    if (!existingRow) {
      result.push({
        matt: row["matt"],
        nom: row["nom"],
        prenom: row["prenom"],
        dateN: row["dateN"],
        gender: row["student"]["s_gender"],
        notes: [
          {
            matiere_name: row["matiere_name"],
            exam: row["exam"],
            dev: row["dev"],
          },
        ],
      });
    } else {
      existingRow["notes"].push({
        matiere_name: row["matiere_name"],
        exam: row[where],
        dev: row["dev"],
      });
    }
  });
  const $tableHead = $the; // document.querySelector('#thead');
  const $tableData = document.querySelector("#data");
  $tableData.innerHTML = "";
  const firstRow = result[0];
  let thHTML = `
        <tr>
            <th style="width:5%">الرقم</th>
            <th class="fs-3" align="center">لقب و اسم التلميذ</th>
            <th class="rotate" style="width:2%" align="center"><div>العمر</div></th>
            <th class="rotate" style="width:2%" align="center"><div>الجنس</div></th>
        `;
  const notes = firstRow["notes"];
  notes.forEach((note) => {
    thHTML += `
            <th class="rotate" style="width:2%" align="center">
            <div>${
              note.matiere_name.includes("الفيزيا")
                ? "الفيزياء"
                : note.matiere_name
            }</div>
            </th>
        `;
  });
  thHTML +=
    '<th class="rotate" style="width:2%" align="center"><div>المعدل</div></th></tr>';
  $tableHead.innerHTML = thHTML;
  // Table data
  let trHTML = "";
  let rowNumber = 1;
  result.forEach((row) => {
    const notes = row["notes"];

    let len = 0;
    let some = 0;
    notes.forEach((note) => {
      const noteValue = calcNoteValue(type, note.exam, note.dev);
      if (!noteValue.toString().includes("معفى")) {
        len++;
        some += Number(noteValue);
      }
    });
    const average = some / len;
    let tdHTML = `
                <tr>
                <th>${rowNumber++}</th>
                <td class="fs-4">${row.nom} ${row.prenom}</td>
                <td>${_.age(row.dateN, this_year)}</td>
                <td>${row.gender}</td>
            `;

    notes.forEach((note) => {
      // const noteValue = note.exam ?? 0;
      const noteValue = calcNoteValue(type, note.exam, note.dev);
      tdHTML += `
                <td style="background-color: ${
                  Number(noteValue) < moy && noteValue != ""
                    ? "rgb(255, 188, 188)"
                    : noteValue.toString().includes("معفى")
                    ? "rgba(20, 17, 17, 0.15)"
                    : "transparent"
                }">
                    ${noteValue}
                </td>
                `;
    });
    tdHTML += `<td>${average.toFixed(2)}</td></tr>`;
    trHTML += tdHTML;
  });
  $tableData.innerHTML = trHTML;
  const numberOfColumns = $tableData.rows[0].cells.length - 1;
  sortTable("#data", numberOfColumns);
  statistic_table();
  const rows_ = $tableData.querySelectorAll("tr"); // get all the rows of the table
  for (let i = 0; i < rows_.length; i++) {
    const row = rows_[i];
    const firstCell = row.querySelector("th:first-child"); // get the first cell of the row
    if (firstCell) {
      firstCell.textContent = i + 1; // set the text content to the row index + 1
    }
  }
}
const calcNoteValue = (type, exam, dev) => {
  // For type "1", check exam only
  if (type === "1") {
    return exam === "معفى" ? "معفى" : Number(exam).toFixed(2);
  }

  // For type "2", return معفى if either is معفى
  if (type === "2") {
    if (exam === "معفى" || dev === "معفى") {
      return "معفى";
    }
    // Calculate average if neither is معفى
    return ((Number(exam) + Number(dev)) / 2).toFixed(2);
  }

  // Default case
  return "0.00";
};
function sortTable(Table, td_nbr) {
  const tbody = document.querySelector(Table);
  const rows = Array.from(tbody.rows);
  rows.sort(
    (a, b) => b.cells[td_nbr].textContent - a.cells[td_nbr].textContent
  );
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  rows.forEach((row) => tbody.appendChild(row));
}
function statistic_table() {
  document.querySelector("#stat-table").innerHTML = "";
  const tbody = document.querySelector("#data");
  const results = [];
  const numColumns = tbody.rows[0].cells.length;
  const len = tbody.rows.length;
  const genderCounts = { ذكر: 0, أنثى: 0 };

  for (let i = 4; i < numColumns; i++) {
    let sum = 0,
      countLessThan8 = 0,
      countGreaterThan10 = 0,
      countLessThan12 = 0,
      countLessThan14 = 0,
      countLessThan16 = 0,
      countLessThan18 = 0,
      countLessThan20 = 0,
      countLessThan10 = 0,
      boy = 0,
      girl = 0;

    for (let j = 0; j < len; j++) {
      const cell = tbody.rows[j].cells[i];
      const num = Number(cell.textContent);
      sum += num;
      if (num >= 10) {
        const genderCell = tbody.rows[j].cells[3].textContent;
        if (genderCell.includes("ذكر")) boy++;
        if (genderCell.includes("أنثى")) girl++;
        countGreaterThan10++;
      }
      if (num < 8) countLessThan8++;
      // if (num < 10) countLessThan10++;
      if (num >= 8 && num < 10) countLessThan10++;
      if (num >= 10 && num < 12) countLessThan12++;
      if (num >= 12 && num < 14) countLessThan14++;
      if (num >= 14 && num < 16) countLessThan16++;
      if (num >= 16 && num < 18) countLessThan18++;
      if (num >= 18 && num < 20) countLessThan20++;
    }
    const mean = (sum / len || 0).toFixed(2);
    const successRate = ((countGreaterThan10 * 100) / len || 0).toFixed(2);

    const columnResults = {
      boy,
      girl,
      mean,
      countGreaterThan10,
      countLessThan10,
      successRate,
      countLessThan8,
      countLessThan10,
      countLessThan12,
      countLessThan14,
      countLessThan16,
      countLessThan18,
      countLessThan20,
    };

    results.push(columnResults);
  }
  const tableData = Object.keys(results[0]).map((key) => [
    key,
    ...results.map((obj) => obj[key]),
  ]);
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  // Loop over each column of the table and create a new th element for it
  $the.querySelectorAll("th").forEach((th) => {
    const newTh = document.createElement("th");
    newTh.textContent = th.textContent;
    tr.appendChild(newTh);
  });

  thead.appendChild(tr);
  table.classList.add("table", "fs-4");

  // get the first four th elements in the cloned thead
  const firstFourTH = thead.querySelectorAll("th:nth-of-type(-n+4)");

  // create a new th element with the text "data"
  const newDataTH = document.createElement("th");
  newDataTH.textContent = "عدد التلاميذ:" + len;

  // replace the first four th elements with the new th element
  firstFourTH.forEach((th) => {
    th.parentNode.replaceChild(newDataTH, th);
  });
  table.appendChild(thead);

  const h = [
    "الذكور",
    "الإناث",
    "المعدل",
    "عدد الناجحين",
    "عدد الراسبين",
    "نسبة النجاح",
    "0-7.99",
    "8-9.99",
    "10-11.99",
    "12-13.99",
    "14-15.99",
    "16-17.99",
    "18-20",
  ];

  // create table rows
  tableData.forEach((item, i) => {
    const row = table.insertRow();
    Object.values(item).forEach((value, index) => {
      const cell = row.insertCell();
      value = index == 0 ? h[i] : value;
      cell.appendChild(document.createTextNode(value));
    });
  });
  document.querySelector("#stat-table").appendChild(table);
}
