import { moreInfoTable, studentsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";

async function init() {
  let id = _.decodeURL(segments[2]);
  $title.innerHTML = document.title = `قائمة تلاميذ قسم ${id
    .split("-")
    .join(" ")}`;
  _.afterbegin("header", header);
  _.afterbegin("footer", footer);
  let dbindex = _.isLycee() ? 2 : 1;
  id = id.split("-");
  const students = await getStudents(id, dbindex);
  const moreInfo = await moreInfoTable.where({ annee: this_year }).toArray();
  const lists = mergedArray(students, moreInfo);
  const newList = orderASC(lists, "s_nom");
  $studentsList.innerHTML = generateStudentRows(newList);
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
async function getStudents(id, dbindex) {
  return await studentsTable
    .where({ s_niv: `${id[0].trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section === id[dbindex])
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(id[1].trim()) : true
    )
    .toArray();
}

function generateStudentRows(studentList) {
  return studentList
    .map(
      (element, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${element.s_nom} ${element.s_prenom}</td>
        <td>${element.s_gender}</td>
        <td>${element.s_birthday}</td>
        <td>${element.nom_pere ?? ""}</td>
        <td>${element.s_moiid == 1 ? "نعم" : "لا"}</td>
        <td>${
          _.isNull(element.s_sifa) ? "" : element.s_sifa.replace("نصف ", "ن.")
        }</td>
        <td>${_.age(element.s_birthday, this_year)}</td>
      </tr>`
    )
    .join("");
}

function orderASC(arrayOfObjects, orderBy) {
  return arrayOfObjects.sort((a, b) =>
    a[orderBy].localeCompare(b[orderBy], "ar")
  );
}

// Call the init function when needed
init();
