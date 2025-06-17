import {
  exambuilderTable,
  examDistributionTable,
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
  this_year_text,
} from "../../../../core/helpers/const.js";
import { footer, header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

const id = _.decodeURL(segments[2]);
const type = _.decodeURL(segments[3]);
const pageCount = 14;
load_exam();

const style = document.createElement("style");
style.textContent = `
    @media print {
       
        .table-container {
            page-break-inside: avoid;
            break-inside: avoid;
            float: none !important;
        }
        table {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
        }
    }
`;
document.head.appendChild(style);

async function load_exam() {
  const exam = await exambuilderTable.where({ id: Number(id) }).first();
  console.log(exam);
  const examData = await examDistributionTable
    .where({ examId: exam.id })
    .first();
  console.log(examData);
  const exam_students = await examStudentsTable
    .where({ examId: Number(id) })
    .toArray();
  const students = exam_students.map((e) => e.studentId);
  const students_list = await studentsTable
    .where("s_matt")
    .anyOf(students)
    .toArray();
  console.log(students_list);
  const boys = students_list.filter((e) => e.s_gender.includes("ذكر"));
  const girls = students_list.filter((e) => e.s_gender.includes("أنثى"));
  const halls = await hallsTable
    .where("id")
    .anyOf(exam.selectedHalls.map(Number))
    .toArray();
  let currentNumber = examData.startNumber;
  const data = halls.flatMap((hall, index) => {
    const students = exam_students.filter((eleve) => eleve.hallId == hall.id);
    console.log(students);
    const students_list_table = students.map((e) => {
      const student = students_list.find(
        (eleve) => eleve.s_matt == e.studentId
      );
      return { ...e, ...student, hall: hall.name };
    });
    console.log(students_list_table);
    const sections = new Set(
      students_list_table.map((e) => `${e.s_niv} ${e.s_choaba}-${e.s_section}`)
    );
    const endNumber = currentNumber + students_list_table.length - 1;
    currentNumber = endNumber + 1;
    return students_list_table;
  });
  console.log(data);
  let tr = "";
  let currentSheet = "";

  data.forEach((student, index) => {
    if (index % pageCount === 0) {
      if (currentSheet) {
        tr += "</div>";
      }
      currentSheet = '<div class="sheet p-5mm" dir="rtl">';
      tr += currentSheet;
    }

    tr += htm(
      index + 1,
      student.s_matt,
      student.number,
      student.s_nom + " " + student.s_prenom,
      student.s_birthday,
      student.hall
    );

    if ((index + 1) % pageCount === 0 || index === data.length - 1) {
      tr += "</div>";
    }
  });

  $content.innerHTML += tr;
}

let page = 0;
function htm(index, matt, nbrtas, name, birthday, sall) {
  if (index === 1) {
    page = 0;
  }
  page++;

  const isLastTableOnPage = page === pageCount;
  if (isLastTableOnPage) page = 0;

  return `
        <div class="table-container" style="width: 48%; display: inline-block; page-break-inside: avoid; float: ${
          index % 2 ? "left" : "right"
        }">
            <table dir="rtl" style="width: 100%;" class="mb-3" border="1" cellpadding="1" cellspacing="0" align="${
              index % 2 ? "left" : "right"
            }" nobr="false"
                style="margin-top: 10px;">
                <tbody>
                    <tr>
                        <td align="center"> ${name} [${birthday}]</td>
                    </tr>
                    <tr>
                        <td align="center"><span style="font-size: 48px; font-weight: bold;">${nbrtas} </span></td>
                    </tr>
                    <tr>
                        <td align="center">
                        <div class="d-flex px-3 justify-content-between">
                        <div class="w-100 text-right">
                        <span>القاعة:</span> <span>[${sall}]</span>
                        </div>
                        <div class="w-100 text-left">
                        <span>[${matt}]</span>
                        </div>
                        </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;
}
