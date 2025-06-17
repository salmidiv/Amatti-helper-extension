import {
  db,
  divisionsTable,
  exambuilderTable,
  FinalMoysTable,
  finalResTable,
  inoutstudentsTable,
  isnadTable,
  istidrakDataTable,
  istidrakHeadTable,
  istidrakTable,
  istiksaaDataTable,
  moreInfoTable,
  moyexambuilderTable,
  personalsTable,
  settingsTable,
  StatisTable,
  stopstudentsTable,
  studentsTable,
} from "../../../core/db/conn.js";
import {
  option,
  towrs,
  MOTAMADRIS,
  this_year,
  AMATTI_HOST,
  this_trim,
} from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
notify.warning_note(
  $notifyEmpty,
  "بعد تفريغ بيانات الجدول ستفقد جميع البيانات المحفوظة على هذا الجدول، وستعيد تحميلها من جديد"
);
notify.warning_note(
  $notifyStudents,
  "يجب تحميل البيانات بالترتيب، يستم تفعيل خاصية: تعديل البيانات (بسبب وافدين) في التحديثات"
);
notify.warning_note(
  $notifyStudents,
  `
  يجب تفريغ بيانات التسنة الحالية أولا من خلال أيقونة حذف بيانات السنة الحالية
  `
);
/**
 * general setting
 */
const towrs_html = () => {
  let op = option;
  towrs.forEach((towr) => {
    let selected = localStorage.schoolType == towr ? 'selected="selected"' : "";
    op += `<option value="${towr}" ${selected}>${towr}</option>`;
  });
  _.getid("schoolType").innerHTML = op;
};

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("settingData"):
      fetch_data();
      break;
    case classList.contains("saveSetting"):
      saveSettings();
      break;
    case classList.contains("saveStudents"):
      princ_student();
      break;
    case classList.contains("savetudentsSifa"):
      update_sifa();
      break;
    case classList.contains("saveMoiidStudents"):
      update_moiid();
      break;
    case classList.contains("saveInStudents"):
      in_student();
      break;
    case classList.contains("saveOutStudents"):
      out_student();
      break;
    case classList.contains("saveStopStudents"):
      stop_student();
      break;
    case classList.contains("saveStudentsOld"):
      princ_student_old(); // info_civil_excel();
      break;
    case classList.contains("saveStopStudentsOld"):
      save_students_old();
      break;
    case classList.contains("persLoad"):
      personnel();
      break;
    case classList.contains("persFromFiche"):
      persFromFiche();
      break;
    case classList.contains("persIsnad"):
      persIsnad();
      break;
    case classList.contains("saveDivs"):
      saveDivs();
      break;
    case classList.contains("printTeacherListOne"):
      _.to("teachers-list/أستاذ التعليم");
      break;
    case classList.contains("printTeacherListTwo"):
      _.to("teachers-list/أستاذ رئيسي");
      break;
    case classList.contains("printTeacherListThree"):
      _.to("teachers-list/أستاذ مكون");
      break;
    case classList.contains("printTeacherListFour"):
      _.to("teachers-list/all");
      break;
    case classList.contains("emptyDatabase"):
      emptyDatabase();
      break;
    case classList.contains("saveMoreInfo"):
      saveMoreInfo();
      break;
    case classList.contains("emptyThisYearData"):
      emptyThisYearData();
      break;
  }
});

const emptyThisYearData = async () => {
  // Tables using s_annee
  await studentsTable.where({ s_annee: this_year }).delete();
  await stopstudentsTable.where({ s_annee: this_year }).delete();
  await inoutstudentsTable.where({ s_annee: this_year }).delete();
  await istiksaaDataTable.where({ s_annee: this_year }).delete();

  // Tables using annee
  await divisionsTable.where({ annee: this_year }).delete();
  await moreInfoTable.where({ annee: this_year }).delete();
  await isnadTable.where({ annee: this_year }).delete();
  await exambuilderTable.where({ annee: this_year }).delete();
  await moyexambuilderTable.where({ annee: this_year }).delete();
  await finalResTable.where({ annee: this_year }).delete();
  await FinalMoysTable.where({ annee: this_year }).delete();
  await StatisTable.where({ annee: this_year }).delete();
  await istidrakHeadTable.where({ annee: this_year }).delete();
  await istidrakDataTable.where({ annee: this_year }).delete();
  await istidrakTable.where({ annee: this_year }).delete();

  notify.toast({
    type: "done",
    color: "success",
    message: "تم عملية تفريغ البيانات بنجاح",
  });
};

