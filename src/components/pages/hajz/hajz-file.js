import { divisionsTable } from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";
let data = [];
let selectedClass = [];
let classKeys;
let postKeys;

_.qSel(".HajzFileModal").addEventListener("click", () => {
  _.qSel("#file-title").innerHTML = "";
  _.getid("classes").innerHTML = "";
  $nivs.innerHTML = "";
  _.getid("title-from-sheet").innerHTML = "";
  _.getid("tablehead").innerHTML = "";
  _.getid("tablebody").innerHTML = "";
});

_.qSel(".HajzFileModal").addEventListener("click", () => {
  $extNote.style.display = "none";
});

$fileHajz.addEventListener("change", async (file) => {
  if (file == "")
    return notify.toast({
      type: "error",
      color: "danger",
      message: "اختر الملف أولا",
    });
  _.qSel("#file-title").innerHTML = file.target.files[0].name;
  _.getid("classes").innerHTML = "";

  const res = await _.readXlss(file);
  console.log("Excel data:", res);
  data = res; // Store the complete data

  if (!_.isPrimary()) {
    $nivs.classList.remove("d-none");
    $nivs.classList.add("d-flex");
    getNivsFromFile(res);
  } else {
    $nivs.classList.add("d-none");
    $nivs.classList.remove("d-flex");
    getmawad(res);
  }
});

async function getmawad(result) {
  _.getid("classes").innerHTML = "";
  _.getid("classes").innerHTML = result
    .map(
      (obj) => `
    <button class="btn hacen btn-Pink show-data mb-2" data-id="${
      Object.keys(obj)[0]
    }">${Object.keys(obj)[0]}</button>`
    )
    .join("");

  const buttons = _.qSelAll(".show-data");
  buttons.forEach((button) => {
    _.btnEvent(button, "click", show);
  });
}

async function getNivsFromFile(result) {
  $nivs.innerHTML = "<option selected> -- اختر القسم -- </option>";
  $nivs.classList.remove("d-none");

  const names = await Promise.all(
    result.map(async (item) => {
      const div =
        Object.keys(item)[0].split(" ").length > 1
          ? Object.keys(item)[0].split(" ")[0]
          : Object.keys(item)[0];
      const cls = await divisionsTable.where({ div: div }).first();
      return { div, text: cls.div_text };
    })
  );

  const uniqueDataArray = Array.from(
    new Set(names.map((item) => item.div))
  ).map((div) => names.find((item) => item.div === div));

  $nivs.innerHTML += uniqueDataArray
    .map(({ div, text }) => `<option value="${div}">${text}</option>`)
    .join("");
}

$nivs.addEventListener("change", async (e) => {
  const div = e.target.value;
  select_class(div);
});

function select_class(div) {
  selectedClass = data.filter((item) => {
    return Object.keys(item)[0].includes(div);
  });

  _.getid("classes").innerHTML = selectedClass
    .map(
      (e, i) => `
    <button class="btn btn-Pink show-data mb-2 hacen" data-id="${i}">${Object.values(
        e
      )[0][4][0]
        .split(":")
        .pop()}</button>`
    )
    .join("");

  const buttons = _.qSelAll(".show-data");
  buttons.forEach((button) => {
    _.btnEvent(button, "click", show);
  });
}

function show(ev) {
  $extNote.style.display = "flex";
  const id = ev.target.dataset.id;
  let dataa;

  if (_.isPrimary()) {
    dataa = data.find((e) => Object.keys(e)[0] == id);
  } else {
    dataa = selectedClass[id];
  }

  const res = Object.values(dataa)[0];
  console.log("Sheet data:", res);

  classKeys = res[6] || [];
  postKeys = res[5] || [];
  console.log("Class keys:", classKeys);
  console.log("Post keys:", postKeys);

  _.getid("title-from-sheet").innerHTML = res[4][0];
  _.getid("tablehead").innerHTML =
    `<tr>` + res[7].map((e) => `<th>${e}</th>`).join("") + `</tr>`;

  const newArray = res.slice(8);
  let items = "";

  for (const item of newArray) {
    items += `<tr>`;
    for (let index = 0; index < res[7].length; index++) {
      const element = item[index] ?? "";
      items += `<td
        ${index > 3 ? 'contenteditable="true"' : ""} class="${
        chckError(element, index, res[7].length) ? "error" : ""
      }">${element}</td>`;
    }
    items += `</tr>`;
  }

  _.getid("tablebody").innerHTML = items;

  document
    .getElementById("tablebody")
    .addEventListener("input", function (event) {
      const newValue = event.target.innerText.trim();
      const check = chckError(newValue, 4, res[7].length);
      event.target.classList.toggle("error", check);
    });
}

