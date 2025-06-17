import { personalsTable } from "../../../core/db/conn.js";
import { _ } from "../../../core/helpers/helpers.js";

const keywordArray = [
  "مدير",
  "ناظر ثانوية",
  "مقتصد رئيسي",
  "مستشار رئيسي",
  "مقتصد",
  "مستشار التربية",
  "مستشار رئيسي للتوجيه",
  "وثائقي أمين محفوظات",
  "مستشار التوجيه و الإرشاد المدرسي",
  "مشرف رئيسي للتربية",
  "مساعد متصرف",
  "مساعد وثائقي أمين محفوظات رئيسي",
  "ملحق رئيسي بالمخابر",
  "ملحق رئيسي للإدارة",
  "مساعد وثائقي أمين محفوظات",
  "نائب مقتصد",
  "مشرف التربية",
  "ممرض حاصل",
  "ملحق إدارة",
  "ممرض مؤهل",
  "مساعد تمريض",
  "مساعد رئيسي للتربية",
  "ملحق بالمخابر",
  "عون إدارة رئيسي",
  "كاتب مديرية",
  "تقني في الإعلام الآلي",
  "محاسب إداري",
  "عون إدارة",
  "معاون تقني في المخبر",
  "مساعد التربية",
  "كاتب",
  "عون مكتب",
  "عون تقني في المخبر",
  "عون حفظ البيانات",
  "عامل مهني خارج الصنف",
  "عامل مهني من الصنف الأول",
  "عامل مهني من الصنف الثاني",
  "سائق سيارة من الصنف الأول",
  "سائق سيارة من الصنف الثاني",
  "رئيس مخزن",
  "رئيس مطعم",
  "مسؤول المصلحة الداخلية",
  "عون الخدمة من المستوى الأول",
  "عون الوقاية من المستوى الثاني",
  "عون الوقاية من المستوى الأول",
  "عامل مهني من المستوى الرابع",
  "عامل مهني من المستوى الثالث",
  "عامل مهني من المستوى الثاني",
  "عامل مهني من المستوى الأول",
  "سائق سيارة من المسستوى الثاني",
  "سائق سيارة من المسستوى الأول",
];
function levenshteinDistanceArray(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = i === 0 ? j : 0;
    }
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
function customSort(a, b) {
  const wordsA = a.rotba.split(/\s+/);
  const wordsB = b.rotba.split(/\s+/);

  const closestA = keywordArray.reduce(
    (min, keyword) => {
      const distance = levenshteinDistanceArray(wordsA, keyword.split(/\s+/));
      return distance < min.distance ? { keyword, distance } : min;
    },
    { keyword: "", distance: Infinity }
  ).keyword;

  const closestB = keywordArray.reduce(
    (min, keyword) => {
      const distance = levenshteinDistanceArray(wordsB, keyword.split(/\s+/));
      return distance < min.distance ? { keyword, distance } : min;
    },
    { keyword: "", distance: Infinity }
  ).keyword;

  return keywordArray.indexOf(closestA) - keywordArray.indexOf(closestB);
}
function customSortss(objA, objB) {
  const rotbaA = objA.rotba.toLowerCase();
  const rotbaB = objB.rotba.toLowerCase();
  // Check if any keyword from keywordArray is present in rotba
  const containsKeywordA = keywordArray.some((keyword) =>
    rotbaA.includes(keyword)
  );
  const containsKeywordB = keywordArray.some((keyword) =>
    rotbaB.includes(keyword)
  );

  // Sort based on the presence of keywords
  if (containsKeywordA && !containsKeywordB) {
    return -1;
  } else if (!containsKeywordA && containsKeywordB) {
    return 1;
  } else {
    return 0;
  }
}

async function getData() {
  const db_personals = await personalsTable.toArray();
  const personals = db_personals.filter(
    (user) => !user.rotba.includes("أستاذ")
  );
  const sortedArray = personals.sort(customSort); // personals.sort(customSort) orderArray(personals); //
  generateHtml(sortedArray);
}
getData();
function generateHtml(sortedArray) {
  const size = 29;
  const chunks = Array.from(
    { length: Math.ceil(sortedArray.length / size) },
    (_, index) => sortedArray.slice(index * size, (index + 1) * size)
  );

  const insertedTablesElement = _.getid("insertedTabels");
  insertedTablesElement.innerHTML = chunks.reduce((html, chunk, index) => {
    const htmlTable = templateIdara(chunk, size, index);
    // Wrap every two tables in a <div class="w-100 flex gap-3"></div>
    if (index % 2 === 0) {
      html += `<div class="sheet p-10mm"><div class="w-100 flex gap-3">`;
    }
    html += htmlTable;
    // Close the div after every second table
    if (index % 2 === 1 || index === chunks.length - 1) {
      html += `</div></div>`;
    }
    return html;
  }, "");
}

function generateHtmls(sortedArray) {
  const one = sortedArray.slice(0, 19);
  const two = sortedArray.slice(20, 39);
  _.getid("insertedTabels").innerHTML = templateIdara(one);
  _.getid("insertedTabels").innerHTML += templateIdara(one);
}

function templateIdara(data, size, page) {
  return `<div class="w-50"><table class="table mb-0 fs-4 hacen text-center">
    <thead>
        <tr>
        <th class="rotate">
            <div>الرقم التسلسلي</div>
        </th>
        <th class="rotate">
            <div>عدد المناصب</div>
        </th>
        <th>
        اللقب والاسم
         
        </th>
        <th>الرتبة</th>

        <th style="width:78px">تاريخ الميلاد</th>
        <th>أقصى درجة جامعية</th>
        <th>الصفة</th>
        <th style="width:78px">تاريخ أول تعيين بهذه الصفة</th>
        <th style="width:78px">تاريخ التعيين بالمؤسسة</th>
        </tr>
    </thead>
    <tbody>
    ${data
      .map((e, i) => {
        return `
                <tr>
                  <td class="rotate">
                      <div> ${page * size + i + 1}</div>
                  </td>
                  <td class="rotate">
                      <div> ${getManasib(e.rotba, data, e.matt)} </div>
                  </td>
                  <td>${e.nom} ${e.prenom}
                  </td>
                  <td>${e.rotba}</td>
                  <td>${e.birthday}</td>
                  <td>${getSchool(e.education)} </td>
                  <td>${e.Administrative_status}</td>
                  <td>${getdateSifa(e.total_services, e.rotba)}</td>
                  <td>${e.current_school_date}  </td>
                    </tr>
                  `;
      })
      .join("")}</tbody>
</table></div>`;
}
function getSchool(education) {
  const educ = JSON.parse(education);
  const lastQualification = educ.reduce(
    (acc, current) => current.qualification,
    ""
  );

  return lastQualification;
}
const getManasib = (rotba, data, matt) => {
  const res = data.filter((d) => d.rotba.includes(rotba));
  const index = res.findIndex((d) => Number(d.matt) == Number(matt));

  const total = res.length;
  return `${total}/${index + 1}`;
};

function getdateSifa(total_services, rotba) {
  const services = JSON.parse(total_services);
  const res = services.filter((d) => d.rotba.includes(rotba));
  return res[0] ? res[0].from : "";
}
