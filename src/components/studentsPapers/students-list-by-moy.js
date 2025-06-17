import { FinalMoysTable, studentsTable, db } from "../../../core/db/conn.js";
import { this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
let tArray = [];
_.afterbegin("header", header);
_.afterbegin("footer", footer);
if (
  !localStorage.lawha ||
  !localStorage.tchjia ||
  !localStorage.thniaa ||
  !localStorage.imtiyaz
) {
  _.qSel(".sheet").innerHTML = `<h1 class="text-center">
  يجب حجز معدلات الاجازات أولا من صفحة قرار مجلس القسم ،أيقونة إدراج معدلات الإجازات والملاحظات الموجوجدة في شريط الإضافة
</h1>`;
}
// Define database query function
async function selectDistinctValues(column, table, whereClause) {
  const distinctValues = await FinalMoysTable.where({
    annee: this_year,
  }).toArray();
  return distinctValues.map((value) => value[column]);
}

// Populate dropdown options
async function populateDropdownOptions($dropdown, values, defaultOptionText) {
  $dropdown.innerHTML = "";
  const defaultOption = createOption(defaultOptionText, true);
  $dropdown.appendChild(defaultOption);
  for (const value of values) {
    const option = createOption(value);
    $dropdown.appendChild(option);
  }
}
function createOption(value, isSelected = false) {
  const option = document.createElement("option");
  option.textContent = value;
  option.value = value;
  if (isSelected) {
    option.selected = true;
  }
  return option;
}

// Get data and populate dropdowns
(async function () {
  const nivValues = await FinalMoysTable.where({
    annee: this_year,
  }).toArray();
  tArray.push(nivValues);
  const uniqueNivValues = [...new Set(nivValues.map((obj) => obj.niv))];
  await populateDropdownOptions($mostawa, uniqueNivValues, "المستوى");
})();

$mostawa.addEventListener("change", async function () {
  if (_.isLycee()) {
    const res = tArray[0].filter((e) => e.niv.includes($mostawa.value));
    const choabaValues = [...new Set(res.map((obj) => obj.choaba))];
    await populateDropdownOptions($choaba, choabaValues, "اختر الشعبة");
    $choaba.value = "";
    $section.value = "";
  } else {
    const res = tArray[0].filter((e) => e.niv.includes($mostawa.value));
    const sectionValues = [...new Set(res.map((obj) => obj.section))];
    await populateDropdownOptions($section, sectionValues, "الفوج");
    $section.value = "";
  }
  handleDropdownChange();
});

$choaba.addEventListener("change", async function () {
  const res = tArray[0].filter(
    (e) =>
      e.niv.includes($mostawa.value) && e.choaba.includes($choaba.value.trim())
  );
  const sectionValues = [...new Set(res.map((obj) => obj.section))];
  await populateDropdownOptions($section, sectionValues, "الفوج");
  $section.value = "";
  handleDropdownChange();
});
$annee.addEventListener("change", handleDropdownChange);
$trim.addEventListener("change", handleDropdownChange);
$section.addEventListener("change", handleDropdownChange);
$number.addEventListener("input", handleDropdownChange);
$ijaza.addEventListener("input", handleDropdownChange);

function txt(id) {
  return id.options[id.selectedIndex].text;
}
// Handle dropdown change event
async function fetchData(where) {
  try {
    // Perform an inner join between "statis" and "students" tables
    const result = await db.transaction(
      "r",
      FinalMoysTable,
      studentsTable,
      async () => {
        const final = await FinalMoysTable.where(where).toArray();

        const studentMatts = final.map((record) => Number(record.matt));
        const studentsData = await studentsTable
          .where("s_matt")
          .anyOf(studentMatts)
          .toArray();

        // Combine the data from both tables based on the join condition
        const joinedData = final.map((statisRecord) => {
          const studentRecord = studentsData.find(
            (student) => student.s_matt === Number(statisRecord.matt)
          );
          return {
            ...statisRecord,
            student: studentRecord,
          };
        });

        return joinedData;
      }
    );
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
async function handleDropdownChange() {
  const annee = $annee.value,
    trim = $trim.value,
    mostawa = $mostawa.value.trim(),
    choaba = $choaba.value.trim(),
    section = $section.value,
    ijaza = $ijaza.value;

  $title.innerHTML = document.title = `التلاميذ المجازين لسنة ${txt($annee)} ${
    trim !== "" ? "حسب: " + txt($trim) : ""
  }  <br> ${
    mostawa !== "المستوى"
      ? "لمستوى: " + txt($mostawa) + " " + localStorage.schoolType
      : "جميع تلاميذ المؤسسة"
  }  ${choaba !== "" ? txt($choaba) : ""} ${
    section !== "" ? txt($section) : ""
  }`;

  if (annee === "") {
    alert("يجب اختيار السنة الدراسية أولا");
  }

  let where = { annee: Number(annee) }; // `annee = "${annee}" `;
  if (mostawa !== "المستوى") where.niv = `${mostawa}`;
  if (choaba !== "") where.choaba = `${choaba.trim()}`;
  if (section !== "") where.section = Number(section);
  const res = trim === "" ? [] : await fetchData(where); // await FinalMoysTable.where(where).toArray();

  let uniqueArray = res.filter(
    (obj, index, self) =>
      index === self.findIndex((t) => t.id === obj.id && t.name === obj.name)
  );
  uniqueArray.sort((a, b) => get_trim_note(trim, b) - get_trim_note(trim, a));

  const studentsRows = uniqueArray
    .map((stud, index) => {
      let moyen = get_trim_note(trim, stud);
      moyen = typeof moyen === "string" ? moyen : moyen.toFixed(2);
      const niv_text = `${stud.niv} ${stud.choaba} ${stud.section}`;
      return `
        <tr class="all rowTr ${add_ijaza(Number(moyen), "class")}">
            <td>${index + 1}</td>
            <td class="th_s">${stud.nom} ${stud.prenom}</td>
            <td>${stud.gender}</td>
            <td>${stud.birthdate}</td>
            <td>${_.isLycee() ? short_name(niv_text) : niv_text}</td>
            <td>${stud.student?.s_moiid ? "نعم" : "لا"}</td>
            <td class="sortColumn">${moyen}</td>
            <td>${add_ijaza(Number(moyen))}</td>
        </tr>
    `;
    })
    .join("");
  $studentsList.innerHTML = studentsRows;
  // remove by ijaza
  if (ijaza !== "") {
    const allElements = document.querySelectorAll(".all");
    if (ijaza === "0") {
      allElements.forEach((tr) => tr.classList.remove("d-none"));
    } else {
      let rowNumber = 1;
      allElements.forEach((tr) => {
        if (!tr.classList.contains(ijaza)) {
          tr.classList.toggle("d-none");
        } else {
          tr.querySelector("td:first-child").textContent = rowNumber;
          rowNumber++;
        }
      });
    }
  }
  if (ijaza == "") nbr();
}

function get_trim(trim) {
  const moy = {
    "": "sanawi",
    1: "tre1",
    2: "tre2",
    3: "tre3",
    12: "tre21",
    13: "tre31",
    23: "tre32",
    123: "tre321",
    4: "sanawi",
    34: "sanawi",
  };
  return moy[trim];
}
function get_trim_note(trim, stud) {
  const moy = {
    "": stud.sanawi ?? 0,
    1: stud.tre1 ?? 0,
    2: stud.tre2 ?? 0,
    3: stud.tre3 ?? 0,
    12: stud.tre21 ?? 0,
    13: stud.tre31 ?? 0,
    23: stud.tre32 ?? 0,
    123: stud.tre321 ?? 0,
    4: stud.sanawi ?? 0,
    34: (stud.sanawi + stud.tre3) / 2 ?? 0,
  };
  return moy[trim];
}

function add_ijaza(grade, text = "") {
  const [lawhaMin, ...lawhaMax] = localStorage.lawha.split("-").map(Number);
  const [tchjiaMin, ...tchjiaMax] = localStorage.tchjia.split("-").map(Number);
  const [thniaaMin, ...thniaaMax] = localStorage.thniaa.split("-").map(Number);
  const [imtiyazMin, ...imtiyazMax] = localStorage.imtiyaz
    .split("-")
    .map(Number);
  if (
    Number(grade.toFixed(2)) >= lawhaMin &&
    Number(grade.toFixed(2)) <= lawhaMax.pop()
  )
    return text == "class" ? "lawha" : "لوحة شرف";
  if (
    Number(grade.toFixed(2)) >= tchjiaMin &&
    Number(grade.toFixed(2)) <= tchjiaMax.pop()
  )
    return text == "class" ? "tchjia" : "تشجيع";
  if (
    Number(grade.toFixed(2)) >= thniaaMin &&
    Number(grade.toFixed(2)) <= thniaaMax.pop()
  )
    return text == "class" ? "thniaa" : "تهنئة";
  if (
    Number(grade.toFixed(2)) >= imtiyazMin &&
    Number(grade.toFixed(2)) <= imtiyazMax.pop()
  )
    return text == "class" ? "imtiyaz" : "امتياز";
  return text == "class" ? "non" : "";
}
const short_name = (str) =>
  str.replace(/\s/g, " ").replace(/(\D+)(\d+)/, (match, p1, p2) => {
    const num = convertWordToNumber(p1.split(" ")[0]);
    const letters = p1
      .split(/\s+/)
      .slice(1)
      .map((word) =>
        word.charAt(0) === "و" ? word.substring(0, 2) : word.charAt(0)
      )
      .join(" ");
    return `${num} ${letters} ${p2}`.replace(/\s/g, " ");
  });
const convertWordToNumber = (word) =>
  ({
    أولى: 1,
    ثانية: 2,
    ثالثة: 3,
    رابعة: 4,
    خامسة: 5,
    سادسة: 6,
    سابعة: 7,
    ثامنة: 8,
    تاسعة: 9,
    عاشرة: 10,
  }[word] || 0);
$number.addEventListener("change", () => {
  nbr();
});
function nbr() {
  const number = Number($number.value);
  $studentsList.querySelectorAll("tr").forEach((tr, index) => {
    tr.classList.toggle("d-none", index >= number && number !== 0);
  });
}
