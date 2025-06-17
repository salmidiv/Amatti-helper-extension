import { moreInfoTable, studentsTable } from "../../core/db/conn.js";
import { this_year } from "../../core/helpers/const.js";
import DownloadPDF from "../../core/helpers/donwload-pdf.js";
import { _ } from "../../core/helpers/helpers.js";
import { notify } from "../../core/helpers/notify.js";
import Tabs from "../../core/helpers/tabs.js";
import { route } from "../../core/route/route.js";
const downloadPDF = new DownloadPDF();

const noti = `
     تم إضافة خاصية "<span class="fw-bold">طباعة شهادة مدرسية (نسختين في ورقة واحدة)</span>" للطباعة، للحصول على الوثيقة، تضغط على أي سطر تلميذ بالزر الأيمن ثم تختار طباعة شهادة مدرسية (نسختين في ورقة واحدة).
     <br>
     العملية صالحة لكل السنوات الدراسية على الرقمنة
`;
const noti1 = `
     يمكنكم الآن الضغط بالزر الأيمن للفأرة وطباعة شهادة مدرسية بدل تحميلها
`;
notify.note($notify, noti);
notify.note($notify, noti1);
async function initModal() {
  await route.loadModal(
    "etab_scolarite/certaficat_modal",
    $modals,
    "certaficat-modal"
  );
  const tabsInstance = new Tabs(".tabs");
}
initModal();

const table = document.querySelector("#eleves tbody");

const dropdownMenu = document.createElement("div");
dropdownMenu.classList.add("dropdown-menu");
dropdownMenu.classList.add("hacen");

const createMenuItem = (text, callback) => {
  const anchor = document.createElement("a");
  anchor.href = "#";
  anchor.textContent = text;
  anchor.style.padding = "1rem";
  anchor.style.fontSize = "1.3rem";
  anchor.style.color = "#000";
  anchor.addEventListener("click", callback);
  return anchor;
};

function handleRightMenu(event) {
  event.preventDefault();
  const row = event.target.closest("tr");

  if (row) {
    dropdownMenu.innerHTML = "";
    const annee = _.getid("annee_school").value;

    // Create menu items
    const printCertificate = createMenuItem(
      "طباعة شهادة مدرسية (نسختين في ورقة واحدة)",
      function () {
        const rowData = Array.from(row.querySelectorAll("td")).map(
          (td) => td.textContent
        );
        notify.toast({
          type: "warning",
          color: "warning",
          message: "الرجاء الانتظار حتى اكتمال العملية",
        });
        downloadPDF.TwoFace(rowData[1], annee, "");
      }
    );
    const printCertificate2 = createMenuItem(
      "طباعة شهادة مدرسية (نسخة واحدة في ورقة واحدة)",
      function () {
        const rowData = Array.from(row.querySelectorAll("td")).map(
          (td) => td.textContent
        );
        notify.toast({
          type: "warning",
          color: "warning",
          message: "الرجاء الانتظار حتى اكتمال العملية",
        });
        downloadPDF.oneFace(rowData[1], annee, "");
      }
    );

    dropdownMenu.appendChild(printCertificate);
    dropdownMenu.appendChild(printCertificate2);
    document.body.appendChild(dropdownMenu);
    dropdownMenu.style.display = `flex`;
    dropdownMenu.style.flexDirection = `column`;
    dropdownMenu.style.left = `${event.clientX + window.scrollX}px`;
    dropdownMenu.style.top = `${event.clientY + window.scrollY}px`;

    const closeMenu = () => {
      dropdownMenu.remove();
      document.removeEventListener("click", closeMenu);
    };
    document.addEventListener("click", closeMenu, { once: true });
  }
}

table.addEventListener("contextmenu", handleRightMenu);

_.btnEvent(_.getid("downloadMasarData"), "click", async () => {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  const students = await getStudents();
  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(students, moreInfo);
  const newList = orderASC(lists, "s_nom");
  console.log(newList);
  const rows = newList.map((s) => ({
    matt: s.s_matt,
    nom: s.s_nom,
    prenom: s.s_prenom,
    birthdat: s.s_birthday,
    sexe: s.sexe_elv == "1" ? "ذكر" : "أنثى",
    level: s.s_niv,
    choaba: s.s_choaba,
    section: s.s_section,
    sifa: s.s_sifa,
    s_moiid: s.s_moiid == "1" ? "نعم" : "لا",
    regester: s.s_regester_nbr,
    frNom: s.nom_elvlt,
    frPrenom: s.prenom_elvlt,
    lieun: s.lieun,
    lieunf: s.lieunf,
    anneeinscr: s.anneeinscr,
    numact: s.numact,
    nom_pere: s.nom_pere,
    nom_mere: s.nom_mere,
    prenom_mere: s.prenom_mere,
    adresse: s.adresse,
    email_pere: s.email_pere,
    tel: s.tel,
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [
        "رقم التعريف الوطني",
        "اللقب",
        "الاسم",
        "تاريخ الميلاد",
        "الجنس",
        "القسم",
        "الشعبة",
        "الفوج",
        "الصفة",
        "الإعادة",
        "رقم التسجيل",
        "اللقب بالفرنسية",
        "الاسم بالفرنسية",
        "الولاية",
        "الولاية بالفرنسية",
        "تاريخ الدخول للمدرسة",
        "رقم شهادة الميلاد",
        "اسم الأب",
        "لقب الأم",
        "اسم الأم",
        "مكان الميلاد",
        "البريد الالكتروني",
        "رقم الهاتف",
      ],
    ],
    { origin: "A1" }
  );
  XLSX.writeFile(workbook, "البيانات الاجمالية للتلاميذ.xlsx", {
    compression: true,
  });
});
async function getStudents() {
  return await studentsTable
    .where({ s_annee: this_year }) // s_niv: `${id[0].trim()}`,
    //.and((eleve) => eleve.s_section === id[dbindex])
    //.and((eleve) =>
    //  _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    //)
    .toArray();
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
function orderASC(arrayOfObjects, orderBy) {
  return arrayOfObjects.sort((a, b) =>
    a[orderBy].localeCompare(b[orderBy], "ar")
  );
}