const emptyDatabase = async () => {
  const table = _.getid("databaseTables").value;
  if (table === "settings") await settingsTable.clear();
  if (table === "students") await studentsTable.clear();
  if (table === "personals") await personalsTable.clear();
  if (table === "divisions") await divisionsTable.clear();
  if (table === "isnad") await isnadTable.clear();
  if (table === "exambuilder") await exambuilderTable.clear();
  if (table === "moyexambuilder") await moyexambuilderTable.clear();
  notify.toast({
    type: "done",
    color: "success",
    message: "تم عملية تفريغ الجدول بنجاح",
  });
};

async function saveSettings() {
  await settingsTable.clear();
  await settingsTable.add({
    walaya: _.getid("wilaya").value,
    commune: _.getid("baladiya").value,
    school_name: _.getid("schoolName").value,
    school_type: _.getid("schoolType").value,
    modir_name: _.getid("modirName").value,
  });
  notify.toast({
    type: "done",
    color: "success",
    message: "تم حفظ البيانات بنجاح",
  });
  localStorage.schoolType = _.getid("schoolType").value;
  towrs_html();
}
const fetch_data = async () => {
  const data = await settingsTable.toArray();
  if (_.big(data.length, 0)) {
    _.getid("schoolName").value = data[0].school_name;
    _.getid("wilaya").value = data[0].walaya;
    _.getid("baladiya").value = data[0].commune;
    _.getid("schoolType").value = data[0].school_type;
    _.getid("modirName").value = data[0].modir_name;
  }
  towrs_html();
};

/**
 * Load Students Data
 */

const princ_student = async () => {
  _.loading($loader);
  const response = await fetch(
    AMATTI_HOST + "scolarite/dossier_eleves/eleves/list_eleves"
  );
  const data = await response.json();
  console.log(data);
  const all_eleves = data.data.map((innerArray) => {
    const ind = _.isLycee() ? 8 : 7;
    return {
      s_matt: Number(innerArray[1]),
      s_nom: innerArray[2].replace(/\s+/g, " ").trim(),
      s_prenom: innerArray[3].replace(/\s+/g, " ").trim(),
      s_gender: innerArray[4],
      s_birthday: innerArray[5],
      s_niv: innerArray[6],
      s_choaba: _.isLycee() ? innerArray[7].replace(/\s+/g, " ").trim() : "",
      s_section: innerArray[ind],
      s_regester_nbr: innerArray[ind + 1],
      is_study: MOTAMADRIS,
      s_annee: this_year,
    };
  });
  const res = all_eleves; // await fetchAllData(all_eleves)
  const db_students = await studentsTable
    .where({ s_annee: this_year })
    .toArray();
  console.log(res, db_students);
  const result = _.unique(res, db_students, "s_matt");
  console.log(result);
  await studentsTable.bulkAdd(result);
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};

const saveMoreInfo = async () => {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال عملية التحميل",
  });

  const students = await studentsTable.where({ s_annee: this_year }).toArray();
  _.qSel(
    ".saveMoreInfo"
  ).innerHTML = `<span >الوقت المتوقع للتحميل: <span id="infoTime"></span></span>
                  ||<span id="infoCount"></span>`;
  const total = students.length;
  _.qSel("#infoTime").innerHTML = _.convertMsToTime(total * 900);
  for (let index = 0; index < total; index++) {
    const student = students[index];
    let data = await _.fetchData(
      "scolarite/dossier_eleves/eleves/info_civil",
      //"scolarite/examen_national/correction/info_candidat",
      {
        mat: student.s_matt,
        annee: this_year,
      }
    );
    data["annee"] = this_year;
    const user = await moreInfoTable
      .where({
        matricule: data.matricule,
        annee: this_year,
      })
      .first();

    if (user) {
      await moreInfoTable
        .where({
          matricule: data.matricule,
          annee: this_year,
        })
        .modify(data);
    } else {
      await moreInfoTable.add(data);
    }
    _.qSel("#infoCount").innerHTML = `تم تحميل ${index + 1} من ${total} تلميذ`;
    await _.sleep(800);
  }
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
  _.qSel(".saveMoreInfo").innerHTML = `7- حفط بيانات أولياء التلاميذ`;
};

