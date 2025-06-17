import { studentsTable } from "../db/conn.js";
import { _ } from "./helpers.js";

export const MOTAMADRIS = 1;
export const STOP = 2;
export const IN = 2;
export const OUT = 3;
export const EXIT = 4;
export const LYCEE = 1;
export const CEM = 2;
export const PRIMARY = 3;
export const full_link = location.pathname;
export const AMATTI_HOST = "https://amatti.education.dz/";
export const segments = full_link.split("/");
export const WaitTime = 800;
export const extension_url = `chrome-extension://${localStorage.extension_id}`;
export const towrs = ["مدرسة", "متوسط", "ثانوي"];
export const option = `<option value="" > -- اختر الطور -- </option>`;
export const this_year = 2024;
export const this_year_text = "2024-2025";
export const last_year = 2023;
export const this_trim = 20243;

export const load_sections = async (...ids) => {
  const results = await studentsTable
    .where("s_annee")
    .equals(this_year)
    .toArray();

  let nivs = results
    .reduce((acc, niv) => {
      if (_.isLycee() && !_.isNull(niv.s_choaba) && !_.isNull(niv.s_section)) {
        acc.push(
          `${niv.s_niv.trim()}-${niv.s_choaba.trim()}-${niv.s_section} `
        );
      } else if (!_.isNull(niv.s_section)) {
        acc.push(`${niv.s_niv.trim()} -${niv.s_section}`);
      }
      return acc;
    }, [])
    .sort();
  const uniqueNivs = [...new Set(nivs)];
  const customOrder = ["أولى", "ثانية", "ثالثة"];
  uniqueNivs.sort(
    (a, b) =>
      customOrder.indexOf(a.split("-")[0]) -
      customOrder.indexOf(b.split("-")[0])
  );

  var op = ` <option value="" selected="">-- اختر القسم --</option>`;
  op += uniqueNivs
    .map(
      (element) =>
        `<option value="${element.trim()}">${element
          .split("-")
          .join(" ")}</option>`
    )
    .join("");
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index];
    _.qSel("." + id).innerHTML = op;
  }
  return op;
};

const notes_fiable = [
  "عليك بالعمل أكثر في ما تبقى لتدارك النقائص",
  "ينتظر منك مجهود كبير لتحسين النتائج",
  "عليك ببذل المزيد من الجهد لتحسين نتائجك",
  "نتائج متذبذبة، يطلب منك التركيز والجدية لتحسينها",
  "عمل ناقص عليك باستغلال امكانياتك لتحسين النتائج",
  "عمل ينقصه التنظيم وقلة التحضير في البيت. انتبه",
];
const notes_moyen = [
  "ضاعف مجهوداتك ليكون عملك أكثر فعالية، باستطاعتك ذلك",
  "عليك بمضاعفة مجهوداتك",
  "نتائج غير مرضية نتيجة الحركة داخل القسم",
  "مشاركة ناقصة عليك بالتحضير الجيد للدروس",
  "بالامكان أن تكون النتائج هذا الفصل أحسن، عليك بالمزيد من العمل",
  "ركز في دراستك وحسن من سلوكك، وابتعد عن رفاق السوء",
];

const notes_moyen2 = [
  "لديك قدرات للحصول على نتائج أحسن فلا تبخل بها",
  "تحسن كبير في السلوك والعمل، أشجعك واصل",
  "كان بالامكان أن تكون النتائج أفضل، حذار من الغرور",
];
const notes_good = [
  "نتائج حسنة ومشاركة فعالة في القسم واصل",
  "نتائج مرضية وفي تحسن مستمر، لديك إمكانيات لمواصلة ذلك",
  "عمل يستحق الشكر والتشجيع واصل",
  "تلميذ(ة) نجيب يتمتع بقدرات عالية وجدية متميزة، أتمنى لك التوفيق",
];

export const noteMappings = {
  faible: notes_fiable,
  ender: notes_moyen,
  hasan: notes_moyen2,
  bien: [],
  tbien: [],
  good: notes_good,
  super: [],

  arfaible: notes_fiable,
  arender: notes_moyen,
  arhasan: notes_moyen2,
  arbien: [],
  artbien: [],
  argood: notes_good,
  arsuper: [],

  frfaible: [],
  frender: [],
  frhasan: [],
  frbien: [],
  frtbien: [],
  frgood: [],
  frsuper: [],

  mzfaible: [],
  mzender: [],
  mzhasan: [],
  mzbien: [],
  mztbien: [],
  mzgood: [],
  mzsuper: [],
};
