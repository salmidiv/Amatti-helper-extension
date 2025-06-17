// isnadDataHead
//isnadDataBody

import { divisionsTable, personalsTable } from "../../../core/db/conn.js";
import { this_trim, this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
let divisionsIsnad = [];
let teachersList = [];
let currentIsnad = [];

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  const trimIsnad = _.getid("trimIsnad").value;
  switch (true) {
    case classList.contains("getCurrentIsnad"):
      getCurrentIsnad(trimIsnad);
      break;
    case classList.contains("getCurrentTeachers"):
      getCurrentTeachers(trimIsnad);
      break;
    case classList.contains("setIsnadTable"):
      setIsnadTable();
      break;
  }
});

async function getCurrentIsnad(trimIsnad) {
  _.getid("getCurrentIsnad").innerHTML = "الرجاء الإنتظار حتى اكتمال العملية";
  divisionsIsnad = await divisionsTable.where({ annee: this_year }).toArray();
  for (const division of divisionsIsnad) {
    const { data } = await _.fetchData("list_isnad", {
      annee: trimIsnad,
      division: division.div,
    });
    for (const item of data) {
      currentIsnad.push({
        mada: item[0],
        matt: item[1],
        name: item[2],
        div: item[4].match(/\d+/)[0],
      });
    }
  }
  _.getid("getCurrentIsnad").innerHTML = "جلب الإسناد الحالي";
  notify.toast({
    type: "done",
    color: "success",
    message: "انتهت العملية بنجاح",
  });
  return currentIsnad.flat();
}

async function getCurrentTeachers(trimIsnad) {
  const response = await _.fetchData(
    "combo_prof",
    {
      annee: trimIsnad,
    },
    "text"
  );

  // Convert the response string to a DOM structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(response, "text/html");

  // Extract the <option> elements
  const options = doc.querySelectorAll("option");

  // Convert options to an array of objects
  teachersList = Array.from(options)
    .filter((option) => option.value) // Exclude empty value options
    .map((option) => {
      const [name, mada] = option.textContent
        .split(" - ")
        .map((str) => str.trim());
      return {
        matt: option.value,
        name,
        mada,
      };
    });
  if (_.isCem()) {
    const hisTeachers = teachersList.filter((t) =>
      t?.mada?.includes("التاريخ")
    );
    hisTeachers.forEach((t) => {
      teachersList.push({ ...t, mada: "التربية المدنية" });
    });
    const arabTeachers = teachersList.filter((t) =>
      t?.mada?.includes("العربية")
    );
    arabTeachers.forEach((t) => {
      teachersList.push({ ...t, mada: "التربية الإسلامية" });
    });
  }
  teachersList.sort((a, b) => a?.mada?.localeCompare(b.mada, "ar"));
  notify.toast({
    type: "done",
    color: "success",
    message: "انتهت العملية بنجاح",
  });
}

