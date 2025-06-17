import { _ } from "../../../../core/helpers/helpers.js";
import { kafaa, mi3yar, module, mawarid } from "./help.js";
_.getid("logo").innerHTML = "";
_.getid("module").innerHTML =
  ` <option value="">اختر المادة</option>` +
  module.map((m) => ` <option value="${m.id}">${m.name}</option>`).join("");

_.btnEvent(_.getid("state"), "click", startState);
_.btnEvent(_.getid("module"), "change", () => {
  if (_.getid("module").value == "0") {
    document.querySelectorAll(".student").forEach(function (element) {
      element.classList.add("d-none");
    });
    document.querySelectorAll(".modir").forEach(function (element) {
      element.classList.remove("d-none");
    });
  } else {
    document.querySelectorAll(".modir").forEach(function (element) {
      element.classList.add("d-none");
    });
    document.querySelectorAll(".student").forEach(function (element) {
      element.classList.remove("d-none");
    });
  }
});

async function startState() {
  const module = _.getid("module").value;
  const fileInput = _.getid("file");
  if (fileInput.files.length == 0 || module == "")
    return alert("يجب اختيار المادة والملف");
  const data = await _.readMXls(fileInput.files);
  if (module == "0") {
    modir(data);
  } else {
    action(data);
  }
}
function mergeAndSumArrays(arrays) {
  // Check if the input array has data
  if (!arrays || arrays.length === 0) return [];

  // Initialize the result with a deep clone of the first array's structure
  const result = arrays[0].map((row) => [...row]);

  // Sum numeric values across the arrays
  arrays.slice(1).forEach((array) => {
    array.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        // Start summing from index 2 (skipping first two elements that are non-numeric labels)
        if (colIndex >= 2 && typeof value === "number") {
          result[rowIndex][colIndex] += value;
        }
      });
    });
  });

  return result;
}
function action(data) {
  let students = [];
  let total = [];
  let kafaa, mi3yar;
  for (let index = 0; index < data.length; index++) {
    const list = data[index].content[0]["sheetData"];
    if (index === 0) kafaa = fillArray(list[0]);
    if (index === 0) mi3yar = list[1];
    total.push(list.slice(-4));
    students.push(list.slice(2, -4).filter((s) => s[2] != "غ"));
  }
  const newStudents = students.flat();
  const newTotal = mergeAndSumArrays(total);
  const { index, array } = sumAndAppend2D(newTotal, newStudents);
  console.log(array);
  fillTableOne(index, _.getid("type").value);
  if (_.getid("type").value == "2") {
    fillTableTwo(index, newStudents);
  } else {
    fillTableThree(index, newStudents);
  }
  if (_.getid("type").value == "2") {
    studentsList(index, newStudents);
  }

  /*
  const list = Object.values(data[0])[0];
  let num = 1; // Starting number
  const kafaa = fillArray(list[0]);
  const mi3yar = list[1];
  const students = list.slice(2, -4).filter((s) => s[2] != "غ");
  const total = list.slice(-4);
  const { index, array } = sumAndAppend2D(total, students);
  fillTableOne(index, _.getid("type").value);
  if (_.getid("type").value == "2") {
    fillTableTwo(index, students);
  } else {
    fillTableThree(index, students);
  }
  if (_.getid("type").value == "2") {
    studentsList(index, students);
  }
    */
}

function fillTableOne(index, type) {
  const t = type == "1" ? "للمادة" : "للفوج";
  _.getid("title").innerHTML = `بطاقة وصفية لصعوبات التعلم ${t}`;
  const thead = `
   <thead>
        <tr>
          <th width="230px">الكفاءات</th>
          ${kafaa
            .filter((k) => k.moduleId == _.getid("module").value)
            .map(
              (m) => `
            <th colspan="${m.ma3yarnbr}"> الكفاءة ${m.id}</th>
            `
            )
            .join("")}
        </tr>
      </thead>
  `;

  const getMi3yar = mi3yar.filter((m) => m.moduleId == _.getid("module").value);
  if (getMi3yar.length === 0) return false;
  const tbody = `
   <tbody>
        <tr>
          <td>أرقام المعايير ذات الأداء المنخفض: C + D</td>
          ${index
            .map((i) => {
              if (i === -1) {
                return `<td width="${80 / getMi3yar.length}%"></td>`;
              } else {
                return `<td width="${80 / getMi3yar.length}%"> ${
                  getMi3yar[i].m
                }</td>`;
              }
            })
            .join("")}
        </tr>
      </tbody>
  `;

  _.getid("tableone").innerHTML = thead + tbody;
}

