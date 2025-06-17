import { _ } from "../../../../core/helpers/helpers.js";
import { footer, header } from "../../../../core/helpers/header.js";
import {
    istidrakDataTable,
    istidrakHeadTable,
} from "../../../../core/db/conn.js";
import { this_year } from "../../../../core/helpers/const.js";

_.afterbegin("header", header);
_.afterbegin("footer", footer);
loadList();
async function loadList() {
    try {
        const data = await istidrakDataTable
            .where({ annee: this_year })
            .toArray();
        const head = await istidrakHeadTable
            .where({ annee: this_year })
            .toArray();

        const keys = _.isLycee()
            ? ["أولى", "ثانية"]
            : ["أولى", "ثانية", "ثالثة"];
        const separatedArrays = keys.reduce((acc, key) => {
            acc[key] = data
                .filter((obj) => obj.niv === key)
                .reduce((subAcc, obj) => {
                    if (!subAcc[obj.shoaba]) {
                        subAcc[obj.shoaba] = [];
                    }
                    subAcc[obj.shoaba].push(obj);
                    return subAcc;
                }, {});
            return acc;
        }, {});

        const sheetElement = document.querySelector("#sheet");
        sheetElement.innerHTML = "";

        const datffa = Object.entries(separatedArrays)
            .map(([year, objects], index) => {
                let yearData = `<h2 class="hacen fs-3 fw-bold">${
                    index + 1
                }-  قوائم تلاميذ سنوات: ${year}</h2>`;

                const objectsData = Object.entries(objects)
                    .map(([shoaba, objectArray]) => {
                        let isChoaba = "";
                        if (!objectArray.length) return "";
                        if (_.isLycee()) {
                            isChoaba += `<h2 class="hacen fs-3 ">- المستدركين شعبة: <span class="fw-bold">${shoaba}</span></h2>`;
                        }

                        const thead = head.find(
                            (e) => e.nivid == objectArray[0].nivid
                        );
                        if (!thead) return "";

                        const names = thead.data || [];
                        const objectModules =
                            objectArray[0].module.split("/")[1]?.split(",") ||
                            [];
                        console.log(objectModules);
                        const tableHeader =
                            `<th>القسم</th>` +
                            names
                                .map((nam, index) =>
                                    objectModules.includes(index.toString())
                                        ? ""
                                        : `<th>${nam}</th>`
                                )
                                .join("");

                        const tableRows = objectArray
                            .map((item) => {
                                const tableCells = item.data
                                    // .split(",")
                                    .map((element, index) => {
                                        const tdClass =
                                            item.module
                                                .split("/")[0]
                                                .includes(index) && index > 2
                                                ? "yes"
                                                : "";
                                        return objectArray[0].module.split(
                                            "/"
                                        )[1] &&
                                            objectArray[0].module
                                                .split("/")[1]
                                                .split(",")
                                                .includes(index.toString())
                                            ? ""
                                            : `<td class="${tdClass}">${element}</td>`;
                                    })
                                    .join("");

                                return `<tr> <td style="font-size:1.2rem">${item.section}</td> ${tableCells}</tr>`;
                            })
                            .join("");

                        return `
          ${isChoaba}
          <table class="table fs-5">
            <thead><tr>${tableHeader}</tr></thead>
            <tbody><tr>${tableRows}</tr></tbody>
          </table>
        `;
                    })
                    .join("");

                return yearData + objectsData;
            })
            .join("");

        sheetElement.innerHTML = datffa;
    } catch (error) {
        console.error("Error loading list:", error);
    }
}