/**
 * Load Students Sifa
 */
const update_sifa = async () => {
  _.loading($loader);
  _.html($savetudentsSifa, `بدأ عملية التحميل ...`);
  const response = await fetch(
    AMATTI_HOST + "scolarite/passage_eleves/dossier_eleve/list_eleves"
  );
  const data = await response.json();
  const students = data.data;
  let c = 0;
  students.forEach(async (eleve) => {
    const ind = _.isLycee() ? 8 : 7;
    await db.students
      .where({ s_matt: Number(eleve[0]), s_annee: this_year })
      .modify({ s_sifa: eleve[ind] });
    c++;
    _.html($savetudentsSifa, `تم حفظ  ${c} من ${students.length}`);
    if (c === students.length) {
      _.endLoading($loader);
      _.html($savetudentsSifa, `2- حفط صفة التلاميذ`);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم تحميل البيانات بنجاح",
      });
    }
  });
};

/**
 * Load Students Moiid
 */
const tableToArray = (rows) => {
  rows = Array.from(rows);
  const headers = Array.from(rows.shift().cells).map((cell) =>
    cell.innerText.trim()
  );
  return rows.map((row) => {
    const data = {};
    Array.from(row.cells).forEach((cell, index) => {
      data[headers[index]] = cell.innerText.trim();
    });
    return Object.values(data);
  });
};
const update_moiid = async () => {
  _.loading($loader);
  _.html($saveMoiidStudents, `بدأ عملية التحميل ...`);
  const response = await fetch(
    AMATTI_HOST + "scolarite/passage_eleves/dossier_eleve/impression"
  );
  const data = await response.text();
  const source = new DOMParser().parseFromString(data, "text/html");
  const all_tbl = source.getElementsByTagName("table");
  const niv = Array.from(all_tbl)
    .filter((t) => t.rows.length > 6)
    .flatMap((table) => {
      const ttrs = table.rows[3].cells[0].innerText;
      return ttrs.length > 55 ? [ttrs.split(":")[1].split("للسنة")[0]] : [];
    });
  let c = 0;
  const moii = await Promise.all(
    Array.from(all_tbl)
      .filter((t) => t.rows.length > 6)
      .flatMap((table) =>
        tableToArray(table.rows).filter((row) => row[7].includes("نعم"))
      )
  );
  moii.map(async (eleve) => {
    const moiid = await db.students
      .where({ s_matt: Number(eleve[1]), s_annee: this_year })
      .modify({ s_moiid: 1 });
    c++;
    _.html($saveMoiidStudents, `تم حفظ  ${c} من ${moii.length}`);
    if (c === moii.length) {
      _.endLoading($loader);
      _.html($saveMoiidStudents, `3- حفط بيانات التلاميذ المعيدين`);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم تحميل البيانات بنجاح",
      });
    }
  });
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};

/**
 * Load In Students
 */
const in_student = async () => {
  _.loading($loader);
  _.html($saveInStudents, `بدأ عملية التحميل ...`);
  const data = await _.fetchData(
    "scolarite/transferts/transfertDemande/getList"
  );
  console.log(data);

  //  await fetch(
  //  AMATTI_HOST + "scolarite/transferts/eleves_in/list_eleves"
  //);
  //const data = await response.json();

  const students = data.data;
  const list = students
    .filter((e) => e[8].includes("مقبول") && e[8].includes("مفوج"))
    .map((eleve) => ({
      s_matt: eleve[0],
      s_nom: eleve[1],
      s_prenom: eleve[2],
      //s_gender: eleve[3],
      s_birthday: eleve[3],
      s_niv: eleve[4],
      distination: eleve[5],
      s_type: "IN",
      s_annee: this_year,
    }));
  _.html($saveInStudents, `حفظ البيانات على قاعدة البيانات`);
  const dbList = await db.inoutstudents
    .where({ s_type: "IN", s_annee: this_year })
    .toArray();
  const result = _.unique(list, dbList, "s_matt");
  await db.inoutstudents.bulkAdd(result);
  _.html($saveInStudents, `4- حفط بيانات التلاميذ الوافدين`);
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};
/**
 * Load Out Students
 */