function chckError(element, index, total) {
  const numericRegex = /^[1-9]\d*$/;
  const w = _.isLycee() ? 3 : 2;
  if (
    index > 3 &&
    index <= total - w &&
    (isNaN(element) || element < 0 || element > 20 || _.empty(element))
  ) {
    return true;
  }
  return false;
}

$hajzNote.addEventListener("click", async () => {
  if (!postKeys || postKeys.length === 0) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "No data available. Please select a class first.",
    });
    return;
  }

  const displayTable = document.getElementById("ext-note");
  const note = tableToJson(displayTable);

  const data = {
    note: note,
    annee: postKeys[1],
    division: postKeys[0],
    matiere: Number(postKeys[2]),
  };

  const formData = new FormData();
  data.note.forEach((noteItem, index) => {
    Object.keys(noteItem).forEach((key) => {
      formData.append(`note[${index}][${key}]`, noteItem[key]);
    });
  });

  formData.append("annee", data.annee);
  formData.append("division", data.division);
  formData.append("matiere", data.matiere);
  fetch("https://amatti.education.dz/save_hadjz", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data === 0) {
        notify.toast({
          type: "error",
          color: "danger",
          message: "تم غلق عملية الحجز ... لا يمكن الحجز أو التعديل حاليا",
        });
      }
      if (data === 1) {
        notify.toast({
          type: "done",
          color: "success",
          message: "تمت عملية حجز النقاط بنجاح",
        });
      }
      if (data === 2) {
        notify.toast({
          type: "error",
          color: "danger",
          message: "لا يمكن حجز إعفاء تلميذ في  هذه المادة ",
        });
      }
      if (data === 3) {
        notify.toast({
          type: "error",
          color: "danger",
          message: "انتبه هناك خطأ في الحجز ... حقل لايقبل الفراغات والحروف  ",
        });
      }
      if (data === 4) {
        notify.toast({
          type: "error",
          color: "danger",
          message:
            "حذار علامات خارج مجال التنقيط ... سيتم إدخال حسابكم في القائمة السوداء ",
        });
      }
      if (data === 5) {
        notify.toast({
          type: "error",
          color: "danger",
          message: "حذار لا يمكن تعديل نقاط تلميذ متواجد ضمن قوائم الاستدراك ",
        });
      }
      if (data === 6) {
        notify.toast({
          type: "error",
          color: "danger",
          message: "حذار لا يمكن تعديل نقاط تلميذ مفوج في السنة الحالية ",
        });
      }
    })
    .catch((error) => console.error("Error:", error));
});

function tableToJson(table) {
  const data = [];
  const rows = table.querySelectorAll("tr");

  rows.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    if (row.style.display === "none" || row.hidden) return; // Skip hidden rows

    // Check if row has any content
    const cells = row.querySelectorAll("td");
    const hasContent = Array.from(cells).some(
      (cell) => cell.textContent.trim() !== ""
    );

    if (!hasContent) return; // Skip empty rows

    const rowData = {};
    cells.forEach((cell, cellIndex) => {
      if (classKeys[cellIndex]) {
        // Only add if we have a key for this column
        rowData[classKeys[cellIndex]] = cell.textContent.trim();
      }
    });

    // Only add row if it has any data
    if (Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  });

  return data;
}
