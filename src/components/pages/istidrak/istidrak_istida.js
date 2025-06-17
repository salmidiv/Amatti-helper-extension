import { _ } from "../../../../core/helpers/helpers.js";
import { footer, header } from "../../../../core/helpers/header.js";
import {
  divisionsTable,
  istidrakDataTable,
  istidrakHeadTable,
  istidrakTable,
  moreInfoTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import { this_year } from "../../../../core/helpers/const.js";

loadList();
/**
 * Fetches and joins data from istidrak, students, and moreInfo tables for a given year.
 * @param {number} year - The year to filter data by
 * @returns {Promise<Array>} Array of joined data objects
 * @throws {Error} If data fetching or processing fails
 */
async function getJoinedData(year) {
  // Input validation
  if (!Number.isInteger(year) || year < 0) {
    throw new Error("Invalid year parameter");
  }

  try {
    // Use Promise.all for concurrent data fetching
    const [istidrakData, studentsData, moreInfoData, divisions] =
      await Promise.all([
        istidrakTable.where("annee").equals(year).toArray(),
        studentsTable.where("s_annee").equals(year).toArray(),
        moreInfoTable.where("annee").equals(year).toArray(),
        divisionsTable.where("annee").equals(year).toArray(),
      ]);

    // Create lookup maps for O(1) access
    const studentsMap = new Map(
      studentsData.map((student) => [Number(student.s_matt), student])
    );
    const moreInfoMap = new Map(
      moreInfoData.map((info) => [Number(info.matricule), info])
    );
    const divisionsMap = new Map(
      divisions.map((div) => [Number(div.div), div.div_text])
    );

    // Transform data with optimized mapping
    const joinedData = istidrakData.map((istidrakItem) => {
      const matt = Number(istidrakItem.matt);
      return {
        ...istidrakItem,
        student: studentsMap.get(matt) ?? null,
        moreData: moreInfoMap.get(matt) ?? null,
        div_text: divisionsMap.get(Number(istidrakItem.division)) ?? null,
      };
    });

    // Optional: Filter out items without matching student
    // Remove this if you want to keep all records
    const filteredJoinedData = joinedData.filter(
      (item) => item.student !== null
    );

    return filteredJoinedData;
  } catch (error) {
    // Structured error handling
    const errorMessage = `Failed to fetch joined data for year ${year}: ${error.message}`;
    console.error(errorMessage, { error, year });
    throw new Error(errorMessage);
  }
}
async function loadList() {
  try {
    // Fetch necessary data
    const joinedData = await getJoinedData(this_year);

    const html = generateHtml(joinedData);

    // Insert the generated HTML into the document body
    document.body.innerHTML =
      `<button id="togglednone" class="btn btn-danger no-print hacen">إخفاء / إظهار المواد المستدركة</button>` +
      html;

    // Attach event listener to the button
    document.getElementById("togglednone").addEventListener("click", () => {
      const elements = document.getElementsByClassName("istidrak_table_body");
      Array.from(elements).forEach((element) => {
        element.classList.toggle("d-none");
      });
    });
  } catch (error) {
    console.error("Error loading list:", error);
  }
}
/**
 * Generates HTML content for student pairs with their respective data.
 * @param {Array<Object>} students - Array of student objects containing student data and matieres
 * @returns {string} HTML string for student sheets
 */
const generateHtml = (students) => {
  // Early return for empty or invalid input
  if (!Array.isArray(students) || students.length === 0) {
    return "";
  }

  return students
    .reduce((pairs, _, index, arr) => {
      // Process students in pairs using reduce
      if (index % 2 === 0) {
        pairs.push(arr.slice(index, index + 2));
      }
      return pairs;
    }, [])
    .map(
      (pair) => `
      <div class="sheet p-5mm hacen">
        ${pair
          .map(
            (student, idx) => `
          <div class="one">
            ${generateStudentContent(
              student,
              student.student.s_gender === "أنثى" ? "ابنتكم" : "ابنكم",
              student.matieres,
              idx === 0 && pair.length > 1
            )}
          </div>
        `
          )
          .join("")}
      </div>
    `
    )
    .join("");
};

const generateStudentContent = (
  student,
  genderPrefix,
  matieres,
  isOne = false
) => {
  // Parse matieres if it's a string
  const matieresObj =
    typeof matieres === "string" ? JSON.parse(matieres) : matieres;

  // Get table headers and values
  const headers = Object.keys(matieresObj);
  const values = Object.values(matieresObj);

  return `
      <div dir="rtl">
        ${header}
        <div style="width:100%; display: flex; justify-content: flex-end; margin-top: -40px">
          <div class="receiver text-center" style="width: 450px;">
            <p class="mb-0">إلى السيد :
              <span contenteditable="true">${student.student.s_nom} ${
    student?.moreData?.nom_pere
  }</span>
            </p>
            <span contenteditable="true">${student?.moreData?.adresse}</span>
          </div>
        </div>
      </div>
      <h1 class="ti m-0 fs-2 fw-bold text-center">استدعاء اجتياز الامتحان الاستدراكي</h1>
      <div id="div" dir="rtl" class="fs-3">
        ليكن في علمكم أن ${genderPrefix} مدعو لاجتياز الامتحان الاستدراكي بتاريخ: ${
    localStorage.istidakdate ??
    '<span class="add_date" contenteditable="true">...................</span>'
  }
        </br>
        الاسم واللقب: <span class="fw-bold">${student.student.s_nom} ${
    student.student.s_prenom
  }</span>
        - تاريخ الميلاد: <span class="fw-bold" dir="rtl">${
          student.student.s_birthday
        }</span>
        - قسم: <span class="fw-bold">${student.div_text}</span>
      </div>
      <h3 class="ti fs-3 mt-3">المواد المستدركة</h3>
      <table class="istidrak_table table fs-5 text-center">
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="istidrak_table_body">
          <tr>
            ${values
              .map((value) => {
                const note = parseFloat(value);
                const needsIstidrak = note < 10;
                return `<td class="fs-4 text-center ${
                  needsIstidrak ? "yes" : ""
                }">${value}</td>`;
              })
              .join("")}
          </tr>
        </tbody>
      </table>
      <div style="display:flex; justify-content: space-between">
        <div>
          <h3 class="fs-3 fw-bold m-1">ملاحظة</h3>
          <ul class="list-group">
            <li class="list-group-item fs-3">احضار الأدوات أمر ضروري</li>
          </ul>
        </div>
        <div>
            ${footer}
        </div>
      </div>
      ${
        isOne
          ? ` </br >
        </br >
        </br >
        <hr>`
          : ""
      }
        `;
};
