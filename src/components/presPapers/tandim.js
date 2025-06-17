import { isnadTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
let id = _.decodeURL(segments[2]);
_.afterbegin("header", header);
_.afterbegin("footer", footer);

tandim();
async function tandim() {
  if (_.isLycee()) {
    document.body.classList.remove("A4", "landscape");
    document.body.classList.add("A3", "landscape");
  }
  let annee = Number(segments[2]);
  document.title = "التنظيم التربوي";
  let isnad = await isnadTable.where({ annee: annee }).toArray();
  let class_names = [...new Set(isnad.map((d) => d.div_text))]; // all classes
  let module_names = [...new Set(isnad.map((d) => d.mada))]; // all module
  var teachers_list = document.getElementById("teachers_list");
  //let all_class = niv_section;
  const modules = {
    حياة: "العلوم الطبيعية",
    طبيع: "العلوم الطبيعية",
    رياضية: "التربية البدنية",
    العربية: "اللغة العربية",
    تاريخ: "التاريخ والجغرافيا",
    سلامية: "العلوم الاسلامية",
    نجليزية: "اللغة الانجليزية",
    مازيغية: "اللغة الأمازيغية",
    تكنولو: "التكنولوجيا",
  };
  const replacedIsnad = isnad.map((obj) => {
    for (const key in modules) {
      if (obj.mada.includes(key)) {
        obj.mada = modules[key];
      }
    }
    return obj;
  });

  const replacedSubjects = module_names.map((subject) => {
    for (const key in modules) {
      if (subject.includes(key)) {
        return modules[key];
      }
    }
    return subject;
  });
  const uniqueSubjects = [...new Set(replacedSubjects)];

  _.qSel(
    "table > thead"
  ).innerHTML = `<tr><th class="addline"><div>المواد<br>المستويات</div></th>${uniqueSubjects
    .map((name) => `<th>${name}</th>`)
    .join("")}</tr>`;

  _.qSel("#teachers_list tbody").innerHTML = class_names
    .map((name) => `<tr><td>${name}</td></tr>`)
    .join("");
  const teachersList = document.getElementById("teachers_list");
  const tbody = teachersList.getElementsByTagName("tbody")[0];
  const thead = teachersList.getElementsByTagName("thead")[0];

  for (let j = 0; j < class_names.length; j++) {
    const row = tbody.getElementsByTagName("tr")[j];
    const classeOnTable = row.getElementsByTagName("td")[0].innerText;

    for (let i = 1; i < uniqueSubjects.length + 1; i++) {
      const moduleOnTable = thead.getElementsByTagName("th")[i].innerText;
      const isnadIndex = replacedIsnad.findIndex(
        (d) =>
          d.div_text.replace(/\s+/g, "") ===
            classeOnTable.replace(/\s+/g, "") &&
          d.mada.replace(/\s+/g, "") === moduleOnTable.replace(/\s+/g, "")
      );

      const adminClass =
        isnadIndex !== -1 && replacedIsnad[isnadIndex].is_admin === 1
          ? "admin"
          : "";
      const teacher =
        isnadIndex !== -1
          ? `<td class="dnone ${adminClass}">${replacedIsnad[isnadIndex].pname}</td>`
          : "<td></td>";

      row.insertAdjacentHTML("beforeend", teacher);
    }
  }
  document.querySelectorAll("tbody td:first-child").forEach(function (td) {
    td.innerHTML = _.shortName(td.innerHTML);
  });
}