function fillTableTwo(index, students) {
  const thead = `
   <thead>
        <tr>
          <th>المادة</th>
          <th>الكفاءة</th>
          <th>رقم المعيار</th>
          <th>توصيف المعيار</th>
          <th width="190px">الموارد المتعلقة بالمعيار</th>
          <th>نمط المعالجة</th>
          <th>فترة المعالجة</th>
          <th>أسماء التلاميذ</th>
        </tr>
      </thead>
  `;

  const getMi3yar = mi3yar.filter((m) => m.moduleId == _.getid("module").value);
  if (getMi3yar.length === 0) return false;

  let renderedKafaaIds = new Set();
  var start = 0;
  const tbody = `
     <tbody>
     ${getMi3yar
       .map((m, x) => {
         if (index[x] == -1) return "";
         const rowspan = getMi3yar.filter(
           (gm, i) => gm.kafaaId === m.kafaaId && index[i] != -1
         ).length;
         const html = `
          <tr>
          ${
            start == 0
              ? `
          <td  rowspan="${index.filter((i) => i != -1).length}">${
                  module.find((mo) => mo.id === m.moduleId).name
                }</td>
          `
              : ""
          }
          
          ${
            !renderedKafaaIds.has(m.kafaaId)
              ? `<td rowspan="${rowspan}">${m.kafaaId}</td>`
              : ""
          }
          <td>${m.m}</td>
          <td>${m.name}</td>
          <td class="text-right">${
            mawarid
              .filter((m) => m.moduleId == _.getid("module").value)
              .find((mw) => mw.kafaaId === m.kafaaId && mw.mi3yarId === m.m)
              ?.name || ""
          }</td>
          <td>التفويج - الطرائق - الاستراتيجيات</td>
          <td>${
            mawarid
              .filter((m) => m.moduleId == _.getid("module").value)
              .find((mw) => mw.kafaaId === m.kafaaId && mw.mi3yarId === m.m)
              ?.method || ""
          }</td>
          <td class="text-right">
          ${students
            .filter((st) => st[x + 2] == "ج" || st[x + 2] == "د")
            .map((s) => s[0])
            .join(" - ")}</td>
          </tr>`;
         renderedKafaaIds.add(m.kafaaId);
         start = 1;
         return html;
       })
       .join("")}
      </tbody> 
  `;

  _.getid("tabletwo").innerHTML = thead + tbody;
}

function fillTableThree(index, students) {
  const thead = `
   <thead>
        <tr>
          <th>المادة</th>
          <th>رقم ونص الكفاء</th>
          <th>طبيعة الكفاءة</th>
          <th>رقم المعيار</th>
          <th>عدد المتعثرين</th>
          <th>توصيف المعيار</th>
          <th> الموارد المعرفية المتعلقة بالمعيار</th>
        </tr>
      </thead>
  `;

  const getMi3yar = mi3yar.filter((m) => m.moduleId == _.getid("module").value);
  let renderedKafaaIds = new Set();

  var start = 0;
  const tbody = `
     <tbody>
     ${getMi3yar
       .map((m, x) => {
         if (index[x] == -1) return "";
         const rowspan = getMi3yar.filter(
           (gm, i) => gm.kafaaId === m.kafaaId && index[i] != -1
         ).length;

         const html = `
          <tr>
          ${
            start == 0
              ? `
          <td  rowspan="${index.filter((i) => i != -1).length}">${
                  module.find((mo) => mo.id === m.moduleId).name
                }</td>
          `
              : ""
          }
          
          ${
            !renderedKafaaIds.has(m.kafaaId)
              ? `<td rowspan="${rowspan}">(${m.kafaaId}) ${
                  kafaa.find(
                    (k) => m.moduleId === k.moduleId && k.id === m.kafaaId
                  ).name
                }</td>`
              : ""
          }
               <td>${
                 mawarid
                   .filter((m) => m.moduleId == _.getid("module").value)
                   .find(
                     (mw) => mw.kafaaId === m.kafaaId && mw.mi3yarId === m.m
                   )?.method || ""
               }</td>
          <td>${m.m}</td>
          <td>${
            students.filter((st) => st[x + 2] == "ج" || st[x + 2] == "د").length
          } من ${students.length}</td>
          <td>${m.name}</td>
          <td class="text-right">${
            mawarid
              .filter((m) => m.moduleId == _.getid("module").value)
              .find((mw) => mw.kafaaId === m.kafaaId && mw.mi3yarId === m.m)
              ?.name || ""
          }</td>
          </tr>`;
         renderedKafaaIds.add(m.kafaaId);
         start = 1;
         return html;
       })
       .join("")}
      </tbody> 
  `;

  _.getid("tabletwo").innerHTML = thead + tbody;
}

