import { this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("entryDateModal"):
      Gdate();
      break;
    case classList.contains("save-regime"):
      saveRegime();
      break;
  }
});

///
let studentsList = [];
let selectedList = [];
let checkedList = [];
const Gdate = async () => {
  const list = await _.fetchData(
    "scolarite/passage_eleves/dossier_eleve/list_eleves"
  );
  let n = [];
  console.log(list);
  const students = list.data.map((student) => {
    const indx = _.isLycee() ? 10 : 9;
    const one = student.slice(0, indx);
    if (_.isLycee()) {
      n.push([one[5], one[6], one[7]].join("-"));
    } else {
      n.push([one[5], one[6]].join("-"));
    }
    // Extract parameters from the update_div function
    const two = student[indx];

    const match = two.match(/'([^']+)'/g);
    const updateDivParameters = match.map((param) => param.replace(/'/g, ""));

    // Combine the two arrays into a single array
    const uniqueArray = Array.from(new Set(updateDivParameters));

    const resultArray = one.concat(uniqueArray);

    // Remove duplicates using a Set
    return resultArray;
  });

  studentsList = students;
  console.log(n);
  setDivs(n);
};

const setDivs = (n) => {
  _.getid("nivs").innerHTML =
    `<option value="">اختر القسم</option>` +
    [...new Set(n)]
      .sort()
      .map((d) => `<option value="${d}">${d}</option>`)
      .join("");
};

_.getid("nivs").addEventListener("change", () => {
  selectedList = [];
  checkedList = [];
  const niv = _.getid("nivs").value;
  if (niv == "") {
    alertify.error("الرجاء اختيار القسم");
    return;
  }
  let n = niv.split("-");
  let list = studentsList.filter((u) => {
    if (_.isLycee()) {
      return u[5] == n[0] && u[6].includes(n[1].trim()) && u[7] == n[2];
    }
    return u[5] == n[0] && u[6] == n[1];
  });
  console.log(list);
  selectedList = list;
  _.getid("list").innerHTML = list
    .map((l) => {
      const reg = _.isLycee() ? 9 : 8;
      const indx = _.isLycee() ? 14 : 13;
      return `
      <tr>
        <td>
            <input type="checkbox" value="${l[0]}"  class="chackOne" />
        </td>
        <td>${l[1]} ${l[2]}</td>
        <td>${l[4]} </td>
        <td>${l[reg]}</td>
        <td>${l[indx]}</td>
      </tr>
    `;
    })
    .join(" ");
  const chackOne = document.querySelectorAll(".chackOne");
  const checkedValues = [];
  chackOne.forEach((checkbox) => {
    checkbox.addEventListener("click", () => {
      if (checkbox.checked) {
        // If checked, add its value to the checkedValues array
        checkedValues.push(checkbox.value);
      } else {
        const index = checkedValues.indexOf(checkbox.value);
        if (index !== -1) {
          checkedValues.splice(index, 1);
        }
      }
      checkedList = checkedValues;
    });
  });
});

_.getid("changeEntryDate").addEventListener("click", async () => {
  const filteredList = _.getid("chackAll").checked
    ? []
    : selectedList.filter((item) => !checkedList.includes(item[0]));
  console.log(filteredList);
  const reg = _.isLycee() ? 9 : 8;

  for (let index = 0; index < filteredList.length; index++) {
    const elm = filteredList[index];
    const data = {
      mat_elv_up: elm[0],
      annee_up: this_year,
      NReinscrire: elm[reg],
      DateReinscriptRg: _.getid("entryDate").value,
      dest_div_up: "",
    };
    const res = await _.fetchData(
      "scolarite/passage_eleves/dossier_eleve/update_in",
      data
    );
    if (res === 1) {
      alertify.success("تمت عملية التعديل بنجاح");
    } else {
      alertify.error("عملية التعديل لم تتم ");
    }
    await _.sleep(1000);
  }
});
