import { segments } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";
import Tabs from "../../../../core/helpers/tabs.js";
import { route } from "../../../../core/route/route.js";

notify.warning_note(
  $notify,
  "تحليل البيانات، حاليا يعمل لجميع الأطوار وبدون مشاكل (تم التجريب للأطوار الثلاثة)"
);
notify.note(
  $notify,
  `الاستدراك متاح الآن،
   <p class="ui large red circular label header span1 biarabi">
                    هــــام
                  </p>
  يجب العمل بالتعليمات الموجودة في نافذة الاستدراك`
);
notify.warning_note(
  $notify,
  "تم حل المشكل الخاص بالاستدراك للطور المتوسط، يرجى تفريغ بيانات الاستدراك وإعادة رفعها"
);
if (_.get("isOpen") != "yes") {
  _.set("isOpen", "yes");
  notify.toast(
    {
      type: "done",
      color: "success",
      message: "تحليل البيانات الخاص بالفصل الثاني متاحة الآن",
    },
    7
  );
}
async function initModal() {
  if (_.isPrimary()) {
    console.log(_.getclass("add-ijazat")[0]);
    _.getclass("add-ijazat")[0].classList.add("d-none");
  }
  await route.loadModal("pages/madjlis/modal", $modals, "notes-modal");
  await route.loadModal(
    "pages/madjlis/statistics",
    $modals,
    "statistics-modal"
  );
  await route.loadModal("pages/madjlis/istidrak", $modals, "istidrak-modal");
  const tabsInstance = new Tabs(".tabs");
}

initModal();
