import { notify } from "../../../../core/helpers/notify.js";
import Tabs from "../../../../core/helpers/tabs.js";
import { route } from "../../../../core/route/route.js";

notify.note(
  $notify,
  "يمكنكم الآن التأكد من ملفات الحجز واستيراد النقط مباشرة من الإضافة بعد عملية التأكد"
);
notify.warning_note(
  $notify,
  "<strong>لتفعيل خاصية حجز النقاط، يرجى اتباع الخطوات التالية:</strong>\n\n" +
    "← <strong>الخطوة 1:</strong> الانتقال إلى صفحة التمدرس\n" +
    "← <strong>الخطوة 2:</strong> النقر على أيقونة ضبط الإعدادات\n" +
    "← <strong>الخطوة 3:</strong> اختيار نافذة 'بيانات المستخدمين'\n" +
    "← <strong>الخطوة 4:</strong> النقر على أيقونة الخريطة التربوية لتحميل بيانات الخريطة\n" +
    "<strong>بعد إكمال هذه الخطوات، ستتمكن من استخدام خاصية حجز النقاط بشكل كامل.</strong>"
);

async function initModal() {
  await route.loadModal("pages/hajz/hajz-file", $modals, "hajz-file-modal");
  const tabsInstance = new Tabs(".tabs");
}

initModal();
