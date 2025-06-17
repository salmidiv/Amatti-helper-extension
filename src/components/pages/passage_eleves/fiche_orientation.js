import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";
import Tabs from "../../../../core/helpers/tabs.js";
import { route } from "../../../../core/route/route.js";

const noti = `
<div class="  fs-2 hacen text-right">
  <ol class="text-right m-0">
   <li>
   لتعمل معك أيقونة التحقق من ادراج الرغبات وأيقونة تصدير الرغبات الحالية للتلاميذ لملف اكسل يجب اختيار السنة الدراسية والفوج التربوي
    </li>
  </ol>
</div>
`;
notify.warning_note($notify, noti);
async function initModal() {
    await route.loadModal(
        "pages/passage_eleves/add-choice-modal",
        $modals,
        "form_excel-rak"
    );
    const tabsInstance = new Tabs(".tabs");
}
initModal();

//
console.log("pasage");
const rakbaExcel = _.qSel(".rakba-excel"); // document.getElementById("rakba-excel");
const StatTableBtn = _.qSel(".stat-table");

rakbaExcel.addEventListener("click", async () => {
    console.log("clcik");
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    setTimeout(rakba_excel, 350);
});

async function rakba_excel() {
    let annee = $("#annee_school").val();
    let div = $("#division").val();
    if (annee == "" || div == "") {
        alertify.error("الرجاء اختيار السنة الدراسية والفوج التربوي.");
        return;
    }

    let div_text = $("#division option:selected").text();
    let fich = _.isLycee() ? "fiche_orientation_2as" : "fiche_orientation";
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
    let url =
        _.isLycee() && div_text.includes("علوم")
            ? "get_choix_tech"
            : "get_choix";
    let students = await all_students(annee, div);
    for (let i = 0; i < students.length; i++) {
        const matt = students[i][0];
        const passage_eleves = await passageEleves(fich, url, matt);
        students[i] = students[i]
            .slice(0, -1)
            .concat(Object.values(passage_eleves));
        await _.sleep(800);
    }
    document.getElementById("footerfixe").style.backgroundColor =
        "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "ملف الرغبات",
        Subject: "salmi tahar - amatti",
        Author: "salmi tahar - amatti",
        CreatedDate: new Date(),
    };
    let rows = _.isCem() ? cem_ra(students) : "";
    rows = _.isLycee() && div_text.includes("علوم") ? tech(students) : rows;
    rows = _.isLycee() && div_text.includes("آداب") ? latter(students) : rows;
    var worksheet = XLSX.utils.json_to_sheet(rows);
    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "salmi tahar - amatti");
    XLSX.utils.sheet_add_aoa(worksheet, all_stu, { origin: "A1" });
    var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 }];
    workbook.Workbook = { Views: [{ RTL: true }] };
    var wscols = [{ wch: 100 }, { wch: 100 }, { wch: 10 }, { wch: 20 }];
    workbook["!cols"] = wscols;
    XLSX.writeFile(workbook, "ملف رغبات: " + div_text + ".xlsx");
    document.getElementById("wait-loader").innerHTML = "";
}
async function all_students(annee, div) {
    const response = await fetch(
        "https://amatti.education.dz/scolarite/passage_eleves/fiche_orientation/list_eleves",
        {
            method: "POST",
            body: new URLSearchParams({ annee: annee, division: div }),
        }
    );
    const data = await response.json();
    return data.data;
}
async function passageEleves(fich, url, matt) {
    const response = await fetch(
        `https://amatti.education.dz/scolarite/passage_eleves/${fich}/${url}`,
        {
            method: "POST",
            body: new URLSearchParams({ mat: matt }),
        }
    );
    const data = await response.json();
    return data;
}

function latter(array) {
    const rows = array.map((row) => ({
        id: row[0],
        nom: row[1],
        prenom: row[2],
        birthday: row[3],
        lang: row[4],
        phil: row[5],
        art: row[6],
        forma: row[7],
        cfp: row[8],
    }));
    return rows;
}
function tech(array) {
    const rows = array.map((row) => ({
        id: row[0],
        nom: row[1],
        prenom: row[2],
        birthday: row[3],
        math: row[4],
        tech: row[5],
        scf: row[6],
        eco: row[7],
        art: row[8],
        forma: row[9],
        cfp: row[10],
    }));
    return rows;
}
function cem_ra(array) {
    const rows = array.map((row) => ({
        id: row[0],
        nom: row[1],
        prenom: row[2],
        birthday: row[3],
        lang: row[4],
        tech: row[5],
        forma: row[6],
        cfp: row[7],
    }));
    return rows;
}

StatTableBtn.addEventListener("click", async () => {
    var division = $("#division").find(":selected").text();
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    StatTable(division);
});
async function StatTable(division) {
    let s_table = document.getElementById("eleves");
    let tr = s_table
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr");
    let bem_url = "scolarite/passage_eleves/fiche_orientation/get_choix";
    let bac_url = division.includes("تكنولوجيا")
        ? "scolarite/passage_eleves/fiche_orientation_2as/get_choix_tech"
        : "scolarite/passage_eleves/fiche_orientation_2as/get_choix";
    let c_url = _.isLycee() ? bac_url : bem_url;
    for (let index = 0; index < tr.length; index++) {
        tr[index].style.backgroundColor = "";
        let mat = tr[index].getElementsByTagName("td")[0].innerText;
        //$.ajaxSetup({ async: false });
        const data = await _.fetchData(c_url, {
            mat: mat,
        });
        //$.ajax({
        //  url: "https://amatti.education.dz/" + c_url,
        //  method: "POST",
        //  data: { mat: mat },
        //  dataType: "json",
        //  success: function (data) {
        let keys = [
            "eco",
            "math",
            "scf",
            "tech",
            "cfp",
            "forma",
            "lang",
            "phil",
        ];
        for (let i = 0; i < keys.length; i++) {
            if (_.isNull(data[keys[i]]) || data[keys[i]] == "0") {
                tr[index].style.backgroundColor = "#efff8b";
                break;
            }
        }
        //if (
        //    isNull(data.eco) ||
        //    data.eco == '0' ||
        //    isNull(data.math) ||
        //    data.math == '0' ||
        //    isNull(data.scf) ||
        //    data.scf == '0' ||
        //    isNull(data.tech) ||
        //    data.tech == '0' ||
        //    isNull(data.cfp) ||
        //    data.cfp == '0' ||
        //    isNull(data.forma) ||
        //    data.forma == '0' ||
        //    isNull(data.lang) ||
        //    data.lang == '0' ||
        //    isNull(data.phil) ||
        //    data.phil == '0'
        //) {
        //    tr[index].style.backgroundColor = '#efff8b';
        //}
        // }
        //});
    }
    alertify.success(
        "تم الانتهاء من عملية الكشف، الخلايا الملونة هي التي لم تدرج لأصحابها رغبات، انتقل للصفحة الموالية في الجدول"
    );
}
