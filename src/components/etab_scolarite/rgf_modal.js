import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
notify.warning_note(
  _.getid("rgfNotify"),
  "يجب أولا الذهاب لأيقونة ضبط الاعدادات وتحميل بيانات المستخدمين"
);

document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("idaraData"):
      _.to("/idara-data");
      break;
  }
});
