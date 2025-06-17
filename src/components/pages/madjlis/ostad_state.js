import { finalResTable, mawadTable } from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { this_trim } from "../../../../core/helpers/const.js";
if (
  !localStorage.lawha ||
  !localStorage.tchjia ||
  !localStorage.thniaa ||
  !localStorage.imtiyaz
) {
  _.qSel(".wrapper").innerHTML = `<h1 class="text-center">
  يجب حجز معدلات الإجازات أولا من صفحة قرار مجلس القسم، أيقونة إدراج معدلات الإجازات والملاحظات الموجودة في شريط الإضافة
</h1>`;
}

let trim = Number(this_trim.toString().slice(-1));
const Maxmoy = _.Mmoy();

$anneschool.addEventListener("change", async () => {
  update_mark();
});

async function update_mark() {
  const year = $anneschool.value;
  if (year) {
    const res = await _.fetchData(
      "scolarite/en_chiffre/analyse_class/get_division",
      { annee: year, isAjax: true },
      "text"
    );
    $divi.innerHTML = res;
  }
}

$divi.addEventListener("change", async () => {
  if ($divi.value) load_data($anneschool.value, $divi.value);
});
async function load_data(annee, division) {
  const res = await finalResTable
    .where({ niv: division, annee: annee })
    .toArray();
  const data = res.map((r) => JSON.parse(r.data));
  const cols = await mawadTable
    .where({ niv: division, annee: annee })
    .toArray();

  const selectedIndex = $divi.selectedIndex;
  const selectedText = $divi.options[selectedIndex].text;
  const selectedfatraIndex = $anneschool.selectedIndex;
  const fatraText = $anneschool.options[selectedfatraIndex].text;

  _.qSel(
    ".title"
  ).innerHTML = `محضر مجلس القسم لقسم ${selectedText} [${fatraText}]`;

  const columns = JSON.parse(cols[0]?.data);
  buildTable(columns, data);
}
function sortArray(arr) {
  return arr.sort((a, b) => {
    const getValue = (item) => {
      const lastValue = item[item.length - 1];
      if (!lastValue.includes("ﻍ")) {
        return parseFloat(lastValue); // Convert to float if not containing 'ﻍ'
      } else {
        return 0; // Return 0 if containing 'ﻍ'
      }
    };

    return getValue(b) - getValue(a);
  });
}

function buildTable(columns, data) {
  const tr = `<tr>
    <th align="center" width="150px"><div>المواد</div></th>`;
  const columnHeaders = columns
    .slice(5)
    .map(
      (element) =>
        `<th class="rotate" style="width:6%" align="center"><div>${element}</div></th>`
    )
    .join("");
  _.qSel(".one-head").innerHTML = tr + columnHeaders;
  var { byModule, general, byGender, moyenRangeWithPers } = calc_one(
    data,
    Maxmoy
  );

  //const stude = data.filter(s => s.pop().includes('ﻍ'));
  //const row_len = stude.length;
  _.qSel(".one-body").innerHTML = ``;
  byModuleTable(byModule, data);

  generalStatsTable(general, data);

  byGenderTable(byGender, data);

  moyenRangeWithPersTable(moyenRangeWithPers, data);

  ijazaTable(data);
}

function byModuleTable(byModule, data) {
  const cells_name = ["عدد الناجحين", "المعدل العام"];
  const cells_code = ["najah", "average"];
  _.qSel(".one-body").innerHTML += `<tr><th colspan="${
    data[0].length - 4
  }"> معدلات المواد</th>`;
  cells_name.forEach((text, index) => {
    let tr = `<tr><th >${text}</th>`;
    const najah = cells_code[index];
    byModule.forEach((subArr) => {
      const element = subArr[najah];
      tr += `<td>${element}</td>`;
    });
    tr += `</tr>`;
    _.qSel(".one-body").innerHTML += tr;
  });
}

function generalStatsTable(general, data) {
  _.qSel(".one-body").innerHTML += `<tr><th colspan="${
    data[0].length - 4
  }">احصائيات عامة [ عدد التلاميذ: ${general[0].total} ]</th>`;
  console.log(general);
  const cells_name_g = [">= 10", "<= 10", "نسبة النجاح"];
  const cells_code_g = ["najah", "lessTen", "pers"];
  cells_name_g.forEach((text, index) => {
    let tr = `<tr><th width="265px">${text} </th>`;
    const najah = cells_code_g[index];
    general.forEach((subArr) => {
      const element = subArr[najah];
      tr += `<td>${element}</td>`;
    });
    tr += `</tr>`;
    _.qSel(".one-body").innerHTML += tr;
  });
}

