import { moreInfoTable, studentsTable } from "../../../core/db/conn.js";
import { this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";
import Tabs from "../../../core/helpers/tabs.js";
import { route } from "../../../core/route/route.js";
const noti = `
     تم إضافة خاصية "<span class="fw-bold">طباعة شهادة مدرسية (نسختين في ورقة واحدة)</span>" للطباعة، للحصول على الوثيقة، تضغط على أي سطر تلميذ بالزر الأيمن ثم تختار طباعة شهادة مدرسية (نسختين في ورقة واحدة).
     <br>
     العملية صالحة لكل السنوات الدراسية على الرقمنة
`;
notify.note($notify, noti);

async function initModal() {
  await route.loadModal("entryData/sifa_modal", $modals, "sifa-modal");
  await route.loadModal(
    "entryData/entryDate_modal",
    $modals,
    "entryDate-modal"
  );
  const tabsInstance = new Tabs(".tabs");
}
initModal();
