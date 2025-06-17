import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

const noti = `
    بعد اختيار الفترة والفوج التربوي يمكنكم الضغظ على أيقونة "احصائيات سريعة" الموجودة أسفل يسار الصفحة، لإظهار 
عدد الناجحين والمعيدين والموجهين للقسم المختار، يجب الضغط على الأيقونة في كل مرة تقوم باختيار فوج جديد
`;
notify.note($notify, noti);

const finalStats = _.qSel(".finalStats");
finalStats.addEventListener("click", calculateSums);

function calculateSums() {
  const divisionSelect = document.getElementById("division");
  const selectedDivision = divisionSelect.value;
  if (selectedDivision === "" || selectedDivision === null) {
    alertify.error("الرجاء اختيار الفوج التربوي ");
    return;
  }
  const resultTable = document.getElementById("displayTable");
  const rows = resultTable.getElementsByTagName("tr");
  const sums = {
    Move: 0,
    Repeat: 0,
    Oriented: 0,
  };

  for (let i = 2; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const TDtext = cells[cells.length - 1].innerText;
    sums.Move += TDtext.includes("ينتقل") ? 1 : 0;
    sums.Repeat += TDtext.includes("يعيد") ? 1 : 0;
    sums.Oriented += TDtext.includes("يوجه") ? 1 : 0;
  }
  document.querySelector("#stat").innerHTML = sums.Move;
  document.querySelector("#stat1").innerHTML = sums.Repeat;
  document.querySelector("#stat2").innerHTML = sums.Oriented;
}
