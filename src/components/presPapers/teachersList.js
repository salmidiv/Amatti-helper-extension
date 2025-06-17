import { db, personalsTable } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
let id = _.decodeURL(segments[2]);
const t = _.isLycee()
  ? "تعليم الثانوي"
  : _.isCem()
  ? "تعليم متوسط"
  : _.isPrimary()
  ? "تعليم ابتدائي"
  : "";
var title =
  id == "أستاذ التعليم"
    ? "أساتذة ال" + t
    : id == "أستاذ رئيسي"
    ? "الأساتذة الرئيسيين لل" + t
    : "الأساتذة المكونين لل" + t;
title = id == "all" ? "أساتذة المؤسسة" : title;
$title.innerHTML = document.title = `قائمة   ${title}`;
_.afterbegin("header", header);
_.afterbegin("footer", footer);
const rotb =
  _.isPrimary() && id.includes("أستاذ التعليم") ? "أستاذ المدرسة" : id;
let students = await personalsTable
  .filter((p) =>
    id !== "all"
      ? p.rotba.includes("أستاذ") && p.rotba.includes(rotb)
      : p.rotba.includes("أستاذ")
  )
  .toArray();
let tr = "";
if (id == "all") {
  _.remClass(_.qSel(".rotba"), "d-none");
}
students.forEach((element, index) => {
  tr += `<tr><td>${index + 1}</td>
    <td>${element.nom} ${element.prenom}</td>
    <td>${element.birthday}</td>
    <td>${element.mada}</td>
    ${id == "all" ? `<td>${element.rotba}</td>` : ""}
    <td></td>
    </tr>`;
});
$studentsList.innerHTML = tr;
