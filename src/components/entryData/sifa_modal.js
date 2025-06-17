import { studentsTable } from "../../../core/db/conn.js";
import {
  AMATTI_HOST,
  MOTAMADRIS,
  this_year,
} from "../../../core/helpers/const.js";
import DownloadPDF from "../../../core/helpers/donwload-pdf.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
let divs = [];

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("sifaModal"):
      load_list();
      break;
    case classList.contains("save-regime"):
      saveRegime();
      break;
  }
});

async function get_divs() {
  const data = await _.fetchData(
    "scolarite/en_chiffre/analyse_class/get_division",
    { annee: 20241, isAjax: true },
    "text"
  );
  let pageRender = $(data);
  pageRender.map(function () {
    let division = $(this);
    if (division.val() != "") {
      divs.push({ div: division.val(), div_text: division.text() });
    }
  });
  return divs;
}

async function load_list() {
  const all_classes = await get_divs(); // JSON.parse(localStorage.all_classes);
  const key = "div";
  const all_class = [
    ...new Map(all_classes.map((item) => [item[key], item])).values(),
  ];
  let option = `<option value="" >اختر القسم </option>`;
  all_class.forEach((clas) => {
    option += `<option value="${clas.div}">${clas.div_text}</option>`;
  });
  document.getElementById("levels").innerHTML = option;
}

document.addEventListener("change", function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("levels"):
      load_students_list();
      break;
  }
});

//_.btnEvent(_.getid("levels"), "change", load_students_list);

async function load_students_list() {
  const division = _.getid("levels").value;
  const students = await _.fetchData(
    "scolarite/passage_eleves/dossier_eleve/list_eleves",
    {
      division: division,
    }
  );
  make_table(students.data, division);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم عملية الجلب بنجاح",
  });
}

function check_class(a, division, div_text) {
  div_text = div_text.replace(/\s+/g, " ").trim();
  let cl = div_text.split(" ")[0];
  let check;
  if (!_.isLycee()) {
    check = a[5].includes(cl) && a[6] == division.slice(-1);
  } else {
    // a[5].includes(cl)
    // div_text.includes(a[6])
    // a[7] == division.slice(-1)
    check =
      a[5].includes(cl) &&
      div_text.includes(a[6].replace(/\s+/g, " ").trim()) &&
      a[7] == division.slice(-1);
  }
  return check;
}

function make_table(students, division) {
  const divText = divs.find((d) => d.div === division).div_text;
  var s = students.filter((a) => check_class(a, division, divText)); //a[5].includes(cl) && a[6] == division.slice(-1))
  let html = "";
  for (let i = 0; i < s.length; i++) {
    let one = "",
      two = "",
      three = "";

    const cla = s[i][5] + " " + localStorage.schoolType + " " + s[i][6];

    let b = s[i][3] == "ذكر" ? "bold" : "";
    let cl = !_.isLycee()
      ? s[i][5] + " " + s[i][6] + " " + s[i][7]
      : s[i][5] + " " + s[i][6];
    let cl_sub = _.isLycee() ? s[i][8] : s[i][7];
    const index = _.isLycee() ? 8 : 7;
    const section = _.isLycee()
      ? `${s[i][5]} ${s[i][6]} - ${s[i][7]}`
      : `${s[i][5]} ${s[i][6]}`;
    if (s[i][index].includes("خار")) one = 'checked=""';
    if (s[i][index].includes("داخلي")) three = 'checked=""';
    if (s[i][index].includes("نصف") && s[i][index].includes("داخ"))
      two = 'checked=""';
    let tr = `<tr>
              <td>${i + 1} </td>
              <td>${s[i][0]} </td>
              <td>${s[i][1]} ${s[i][2]}</td>
              <td>${s[i][4]} </td>
              <td>${s[i][3]} </td>
              <td> ${section} </td>
              <td style="position:relative">
                  <div class="form-group test_check_group">
                    <label class="forcheckboxTest" for="intern-${i}" id="labelCheck-${i}">
                    <input ${three} class="testCheck " id="intern-${i}" name="gender_${i}" value="3-${
      s[i][0]
    }" type="radio">
                        <span class="check"></span>
                    </label>
                  </div>
              </td>
              <td style="position:relative">
                  <div class="form-group test_check_group">
                    <label class="forcheckboxTest" for="mamnoh-${i}" id="labelCheck-${i}">
                    <input ${two} class="testCheck " id="mamnoh-${i}" name="gender_${i}" value="2-${
      s[i][0]
    }" type="radio">
                        <span class="check"></span>
                    </label>
                  </div>
              </td>
              <td style="position:relative">
                  <div class="form-group test_check_group">
                    <label class="forcheckboxTest" for="extern-${i}" id="labelCheck-${i}">
                    <input ${one} class="testCheck " id="extern-${i}" name="gender_${i}" value="1-${
      s[i][0]
    }" type="radio">
                        <span class="check"></span>
                    </label>
                  </div>
              </td>
              <tr>`;
    html += tr;
  }
  _.getid("students_list").innerHTML = html;
}

function regim(reg) {
  let arr = {
    خارجي: 1,
    "نصف داخلي": 2,
    داخلي: 3,
  };
  return arr[reg];
}
async function saveRegime() {
  let arra_reg = [];

  document
    .querySelectorAll('input[type="radio"]:checked')
    .forEach(function (radio) {
      let value = radio.value.split("-");
      arra_reg.push({
        reg: value[0],
        user_serial: value[1],
      });
    });

  for (var i = 0; i < arra_reg.length; i++) {
    const response = await _.fetchData(
      "scolarite/passage_eleves/dossier_eleve/update_regime",
      {
        annee_regime: this_year,
        mat_elv_reg: arra_reg[i].user_serial,
        annee_up: this_year,
        regime: arra_reg[i].reg,
      }
    );
    if (response === 1) {
      notify.toast({
        type: "done",
        color: "success",
        message: "تم عملية التعديل بنجاح",
      });
    } else {
      notify.toast({
        type: "done",
        color: "warning",
        message: "لم عملية التعديل",
      });
    }
  }
}