function setIsnadTable(groupColors) {
  const colorMap = new Map(); // To store unique colors for each 'mada'
  const baseColors = [
    "#FF5722",
    "#4CAF50",
    "#2196F3",
    "#FFC107",
    "#9C27B0", // Original colors
    "#E91E63",
    "#673AB7",
    "#00BCD4",
    "#8BC34A",
    "#FF9800", // Additional Material Design colors
    "#3F51B5",
    "#CDDC39",
    "#FFEB3B",
    "#009688",
    "#795548",
    "#607D8B",
    "#F44336",
    "#03A9F4",
    "#2196F3",
    "#FFAB00",
    "#AEEA00",
    "#FFD600",
    "#C51162",
    "#AA00FF",
    "#304FFE",
    "#1DE9B6",
    "#00E5FF",
    "#00C853",
    "#64DD17",
    "#DD2C00",
  ];
  // Base colors to choose from
  let colorIndex = 0; // Index to track base color usage

  const lightenColor = (color, percentage) => {
    const num = parseInt(color.slice(1), 16); // Convert hex to integer
    const r =
      (num >> 16) + Math.round((255 - (num >> 16)) * (percentage / 100));
    const g =
      ((num >> 8) & 0x00ff) +
      Math.round((255 - ((num >> 8) & 0x00ff)) * (percentage / 100));
    const b =
      (num & 0x0000ff) +
      Math.round((255 - (num & 0x0000ff)) * (percentage / 100));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getColorForMada = (mada) => {
    if (!colorMap.has(mada)) {
      // Generate a new color if not already assigned
      const baseColor = baseColors[colorIndex % baseColors.length];
      const lightenedColor = lightenColor(baseColor, 70); // 70% lighter
      colorMap.set(mada, lightenedColor);
      colorIndex++;
    }
    return colorMap.get(mada);
  };

  document.querySelector("#isnadDataHead").innerHTML =
    '<tr><th style="width: 125px">الأساتذة/الأقسام</th></tr>';
  document.querySelector("#isnadDataBody").innerHTML = "";
  const thead = document.querySelector("#isnadDataHead tr");
  const tbody = document.querySelector("#isnadDataBody");

  // Append divisions to the table header
  divisionsIsnad.forEach((division) => {
    const th = document.createElement("th");
    th.textContent = _.shortName(division.div_text);
    thead.appendChild(th);
  });

  // Iterate over teachers and generate rows
  teachersList.forEach((teacher) => {
    const row = document.createElement("tr");

    // Add teacher name and mada cell
    const nameCell = document.createElement("td");
    nameCell.innerHTML = `<span>${teacher.name}<br> ${
      teacher?.mada || "غير محدد"
    }</span>`;
    row.appendChild(nameCell);

    // Apply the dynamically generated color for the `mada` group
    const groupColor = getColorForMada(teacher.mada);
    row.style.backgroundColor = groupColor;
    const teacherIsnad = currentIsnad.filter((t) =>
      t.matt.includes(teacher.matt)
    );
    divisionsIsnad.forEach((division) => {
      const getItem = teacherIsnad.find((item) =>
        item.div.includes(division.div)
      );
      const getMada = teacherIsnad[0]?.div.slice(-2);
      const cell = document.createElement("td");
      if (!getItem && getMada) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.matricule = teacher.matt;
        checkbox.dataset.teacherName = teacher.name;
        checkbox.dataset.division = division?.div + getMada;
        checkbox.dataset.divisiontext = division?.div_text;
        cell.appendChild(checkbox);
        //cell.appendChild(document.createElement("span"));
      } else {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.matricule = teacher.matt;
        checkbox.dataset.teacherName = teacher.name;
        checkbox.dataset.division = getItem?.div;
        checkbox.dataset.divisiontext = division?.div_text;
        checkbox.addEventListener("change", handleCheckboxChange);
        checkbox.checked = !!getItem?.div.includes(division?.div);
        cell.appendChild(checkbox);
      }
      row.appendChild(cell);
    });

    /*
    // Add cells for each division
    divisionsIsnad.forEach((division) => {
      const cell = document.createElement("td");
      const getItem = findItem(division, teacher);
      if (getItem) {
        console.log(
          "No item found for",
          getItem.matt,
          getItem.div,
          division.div,
          teacher.matt
        );
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.matricule = teacher.matt;
        checkbox.dataset.teacherName = teacher.name;
        checkbox.dataset.division = getItem?.div;
        checkbox.dataset.divisiontext = division?.div_text;
        checkbox.addEventListener("change", handleCheckboxChange);
        if (
          // getItem.name !== "" &&
          getItem.matt === teacher.matt &&
          getItem?.div.includes(division?.div)
        ) {
          checkbox.checked = true;
        }
        cell.appendChild(checkbox);
      } else {
        //const getItem = findItemEmpty(division, teacher);
        //const checkbox = document.createElement("input");
        //checkbox.type = "checkbox";
        //checkbox.dataset.matricule = teacher.matt;
        //checkbox.dataset.teacherName = teacher.name;
        //checkbox.dataset.division = getItem?.div;
        //checkbox.dataset.divisiontext = division?.div_text;
        //checkbox.addEventListener("change", handleCheckboxChange);
        //if (
        //  //getItem?.name !== "" &&
        //  getItem?.matt.includes(teacher.matt) &&
        //  getItem?.div.includes(division?.div)
        //) {
        //  checkbox.checked = true;
        //}
        //cell.appendChild(checkbox);
        cell.appendChild(document.createElement("span"));
      }
      row.appendChild(cell);
    });

  
    */
    tbody.appendChild(row);
  });
}

// Subject mapping for different educational disciplines
const SUBJECT_MAPPING = {
  سلامية: "سلامية",
  رسم: "تشكيلية",
  عرب: "اللغة العربية",
  الآلي: "المعلوماتية",
  رياضية: "الرياضية",
  طبيعية: "طبيع",
  التاريخ: "التاريخ",
  لفيزيائية: "لفيزيائية",
  نجليزية: "نجليزية",
  فرنسية: "فرنسية",
  قتصادية: "قتصاد",
  سبانية: "الثالثة",
  ميكانيكية: "تكنولوجيا",
  هربائية: "تكنولوجيا",
  مدنية: "تكنولوجيا",
};

/**
 * Maps a teacher's subject to its standardized form
 * @param {string} subject - The original subject name
 * @returns {string} The mapped subject name or the original if no mapping exists
 */
