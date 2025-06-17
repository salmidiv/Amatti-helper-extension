import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";
import Tabs from "../../../../core/helpers/tabs.js";
import { route } from "../../../../core/route/route.js";

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
async function initModal() {
  await route.loadModal("pages/madjlis/istidrak", $modals, "istidrak-modal");
  const tabsInstance = new Tabs(".tabs");
}

initModal();
