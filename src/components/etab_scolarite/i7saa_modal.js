import { db, istiksaaDataTable } from "../../../core/db/conn.js";
import { this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";

$emptyDatabaseIstiksaa.addEventListener("click", async (e) => {
  await istiksaaDataTable.clear();
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
});
$cusTime.value = localStorage.cusTime;
$dateType.value = localStorage.dateType;

$dateType.addEventListener("change", async () => {
  localStorage.dateType = $dateType.value;
});
$cusTime.addEventListener("change", async () => {
  if ($dateType.value != 4) {
    alert(
      "'يمكن اختيار تاريخ مخصص فقط في حال اختيار 'حساب العمر حسب تاريخ مقترح"
    );
  }
  localStorage.cusTime = $cusTime.value;
});
$year.addEventListener("change", async () => {
  let annee = $year.value;
  if (annee == 2024) {
    $downListw.classList.add("d-flex");
    $downListm.classList.add("d-flex");
    $downListmoiid.classList.add("d-flex");
    $downListw.classList.remove("d-none");
    $downListm.classList.remove("d-none");
    $downListmoiid.classList.remove("d-none");
  } else {
    $downListw.classList.add("d-none");
    $downListm.classList.add("d-none");
    $downListw.classList.remove("d-flex");
    $downListm.classList.remove("d-flex");
    $downListmoiid.classList.remove("d-flex");
    $downListmoiid.classList.add("d-none");
  }
});
$downList.addEventListener("click", async () => {
  $waitText5.classList.remove("d-none");
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";

  let annee = $year.value;
  $spin5.classList.add("d-flex");
  setTimeout(function () {
    downlist(annee);
  }, 350);
});

$downListmoiid.addEventListener("click", async () => {
  $waitText5.classList.remove("d-none");
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";

  $spin5.classList.add("d-flex");
  setTimeout(function () {
    list_moiid();
  }, 350);
});

async function downlist(annee) {
  const students = await _.fetchData(
    "scolarite/dossier_eleves/eleves/list_eleves",
    {
      annee: annee,
    }
  );
  console.log(students);
  let ids = [];
  const real =
    annee == this_year
      ? students.data.filter((s) => s[9] != "0")
      : students.data;
  console.log(real);
  let total = real.length;
  for (let i = 0; i < total; i++) {
    const index = _.isLycee() ? 8 : 7;
    ids.push(real[i][1]);
    let data = {
      s_matt: real[i][1],
      s_nom: real[i][2],
      s_prenom: real[i][3],
      s_gender: real[i][4],
      s_birthday: real[i][5],
      s_age: _.age(real[i][5], annee),
      s_niv: real[i][6],
      s_choba: _.isLycee() ? real[i][7] : "",
      s_section: real[i][index],
      out: 0,
      s_annee: Number(annee),
    };
    const user = await istiksaaDataTable
      .where({
        s_matt: real[i][1],
        s_annee: Number(annee),
      })
      .first();

    if (user) {
      await istiksaaDataTable
        .where({
          s_matt: real[i][1],
          s_annee: Number(annee),
        })
        .modify(data);
    } else {
      await istiksaaDataTable.add(data);
    }
    $waitText5.innerHTML = `تم تحميل ${i + 1} من ${total} تلميذ`;
  }
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
  $waitText5.classList.add("d-none");
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";
}
async function list_moiid() {
  var stat = false;
  var all_tbl;
  var niv = [];
  const data = await _.fetchData(
    "scolarite/passage_eleves/dossier_eleve/impression",
    {},
    "text"
  );
  let source = new DOMParser().parseFromString(data, "text/html");
  all_tbl = source.getElementsByTagName("table");
  for (var i = 0; i < all_tbl.length; i++) {
    let ttrs = all_tbl[i]?.rows[3]
      ? all_tbl[i]?.rows[3]?.cells[0].innerText
      : [];
    if (ttrs.length > 55) {
      niv.push(ttrs.split(":")[1].split("للسنة")[0]);
    }
  }
  let tables = [];
  for (let index = 0; index < all_tbl.length; index++) {
    if (all_tbl[index].rows.length > 6) {
      tables.push(all_tbl[index]);
    }
  }
  let total = [];
  for (var i = 0; i < tables.length; i++) {
    stat = true;
    let ar = tableToArray(tables[i].rows);
    let moi = ar.filter((e) => e[7].includes("نعم"));
    for (let index = 0; index < moi.length; index++) {
      total.push({
        s_matt: moi[index][1],
        s_moiid: 1,
        s_annee: this_year,
      });
    }
  }
  console.log(total);
  for (let index = 0; index < total.length; index++) {
    const moi = total[index];
    const data = {
      s_matt: moi.s_matt,
      s_moiid: 1,
      s_annee: this_year,
    };
    await istiksaaDataTable
      .where("[s_matt+s_annee]")
      .equals([moi.s_matt, this_year])
      .modify(data);
    $waitText5.innerHTML = `تم تحميل ${index + 1} من ${total.length} تلميذ`;
  }
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
  $waitText5.classList.add("d-none");
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";
}
function tableToArray(rows) {
  var result = [];
  var rows = rows;
  var cells, t;
  for (var i = 0, iLen = rows.length; i < iLen; i++) {
    cells = rows[i].cells;
    t = [];
    for (var j = 0, jLen = cells.length; j < jLen; j++) {
      t.push(cells[j].textContent);
    }
    result.push(t);
  }
  return result;
}

$downListw.addEventListener("click", async () => {
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";

  $spin5.classList.add("d-flex");
  setTimeout(function () {
    getListIn();
  }, 350);
});
async function getListIn() {
  const res1 = await _.fetchData(
    "scolarite/transferts/transfertDemande/getList"
  );
  const data = res1.data;
  //const res2 = await _.fetchData(
  //  "scolarite/transferts/transfertDemande/getListIap"
  //);
  //const data = [...data2, ...res1.data];
  const students = data.filter(
    (s) => s[8].includes("مقبول") && s[8].includes("مفوج")
  );
  console.log(students);
  const total = students.length;

  for (let i = 0; i < total; i++) {
    const data = {
      s_matt: students[i][0],
      s_wafid: 1,
      out: 0,
      s_annee: this_year,
    };

    await istiksaaDataTable
      .where({
        s_matt: students[i][0],
        s_annee: this_year,
      })
      .modify(data);
    $waitText5.innerHTML = `تم تحميل ${i + 1} من ${total} تلميذ`;
  }
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
  $waitText5.classList.add("d-none");
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";
}

$downListm.addEventListener("click", async () => {
  $waitText5.classList.remove("d-none");
  $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";

  let annee = $year.value;
  $spin5.classList.add("d-flex");
  setTimeout(function () {
    getListOut();
  }, 350);
});

async function getListOut() {
  const res = await _.fetchData(
    "scolarite/transferts/transfertDemande/getListOut"
  );
  const students = res.data.filter(
    (s) => s[7].includes("طلب") && s[7].includes("مقبول")
  );
  for (let i = 0; i < students.length; i++) {
    const data = {
      s_matt: students[i][0],
      out: 1,
      s_annee: this_year,
    };

    await istiksaaDataTable
      .where({
        s_matt: students[i][0],
        s_annee: this_year,
      })
      .modify(data);
  }
  $waitText5.innerHTML = "جاري حجز بيانات التلاميذ على قاعدة البيانات";
  setTimeout(function () {
    $waitText5.innerHTML = "جاري تحميل البيانات من الرقمنة";
    $spin5.classList.remove("d-flex");
    $spin5.classList.add("d-none");
  }, students.length * 13);
}
