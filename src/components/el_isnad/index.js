import { notify } from "../../../core/helpers/notify.js";
import Tabs from "../../../core/helpers/tabs.js";
import { route } from "../../../core/route/route.js";
notify.note($notify, "تم تحيين الفصل الثالث لتحميل ملفات الحجز");
notify.warning_note($notify, "لتحميل ملفات حجز النقاط يجب أولا اختيار الفترة ");
//notify.warning_note(
//  $notify,
//  "تم إدراج مادتي التربية الإسلامية والمدنية للطور المتوسط، وإدراج الحجز لجميع الأقسام لمادة التربية الإسلامية للطور الثانوي، كما تم تترتيب القائمة حسب المادة مع تلوين كل مادة بلون مختلف"
//);

initModal();
async function initModal() {
  await route.loadModal("el_isnad/hajz-file", $modals, "hajz-file-modal");
  await route.loadModal(
    "el_isnad/isnad-maker-model",
    $modals,
    "isnad-maker-modal"
  );

  const tabsInstance = new Tabs(".tabs");
}
