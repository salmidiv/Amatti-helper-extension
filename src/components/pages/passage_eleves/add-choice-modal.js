import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

const myAnneeBtn = _.getid("my-annee");
const fileDownBtn = _.qSel(".file_down");

const excelRakba = _.qSel("#excel-rakba");
myAnneeBtn.addEventListener("change", async () => {
    let annee = myAnneeBtn.value;
    mydiv_add(annee);
});
fileDownBtn.addEventListener("click", async () => {
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    setTimeout(files_down, 350);
});

async function mydiv_add(annee) {
    let fich = _.isLycee() ? "fiche_orientation_2as" : "fiche_orientation";
    const data = await _.fetchData(
        `scolarite/passage_eleves/${fich}/get_division`,
        {
            annee: annee,
        },
        "text"
    );
    _.html(_.getid("my-div"), data);
}

function files_down() {
    let div_text = $("#my-div option:selected").text();
    let division = $("#my-div").val();
    let annee = $("#my-annee").val();
    let all_stu = [
        [
            "رقم التعريف الوطني",
            "اللقب",
            "الاسم",
            "تاريخ الميلاد",
            "علوم و تكنولوجيا",
            "آداب",
            "تعليم مهني",
            "تكوين مهني",
        ],
    ];
    all_stu =
        _.isLycee() && div_text.includes("داب")
            ? [
                  [
                      "رقم التعريف الوطني",
                      "اللقب",
                      "الاسم",
                      "تاريخ الميلاد",
                      "آداب ولغات أجنبية",
                      "آداب وفلسفة",
                      "فنون",
                      "تعليم مهني",
                      "تكوين مهني",
                  ],
              ]
            : all_stu;
    all_stu =
        _.isLycee() && div_text.includes("علوم")
            ? [
                  [
                      "رقم التعريف الوطني",
                      "اللقب",
                      "الاسم",
                      "تاريخ الميلاد",
                      "رياضيات",
                      "تقني رياضي",
                      "علوم تجريبية",
                      "تسيير واقتصاد",
                      "فنون",
                      "تعليم مهني",
                      "تكوين مهني",
                  ],
              ]
            : all_stu;
    $.ajaxSetup({ async: false });
    $.ajax({
        url: "https://amatti.education.dz/scolarite/passage_eleves/fiche_orientation/list_eleves",
        data: { annee: annee, division: division },
        type: "POST",
        dataType: "json",
        success: function (data) {
            let all_students = data.data;
            for (let index = 0; index < all_students.length; index++) {
                all_students[index][4] = "1";
                all_students[index][5] = "2";
                all_students[index][6] = "3";
                all_students[index][7] = "4";
                if (_.isLycee() && div_text.includes("آداب")) {
                    all_students[index][8] = "5";
                }
                if (_.isLycee() && div_text.includes("علوم")) {
                    all_students[index][8] = "5";
                    all_students[index][9] = "6";
                    all_students[index][10] = "7";
                }
                all_stu.push(all_students[index]);
            }
        },
    });
    let opts = [];
    let file_name = `ملف ادراج الرغبات لقسم - ${div_text} - ${annee}.xlsx`;
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Sheet1",
        Subject: "Sheet1",
        Author: "Sheet1",
        CreatedDate: new Date(2017, 12, 19),
    };
    wb.Workbook = { Views: [{ RTL: true }] };
    var wscols = [{ wch: 100 }, { wch: 100 }, { wch: 10 }, { wch: 20 }];
    wb["!cols"] = wscols;
    wb.SheetNames.push("Sheet1");
    var ws_data = all_stu;
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Sheet1"] = ws;
    var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        file_name
    );
    document.getElementById("wait-load").innerHTML = "";
}
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
}
function saveAs(blob, filename) {
    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

excelRakba.addEventListener("change", file_Reader);

function file_Reader(oEvent) {
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    var oFile = oEvent.target.files[0];
    if (oFile === undefined) return;
    var sFilename = oFile.name;
    var reader = new FileReader();
    var result = {};
    reader.onload = async function (e) {
        var data = e.target.result;
        data = new Uint8Array(data);
        var workbook = XLSX.read(data, { type: "array" });
        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
            var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                header: 1,
            });
            if (roa.length) result[sheetName] = roa;
        });
        let sheet_name = Object.keys(result)[0];
        await add_choises(result[sheet_name]);
    };
    reader.readAsArrayBuffer(oFile);
}
async function add_choises(result) {
    let n = [];
    let tot = 0;
    $.ajaxSetup({ async: false });
    let fich = _.isLycee() ? "fiche_orientation_2as" : "fiche_orientation";
    for (let index = 1; index < result.length; index++) {
        let url =
            _.isLycee() && result[index].length == 11
                ? "add_choix_tech"
                : "add_choix";
        let all_stu = [];
        const matricule = result[index][0];
        let adab = {
            matricule: Number(matricule),
            lang: Number(result[index][4]),
            phil: Number(result[index][5]),
            art: Number(result[index][6]),
            forma: Number(result[index][7]),
            cfp: Number(result[index][8]),
        };
        let cem = {
            matricule: Number(matricule),
            tech: Number(result[index][4]),
            lang: Number(result[index][5]),
            forma: Number(result[index][6]),
            cfp: Number(result[index][7]),
        };
        let tech = {
            matricule: Number(matricule),
            math: Number(result[index][4]),
            tech: Number(result[index][5]),
            scf: Number(result[index][6]),
            eco: Number(result[index][7]),
            art: Number(result[index][8]),
            forma: Number(result[index][9]),
            cfp: Number(result[index][10]),
        };
        let data = _.isCem() ? cem : adab;
        data = _.isLycee() && result[index].length == 11 ? tech : data;
        let c = check_value(result[index]);
        let d = hasDuplicates(result[index]);
        if (c.length != 0 || d.length != 0)
            n.push({ index: index, student: result[index] });

        if (c.length == 0 && d.length == 0) {
            $.ajax({
                url: `https://amatti.education.dz/scolarite/passage_eleves/${fich}/${url}`,
                method: "POST",
                data: data,
                //dataType: 'json',
                success: function (data) {
                    tot++;
                },
            });
            await _.sleep(800);
        }
    }
    $("#errore").html("");

    let to = Object.keys(n).length;
    if (to == 0) {
        alertify.success(`تم حجز جميع الرغبات بنجاح`);
        document.getElementById("excel-rakba").value = null;
        document.getElementById("loader-wait").innerHTML = "";

        return;
    }
    let resu = `<div id="result" style="margin-top: 1rem;">
                <h4 class="biarabi">لدى التلاميذ التالية أسماؤهم أخطاء في حجز الرغبات، يرجى التصحيح، والادخال يدويا في حال كان العدد قليل </h4>
                <ul class="biarabi" id="students_list">
                </ul>
              </div>`;
    let li = "";
    for (let index = 0; index < to; index++) {
        li += `<li><b> ${n[index].student[1]} ${
            n[index].student[2]
        }</b>  موجود في السطر ${n[index].index + 1}</li>`;
    }
    $("#errore").append(resu);
    $("#students_list").append(li);
    alertify.success(
        `تم اتمام رغبات ${tot} تلميذا، مع وجود أخطاء لدى ${to} تلميذ`
    );
    document.getElementById("excel-rakba").value = null;
}
function check_value(array) {
    const c = [1, 2, 3, 4];
    const l_a = [1, 2, 3, 4, 5];
    const l_t = [1, 2, 3, 4, 5, 6, 7];

    const allowedValues =
        array.length == 8
            ? c
            : array.length == 9
            ? l_a
            : array.length == 11
            ? l_t
            : [];
    const invalidValues = array.filter(
        (val) => !allowedValues.includes(Number(val))
    );

    return invalidValues.length > 0 ? [] : array;
}

function hasDuplicates(array) {
    return new Set(array).size !== array.length ? array : [];
}
