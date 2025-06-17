// https://cdn.jsdelivr.net/npm/apexcharts

import {
    extension_url,
    //this_trim,
    //this_year,
} from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
let moy_najah = 10; //9.5
const this_year = 2023;
const this_trim = 20231;
if (typeof jQuery === "undefined") {
    console.log("jQuery is not loaded. Reloading the page...");
    // Reload the page
    location.reload();
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function isNull(object) {
    return typeof object === "null" || object === null;
}
$("#file").on("change", async (ev) => {
    let imageName = document.getElementById("imageName");
    imageName.innerText = ev.target.files[0].name;
    _.readXls(ev, action);
});
function action(result) {
    let sheet_name = Object.keys(result[0])[0];
    localStorage.excel_note = JSON.stringify(result[0][sheet_name]);
}
$("#update-data").on("click", function (e) {
    get_choba();
});
$("#get-moy-sanawi").on("click", function (e) {
    document.getElementById("container_spin").style.display = "flex";
    setTimeout(function () {
        get_moy_sanawi();
    }, 350);
});

$("#students-list").on("click", function () {
    var index = $("#cho-list").val();
    load_d(index);
});
$("#show-success-rates-bac").on("click", function () {
    show_success_rates_bac();
});
$("#show-module-nisab-bac").on("click", function () {
    show_module_nisab_bac();
    statistic_table_bac();
});

function show_success_rates_bac() {
    var c_index = $("#cho-list").val();
    let table = document.getElementById("nisba");
    table.getElementsByTagName("tbody")[0].innerHTML = "";
    table.style.display = "table";
    let r = tableToJson(2, document.getElementById("stud-table"));
    document.getElementById("table_title").innerText =
        "جدول يعرض نسب النجاح والرسوب لشهادة البكالوريا لشعبة: " +
        choba(c_index);
    let s_bac = 0;
    for (let index = 0; index < r.length; index++) {
        if (Number(r[index].at(-3)) >= moy_najah) s_bac++;
    }
    localStorage.sbac = s_bac;
    let tr = `<tr>
              <td>${s_bac}</td>
              <td>${((s_bac * 100) / r.length).toFixed(2)}%</td>
              <td>${r.length - s_bac}</td>
              <td>${(((r.length - s_bac) * 100) / r.length).toFixed(2)}%</td>
            </tr>
            `;
    table.getElementsByTagName("tbody")[0].innerHTML = tr;
    go_to_element("#nisba");
}
function show_module_nisab_bac() {
    var c_index = $("#cho-list").val();
    let table = document.getElementById("module_nisab");
    table.getElementsByTagName("tbody")[0].innerHTML = "";
    table.style.display = "inline-table";
    let r = tableToJson(2, document.getElementById("stud-table"));
    let count_najah = 0;
    let count_rosob = 0;
    let modules_n = [];
    let modules_r = [];
    for (let v = 4; v < r[0].length; v++) {
        for (let index = 0; index < r.length; index++) {
            const element = r[index][v];
            const najah_m = moy_najah; // v == r[0].length - 2 ? 9.5 : 10
            if (Number(element) >= najah_m) count_najah++;
            if (Number(element) < najah_m && !element.includes("مشطوب"))
                count_rosob++;
        }
        modules_n.push(count_najah);
        modules_r.push(count_rosob);
        count_najah = 0;
        count_rosob = 0;
    }

    localStorage.modules_n = JSON.stringify(modules_n);
    let th = `<tr><th colspan="${
        modules_n.length + 1
    }"> جدول يعرض نسب النجاح والرسوب حسب المواد  </th></tr>
            <tr><th>المواد</th>`;
    var mawad = module(c_index);
    for (let index = 0; index < mawad.length; index++) {
        th += `<th>${mawad[index]}</th>`;
    }
    th += `<th>معدل باك</th>`;
    th += `<th>المعدل السنوي</th>`;
    th += `</tr>`;
    table.getElementsByTagName("thead")[0].innerHTML = th;

    let tr = `<tr><td>عدد الناجحين</td>`;
    for (let index = 0; index < modules_n.length; index++) {
        tr += `<td>${modules_n[index]}</td>`;
    }
    tr += `</tr>`;
    tr += `<tr><td> نسبة النجاح</td>`;
    for (let index = 0; index < modules_n.length; index++) {
        const nisba = ((modules_n[index] * 100) / r.length).toFixed(2);
        tr += `<td style="color: ${nisba >= 50 ? "#5f37ff" : "#ff3737"}">${
            nisba + "%"
        }</td>`;
    }
    tr += `</tr>`;
    tr += `<tr><td>عدد الراسبين</td>`;
    for (let index = 0; index < modules_r.length; index++) {
        tr += `<td>${modules_r[index]}</td>`;
    }
    tr += `</tr>`;
    tr += `<tr><td> نسبة الرسوب</td>`;
    for (let index = 0; index < modules_r.length; index++) {
        const nisba = ((modules_r[index] * 100) / r.length).toFixed(2);
        tr += `<td style="color: ${nisba >= 50 ? "#5f37ff" : "#ff3737"}">${
            nisba + "%"
        }</td>`;
    }
    tr += `</tr>`;
    table.getElementsByTagName("tbody")[0].innerHTML = tr;
    go_to_element("#module_nisab");
}
function tableToJson(index, table) {
    var data = [];
    for (var i = index; i < table.rows.length; i++) {
        var tableRow = table.rows[i];
        var rowData = [];
        for (var j = 0; j < tableRow.cells.length; j++) {
            rowData.push(tableRow.cells[j].innerHTML);
        }
        data.push(rowData);
    }
    return data;
}
function excel_f() {
    return JSON.parse(localStorage.excel_note);
}

function get_choba() {
    let list_students = excel_f();
    console.log(list_students);
    var cho = [];
    $("#cho-list").html("");
    for (let index = 1; index < list_students.length; index++) {
        cho.push(list_students[index][1]);
    }
    var unique = cho.filter(onlyUnique);
    let op = `<option value="" selected="selected">اختر الشعبة</td>`;
    for (let index = 0; index < unique.length; index++) {
        const el = unique[index];
        op += `<option value="${el}">${choba(el)}</td>`;
    }
    $("#cho-list").append(op);
}
async function get_divs() {
    const response = await fetch(
        "https://amatti.education.dz/scolarite/en_chiffre/analyse_class/get_division",
        {
            method: "POST",
            body: new URLSearchParams({ annee: this_trim, isAjax: true }),
        }
    );
    const data = await response.text();
    const nivs = Array.from($(data))
        .filter((division) => division.value !== "")
        .map((division) => ({
            div: division.value,
            div_text: division.textContent,
        }));
    return nivs;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function get_moy_sanawi() {
    let all_classes = await get_divs(); //JSON.parse(localStorage.all_classes)
    //const key = 'div'
    //let all_class = [
    //  ...new Map(all_classes.map((item) => [item[key], item])).values(),
    //]
    let all_class = all_classes.filter(function (el) {
        return el.div_text.includes("ثالثة");
    });
    let all_ss = [];
    const annee = this_year;

    for (let index = 0; index < all_class.length; index++) {
        const class_id = all_class[index].div;
        const data = await _.fetchData(
            "scolarite/en_chiffre/suivi_bulletin/get_eleves_etab",
            { annee: annee, division: class_id, isAjax: true }
        );
        all_ss.push(data.data);
        await sleep(400);
    }
    let all_moys = [];

    for (let index = 0; index < all_ss.length; index++) {
        for (let i = 0; i < all_ss[index].length; i++) {
            all_moys.push(all_ss[index][i]);
        }
    }
    localStorage.all_moys_three = JSON.stringify(all_moys);
    document.getElementById("container_spin").style.display = "none";
}

function load_d(c_index) {
    document.getElementById(
        "list-students"
    ).innerHTML = `<table id="stud-table" class="istidrak_table scroll-margin"  style=" text-align:center;font-weight:bold; font-size:14px; width: 100%;" border="1"><thead></thead><tbody></tbody></table>`;
    let list_students = excel_f();
    let nl = list_students.filter((el) => el[1] === Number(c_index));
    // create table head
    var get_module = module(c_index);

    let th = `<tr><th colspan="${
        get_module.length + 7
    }" style="font-size:1.1rem"> قائمة نقاط التلاميذ </th></tr>`;
    th += `<tr>
        <th>الرقم</th>
        <th>الاسم واللقب</th>
        <th>تاريخ الميلاد</th>
        <th>الجنس</th>`;
    for (let index = 0; index < get_module.length; index++) {
        const element = get_module[index];
        th += `<th>${element}</th>`;
    }
    th += `<th>معدل باك</th>`;
    th += `<th>المعدل السنوي</th>`;
    th += `<th width="63">مقـــارنة  باك - سنوي</th>`;

    th += `<tr>`;
    $("#stud-table thead").append(th);
    let sanawi_moys = JSON.parse(localStorage.all_moys_three);
    // add data to table
    let nbr = 1;
    let ar = [33, 34, 35, 36, 37, 38];
    for (let index = 0; index < nl.length; index++) {
        const element = nl[index];
        let tr = `<tr>
    <td>${index + 1}</td>
    <td>${nl[index][2]} ${nl[index][3]}</td>
    <td>${nl[index][4]}-${nl[index][5]}-${nl[index][6]}</td>
    <td>${nl[index][7] == 1 ? "ذكر" : "أنثى"}</td>`;
        for (let e = 8; e < 20; e++) {
            if (!isNull(nl[index][e]) && !_.empty(nl[index][e])) {
                tr += `<td>${Number(nl[index][e]).toFixed(2)}</td>`;
            } else if (_.empty(nl[index][e])) {
                tr += `<td>معفى</td>`;
            }
        }
        const get_stud = sanawi_moys.find(
            (e) =>
                nl[index][2].includes(e[1]) &&
                nl[index][3].includes(e[2]) &&
                e[4].includes(nl[index][4]) &&
                e[4].includes(nl[index][5]) &&
                e[4].includes(nl[index][6])
        );
        const sana_moy = get_stud ? get_stud.at(-1) : "مشطوب";
        const sana_moyss = sana_moy == "مشطوب" ? 0 : sana_moy;
        tr += `<td ${
            Number(nl[index][20]) < moy_najah //9.5
                ? 'style="color: #ff3737"'
                : 'style="color: #5f37ff"'
        } >${Number(nl[index][20]).toFixed(2)}</td>`;
        tr += `<td ${
            Number(sana_moyss) < moy_najah
                ? 'style="color: #ff3737"'
                : 'style="color: #5f37ff"'
        } >${sana_moy == "مشطوب" ? "مشطوب" : Number(sana_moy).toFixed(2)}</td>`;
        tr += `<td ${
            Number(nl[index][20]) < Number(sana_moyss)
                ? 'style="color: #ff3737"'
                : 'style="color: #5f37ff"'
        } >${
            Number(nl[index][20]) - Number(sana_moyss) > 0 ? "+" : "-"
        }</td></tr>`;
        $("#stud-table tbody").append(tr);
    }

    $("td").each(function () {
        if (this.innerText.includes("NaN")) this.innerText = "معفى";
    });
    $("tr").each(function () {
        if (this.innerText === "") this.closest("tr").remove();
    });
    go_to_element("#stud-table");
}

function choba(index) {
    var m = {
        30: "أداب وفلسفة",
        31: "لغات أجنبية",
        32: "تسيير وإقتصاد",
        33: "علوم تجريبية",
        34: "رياضيات",
        35: "تقني رياضي - ميكانيك",
        36: "تقني رياضي - كهرباء",
        37: "تقني رياضي - هـ مدنية",
        38: "تقني رياضي - هـ طرائق",
    };
    return m[index];
}

function module(index) {
    var m = {
        30: [
            "اللغة العربية وآدابها",
            "الفلسفة",
            "التاريخ+الجغرافيا",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الرياضيات",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "/",
            "/",
            "ت.بدنية",
        ],
        31: [
            "اللغة العربية وآدابها",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "اللغة الأجنبية 3",
            "الفلسفة",
            "التاريخ+الجغرافيا",
            "الرياضيات",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "/",
            "ت.بدنية",
        ],
        32: [
            "ت.مالي ومحاسبي",
            "الاقتصاد و المناجمنت",
            "الرياضيات",
            "التاريخ+الجغرافيا",
            "اللغة العربية وآدابها",
            "قانون",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "أمازيغية",
            "العلوم الإسلامية",
            "ت.بدنية",
        ],
        33: [
            "العلوم الطبيعية",
            "العلوم الفيزيائية",
            "الرياضيات",
            "اللغة العربية وآدابها",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "التاريخ+الجغرافيا",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "ت.بدنية",
        ],
        34: [
            "الرياضيات ",
            "العلوم الفيزيائية",
            "اللغة العربية وآدابها",
            "العلوم الطبيعية",
            "التاريخ+الجغرافيا",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "ت.بدنية",
        ],
        35: [
            "التكنولوجيا",
            "الرياضيات",
            "العلوم الفيزيائية",
            "اللغة العربية وآدابها",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "التاريخ+الجغرافيا",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "ت.بدنية",
        ],
        36: [
            "التكنولوجيا",
            "الرياضيات",
            "العلوم الفيزيائية",
            "اللغة العربية وآدابها",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "التاريخ+الجغرافيا",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "ت.بدنية",
        ],
        37: [
            "التكنولوجيا",
            "الرياضيات",
            "العلوم الفيزيائية",
            "اللغة العربية وآدابها",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "التاريخ+الجغرافيا",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "ت.بدنية",
        ],
        38: [
            "التكنولوجيا",
            "الرياضيات",
            "العلوم الفيزيائية",
            "اللغة العربية وآدابها",
            "اللغة الفرنسية",
            "اللغة الأنجليزية",
            "الفلسفة ",
            "التاريخ+الجغرافيا",
            "أمازيغية",
            "العلوم الإسلامية",
            "/",
            "ت.بدنية",
        ],
    };
    return m[index];
}
function create_table(id, place) {
    let tables = document.createElement("table");
    tables.style.width = "100%";
    tables.setAttribute("id", id);
    tables.setAttribute("border", "1");
    tables.setAttribute("align", "center");
    tables.setAttribute("dir", "rtl");
    let theads = document.createElement("thead");
    let tbodys = document.createElement("tbody");
    tables.appendChild(theads);
    tables.appendChild(tbodys);
    document.getElementById(place).appendChild(tables);
}

function statistic_table_bac() {
    let t = document.getElementById("stud-table");
    t = t.getElementsByTagName("tbody")[0];
    if (!t) {
        alert("لا توجد بيانات");
        return;
    }
    let rr = Swap_bac(t, 10);
    let new_aa = rr.new_a;
    localStorage.nisba = JSON.stringify(new_aa);
    let new_not = rr.new_note;
    document.getElementById("stat-table").innerHTML = "";
    document.getElementById("s-note-table").innerHTML = "";
    create_table("stat-tabl", "stat-table");
    create_table("s-note-tabl", "s-note-table");
    var c_index = $("#cho-list").val();
    let c = module(c_index);
    let tr = `<tr><th width="265px"> عدد المتمدرسين: ${t.rows.length}</th>`;
    for (let index = 0; index < c.length; index++) {
        const element = c[index];
        tr += `<th>${element}</th>`;
    }
    tr += `<th>معدل باك</th>`;
    tr += `<th>المعدل السنوي</th>`;
    tr += `</tr>`;
    $("#stat-tabl thead").append(tr);
    $("#s-note-tabl thead").append(tr);
    let cells_name = [
        "عدد الناجحين",
        "أعلى معدل",
        "أدنى معدل",
        "عدد الذكور",
        "عدد الإناث",
        "المعدل",
        "نسبة أكبر من 10",
        "الانحراف المعياري",
        "المدى",
        "معامل التشتت",
        "المنوال",
        "الوسيط",
    ];
    let cells_code = [
        "najah",
        "max",
        "min",
        "boy",
        "girl",
        "average",
        "bigten",
        "stdev",
        "mada",
        "tachatot",
        "mode",
        "median",
    ];
    for (let index = 0; index < cells_name.length; index++) {
        const nisba = index == 6 ? "%" : "";
        add_row3(
            new_aa,
            cells_code[index],
            cells_name[index],
            "stat-tabl",
            nisba
        );
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
    //let = [
    //  "أقل من 3",
    //  "3 - 4,99",
    //  "5 - 5,99",
    //  "6 - 6,99",
    //  "7 - 7,99",
    //  "أكبر من 8",
    //];
    let ara1 = a_no_t;
    for (let index = 0; index < a_no.length; index++) {
        add_row2(new_not, a_no[index], ara1[index], "s-note-tabl");
    }
    document.querySelector("#stat-table").scrollIntoView({
        behavior: "smooth",
    });
}
function add_row2(arr, najah, text, pos) {
    let tr = `<tr> <th width="265px" rowspan="2">${text}</th>`;
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index][najah].moy;
        tr += `<td> ${isNaN(element) ? 0 : element.toFixed(2)}%</td> `;
    }
    tr += `</tr><tr>`;
    for (let index = 0; index < arr.length; index++) {
        const elm = arr[index][najah].nbr;
        tr += `<td> ${elm}</td> `;
    }
    tr += `</tr> `;
    $(`#${pos} tbody`).append(tr);
}

function add_row3(arr, najah, text, pos, nisba = "") {
    let tr = `<tr><th width="265px">${text}</th>`;
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index][najah];
        const style =
            nisba != "" && Number(element) < 50 ? 'style="color: #ff3737"' : "";
        tr += `<td ${style}>${isNaN(element) ? 0 : element}${nisba}</td>`;
    }
    tr += `</tr>`;
    $(`#${pos} tbody`).append(tr);
}

