import { personalsTable } from "../../../core/db/conn.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";

// changeTeachersGender
document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("changeTeachersGender"):
      loadPersonnels();
      break;
  }
});

async function loadPersonnels() {
  const pers = await personalsTable.toArray();
  const halfLength = Math.ceil(pers.length / 2);
  _.getid("persoHtml").innerHTML = generateHtml(pers.slice(0, halfLength), 0);
  _.getid("persoHtml2").innerHTML = generateHtml(
    pers.slice(halfLength),
    halfLength
  );
  const buttons = _.qSelAll(".cPersGender");

  buttons.forEach((button) => {
    _.btnEvent(button, "click", chengePersGender);
  });
  //
}

function generateHtml(data, index) {
  return data
    .map(
      (u, i) => `
        <tr>
            <td>${i + index + 1} </td>
            <td>${u.nom} ${u.prenom}</td>
            <td> 
                <div class="switch-container">
                    <label class="switch-label ml-3">ذكر</label>
                    <label class="switch">
                        <input type="checkbox" class="cPersGender" data-matt="${
                          u.matt
                        }" ${u.gender == "ذكر" && "checked"}>
                        <span class="slider"></span>
                    </label>
                    <label class="switch-label mr-3">أنثى</label>
                </div>
            </td>
        </tr>
  `
    )
    .join("");
}

async function chengePersGender(ev) {
  const gender =
    ev.target.tagName === "INPUT" &&
    ev.target.type === "checkbox" &&
    ev.target.checked
      ? "ذكر"
      : "أنثى";
  const matt = ev.target.dataset.matt;
  await personalsTable.where("matt").equals(matt).modify({ gender: gender });
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
}
