import { moreInfoTable, studentsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
let matt = _.decodeURL(segments[2]);
_.afterbegin("header", header);
_.afterbegin("footer", footer);
removeP("footer");

function removeP(id) {
  const footerDiv = document.getElementById(id);
  const paragraphs = footerDiv.getElementsByTagName("p");
  if (paragraphs.length >= 2) {
    footerDiv.removeChild(paragraphs[1]);
  }
}
async function init() {
  const student = await studentsTable
    .where({ s_matt: Number(matt), s_annee: this_year })
    .first();
  const parent = await moreInfoTable
    .where({ matricule: matt, annee: this_year })
    .first();
  $father.value = student.s_nom + " " + parent.nom_pere;
  $student.innerHTML = student.s_nom + " " + student.s_prenom;
  $niv.innerHTML =
    student.s_niv + " " + student.s_choaba + " " + student.s_section;
}

init();
