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

_.afterbegin("header", header);
_.afterbegin("footer", footer);
loadList();
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
    console.log(istidrakData);
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
    const data = await getJoinedData(this_year);
    console.log(data);
    const keys = _.isLycee() ? ["أولى", "ثانية"] : ["أولى", "ثانية", "ثالثة"];
    const separatedArrays = keys.reduce((acc, key) => {
      acc[key] = data
        .filter((obj) => {
          console.log(obj);
          return obj.student.s_niv.includes(key);
        })
        .reduce((subAcc, obj) => {
          if (!subAcc[obj.student.s_choaba]) {
            subAcc[obj.student.s_choaba] = [];
          }
          subAcc[obj.student.s_choaba].push(obj);
          return subAcc;
        }, {});
      return acc;
    }, {});
    console.log(separatedArrays);
    generateHtml(separatedArrays);
  } catch (error) {
    console.error("Error loading list:", error);
  }
}

const generateHtml = (separatedArrays) => {
  document.querySelector("#date").innerHTML =
    localStorage.istidakdate ??
    '<span class="add_date" contenteditable="true">...................</span>';
  const sheetElement = document.querySelector("#sheet");
  sheetElement.innerHTML = "";

  const datffa = Object.entries(separatedArrays).map(
    ([year, objects], inde) => {
      if (!objects || Object.keys(objects).length === 0) {
        return;
      }
      let yearData = `<h2 class="hacen fs-3 fw-bold">${
        inde + 1
      }-  قوائم تلاميذ سنوات: ${year}</h2>`;

      const objectsData = Object.entries(objects).map(([key2, object]) => {
        let list_eleves = "";
        if (_.isLycee()) {
          list_eleves += `<h2 class="hacen fs-3 ">- المستدركين شعبة: <span class="fw-bold">${key2}</span></h2>`;
        }

        const tableHeader = `<th>الرقم</th>
                            <th style="width: 121px">الاسم واللقب</th>
                            <th style="width: 90px">تاريخ الميلاد</th>
                            <th style="width: 100px"> القسم</th>
                            <th>المعدل السنوي</th>
                            <th>المواد المستدركة</th>`;

        const tableRows = object
          .map((item, index) => {
            let tableCells = `<td>${index + 1}</td>`;
            tableCells += `<td>${item.nom}</td>`;
            tableCells += `<td>${item.birthday}</td>`;
            tableCells += `<td>${item.div_text}</td>`;
            tableCells += `<td>${item.moyenne}</td>`;
            tableCells += `<td>${Object.entries(item.matieres)
              .map((m) => `${m[0]}`)

              .join(" - ")}</td>`;
            return `<tr>${tableCells}</tr>`;
          })
          .join("");

        list_eleves += `<table class="table fs-4"><thead id="table_${key2}"><tr>${tableHeader}</tr></thead><tbody>${tableRows}</tbody></table>`;
        return list_eleves;
      });

      return yearData + objectsData.join("");
    }
  );

  sheetElement.innerHTML = datffa.join("");
};