/*
let title_head = 'قائمة التلاميذ  المعنيين بالاستدراك';
let trimestre = uri[3];
let trim = trimestre.slice(-1);
function get_divs() {
    divs = []
    $.ajaxSetup({ async: false })
    $.ajax({
        url: "https://amatti.education.dz/scolarite/en_chiffre/analyse_class/get_division",
        data: { annee: 20231, 'isAjax': true },
        type: "POST",
        success: function (data) {
            let pageRender = $(data)
            pageRender.map(function () {
                let division = $(this)
                if (division.val() != '') {
                    divs.push({ div: division.val(), div_text: division.text() })
                }
            })
        }
    })
    return divs
}
function get_new_colums(my_columns, ty = '') {
    let tex = ty == 1 ? 'المعدل الفصلي' : 'المعدل السنوي';
    for (var i = 0; i < my_columns.length; i++) {
        let modul = my_columns[i];
        $.each(modul, function (key, value) {
            new_value = key > 4 && key < modul.length - 3 ? value.slice(0, -4) : value;
            new_value = key > modul.length - 4 ? tex : new_value;
            modul[key] = new_value;
        });
        var unique = modul.filter(array_unique);
        my_columns[i] = unique;
    }
    return my_columns;
}
let all_classS = get_divs()
const key = 'div';
const all_classs = [
    ...new Map(all_classS.map((item) => [item[key], item])).values(),
];
let limit = 'خامسة';
limit = s_type == 'ثانوي' ? 'ثالثة' : limit;
limit = s_type == 'متوسط' ? 'رابعة' : limit;
let all_class = all_classs.filter((o) =>
    Object.keys(o).some((k) => !o['div_text'].toLowerCase().includes(limit)),
);

let my_columns = [];
let my_data = [];

if (uri[4] == 1) {
    $.ajaxSetup({ async: false });
    for (var i = 0; i < all_class.length; i++) {
        $.ajax({
            url:
                'https://amatti.education.dz/scolarite/en_chiffre/analyse_class/get_list',
            data: { trimestre: trimestre, division: all_class[i].div },
            type: 'POST',
            dataType: 'json',
            async: false,
            cache: true,
            success: function (json) {
                my_columns.push(json.columns);
                my_data.push(json.data);
                localStorage.my_columns = JSON.stringify(my_columns);
                localStorage.my_data = JSON.stringify(my_data);
            },
        });
    }
}
new_my_columns = get_new_colums(JSON.parse(localStorage.my_columns));
localStorage.new_my_colu = JSON.stringify(new_my_columns);
let ne_ar = [];
my_data = JSON.parse(localStorage.my_data);
let min_moy_is = s_type == 'مدرسة' ? 4.5 : 9;
let max_moy_is = s_type == 'مدرسة' ? 5 : 10;
for (var i = 0; i < my_data.length; i++) {
    if (s_type == 'مدرسة' && all_class[i].div_text.includes('أولى')) {
        m_data = [];
    } else {
        m_data = my_data[i];
    }
    $.each(m_data, function (key, value) {
        let stu_note = value;
        let new_stu_note = [];
        for (var key = 0; key < stu_note.length; key++) {
            let total_moy =
                trim == 2
                    ? (Number(stu_note.at(-1)) + Number(stu_note.at(-2))) / 2
                    : (Number(stu_note.at(-1)) +
                        Number(stu_note.at(-2)) +
                        Number(stu_note.at(-3))) /
                    3;
            if (total_moy >= min_moy_is && total_moy < max_moy_is) {
                if (key <= 4) {
                    new_stu_note.push(stu_note[key]);
                } else {
                    if (trim == 2) {
                        let moy = (Number(stu_note[key]) + Number(stu_note[key + 1])) / 2;
                        moy = moy.toString().slice(0, 4);
                        new_stu_note.push(moy);
                        key += 1;
                    }
                    if (trim == 3) {
                        let moy =
                            (Number(stu_note[key]) +
                                Number(stu_note[key + 1]) +
                                Number(stu_note[key + 2])) /
                            3;
                        moy = moy.toString().slice(0, 4);
                        new_stu_note.push(moy);
                        key += 2;
                    }
                }
            }
        }
        ne_ar.push(new_stu_note);
    });
    my_data[i] = ne_ar.filter((e) => e.length);
    ne_ar = [];
}

//my_data = JSON.parse(localStorage.old_is)
localStorage.make_isti = JSON.stringify(my_data);
document.getElementById(
    'sheet',
).innerHTML += `<style>.d-none{display:none}  th, td {cursor: pointer; padding: 1px 5px !important; } </style> <button style="border: 1px solid transparent; border-radius: 0.375rem; color: #ffffff; cursor: pointer; padding: 0.5rem 0.75rem; text-align: center; user-select: none; vertical-align: inherit; background-color: #303952;display: flex; margin: 10px auto;" class="remove_last_c">إخفاء / إظهار عمود المعدل السنوي (لن تظهر هذه الأيقونة أثناء الطباعة)</button> <div class="contaier" id="contaier"></div>`;
var i = 0,
    len = all_class.length;
while (i < len) {
    let head_table = new_my_columns[i];
    let body_table = my_data[i];
    if (body_table && body_table.length > 0) {
        document.getElementById('contaier').innerHTML += `
          <div dir="rtl">
            <h1 style="text-align: center; font-size: 15px; font-weight: 800;line-height: 19px;margin: 1.5rem 0px 5px;padding: 5px;">
              مستوى: ${all_class[i].div_text}
            </h1>
          </div>
          <div dir="rtl">
            <table id="table_${i}" class="istidrak_table fs-5" border="1">
              <thead>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
          <hr/>`;
        let th = `<tr>`;
        for (var ix = 0; ix < head_table.length; ix++) {
            th += `<th>${head_table[ix]}</th>`;
        }
        th += `</tr>`;
        $('#table_' + i + ' > thead').append(th);
        for (var a = 0; a < body_table.length; a++) {
            let tr = `<tr>
                <td>${a + 1}</td>
                <td>${body_table[a][1]}</td>
                <td>${body_table[a][2]}</td>
                <td>${body_table[a][3]}</td>
                <td>${body_table[a][4]}</td>`;
            for (var e = 5; e < body_table[a].length; e++) {
                X =
                    uri[2] == 1
                        ? body_table[a][e]
                        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-11.414L9.172 7.757 7.757 9.172 10.586 12l-2.829 2.828 1.415 1.415L12 13.414l2.828 2.829 1.415-1.415L13.414 12l2.829-2.828-1.415-1.415L12 10.586z"/></svg>';
                let m = body_table[a][e] == '0.00' || body_table[a][e] == '0' ? '-' : body_table[a][e];
                m = m < max_moy_is ? X : '-';
                if (uri[2] == 2) {
                    if (e == body_table[a].length - 1) m = body_table[a][e];
                }
                let class_name = m == '-' ? '' : 'hide';
                tr += `<td class="${class_name}" style="text-align:center; font-size: 1.3rem!important;" contenteditable="true">${m}</td>`;
            }
            tr += `</tr>`;
            $('#table_' + i + ' > tbody').append(tr);
        }
    }
    i++;
}
$('.hide').click(function () {
    this.classList.toggle('yes');
});
$('.remove_last_c').click(function () {
    remove_last_column();
});
const tables = document.getElementsByTagName('table');
for (var i = 0; i < tables.length; i++) {
    let sort = tables[i].rows[0].cells.length - 1;
    sortTable(tables[i].id, sort, 1);
}
table_nbr();
*/
