import {
  inoutstudentsTable,
  isnadTable,
  moreInfoTable,
  settingsTable,
  stopstudentsTable,
  studentsTable,
} from "../../../../core/db/conn.js";
import { segments, this_year } from "../../../../core/helpers/const.js";
import { footer, header } from "../../../../core/helpers/header.js";
import { _ } from "../../../../core/helpers/helpers.js";

let setting = await settingsTable.toArray();
const matt = _.decodeURL(segments[2]);
const annee = _.decodeURL(segments[3]);
init();
async function init() {
  _.getid("header1").innerHTML = header;
  _.getid("header2").innerHTML = header;
  _.getid("footer1").innerHTML = footer;
  _.getid("footer2").innerHTML = footer;
  console.log(
    ` ${
      _.isPrimary() ? setting[0].school_type : setting[0].school_type + "ة"
    } ${setting[0].school_name}`
  );
  // get student data
  const student = await inoutstudentsTable
    .where({
      s_matt: matt,
      s_annee: Number(annee),
    })
    .toArray();
  document.querySelectorAll(".fullname").forEach((element) => {
    element.innerHTML = `${student[0].s_nom} ${student[0].s_prenom}`;
  });

  document.querySelectorAll(".birth").forEach((element) => {
    element.innerHTML = student[0].s_birthday;
  });
  document.querySelectorAll(".mostawa").forEach((element) => {
    element.innerHTML = student[0].s_niv;
  });

  document.querySelectorAll(".school").forEach((element) => {
    element.innerHTML = ` ${
      _.isPrimary() ? setting[0].school_type : setting[0].school_type + "ة"
    } ${setting[0].school_name}`;
  });
}
