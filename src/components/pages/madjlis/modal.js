import { noteMappings } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("NotesModal"):
      init();
      break;
    case classList.contains("saveIjaza"):
      saveIjaza();
      break;
    case classList.contains("add-ijazat"):
      addIjazat();
      break;
    case classList.contains("save-notes"):
      saveNotes();
      break;
    case classList.contains("add-notes-to-table"):
      addNotesToTable();
  }
});
document.addEventListener("change", async function (event) {
  const classList = event.target.classList;
  const value = event.target.value;
  switch (true) {
    case classList.contains("select-note-type"):
      getRangeMoyen(value);
      break;
  }
});

function init() {
  if (!_.isPrimary()) {
    _.getid("p-mada").classList.add("d-none");
  }

  _.getid("imtiyaz").value = localStorage.imtiyaz || "18-20";
  _.getid("thniaa").value = localStorage.thniaa || "16-17.99";
  _.getid("tchjia").value = localStorage.tchjia || "14-15.99";
  _.getid("lawha").value = localStorage.lawha || "12-13.99";
}
function saveIjaza() {
  localStorage.imtiyaz = _.getid("imtiyaz").value;
  localStorage.thniaa = _.getid("thniaa").value;
  localStorage.tchjia = _.getid("tchjia").value;
  localStorage.lawha = _.getid("lawha").value;
  notify.toast({
    type: "done",
    color: "success",
    message: "انتهت العملية بنجاح",
  });
}

function addIjazat() {
  const itemsToCheck = ["lawha", "tchjia", "thniaa", "imtiyaz"];
  const allItemsExist = itemsToCheck.every(
    (item) => localStorage.getItem(item) !== null
  );
  if (!allItemsExist) {
    return notify.toast({
      type: "error",
      color: "danger",
      message:
        "العملية لم تتم، الرجاء حجز الإجازات أولا من أيقونة حجز المعدلات والملاحظات",
    });
  }

  if (!_.isPrimary()) {
    var table = document.getElementById("displayTable");
    var rows = table ? table.rows : 0;
    if (rows == 0) {
      return notify.toast({
        type: "error",
        color: "danger",
        message: "لا يمكن حجز الاجازات الرجاء اختيار الفوج التربوي أولا",
      });
    }
    for (var i = 0; i < rows.length; i++) {
      var moyTr = rows[i];
      var moyTd = moyTr.cells[4];
      var moy = moyTd.innerHTML;
      if (Number(moy)) moyTr.cells[8].innerHTML = add_ijaza(Number(moy));
      notify.toast({
        type: "done",
        color: "success",
        message: "تمت العملية بنجاح",
      });
    }
  } else {
    notify.toast({
      type: "error",
      color: "danger",
      message: "لا يمكن حجز الملاحظات للطور الابتدائي حاليا",
    });
  }
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
  }
  return ijaza;
}
function getRangeMoyen(value) {
  const selectedValue = value;
  console.log(selectedValue);
  let notes;
  if (_.isPrimary()) {
    const p_mada = _.getid("p-mada").value;
    const str = `${p_mada}${selectedValue}`;
    notes = localStorage[str]
      ? localStorage[str].split("\n")
      : noteMappings[str];
  } else {
    notes = localStorage[selectedValue]
      ? localStorage[selectedValue].split("\n")
      : noteMappings[selectedValue];
  }

  _.qSel(".text-notes").value = notes ? notes.join("\n") : "";
}
function saveNotes() {
  const t = _.qSel(".select-note-type").value;
  const n = _.qSel(".text-notes").value;
  const p_mada = _.getid("p-mada").value;
  const str = _.isPrimary() ? `${p_mada}${t}` : t;

  localStorage.setItem(str, n);
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
}

function addNotesToTable() {
  var table = document.getElementById("displayTable");
  var rows = table ? table.rows : 0;
  if (rows == 0) {
    return notify.toast({
      type: "error",
      color: "danger",
      message: "لا يمكن حجز الملاحظات، الرجاء اختيار الفوج التربوي أولا",
    });
  }
  for (var i = 0; i < rows.length; i++) {
    var moyTr = rows[i];
    var moyTd = moyTr.cells[4];
    var moy = moyTd.innerHTML;
    const ind = _.isPrimary() ? 8 : 9;
    const t = _.isPrimary() ? "ar" : "";
    if (Number(moy)) moyTr.cells[ind].innerHTML = add_notes(Number(moy), t);
    if (_.isPrimary()) {
      if (Number(moy))
        moyTr.cells[ind + 1].innerHTML = add_notes(Number(moy), "fr");
      if (Number(moy))
        moyTr.cells[ind + 2].innerHTML = add_notes(Number(moy), "mz");
    }
    notify.toast({
      type: "done",
      color: "success",
      message: "تمت العملية بنجاح",
    });
  }
}
const moys = _.isPrimary()
  ? [
      "0-2.99",
      "3-3.99",
      "4-4.99",
      "5-5.99",
      "6-6.99",
      "7-7.99",
      "8-8.99",
      "9-10",
    ]
  : [
      "0-8.99",
      "9-9.99",
      "10-11.99",
      "12-13.99",
      "14-15.99",
      "16-17.99",
      "18-18.99",
      "19-20",
    ];
const r = [
  "faible",
  "ender",
  "hasan",
  "bien",
  "tbien",
  "good",
  "super",
  "gold",
];
_.getid("moyen-range").innerHTML =
  `<option value="">-- اختر مجال المعدل --</option>` +
  moys.map((z, i) => `<option value="${r[i]}">${z}</option>`).join("");

function z(e, x) {
  return Number(moys[e].split("-")[x]);
}
function add_notes(moy, t = null) {
  let selectedValue;
  if (moy >= z(0, 0) && moy <= z(0, 1)) {
    selectedValue = "faible"; // "0-8.99",
  } else if (moy >= z(1, 0) && moy <= z(1, 1)) {
    selectedValue = "ender"; //  "9-9.99",
  } else if (moy >= z(2, 0) && moy <= z(2, 1)) {
    selectedValue = "hasan"; // "10-11.99",
  } else if (moy >= z(3, 0) && moy <= z(3, 1)) {
    selectedValue = "bien"; // "12-13.99",
  } else if (moy >= z(4, 0) && moy <= z(4, 1)) {
    selectedValue = "tbien"; // "14-15.99",
  } else if (moy >= z(5, 0) && moy <= z(5, 1)) {
    selectedValue = "good"; // "16-17.99",
  } else if (moy >= z(6, 0) && moy <= z(6, 1)) {
    selectedValue = "super"; // "18-18.99",
  } else if (moy >= z(7, 0) && moy <= z(7, 1)) {
    selectedValue = "gold"; // "19-20",
  }

  if (!selectedValue) {
    return undefined; // or handle the case when no array is assigned
  }
  const prifix = t ?? "";
  const notes = localStorage[`${prifix}${selectedValue}`]?.split("\n") || [];
  const randomIndex = Math.floor(Math.random() * notes.length);

  return notes[randomIndex];
}
