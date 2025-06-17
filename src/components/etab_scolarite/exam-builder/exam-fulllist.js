import {
  exambuilderTable,
  examStudentsTable,
  hallsTable,
  moyexambuilderTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import {
  MOTAMADRIS,
  last_year,
  segments,
  this_year,
} from "../../../../core/helpers/const.js";
import { footer, header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

const id = _.decodeURL(segments[2]);
const type = _.decodeURL(segments[3]);
let school_type;
_.html(_.getid("header"), header);
_.html(_.getid("footer"), footer);
load_exam();
async function load_exam() {
  const exam = await exambuilderTable.where({ id: Number(id) }).first();
  console.log(exam);
  const exam_students = await examStudentsTable
    .where({ examId: Number(id) })
    .toArray();
  const students = exam_students.map((e) => e.studentId);
  let students_list = await studentsTable
    .where("s_matt")
    .anyOf(students)
    .toArray();
  console.log(exam_students);
  const halls = await hallsTable
    .where("id")
    .anyOf(exam.selectedHalls.map(Number))
    .toArray();
  students_list = students_list.map((student) => {
    const exam = exam_students.find((e) => e.studentId == student.s_matt);
    return {
      ...student,
      examId: exam.examId,
      hallId: halls.find((e) => e.id == exam.hallId)?.name || "بدون قاعة",
      number: exam.number,
    };
  });
  students_list = orderDESC(students_list, "number");
  console.log(students_list);
  $studentsList.innerHTML = html(students_list);
}
function html(res) {
  const r = res.map(
    (e, index) => `
        <tr>
            <td align="center">${index + 1}</td>
            <td align="center">${e.number}</td>
            <td>${e.s_nom} ${e.s_prenom}</td>
            <td>${e.s_birthday}</td>
            <td>${_.shortName(`${e.s_niv} ${e.s_choaba} ${e.s_section}`)} </td>
            <td align="center">${e.hallId}</td>
            <td></td>
            </tr>`
  );
  return r.join("");
}
function orderDESC(arrayOfObjects, key) {
  return arrayOfObjects.sort((a, b) => a[key] - b[key]);
}
/*
  const rankingOption = lists.rankingOption;
  var tri = lists.tri;
  const rankingSort = lists.rankingSort;
  console.log(lists.sections);
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    
  }
  const students = await studentsTable
    .where({
      s_niv: `${lists.niv.trim()}`,
      s_annee: this_year,
      is_study: MOTAMADRIS,
    })
    .and((eleve) =>
      lists.section != 0 ? Number(eleve.s_section) === lists.section : true
    )
    .and((eleve) =>
      _.isLycee() ? eleve.s_choaba.includes(lists.choaba) : true
    )
    .toArray();
  // console.log(students);
  const year = rankingOption == 6 ? last_year : this_year;
  console.log(rankingOption, year, tri);
  tri = rankingOption != 6 ? rankingOption : "";
  tri = rankingOption == 7 ? 1 : tri;
  tri = rankingOption == 8 ? 2 : tri;
  tri = rankingOption == 9 ? 3 : tri;

  const studentsWithNotes = await Promise.all(
    students.map(async (student) => {
      const note = await moyexambuilderTable
        .where({ matt: student.s_matt, annee: year, tri: tri })
        .first();
      return {
        ...student,
        moyen: getFromRankingOption(tri, note), // Assuming you want to retrieve the 'note' field
        //tri: note?.tri,
      };
    })
  );
  const orderBy = get_order(rankingOption);
  let sortred;
  console.log(rankingOption <= 5 && rankingOption != 3);
  if (rankingOption <= 5 && rankingOption != 3) {
    sortred =
      rankingSort == 1
        ? studentsWithNotes.sort((a, b) =>
            a[orderBy].localeCompare(b[orderBy], "ar")
          )
        : studentsWithNotes.sort((a, b) =>
            b[orderBy].localeCompare(a[orderBy], "ar")
          );
  } else {
    sortred =
      rankingSort == 1
        ? orderASC(studentsWithNotes, orderBy)
        : orderDESC(studentsWithNotes, orderBy);
  }
  // sortred =
  //  rankingSort == 1
  //    ? orderASC(studentsWithNotes, orderBy)
  //    : orderDESC(studentsWithNotes, orderBy);

  let tr = "";
  let start = 0;
  let salleStartNum = lists.salleStartNum;
  let studentsStartNum = lists.studentsStartNum;
  let surplus = lists.surplus;
  let exc = lists.excStudents;
  let sectionN = lists.sallsize;
  var chunk = 0;
  var chunks = 0;
  let sections = lists.sallnbr;

  let new_ar = sortred.filter(
    (e) => !exc.split(",").includes(e.s_matt.toString())
  );
  if (surplus == 1) {
    chunks = Math.round(new_ar.length / sections);
    chunk = Math.round(new_ar.length / sections);
  }
  if (surplus == 2) {
    chunks = new_ar.length / sectionN;
    chunks = Math.round(new_ar.length / chunks);
    chunk = Math.round(new_ar.length / sectionN);
  }
  let res = [];
  for (let i = 0; i < new_ar.length; i++) {
    start = studentsStartNum + i;
    if (i == chunks) {
      salleStartNum++;
      chunks = chunks + chunks;
      chunk++;
    }
    res.push([
      i + 1,
      start,
      `${new_ar[i].s_nom} ${new_ar[i].s_prenom}`,
      `${new_ar[i].s_birthday}`,
      `${new_ar[i].s_niv} ${new_ar[i].s_choaba} ${new_ar[i].s_section}`,
      salleStartNum,
    ]);
  }

  $studentsList.innerHTML = htm(res);
}
function htm(res) {
  const r = res.map(
    (e) => `
        <tr>
            <td align="center">${e[0]}</td>
            <td align="center">${e[1]}</td>
            <td>${e[2]}</td>
            <td>${e[3]}</td>
            <td>${_.shortName(e[4])}</td>
            <td align="center">${e[5]}</td>
            <td></td>
            </tr>`
          );
          return r.join("");
        }
        function orderASC(arrayOfObjects, key) {
          console.log(arrayOfObjects, key);
  console.log(arrayOfObjects.sort((a, b) => a[key] - b[key]));
  return arrayOfObjects.sort((a, b) => a[key] - b[key]);
}

function getFromRankingOption(rankingOption, note) {
  const ar = [6, 7, 8, 9];
  // ar.includes(rankingOption) &&
  return note?.moy ? note.moy : "";
}
function get_order(index) {
  const newIndex = index === 7 || index === 8 || index === 9 ? 6 : index;
  console.log(newIndex);
  let sor = [
    "s_prenom",
    "s_nom",
    "s_matt",
    "s_gender",
    "s_regester_nbr",
    "moyen",
  ];
  return sor[newIndex - 1];
}

*/
