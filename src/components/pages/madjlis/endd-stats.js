import { finalResTable, mawadTable } from "../../../../core/db/conn.js";
import { this_year } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
let this_annee = 20243;
let trim = this_annee.toString().slice(-1);
let gmoy = _.isPrimary() ? 5 : 10;

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
$anneschool.addEventListener("change", async () => {
  update_mark();
});
async function update_mark() {
  const year = $anneschool.value;
  if (year) {
    const url = "scolarite/en_chiffre/analyse_class/get_division";
    const data = new URLSearchParams();
    data.append("annee", year);
    data.append("isAjax", true);
    const res = await fetch_data(url, data, "text");
    $divi.innerHTML = res;
  }
}

async function fetch_data(url, data, type = "json") {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return type == "text" ? await response.text() : await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

$divi.addEventListener("change", async () => {
  if ($divi.value) load_data($divi.value);
});

async function load_data(niv) {
  const annee = $anneschool.value;
  const res = await finalResTable
    .where({
      niv: niv,
      annee: annee,
    })
    .toArray();
  const cols = await mawadTable
    .where({
      niv: niv,
      annee: annee,
    })
    .toArray();
  //console.log(res[0].uuid)
  //const r = JSON.parse(res[0].data)

  //r[17] = "غ م"
  //console.log(r)
  //await finalResTable.where('uuid').equals('486c73f1').modify({ data: JSON.stringify(r) })

  let json = res;

  if (json) {
    print_table(json, JSON.parse(cols[0]?.data));
    by_module(json, JSON.parse(cols[0]?.data));
    statistic_table();
    let data = document
      .getElementById("lists")
      .getElementsByTagName("tbody")[0];

    //let data = $("#lists tbody")[0];
    let rows = data.rows;
    for (let index = 0; index < rows.length; index++) {
      const moyIndex = $anneschool.value.toString().slice(-1) == 3 ? 3 : 2;
      const moyen =
        rows[index].cells[rows[index].cells.length - moyIndex].innerHTML;

      let ijaza_place = rows[index].cells[rows[index].cells.length - 1];
      ijaza_place.innerHTML =
        ijaza_place.innerHTML == "" ? add_ijaza(Number(moyen)) : "";
    }
    //let dataس = $('#lists')
    count_ijaza(data);
    averages_range();
  } else {
    document.getElementById("success-rates-section").innerHTML = "";
    document.getElementById("stat-table").innerHTML = "";
    document.getElementById("s-note-table").innerHTML = "";
    document.getElementById("ijaza-section").innerHTML = "";
    document.getElementById("averages-range-section").classList.add("d-none");
    document.getElementById("stat-by-module").classList.add("d-none");
    $t2.innerHTML = "";
    $tit.innerHTML = "";
  }
}
function print_table(data, columns) {
  localStorage.columns = JSON.stringify(columns);
  localStorage.my_data = JSON.stringify(data);
  let ne_ar = [];
  /*
    $.each(data, function (key, value) {
        let stu_note = JSON.parse(value.data)
        let new_stu_note = []
        for (var key = 0; key < stu_note.length; key++) {
            let total_moy = (Number(stu_note.at(-1)) + Number(stu_note.at(-2)) + Number(stu_note.at(-3))) / 3
            if (key <= 4) {
                new_stu_note.push(stu_note[key])
            } else {

                if (trim == 3) {
                    moy = (Number(stu_note[key]) + Number(stu_note[key + 1]) + Number(stu_note[key + 2])) / 3
                }
                if (trim == 2) {
                    moy = (Number(stu_note[key]) + Number(stu_note[key + 1])) / 2
                }
                if (trim == 1) {
                    moy = isNull(stu_note[key]) ? 'معفى' : Number(stu_note[key])
                }
                moy = moy.toString().includes('معفى') ? 'معفى' : moy.toFixed(2) // toString().slice(0, 4)
                new_stu_note.push(moy)
                if (trim == 3) key += 2
                if (trim == 2) key += 1
            }
        }
        ne_ar.push(new_stu_note)
    })
    */
  //data = ne_ar.filter((e) => e.length)
  ne_ar = [];
  students_list(data, columns);
}
function s_o(elm) {
  return elm.options[elm.selectedIndex].text;
}
function students_list(d, c) {
  document.getElementById("success-rates-section").innerHTML = "";
  document.getElementById(
    "success-rates-section"
  ).innerHTML += `<h2 class="hacen fw-bold mb-3">1 - قائمة التلاميذ  ${s_o(
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
    tr += `<th class="rotate" style="width:2%" align="center"><div> ${element}</div></th>`;
  }
  tr += `<th width="5%">الإجازة</th></tr>`;
  const tableHead = document
    .getElementById("lists")
    .getElementsByTagName("thead")[0];
  tableHead.innerHTML = tr;
  d = sortArray(d);
  for (let i = 0; i < d.length; i++) {
    let trs = `<tr>`;
    trs += `<td>${i + 1}</td>`;
    let dr = JSON.parse(d[i].data);
    for (let r = 1; r < dr.length; r++) {
      let elm = dr[r];
      elm = r == 2 ? _.age(elm.trim(), this_year) : elm;
      elm = isNull(elm) ? "معفى" : elm;
      let css =
        r == 1 && dr[3].includes("أنثى")
          ? "girl"
          : elm == "نعم"
          ? "moiid"
          : elm < gmoy && r != 0
          ? "moy"
          : elm == "معفى"
          ? "moafa"
          : "";
      elm = r == 1 ? `${elm}[${d[i].niv_sec}]` : elm;
      trs += `<td class="colorise ${css}">${elm}</td>`;
    }
    trs += `<td></td></tr>`;
    const tableHead = document
      .getElementById("lists")
      .getElementsByTagName("tbody")[0];
    // Append the <tr> element to the <thead> element
    tableHead.insertAdjacentHTML("beforeend", trs);
  }
  //scroll_to('#success-rates-section')
}
function sortArray(arr) {
  return arr.sort((a, b) =>
    Number(JSON.parse(b.data).at(-1)) > Number(JSON.parse(a.data).at(-1))
      ? 1
      : Number(JSON.parse(a.data).at(-1)) > Number(JSON.parse(b.data).at(-1))
      ? -1
      : 0
  );
}
function createTable(id, place) {
  let tables = document.createElement("table");
  tables.setAttribute("id", id);
  tables.setAttribute("class", "w-100 fs-4");
  tables.setAttribute("border", "1");
  tables.setAttribute("align", "center");
  tables.setAttribute("dir", "rtl");
  tables.setAttribute("class", "w-100 fs-4");
  let theads = document.createElement("thead");
  let tbodys = document.createElement("tbody");
  tables.appendChild(theads);
  tables.appendChild(tbodys);
  document.getElementById(place).appendChild(tables);
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
function by_module(results, columns) {
  $one.innerHTML = $mmmm.innerHTML = $mmm.innerHTML = $mm.innerHTML = moys[0];
  $two.innerHTML = moys[1];
  $three.innerHTML = moys[2];
  $four.innerHTML = moys[3];
  $five.innerHTML = moys[4];
  $six.innerHTML = moys[5];
  $seven.innerHTML = moys[6];
  $eight.innerHTML = moys[7];
  let res = [];
  let modules = [];

  if (row_len == 0) {
    alert("لا توجد بيانات حاليا");
    $cont.innerHTML = $gStats.innerHTML = "";
    $preloader.classList.remove("d-flex");
    return;
  }
  modules.push(columns.slice(5));
  let culmn_len = columns.length; //JSON.parse(r[0].data).length
  let boy = 0,
    girl = 0,
    moid = 0,
    boy_t = 0,
    girl_t = 0,
    moid_t = 0,
    t_moy = 0;
  results = results.filter((s) => !JSON.parse(s.data).pop().includes("غ"));
  if (results.length === 0) return;
  for (const key in results) {
    const value = results[key];
    //$.each(data, function (key, value) {
    const data = JSON.parse(value.data);
    const gen = data[3];
    const moi = data[4];
    const mm = data.pop();
    const moye = Number(mm);

    t_moy = moye + t_moy;
    if (mm.includes("غ") && gen.includes("ذكر")) boy++;
    if (mm.includes("غ") && gen.includes("أنثى")) girl++;
    if (mm.includes("غ") && moi.includes("نعم")) moid++;
    if (mm.includes("غ") && gen.includes("ذكر") && moye >= gmoy) boy_t++;
    if (mm.includes("غ") && gen.includes("أنثى") && moye >= gmoy) girl_t++;
    if (mm.includes("غ") && moi.includes("نعم") && moye >= gmoy) moid_t++;
  }
  //);
  const total = results.filter((s) => !JSON.parse(s.data).pop().includes("غ"));

  t_moy = t_moy / total.length;
  $gStats.innerHTML = `
                   <tr>
                       <td>${row_len}</td>
                       <td>${t_moy.toFixed(2)}</td>
                       <td>${boy}</td>
                       <td>${boy_t}</td>
                       <td>${
                         boy != 0 ? ((boy_t * 100) / boy).toFixed(2) : "0.00"
                       }</td>
                       <td>${girl}</td>
                       <td>${girl_t}</td>
                       <td>${
                         girl != 0 ? ((girl_t * 100) / girl).toFixed(2) : "0.00"
                       }</td>
                       <td>${moid}</td>
                       <td>${moid_t}</td>
                       <td>${
                         moid != 0 ? ((moid_t * 100) / moid).toFixed(2) : "0.00"
                       }</td>
                   </tr>
           `;

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
      results[i] = results[i] || {};
      console.log(results[i]);
      const row_data = JSON.parse(results[i]?.data)[index];

      big_ten = row_data >= gmoy ? big_ten + 1 : big_ten;
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
      moafa = isNull(row_data) ? moafa + 1 : moafa + 0;
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
            <th>${modules[0][index]}</th>
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
  $cont.innerHTML = tr;
}
function z(e, x) {
  return Number(moys[e].split("-")[x]) + (x != 0 && e != 7 ? 0.01 : 0);
}

function isNull(object) {
  return typeof object === "null" || object === null;
}
function statistic_table() {
  let table = document.getElementById("lists");
  if (!table) {
    alert("لا توجد بيانات");
    return;
  }
  let moyen = _.isPrimary() ? 5 : 10;

  var { new_one, new_note } = calc(table, moyen);
  document.getElementById("stat-by-module").classList.remove("d-none");
  document.getElementById("general-stat").classList.remove("d-none");
  document.getElementById("stat-table").innerHTML = "";
  document.getElementById("s-note-table").innerHTML = "";
  $t2.innerHTML = "2 - حصيلة نتائج التقويم";
  $t1.innerHTML = "3 - احصائيات عامة";

  createTable("stat-tabl", "stat-table");
  createTable("s-note-tabl", "s-note-table");
  let c = JSON.parse(localStorage.columns);
  $tit.classList.remove("d-none");
  let tr = `<tr><th width="9%"> عدد المتمدرسين: ${table.rows.length - 1}</th>
    `;
  for (let index = 5; index < c.length; index++) {
    let element = c[index];
    tr += `<th class="rotate" style = "width:2%" align = "center" > <div> ${element}</div></th> `;
  }
  tr += `</tr> `;
  // Get the <thead> element of the table with id "lists"
  const tableHead = document
    .getElementById("stat-tabl")
    .getElementsByTagName("thead")[0];

  tableHead.innerHTML = tr;
  const tableHead2 = document
    .getElementById("s-note-tabl")
    .getElementsByTagName("thead")[0];

  tableHead.innerHTML = tr;
  tableHead2.innerHTML = tr;
  // $("#stat-tabl thead").append(tr);
  //$("#s-note-tabl thead").append(tr);

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
  for (let index = 0; index < cells_name.length; index++) {
    add_row(new_one, cells_code[index], cells_name[index], "stat-tabl");
  }
  let a_no = [
    "less_height",
    "less_ten",
    "less_twelve",
    "less_fourteen",
    "less_sexteen",
    "big_sexteen",
  ];
  let a_no_t = [
    "أقل من 8",
    "8 - 9,99",
    "10 - 11,99",
    "12 - 13,99",
    "14 - 15,99",
    "أكبر من 16",
  ];
  let a_no_tp = [
    "أقل من 3",
    "3 - 4,99",
    "5 - 5,99",
    "6 - 6,99",
    "7 - 7,99",
    "أكبر من 8",
  ];
  let ara1 = _.isPrimary() ? a_no_tp : a_no_t;
  for (let index = 0; index < a_no.length; index++) {
    add_row2(new_note, a_no[index], ara1[index], "s-note-tabl");
  }
  //scroll_to('#stat-table')
}
function count_ijaza(table) {
  let rows = table.rows;
  let ija = [];
  for (let index = 0; index < rows.length; index++) {
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
  for (let j = 0; j < 5; j++) {
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
function averages_range() {
  let data = JSON.parse(localStorage.my_data);
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
function getStandardDeviation(array) {
  const n = array.length;
  if (n == 0) return 0;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
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
function add_ijaza(grade) {
  let ijaza;
  switch (true) {
    case grade >= Number(localStorage.lawha.split("-")[0]) &&
      grade <= Number(localStorage.lawha.split("-").pop()):
      ijaza = "لوحة شرف";
      break;
    case grade >= Number(localStorage.tchjia.split("-")[0]) &&
      grade <= Number(localStorage.tchjia.split("-").pop()):
      ijaza = "تشجيع";
      break;
    case grade >= Number(localStorage.thniaa.split("-")[0]) &&
      grade <= Number(localStorage.thniaa.split("-").pop()):
      ijaza = "تهنئة";
      break;
    case grade >= Number(localStorage.imtiyaz.split("-")[0]) &&
      grade <= Number(localStorage.imtiyaz.split("-").pop()):
      ijaza = "امتياز";
      break;
    default:
      ijaza = "";
      break;
  }
  return ijaza;
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
      if (gender.includes("أنثى") && note >= moyen) girls++;
      if (gender.includes("ذكر") && note >= moyen) boys++;
      if (!note.includes("معفى")) aray.push(Number(note));
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
    let one = localStorage.s_type == "مدرسة" ? 3 : 8;
    let two = localStorage.s_type == "مدرسة" ? 5 : 10;
    let three = localStorage.s_type == "مدرسة" ? 6 : 12;
    let four = localStorage.s_type == "مدرسة" ? 7 : 14;
    let five = localStorage.s_type == "مدرسة" ? 8 : 16;
    const less_height = aray.filter((item) => item < one);
    const less_ten = aray.filter((item) => item < two && item >= one);
    const less_twelve = aray.filter((item) => item < three && item >= two);
    const less_fourteen = aray.filter((item) => item < four && item >= three);
    const less_sexteen = aray.filter((item) => item < five && item >= four);
    const big_sexteen = aray.filter((item) => item >= five);
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

function color_less_ten() {
  // Get all tables on the page
  var tables = document.querySelectorAll("table");

  // Loop through each table
  tables.forEach(function (table) {
    // Loop through each row in the table
    Array.from(table.rows).forEach(function (row) {
      // Loop through each cell in the row, starting from the second cell (index 1)
      for (var i = 1; i < row.cells.length; i++) {
        var cell = row.cells[i];
        // Check if the cell contains a number less than 10
        var cellValue = parseFloat(cell.textContent);
        if (!isNaN(cellValue) && cellValue < 10) {
          // Apply the desired color to the cell
          cell.style.backgroundColor = "yellow"; // Change 'yellow' to the desired color
        }
      }
    });
  });
}