function byGenderTable(byGender, data) {
  _.qSel(".one-body").innerHTML += `<tr><th colspan="${
    data[0].length - 4
  }">احصائيات  حسب الجنس: [ عدد الإناث: ${byGender[0].girls} -- عدد الذكور: ${
    byGender[0].boys
  }]</th>`;

  const cells_name_gender = [
    "بنات >= 10",
    "نسبة النجاح",
    "ذكور >= 10",
    "نسبة النجاح",
  ];
  const cells_code_gender = ["girl", "girlsPers", "boy", "boysPers"];
  cells_name_gender.forEach((text, index) => {
    const najah = cells_code_gender[index];

    console.log(najah);
    let tr = `<tr><th width="265px">${text}  </th>`;
    byGender.forEach((subArr) => {
      const element = subArr[najah];
      var extra = najah === "girl" ? subArr["girls"] : "";
      extra = najah === "boy" ? subArr["boys"] : extra;
      tr += `<td>${element}  </td>`;
    });
    tr += `</tr>`;
    _.qSel(".one-body").innerHTML += tr;
  });
}

function moyenRangeWithPersTable(moyenRangeWithPers, data) {
  _.qSel(".one-body").innerHTML += `<tr><th colspan="${
    data[0].length - 4
  }"> فئات المعدلات مع النسب المئوية بالنسبة لمختلف المواد</th>`;
  let cells_code = [
    "oneNbr",
    "oneMoy",
    "twoNbr",
    "twoMoy",
    "threeNbr",
    "threeMoy",
    "fourNbr",
    "fourMoy",
    "fiveNbr",
    "fiveMoy",
    "sixNbr",
    "sixMoy",
    "sevenNbr",
    "sevenMoy",
    "eightNbr",
    "eightMoy",
  ];
  let cells_names = [
    "أقل من 8",
    "النسبة",
    "8 - 9,99",
    "النسبة",
    "10 - 10,99",
    "النسبة",
    "11 - 11,99",
    "النسبة",
    "12 - 12,99",
    "النسبة",
    "13 - 13,99",
    "النسبة",
    "14 - 14,99",
    "النسبة",
    "أكبر من 15",
    "النسبة",
  ];

  cells_names.forEach((text, index) => {
    let tr = `<tr><th width="265px">${text}</th>`;
    const najah = cells_code[index];
    moyenRangeWithPers.forEach((subArr) => {
      const element = subArr[najah];
      tr += `<td ${
        Number(element) === 0 && "style='background: #ffb8b8;'"
      }>${element} </td>`;
    });
    tr += `</tr>`;
    _.qSel(".one-body").innerHTML += tr;
  });
}

function ijazaTable(data) {
  _.qSel(".ijazaTitle").innerHTML = `تعداد الإجازات وأسماء التلاميذ`;
  var { ijazaName, isIjaza } = ijazaCount(data);
  _.qSel(".two-head").innerHTML = "";
  _.qSel(".two-body").innerHTML = "";
  if (Object.keys(ijazaName).length === 0) {
    _.qSel(".two-head").innerHTML = "لا يوجد";
    return;
  }
  let tr = `<tr style="text-align: center;"><th colspan="4">الإجازات</th>`;
  for (let j = 0; j < Object.keys(ijazaName).length; j++) {
    tr += `<th colspan="3">${Object.keys(ijazaName)[j]}</th>`;
  }
  _.qSel(".two-head").innerHTML += tr;
  tr = `</tr><tr style="text-align: center;"><td colspan="4">العدد</td>`;
  for (let j = 0; j < Object.keys(ijazaName).length; j++) {
    tr += `<td colspan="3">${Object.values(ijazaName)[j]}</td>`;
  }
  _.qSel(".two-head").innerHTML += tr;

  tr = `</tr><tr style="text-align: center;"><td colspan="4">أسماء التلاميذ</td>`;
  for (let j = 0; j < Object.keys(ijazaName).length; j++) {
    tr += `<td colspan="3" class="top-right">`;
    for (let index = 0; index < isIjaza.length; index++) {
      if (isIjaza[index].ijaza.includes(Object.keys(ijazaName)[j]))
        tr += `- ${isIjaza[index].name}<br>`;
    }
    tr += `</td>`;
  }
  tr += `</tr>`;
  _.qSel(".two-body").innerHTML += tr;

  //
}