function Swap_bac(table, moy_note) {
    let aray = [];
    let new_a = [];
    let new_note = [];
    let najah = [];
    let exempt = 0;
    let girls = 0;
    let boys = 0;
    let r = table.rows.length;
    for (let index = 4; index < table.rows[0].cells.length; index++) {
        for (let e = 0; e < r; e++) {
            let gender = table.rows[e].cells[3].innerHTML;
            let note = table.rows[e].cells[index]
                ? table.rows[e].cells[index].innerHTML
                : "0";
            const moy_note = moy_najah; // (index == table.rows[0].cells.length - 2) ? 9.5 : 10
            if (gender.includes("أنثى") && Number(note) >= moy_note) girls++;
            if (gender.includes("ذكر") && Number(note) >= moy_note) boys++;
            if (!note.includes("معفى")) {
                const n = note.includes("مشطوب") ? "0" : note;
                aray.push(Number(n));
            }
        }
        const najah_moy = moy_najah; // index == (table.rows[0].cells.length - 2) ? 9.5 : 10
        const najah_a = aray.filter((item) => item >= najah_moy);
        najah = najah_a.length;
        let max_note = aray.length > 0 ? Math.max(...aray) : 0;
        let min_note = aray.length > 0 ? Math.min(...aray) : 0;
        const average = aray.reduce((a, b) => a + b, 0) / aray.length;
        const big_ten = (najah_a.length / aray.length) * 100;
        const inhiraf = getStandardDeviation(aray);
        const tachatot = (inhiraf / average) * 100;
        var new_re = {
            najah: najah,
            max: max_note,
            min: min_note,
            boy: boys,
            girl: girls,
            average: average.toFixed(2),
            bigten: big_ten.toFixed(2),
            stdev: inhiraf.toFixed(2),
            mada: (max_note - min_note).toFixed(2),
            tachatot: tachatot.toFixed(2),
            mode: mode(aray).toFixed(2),
            median: median(aray).toFixed(2),
        };
        new_a.push(new_re);
        const less_height = aray.filter((item) => item < 8);
        const less_ten = aray.filter((item) => item < 10 && item >= 8);
        const less_twelve = aray.filter((item) => item < 12 && item >= 10);
        const less_fourteen = aray.filter((item) => item < 14 && item >= 12);
        const less_sexteen = aray.filter((item) => item < 16 && item >= 14);
        const big_sexteen = aray.filter((item) => item >= 16);
        var note_array = {
            less_height: {
                nbr: less_height.length,
                moy: (less_height.length / aray.length) * 100,
            },
            less_ten: {
                nbr: less_ten.length,
                moy: (less_ten.length / aray.length) * 100,
            },
            less_twelve: {
                nbr: less_twelve.length,
                moy: (less_twelve.length / aray.length) * 100,
            },
            less_fourteen: {
                nbr: less_fourteen.length,
                moy: (less_fourteen.length / aray.length) * 100,
            },
            less_sexteen: {
                nbr: less_sexteen.length,
                moy: (less_sexteen.length / aray.length) * 100,
            },
            big_sexteen: {
                nbr: big_sexteen.length,
                moy: (big_sexteen.length / aray.length) * 100,
            },
        };
        new_note.push(note_array);
        girls = boys = 0;
        aray = [];
    }
    return { new_a, new_note };
}
function go_to_element(elm) {
    document.querySelector(elm).scrollIntoView({
        behavior: "smooth",
    });
}
/*
var preloader = document.querySelector("#preloader");
var overflow = document.querySelector(".overflow");
preloader.classList.add("e");
window.addEventListener("load", function () {
  setTimeout(function () {
    $con.classList.remove("d-none");
    preloader.classList.add("h");
  }, 1500);
});

function counter(elm, id, start, end, duration) {
  //let obj = elm.getElementsByClassName(id),
  let current = start,
    range = end - start,
    increment = end > start ? 1 : -1,
    step = Math.abs(Math.floor(duration / range)),
    timer = setInterval(() => {
      current += increment;
      elm.textContent = current;
      if (current == end) {
        clearInterval(timer);
      }
    }, step);
}
var elems = document.getElementsByClassName("count-number");
[].forEach.call(elems, function (el, i) {
  const n = Number(el.innerHTML);
  console.log(elems.item(i));
  counter(elems.item(i), "count-number", 0, n, 3000);
});
function myFunction(e) {
  var elems = document.querySelectorAll(".active");
  [].forEach.call(elems, function (el) {
    el.closest("a").classList.remove("active");
  });
  e.target.closest("a").classList.add("active");
}
function loader_active() {
  overflow.classList.add("d-none");
  preloader.classList.remove("h");
}
function loader_inactive() {
  overflow.classList.remove("d-none");
  preloader.classList.add("h");
}
$nivs.addEventListener("change", () => {
  if ($nivs.value == 1) {
    loader_active();
    setTimeout(function () {
      loader_inactive();
    }, 2500);
  }
});
*/

// helper function
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