const out_student = async () => {
  _.loading($loader);
  _.html($saveOutStudents, `بدأ عملية التحميل ...`);
  const data = await _.fetchData(
    "scolarite/transferts/transfertDemande/getListOut"
  );
  //const data = await response.json();
  const students = data.data;
  const list = students
    .filter((e) => e[7].includes("مقبول"))
    .map((eleve) => ({
      s_matt: eleve[0],
      s_nom: eleve[1],
      s_prenom: eleve[2],
      s_birthday: eleve[3],
      s_niv: eleve[4],
      distination: eleve[5],
      demandDate: eleve[6],
      s_type: "OUT",
      s_annee: this_year,
    }));
  _.html($saveOutStudents, `حفظ البيانات على قاعدة البيانات`);
  const dbList = await db.inoutstudents
    .where({ s_type: "OUT", s_annee: this_year })
    .toArray();
  const result = _.unique(list, dbList, "s_matt");
  await db.inoutstudents.bulkAdd(result);
  _.html($saveOutStudents, `5- حفط بيانات التلاميذ المغادرين`);
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};

/**
 * Load Stop Students
 */
const stop_student = async () => {
  _.loading($loader);
  _.html($saveStopStudents, `بدأ عملية التحميل ...`);
  const response = await fetch(
    AMATTI_HOST + "scolarite/dossier_eleves/eleves_stop/list_eleves"
  );
  const data = await response.json();
  const students = data.data;
  const list = students.map((eleve) => ({
    s_matt: eleve[1],
    s_nom: eleve[2],
    s_prenom: eleve[3],
    s_gender: eleve[4],
    s_birthday: eleve[5],
    s_niv: eleve[6],
    s_choaba: _.isLycee() ? eleve[7] : "",
    s_section: eleve[_.isLycee() ? 8 : 7],
    chatb_sabab: eleve[_.isLycee() ? 9 : 8],
    chatb_date: eleve[_.isLycee() ? 10 : 9],
    s_type: "STOP",
    s_annee: this_year,
  }));
  _.html($saveStopStudents, `حفظ البيانات على قاعدة البيانات`);
  const dbList = await db.stopstudents
    .where({ s_type: "STOP", s_annee: this_year })
    .toArray();
  const result = _.unique(list, dbList, "s_matt");
  await db.stopstudents.bulkAdd(result);
  _.html($saveStopStudents, `6- حفط بيانات التلاميذ المشطوبين`);
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};

/**
 * Save Old Years Students Data
 */
const princ_student_old = async () => {
  _.loading($loader);
  const year = $yearsOld.value;
  if (year == "") {
    notify.toast({
      type: "error",
      color: "danger",
      message: "اختر السنة الدراسية أولا",
    });
    _.endLoading($loader);
    return;
  }
  _.html($saveStudentsOld, `بدأ عملية التحميل ...`);
  const url = AMATTI_HOST + "scolarite/dossier_eleves/eleves/list_eleves";
  const formData = new FormData();
  formData.append("annee", year);
  const request = new Request(url, {
    method: "POST",
    body: formData,
  });
  const response = await fetch(request);
  const data = await response.json();
  const all_eleves = data.data.map((innerArray) => {
    const ind = _.isLycee() ? 8 : 7;
    return {
      s_matt: Number(innerArray[1]),
      s_nom: innerArray[2],
      s_prenom: innerArray[3],
      s_gender: innerArray[4],
      s_birthday: innerArray[5],
      s_niv: innerArray[6],
      s_choaba: _.isLycee() ? innerArray[7].trim() : "",
      s_section: innerArray[ind],
      s_regester_nbr: innerArray[ind + 1],
      is_study: "no",
      s_annee: Number(year),
    };
  });
  const res = all_eleves; // await fetchAllData(all_eleves)
  const db_students = await studentsTable
    .where({ s_annee: Number(year) })
    .toArray();
  const result = _.unique(res, db_students, "s_matt");
  db.students.bulkAdd(result);
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};
/**
 * Save Old Years Stop Students Data
 */
