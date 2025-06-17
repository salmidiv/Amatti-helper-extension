import { studentsTable } from "../../core/db/conn.js";
import { this_year } from "../../core/helpers/const.js";
import { _ } from "../../core/helpers/helpers.js";
import { notify } from "../../core/helpers/notify.js";
import Tabs from "../../core/helpers/tabs.js";
import { route } from "../../core/route/route.js";

//notify.warning_note(
//  $notify,
//  "للاطلاع على شروحات أيقونات ونوافذ الإضافة والتحديثات الجديدة للإضافة، يمكنكم مراجعة نافذة الروبوت المساعد"
//);
//
//notify.note(
//  $notify,
//  "تم إضافة أيقونة تحميل معدلات الفصل الأول لأيقونة تسيير الامتحانات من أجل إنشاء القوائم حسب معدل الفصل الأول"
//);
notify.note(
  $notify,
  "تم تفعيل السنة الدراسية للإضافة، يمكنكم تحميل البيانات للسنة الجديدة بعد إتمامكم لعملية بداية السنة"
);
notify.warning_note(
  $notify,
  "تم نقل محتوى الإضافة لهذه الصفحة مؤقتا لتسهيل الوصول إلى الشهادات المدرسية والمعلومات الخاصة بالتلاميذ"
);
async function initModal() {
  await route.loadModal(
    "etab_scolarite/modal_setting",
    $modals,
    "setting-modal"
  );
  await route.loadModal("etab_scolarite/modal_papers", $modals, "papers-modal");
  await route.loadModal(
    "etab_scolarite/certaficat_modal",
    $modals,
    "certaficat-modal"
  );
  await route.loadModal("etab_scolarite/rgf_modal", $modals, "rgf-modal");
  await route.loadModal(
    "presPapers/teacher-gender-modal",
    $modals,
    "teachers-gender-modal"
  );
  await route.loadModal(
    "etab_scolarite/exam-builder/exam-modal",
    $modals,
    "exams-builder-modal"
  );
  await route.loadModal("etab_scolarite/helper-modal", $modals, "helper-modal");
  await route.loadModal("etab_scolarite/i7saa_modal", $modals, "i7saa-modal");
  const tabsInstance = new Tabs(".tabs");
}

initModal();