function calc_one(data, moyen) {
  const numStudents = data.length;
  const numNotes = data[0].length - 5; // Assuming all arrays have the same length

  const byModule = [];
  const general = [];
  const byGender = [];
  const moyenRangeWithPers = [];
  for (let i = 5; i < data[0].length; i++) {
    // Loop over the columns
    let totalNotes = 0;
    let najah = 0;
    let boy = 0;
    let boys = 0;
    let girl = 0;
    let girls = 0;
    let students = [];

    for (let j = 0; j < numStudents; j++) {
      // Loop over the rows
      const note = Number(data[j][i]);
      const isNot = note.toString().includes("ﻍ");
      const gender = data[j][3];
      if (!isNaN(note) && note >= moyen) najah++;
      if (!isNaN(note)) totalNotes += Number(note);
      if (!isNaN(note) && note >= moyen && gender.includes("ذكر")) boy++;
      if (!isNaN(note) && note >= moyen && gender.includes("أنثى")) girl++;
      if (!isNaN(note) && gender.includes("ذكر")) boys++;
      if (!isNaN(note) && gender.includes("أنثى")) girls++;
      if (!isNot && !note.toString().includes("معفى")) students.push(note);
    }

    const average = (totalNotes / numStudents).toFixed(2);
    byModule.push({ najah, average });

    const lessTen = numStudents - najah;
    const pers = ((najah / numStudents) * 100).toFixed(2);

    general.push({ najah, lessTen, pers, total: boys + girls });

    const boysPers = ((boy / boys) * 100).toFixed(2);
    const girlsPers = ((girl / girls) * 100).toFixed(2);

    byGender.push({ boy, boys, boysPers, girl, girls, girlsPers });

    let one = _.isPrimary() ? 3 : 8;
    let two = _.isPrimary() ? 5 : 10;
    let three = _.isPrimary() ? 6 : 11;
    let four = _.isPrimary() ? 7 : 12;
    let five = _.isPrimary() ? 8 : 13;
    let six = _.isPrimary() ? 8 : 14;
    let seven = _.isPrimary() ? 8 : 15;
    const less_height = students.filter((item) => item < one);
    const less_ten = students.filter((item) => item < two && item >= one);
    const less_twelve = students.filter((item) => item < three && item >= two);
    const less_fourteen = students.filter(
      (item) => item < four && item >= three
    );
    const less_sexteen = students.filter((item) => item < five && item >= four);
    const less_seven = students.filter((item) => item < six && item >= five);
    const less_eigth = students.filter((item) => item < seven && item >= six);
    const big_sexteen = students.filter((item) => item >= seven);
    moyenRangeWithPers.push({
      oneNbr: less_height.length,
      oneMoy: ((less_height.length / students.length) * 100).toFixed(2),

      twoNbr: less_ten.length,
      twoMoy: ((less_ten.length / students.length) * 100).toFixed(2),

      threeNbr: less_twelve.length,
      threeMoy: ((less_twelve.length / students.length) * 100).toFixed(2),

      fourNbr: less_fourteen.length,
      fourMoy: ((less_fourteen.length / students.length) * 100).toFixed(2),

      fiveNbr: less_sexteen.length,
      fiveMoy: ((less_sexteen.length / students.length) * 100).toFixed(2),

      sixNbr: less_seven.length,
      sixMoy: ((less_seven.length / students.length) * 100).toFixed(2),

      sevenNbr: less_eigth.length,
      sevenMoy: ((less_eigth.length / students.length) * 100).toFixed(2),

      eightNbr: big_sexteen.length,
      eightMoy: ((big_sexteen.length / students.length) * 100).toFixed(2),
    });
  }

  return { byModule, general, byGender, moyenRangeWithPers };
}

function ijazaCount(data) {
  // const ijazat = []
  const isIjaza = data
    .map((student) => {
      const moy = student[student.length - 1];
      const ijaza = add_ijaza(Number(moy));
      return {
        name: student[1],
        moy,
        ijaza,
      };
    })
    .filter((i) => i.ijaza != "");

  const ijazat = data
    .map((s) => s[s.length - 1])
    .map(add_ijaza)
    .filter((value) => value !== ""); // Ignore empty values

  var ijazaName = ijazat
    .filter((i) => i != "")
    .reduce((cnt, cur) => ((cnt[cur] = cnt[cur] + 1 || 1), cnt), {});
  return { ijazaName, isIjaza };
}

function add_ijaza(grade) {
  let ijaza;
  switch (true) {
    case grade >= Number(localStorage.lawha.split("-")[0]) &&
      grade <= Number(localStorage.lawha.split("-").pop()):
      ijaza = "لوحة شرف";
      break;
    case grade >= Number(localStorage.tchjia.split("-")[0]) &&
      grade <= Number(localStorage.tchjia.split("-").pop()):
      ijaza = "تشجيع";
      break;
    case grade >= Number(localStorage.thniaa.split("-")[0]) &&
      grade <= Number(localStorage.thniaa.split("-").pop()):
      ijaza = "تهنئة";
      break;
    case grade >= Number(localStorage.imtiyaz.split("-")[0]) &&
      grade <= Number(localStorage.imtiyaz.split("-").pop()):
      ijaza = "امتياز";
      break;
    default:
      ijaza = "";
      break;
  }
  return ijaza;
}