const save_students_old = async () => {
  _.loading($loader);
  const year = $yearsOld.value;
  if (year == "") {
    notify.toast({
      type: "error",
      color: "danger",
      message: "اختر السنة الدراسية أولا",
    });
    _.endLoading($loader);
    return;
  }
  _.html($saveStopStudentsOld, `بدأ عملية التحميل ...`);
  const url = AMATTI_HOST + "scolarite/dossier_eleves/eleves_stop/list_eleves";
  const formData = new FormData();
  formData.append("annee", year);
  const request = new Request(url, {
    method: "POST",
    body: formData,
  });
  const response = await fetch(request);
  const data = await response.json();
  const students = data.data;
  const list = students.map((eleve) => ({
    s_matt: eleve[1],
    s_nom: eleve[2].replace(/\s+/g, " ").trim(),
    s_prenom: eleve[3].replace(/\s+/g, " ").trim(),
    s_gender: eleve[4],
    s_birthday: eleve[5],
    s_niv: eleve[6],
    s_choaba: _.isLycee() ? eleve[7].replace(/\s+/g, " ").trim() : "",
    s_section: eleve[_.isLycee() ? 8 : 7],
    chatb_sabab: eleve[_.isLycee() ? 9 : 8],
    chatb_date: eleve[_.isLycee() ? 10 : 9],
    s_type: "STOP",
    s_annee: Number(year),
  }));
  _.html($saveStopStudentsOld, `حفظ البيانات على قاعدة البيانات`);
  const dbList = await db.stopstudents
    .where({ s_type: "STOP", s_annee: Number(year) })
    .toArray();
  const result = _.unique(list, dbList, "s_matt");
  await db.stopstudents.bulkAdd(result);
  _.html($saveStopStudentsOld, `2- حفط بيانات التلاميذ المشطوبين`);
  _.endLoading($loader);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
};

/**
 * Load Personnels Data
 */

async function personnel() {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  _.toggle(_.qSel(".persState"), "d-none");
  try {
    let allP = (await _.fetchData(`pers/personnel/list_etablissement`)).data;
    let ccpcnn = (await _.fetchData(`pers/personnel/list_info_detail`)).data;
    let results = [];
    const total_pers = allP.length;
    const time = _.convertMsToTime(total_pers * 800 + 25000);
    _.html(_.qSel(".persState .time"), time);
    let x = 1;
    for (const o of allP) {
      const matchingC = ccpcnn.find((c) => o[1] === c[0]);
      const data = await _.fetchData("pers/personnel/info_personnel", {
        id: o[1],
      });
      const user = [
        {
          matt: o[1],
          nom: o[2],
          prenom: o[3],
          birthday: o[4],
          rotba: o[5],
          mada: o[6] ?? "",
          corrant_daraja: o[7],
          corrant_daraja_date: o[8],
          ccp: matchingC?.[4],
          nss: matchingC?.[5],
          adress: data?.adr,
          cap: data?.cap,
          couple: data?.couple,
          cp: data?.cp,
          email: data?.email,
          nbrenf: data?.nbrenf,
          enf10: data?.enf10,
          enfado: data?.enfado,
          enfsco: data?.enfsco,
          grps: data?.grps,
          nomar: data?.nomar,
          nomarm: data?.nomarm,
          nomlt: data?.nomlt,
          nomltm: data?.nomltm,
          port: data?.port,
          prenomar: data?.prenomar,
          prenomarm: data?.prenomarm,
          prenomarp: data?.prenomarp,
          prenomlt: data?.prenomlt,
          prenomltm: data?.prenomltm,
          prenomltp: data?.prenomltp,
          tel: data?.tel,
        },
      ];
      results.push(user);
      _.html(_.qSel(".persState .counter"), `تم تحميل ${x} من ${total_pers}`);
      x++;
      await _.sleep(800);
    }
    const db_personals = await personalsTable.toArray();
    const uniqueResult = _.unique(results.flat(), db_personals, "s_matt");
    await personalsTable.bulkAdd(uniqueResult);
  } catch (error) {
    notify.toast({
      type: "done",
      color: "success",
      message: "حدث خطأ غير معروف أعد المحاولة من جديد",
    });
    console.error("An error occurred:", error);
  }
  _.toggle(_.qSel(".persState"), "d-none");
  _.html(_.qSel(".persState .counter"), "");
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
}
/**
 * Load Personnels Data from fich
 */
