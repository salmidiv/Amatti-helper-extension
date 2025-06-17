import {
  divisionsTable,
  FinalMoysTable,
  finalResTable,
  istidrakDataTable,
  istidrakHeadTable,
  mawadTable,
  StatisTable,
  studentsTable,
  istidrakTable,
} from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { this_trim, this_year } from "../../../../core/helpers/const.js";
import { notify } from "../../../../core/helpers/notify.js";
_.getclass("istidakdate")[0].value = localStorage.istidakdate || "";
async function updateOrInsert(table, where, data) {
  if ((await table.where(where).count()) != 0) {
    // update
    await table.where(where).modify(data);
  } else {
    // insert
    await table.add(data);
  }
}

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("IstidrakModal"):
      istidrak_head();
      break;
    case classList.contains("getIstidrakList"):
      getIstidrakList();
      break;
    case classList.contains("saveistidakdate"):
      saveDate();
      break;
  }
});

async function getFilteredDivisions() {
  try {
    const divisions = await divisionsTable
      .where("annee")
      .equals(this_year)
      .toArray();
    const limit = _.isLycee() ? "ثالثة" : _.isCem() ? "رابعة" : "خامسة";
    console.log(limit);
    return divisions
      .filter(
        (d) =>
          d.div_text && !d.div_text.toLowerCase().includes(limit.toLowerCase())
      )
      .map((d) => ({
        div: Number(d.div),
        div_text: d.div_text,
      }));
  } catch (error) {
    console.error("Error processing divisions:", error);
    return [];
  }
}

async function convertAndStoreIstidrakData(data, division) {
  try {
    const matieres = {};
    const matieresText = data[4].split("<br>");

    matieresText.forEach((matiere) => {
      if (matiere.trim()) {
        const [nom, note] = matiere.split(" : ");
        matieres[nom.trim()] = parseFloat(note);
      }
    });

    const istidrakData = {
      matt: data[0],
      nom: data[1],
      birthday: data[2],
      moyenne: parseFloat(data[3]),
      matieres: matieres,
      division: division,
      annee: this_year,
    };

    await updateOrInsert(
      istidrakTable,
      { matt: istidrakData.matt, annee: this_year },
      istidrakData
    );
    //await istidrakTable.put(istidrakData);
    return true;
  } catch (error) {
    console.error("Error converting istidrak data:", error);
    return false;
  }
}

async function getIstidrakList() {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  let divisions = await getFilteredDivisions();

  const allStudents = await studentsTable
    .where("s_annee")
    .equals(this_year)
    .toArray();
  const url = "scolarite/passage_eleves/rattrapage/getListRatt";
  /*
  const data = [
    [
      "1101310130364801",
      "العشاش	مايا أنايس",
      "2013-12-02",
      "9.47",
      "اللغة العربية : 6.66<br>اللغة الفرنسية : 5.27<br>اللغة الإنجليزية : 7.25<br>التاريخ والجغرافيا : 9.36<br>الرياضيات : 7.94<br>ع الطبيعة و الحياة : 9.77<br>ع الفيزيائية والتكنولوجيا : 9.88<br>",
      "<label class='ui yellow label'>لم يتم تأكيده</label>",
    ],
  ];

  for (const studentData of data) {
    await convertAndStoreIstidrakData(studentData, 2100001);
  }
    */

  for (const division of divisions) {
    const { data } = await _.fetchData(url, {
      division: division.div,
    });
    if (data && Array.isArray(data)) {
      for (const studentData of data) {
        await convertAndStoreIstidrakData(studentData, division.div);
      }
    }
  }

  notify.toast({
    type: "done",
    color: "success",
    message: "تم عملية تفريغ الجدول بنجاح",
  });
}

function saveDate() {
  console.log(_.getclass("istidakdate"));
  localStorage.istidakdate = _.getclass("istidakdate")[0].value;
  notify.toast({
    type: "done",
    color: "success",
    message: "تم عملية تفريغ الجدول بنجاح",
  });
}

async function istidrak_head() {
  const head = await istidrakHeadTable.where({ annee: this_year }).toArray();

  const opt = head
    .map(
      (niv) =>
        `<option value="${niv.nivid}">${niv.niv} ${niv.shoaba} ${niv.section}</option>`
    )
    .join("");
  _.getclass("classesIst")[0].innerHTML =
    '<option value="" selected>-- اختر المستوى --</option>' + opt;
}

_.getclass("classesIst")[0].addEventListener("change", async () => {
  const niv = _.getclass("classesIst")[0].value;
  const resStudents = await istidrakDataTable
    .where({ nivid: Number(niv), annee: this_year })
    .toArray();
  const resHead = await istidrakHeadTable
    .where({ nivid: Number(niv), annee: this_year })
    .toArray();
  let tr =
    '<thead id="modulehead"><tr>' +
    resHead[0].data
      // .split(",")
      .map(
        (element, index) =>
          `<th class="notstudy ${
            resStudents[0].module.split("/")[1] &&
            resStudents[0].module
              .split("/")[1]
              .split(",")
              .includes(index.toString())
              ? "yesnot"
              : ""
          } " data-index="${index}">${element}</th>`
      )
      .join("") +
    "</tr></thead>";

  tr +=
    '<tbody id="istidrakStudents">' +
    resStudents
      .map((row) => {
        const element = row.data; //.split(",");
        return `<tr data-matt="${row.matt}">${element
          .map(
            (student, index) =>
              `<td ${
                index >= 3 &&
                Number(student) < 10 &&
                index != element.length - 1
                  ? `class="setModule ${
                      row.module.includes(index) ? "yes" : ""
                    } " data-index="${index}"`
                  : ""
              }>${student}</td>`
          )
          .join("")}</tr>`;
      })
      .join("") +
    "</tbody>";
  _.getclass("istidrakList")[0].innerHTML = tr;
  _.getclass("savaIstidrak")[0].classList.remove("d-none");
  actionBtn(niv);
  // const students = resStudents.rows
});
async function actionBtn(niv) {
  const setModule = document.querySelectorAll(".setModule");
  const notstudy = document.querySelectorAll(".notstudy");
  const parentMap = new Map();

  notstudy.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.target.classList.toggle("yesnot");
      const index = e.target.dataset.index;
      console.log(index);
    });
  });

  setModule.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.target.classList.toggle("yes");
      const tr = e.target.closest("tr");
      const index = e.target.dataset.index;

      if (tr) {
        const matt = tr.dataset.matt;
        if (!parentMap.has(matt)) {
          parentMap.set(matt, []);
        }
        const array = parentMap.get(matt);
        array[index] = matt;
        parentMap.set(matt, array);
      }
    });
  });

  const tableRows = document.querySelectorAll("#istidrakStudents tr");
  $savaIstidrak.addEventListener("click", async () => {
    const result = [];
    const NotCells = document.querySelectorAll(".notstudy.yesnot");
    const rowDataNot =
      NotCells.length == 0
        ? []
        : Array.from(NotCells).map((cell) => cell.getAttribute("data-index"));
    tableRows.forEach(async (row) => {
      const yesCells = row.querySelectorAll(".setModule.yes");
      const rowData =
        yesCells.length == 0
          ? []
          : Array.from(yesCells).map((cell) => cell.getAttribute("data-index"));
      const matt = row.getAttribute("data-matt");
      const d = {
        module: rowData + "/" + rowDataNot,
      };
      await istidrakDataTable
        .where({
          nivid: Number(niv),
          matt: Number(matt),
          annee: this_year,
        })
        .modify(d);
    });
    alertify.success("تمت العملية بنجاح");
  });
}

/*

*/