const fillArray = (arr) => {
  let currentNum;
  return arr.map((item) =>
    item === ""
      ? currentNum
      : typeof item === "number"
      ? (currentNum = item)
      : item
  );
};

function pers(value, students) {
  return students.length / value;
}
function sumAndAppend2D(arr, students) {
  if (arr.length < 4 || arr[2].length !== arr[3].length) return arr;
  arr.push(
    arr[2].map((_, i) =>
      i === 0
        ? "Sum"
        : typeof arr[2][i] === "number" && typeof arr[3][i] === "number"
        ? arr[2][i] + arr[3][i]
        : ""
    )
  );
  const lastArray = arr[arr.length - 1];
  const maxVal = Math.max(
    ...lastArray.filter((val) => typeof val === "number")
  );
  const calcValue = _.getid("calc").value;
  const calc =
    calcValue == "1"
      ? pers(3, students)
      : calcValue == "2"
      ? pers(4, students)
      : calcValue == "3"
      ? maxVal / 2
      : 0;
  // const halfVal = maxVal / 2;
  const index = lastArray
    .map((val, index) => (typeof val === "number" && val >= calc ? index : -1))
    .slice(2, -4)
    .map((i) => (i != -1 ? i - 2 : -1));
  return { index, array: arr };
}

function studentsList(index, students) {
  //     <div class="flex-item btn-Pink">gsd</div>
  const thead = `
   <thead>
        <tr>
          <th>الكفاءة</th>
          <th>المعيار</th>
          <th rwospan="2">أسماء التلاميذ</th>
        </tr>
      </thead>
  `;

  const getMi3yar = mi3yar.filter((m) => m.moduleId == _.getid("module").value);
  if (getMi3yar.length === 0) return false;

  let renderedKafaaIds = new Set();

  var start = 0;
  const tbody = `
     <tbody>
     ${getMi3yar
       .map((m, x) => {
         if (index[x] == -1) return "";
         const rowspan = getMi3yar.filter(
           (gm, i) => gm.kafaaId === m.kafaaId && index[i] != -1
         ).length;

         const html = `
          <tr>
          ${
            !renderedKafaaIds.has(m.kafaaId)
              ? `<td rowspan="${rowspan}">${m.kafaaId}</td>`
              : ""
          }
          <td>(${m.m}) ${m.name}</td>
          
          <td class="text-right">
          <table>
          <thead>
          <tr>
            <th>اسم التلميذ</th>
            <th>التقييم </th>
          </tr>
          </thead>
          ${students
            .filter((st) => st[x + 2] == "ج" || st[x + 2] == "د")
            .sort((a, b) => a[x + 2].localeCompare(b[x + 2], "ar"))
            .map(
              (s) =>
                `<tr> <td>${s[0]}</td>  <td style="background: ${
                  s[x + 2] == "ج" ? "#fbd4b4" : "#c00000"
                }"> ${s[x + 2]}</td></tr>`
            )
            .join("")}
             </table>
            </td>
          </tr>`;
         renderedKafaaIds.add(m.kafaaId);
         start = 1;
         return html;
       })
       .join("")}
      </tbody> 
  `;

  _.getid("lists").innerHTML = thead + tbody;
}

// modir
async function modir(data) {
  const list = data[0].content[0]["sheetData"];
  const total = list.slice(-4);
  const kafaa = list[0].slice(1, -4);

  const studentsList = list.slice(2, -4).filter((s) => s[2] != "غ");
  const students = removeSport(studentsList);
  const { index, array } = sumAndAppend2D(total, students);
  const sum = array.pop().slice(1, -4);
  fillTableModirOne(sum, kafaa);
  fillTableModirTwo(students);
}