async function persFromFiche() {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  _.toggle(_.qSel(".persState"), "d-none");
  const db_personals = await personalsTable.toArray();
  const ids = db_personals.map((pers) => pers.matt);
  var parser = new DOMParser();
  let t_data = [];
  const totla_ids = ids.length;
  const time = _.convertMsToTime(totla_ids * 800 + 25000);
  _.html(_.qSel(".persState .time"), time);
  for (let index = 0; index < totla_ids; index++) {
    const id = ids[index];
    const text = await _.fetchData(`pers/personnel/fiche/${id}`, {}, "text");
    let doc = parser.parseFromString(text, "text/html");
    let words = [];
    let split = "\n\t\t\t\t\t";
    const tables = doc.querySelectorAll("table");
    const result = doc.evaluate(
      "//div//text()",
      doc.body,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (let i = 0; i < result.snapshotLength; i++) {
      let node = result.snapshotItem(i).nodeValue.trim();
      if (node.length > 0) words.push(node);
    }
    t_data.push({
      // Extract and clean data from words array
      matt: words[2]?.split(":")?.[1]?.trim() || "",
      //nom: words[3].split(split)[1].split(":")[1].trim(),
      //prenom: words[3].split(split)[3],
      //birthday: words[4].split(":")[1].trim(),
      birthplace: words[5]?.split(split)?.[1]?.trim() || "",
      birthwilaya: words[6]?.split(split)?.[1]?.trim() || "",
      jinsiya: words[7]?.split(split)?.[1]?.trim() || "",
      family_status: words[8]?.split(split)?.[1]?.trim() || "",
      private_adress: words[9]?.split(split)?.[1]?.trim() || "",
      //rotba: words[11].split(":")[1].trim(),
      //mada: words[13].split("\n")[1].trim(),

      // Handle administrative status with null check
      Administrative_status: words[13]?.split("\n")?.[4]?.trim() || "",
      //corrant_daraja: words[14].split("\n")[0].split(":")[1].trim(),
      //corrant_daraja_date: words[14].split("\n")[3]
      //? words[14].split("\n")[3].trim()
      //: "",

      // Extract employment and grade information
      tawdif_date: words[15]?.split("\n")?.[0]?.split(":")?.[1]?.trim() || "",
      date_current_grade: words[15]?.split("\n")?.[3]?.trim() || "",

      // Extract school information
      current_school: words[16]?.split("المؤسسة")?.[1]?.trim() || "",
      current_school_date: words[17]?.split(":")?.[1]?.trim() || "",

      // Handle pedagogical information with null checks
      pedagogical_point: words[18]?.split(split)?.[1]
        ? words[18].split(split)[1].split(":")?.[1]?.trim()
        : "",
      pedagogical_point_date: words[18]?.split(split)?.[3]?.trim() || "",

      // Convert tables to JSON strings
      education: JSON.stringify(tableToJson(tables[0])),
      total_services: JSON.stringify(tableToJson(tables[1])),
    });
    _.html(
      _.qSel(".persState .counter"),
      `تم تحميل ${index + 1} من ${totla_ids}`
    );

    await _.sleep(800);
  }

  t_data.forEach(async (obj, index) => {
    try {
      // Perform an update using the primary key (id)
      await personalsTable.where("matt").equals(obj.matt).modify(obj);
      _.html(
        _.qSel(".persState .counter"),
        `تم حفظ على قاعدة البيانات ${index + 1} من ${t_data.length}`
      );
      if (index + 1 == t_data.length) {
        _.toggle(_.qSel(".persState"), "d-none");
        _.html(_.qSel(".persState .counter"), "");
        notify.toast({
          type: "done",
          color: "success",
          message: "تمت العملية بنجاح",
        });
      }
    } catch (error) {
      console.error(`Error updating record with id ${obj.matt}:`, error);
    }
  });
}
function tableToJson(table) {
  const headers = Array.from(table.querySelectorAll("thead tr th"), (th) =>
    th.textContent.trim()
  );
  const data = Array.from(table.querySelectorAll("tbody tr"), (row, i) => {
    const rowData = {};
    row.querySelectorAll("td").forEach((cell, index) => {
      const newKey = newKeys(headers[index]) ?? headers[index];
      rowData[newKey] = cell.textContent.trim();
    });
    return rowData;
  });

  return data;
}

function newKeys(originalKey) {
  const keyMapping = [
    { original: "المؤهل", new: "qualification" },
    { original: "تاريخ الشهادة", new: "certificate_date" },
    { original: "التخصص", new: "specialty" },
    { original: "الوضعية", new: "situation" },
    { original: "الرتبة", new: "rotba" },
    { original: "الصفة", new: "sifa" },
    { original: "المؤسسة", new: "school" },
    { original: "من", new: "from" },
    { original: "إلى", new: "to" },
  ];

  const newKey = keyMapping.find(
    (mapping) => mapping.original === originalKey
  )?.new;
  return newKey;
}

/**
 * Load Teachers Isnad
 */
async function saveDivs() {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  const divs_text = await _.fetchData(
    "division_isnad",
    {
      annee: this_trim,
    },
    "text"
  );
  const divs_array = divs_text
    .split("<option ")
    .slice(1)
    .map((option) => {
      const match = option.match(/value='([^']+)'.*>([^<]+)</);
      return (
        match && {
          div: match[1],
          div_text: match[2].replace(/\s+/g, " ").trim(),
          annee: this_year,
        }
      );
    })
    .filter(Boolean);
  const getDivs = await divisionsTable.where({ annee: this_year }).toArray();
  const uniqueResult = _.unique(divs_array, getDivs, "div");
  await divisionsTable.bulkAdd(uniqueResult);
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
}

