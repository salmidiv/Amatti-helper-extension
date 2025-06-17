import { moreInfoTable, studentsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
let matt = _.decodeURL(segments[2]);
_.afterbegin("head", header);
_.afterbegin("head1", header);
_.afterbegin("footer", footer);
removeP("footer");
_.afterbegin("footer1", footer);
removeP("footer1");

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
  $father.value = $father1.value = student.s_nom + " " + parent.nom_pere;
}

$date.addEventListener("input", async () => {
  $date2.value = $date.value;
});
$time.addEventListener("input", async () => {
  $time2.value = $time.value;
});
$prof.addEventListener("input", async () => {
  $prof2.value = $prof.value;
});
$sabab.addEventListener("input", async () => {
  $sabab2.value = $sabab.value;
});
init();