function fillTableModirOne(sum, kafaa) {
  const thead = `
   <thead>
        <tr>
          <th>المواد التعليمية</th>
          <th>عدد التلاميذ المتعثرين (مجموع d+c عموديا)</th>
          <th colspan="2">حدد مستوى التحكم في الكفاءة الشاملة للمادة (X)</th>
          <th>رؤية المدير ف إسناد الأفواج التربوية إلى الأساتذة الآتية أسماؤهم</th>
        </tr>
      </thead>
  `;
  const tbody = `
   <tbody>
   ${sum
     .map((s, i) => {
       return `
       <tr>
    <td rowspan="2">${kafaa[i]}</td>
    <td rowspan="2">${s}</td>
    <td>1.	مادة ذات أداء منخفض</td>
    <td>⬜</td>
    <td rowspan="2">.....................</td>
  </tr>
  <tr>
    <td> 2.	مادة ذات أداء غير منخفض</td>
    <td>⬜  </td>
  </tr>
     `;
     })
     .join("")}
      </tbody>
  `;

  document.getElementById("tone").innerHTML = thead + tbody;
}

async function fillTableModirTwo(students) {
  console.log(students);

  const newStudents = _.getid("amaz").checked ? removeAmaz(students) : students;

  const getStudents = await _.fetchData(
    "/scolarite/passage_eleves/dossier_eleve/list_eleves",
    {
      mode: "cors",
      credentials: "include",
      redirect: "manual", // Handle redirects manually
    }
  );
  const sData = getStudents.data;
  const result = calc(newStudents, _.getid("amaz").checked);

  const thead = `
   <thead>
        <tr>
          <th colspan="2">العدد الإجمالي لتلاميذ الكوكبة</th>
          <th colspan="2">${students.length}</th>
        </tr>
        <tr>
          <th colspan="4">تشكيل المجموعات</th>
        </tr>
        <tr>
          <th>المجموعة الأولى  مستوى التحكم (أ)</th>
          <th>المجموعة الأولى  مستوى التحكم (أ+ب)</th>
          <th>المجموعة الأولى  مستوى التحكم (أ+ب+ج)</th>
          <th>المجموعة الأولى  مستوى التحكم (أ+ب+ج+د)</th>
        </tr>
      </thead>
  `;
  const tbody = `
   <tbody>
       <tr>
       ${Object.entries(result)
         .map((r, i) => {
           return `  <td> العدد: ${r[1].length}</td>`;
         })
         .join("")}
        </tr>
       <tr>
  
   ${Object.entries(result)
     .map((r, i) => {
       return `
           <td style="vertical-align: baseline;"> ${r[1]
             .map((s, x) => {
               const cs = sData.find((a) => Number(a[0]) === s[0]);

               return cs
                 ? `<div>${x + 1}- ${cs[1]} ${cs[2]}</br></div>`
                 : `<div>${x + 1}- ${s[0]} (تلميذ محول)</br></div>`;
             })
             .join("")}</td>
    `;
     })
     .join("")}
        </tr>
       
      </tbody>
  `;

  document.getElementById("ttwo").innerHTML = thead + tbody;
}

function removeAmaz(students) {
  return students.map((s) => {
    s.splice(2, 1);
    s[s.length - 4] = s.filter((item) => item === "أ").length;
    s[s.length - 3] = s.filter((item) => item === "ب").length;
    s[s.length - 2] = s.filter((item) => item === "ج").length;
    s[s.length - 1] = s.filter((item) => item === "د").length;
    return s;
  });
}

function removeSport(students) {
  return students.map((s) => {
    s.splice(11, 1);
    s[s.length - 4] = s.filter((item) => item === "أ").length;
    s[s.length - 3] = s.filter((item) => item === "ب").length;
    s[s.length - 2] = s.filter((item) => item === "ج").length;
    s[s.length - 1] = s.filter((item) => item === "د").length;
    return s;
  });
}

function calc(students, amz) {
  const data = { a: [], b: [], c: [], d: [] };
  const len = students.length;
  const index = amz ? 9 : 10;
  for (let i = 0; i < students.length; i++) {
    const s = students[i]; // Get the current student

    if (s.at(-4) === index) {
      data.a.push(s);
      students.splice(i, 1); // Remove the student
      i--; // Adjust the index to account for the removed item
      continue; // Move to the next iteration
    }

    if (s.at(-3) + s.at(-4) === index) {
      data.b.push(s);
      students.splice(i, 1);
      i--;
      continue;
    }

    if (s.at(-2) + s.at(-3) + s.at(-4) === index) {
      data.c.push(s);
      students.splice(i, 1);
      i--;
      continue;
    }

    if (s.at(-1) + s.at(-2) + s.at(-3) + s.at(-4) === index) {
      data.d.push(s);
      students.splice(i, 1);
      i--;
      continue;
    }
  }
  return data;
}