async function persIsnad() {
  console.log("isnad");
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى انتهاء العملية",
  });
  try {
    const divisions = await divisionsTable
      .where({ annee: this_year })
      .toArray();
    _.toggle(_.qSel(".persState"), "d-none");
    console.log(divisions);
    const time = _.convertMsToTime(divisions.length * 800 + 9000);
    _.html(_.qSel(".persState .time"), time);
    var index = 0;
    for (const division of divisions) {
      const { data } = await _.fetchData("list_isnad", {
        annee: this_trim,
        division: division.div,
      });

      const result = data.map(([mada, pmatt, pname]) => ({
        mada,
        pmatt,
        pname,
        div: division.div,
        div_text: division.div_text,
        isAdmin: 0,
        annee: this_year,
        trim: this_trim,
      }));

      const getDivs = await isnadTable
        .where({ div: division.div, annee: this_year, trim: this_trim })
        .toArray();
      console.log(division.div);
      const filterDivs = getDivs.filter(
        (d) => !d.pmatt.includes("0000000000000000")
      );
      const uniqueResult = _.unique(result, getDivs, "div");
      await isnadTable.bulkAdd(uniqueResult);
      _.html(
        _.qSel(".persState .counter"),
        `تم تحميل ${index + 1} من ${divisions.length}`
      );
      index++;
      await _.sleep(600);
    }
    _.toggle(_.qSel(".persState"), "d-none");
    notify.toast({
      type: "done",
      color: "success",
      message: "تمت العملية بنجاح",
    });
  } catch (error) {
    console.error(error);
    // Handle errors with a more robust strategy based on your application needs
  }
}