function mapSubject(subject) {
  if (!subject) return "";
  const matchedKey = Object.keys(SUBJECT_MAPPING).find((key) =>
    subject.includes(key)
  );
  return matchedKey ? SUBJECT_MAPPING[matchedKey] : subject;
}

/**
 * Finds a matching isnad item based on division and teacher
 * @param {Object} division - The division object containing div property
 * @param {Object} teacher - The teacher object containing mada (subject) property
 * @returns {Object|undefined} The matching isnad item or undefined if not found
 */
function findItem(division, teacher) {
  const mappedSubject = mapSubject(teacher.mada);
  //if (mappedSubject === "") {
  //
  //}
  return currentIsnad.find((item) => {
    const subjectMatches = mappedSubject
      ? item.mada.trim().includes(mappedSubject.trim())
      : false;
    const divisionMatches = String(item.div).includes(String(division.div));
    return subjectMatches && divisionMatches;
  });
}

function findItemEmpty(division, teacher) {
  return currentIsnad.find((item) => {
    const subjectMatches = item.mada.includes(teacher.mada);
    const divisionMatches = String(item.div).includes(String(division.div));
    return subjectMatches && divisionMatches;
  });
}

function lightenColor(color, percentage) {
  const num = parseInt(color.slice(1), 16); // Convert hex to integer
  const r = (num >> 16) + Math.round((255 - (num >> 16)) * (percentage / 100));
  const g =
    ((num >> 8) & 0x00ff) +
    Math.round((255 - ((num >> 8) & 0x00ff)) * (percentage / 100));
  const b =
    (num & 0x0000ff) +
    Math.round((255 - (num & 0x0000ff)) * (percentage / 100));
  return `rgb(${r}, ${g}, ${b})`;
}

function makeCheckBox(teacher, division, getItem) {
  const toggleDiv = document.createElement("div");
  toggleDiv.id = `i${teacher.matt}`;
  toggleDiv.className = "ui p-1 h-38 toggle checkbox";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `i${teacher.matt}`;
  checkbox.onclick = () => responsable(checkbox.id);
  checkbox.dataset.matricule = teacher.matt;
  checkbox.dataset.teacherName = `${teacher.nom} ${teacher.prenom}`;
  checkbox.dataset.division = getItem?.div;
  checkbox.dataset.divisiontext = division?.div_text;
  if (
    getItem.name != "" &&
    getItem.matt === teacher.matt &&
    String(getItem?.div).includes(String(division?.div))
  ) {
    checkbox.checked = true;
  }
  const label = document.createElement("label");

  toggleDiv.appendChild(checkbox);
  toggleDiv.appendChild(label);
  return toggleDiv;
}

// Event handler for checkbox change
async function handleCheckboxChange(event) {
  const checkbox = event.target;
  const matricule = checkbox.dataset.matricule;
  const teacherName = checkbox.dataset.teacherName;
  const division = checkbox.dataset.division;
  const id = division.substring(0, 7);
  var mat = division.substring(7, 10);
  const isChecked = checkbox.checked;
  if (isChecked) {
    await _.fetchData(
      "update_isnad",
      {
        aff_all: 0,
        matricule: Number(matricule),
        div_mat: Number(division),
        annee: this_trim,
        nom: teacherName,
      },
      "text"
    );
    notify.toast({
      type: "done",
      color: "success",
      message: "تم عملية الحجز بنجاح",
    });
  } else {
    await _.fetchData("delete_isnad", {
      matricule: Number(matricule),
      division: Number(id),
      mat: mat,
      annee: this_trim,
    });
    notify.toast({
      type: "done",
      color: "success",
      message: "تمت عملية الحذف بنجاح",
    });
  }
  // Add your logic here to update the status in your system
}

const table = document.getElementById("isnadTableData");

table.addEventListener("mouseover", (event) => {
  const cell = event.target.closest("td");
  if (!cell) return; // Skip if not hovering over a cell

  // Clear previous highlights
  clearHighlights();

  // Highlight current row
  const row = cell.parentElement;
  row.classList.add("hover-row");

  // Highlight current column
  const cellIndex = Array.from(cell.parentElement.children).indexOf(cell);
  Array.from(table.rows).forEach((row) => {
    const colCell = row.cells[cellIndex];
    if (colCell) colCell.classList.add("hover-col");
  });
  // Highlight the current cell
  cell.classList.add("hover-cell");
});

table.addEventListener("mouseout", () => {
  clearHighlights(); // Clear highlights when the mouse leaves the table
});

function clearHighlights() {
  document
    .querySelectorAll(".hover-row, .hover-col, .hover-cell")
    .forEach((el) => {
      el.classList.remove("hover-row", "hover-col", "hover-cell");
    });
}
