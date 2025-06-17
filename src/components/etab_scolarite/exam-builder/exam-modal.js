import {
  exambuilderTable,
  moyexambuilderTable,
  studentsTable,
  hallsTable,
  examDistributionTable,
  examStudentsTable,
  examHallsTable,
  examGroupsTable,
} from "../../../../core/db/conn.js";
import { last_year, this_year } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

//
document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("examsBuilderModal"):
      getDivsData();
      loadHalls();
      loadExams();
      break;
    case classList.contains("getLastMoyenSanawi"):
      getLastMoyenSanawi();
      break;
    case classList.contains("getMoyenByTri"):
      const id = event.target.dataset.id;
      getMoyenByTri(id);
      break;
    case classList.contains("saveExamData"):
      saveExamData();
      break;
    case classList.contains("saveDistribution"):
      saveDistribution();
      break;
    case classList.contains("emptyExamBuilderDatabase"):
      emptyExamBuilderDatabase();
      break;
    case classList.contains("saveHall"):
      saveHall();
      break;

    case classList.contains("cancelBtn"):
      resetHallForm();
      break;
    //
  }
});

async function emptyExamBuilderDatabase() {
  const deleteConfirm = confirm(
    "هل تريد حذف كل بيانات الامتحانات وجميع الجداول المرتبطة بها؟"
  );
  if (!deleteConfirm) return;

  try {
    await Promise.all([
      exambuilderTable.clear(),
      moyexambuilderTable.clear(),
      examDistributionTable.clear(),
      examStudentsTable.clear(),
      examHallsTable.clear(),
      examGroupsTable.clear(),
    ]);

    notify.toast({
      type: "done",
      color: "success",
      message: "تم حذف كل بيانات الامتحانات وجميع الجداول المرتبطة بها بنجاح",
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء حذف البيانات",
    });
  }
}

let examsNivs = [];
async function getDivsData() {
  const results = await studentsTable
    .where("s_annee")
    .equals(this_year)
    .toArray();

  const uniqueSections = [
    ...new Set(
      results.map((student) => {
        const section =
          _.isLycee() &&
          !_.isNull(student.s_choaba) &&
          !_.isNull(student.s_section)
            ? `${student.s_niv.trim()}-${student.s_choaba.trim()}-${
                student.s_section
              }`
            : `${student.s_niv.trim()}-${student.s_section}`;
        return section;
      })
    ),
  ].sort();

  const customOrder = ["أولى", "ثانية", "ثالثة"];
  uniqueSections.sort((a, b) => {
    const levelA = a.split("-")[0];
    const levelB = b.split("-")[0];
    return customOrder.indexOf(levelA) - customOrder.indexOf(levelB);
  });

  const sectionsHTML = uniqueSections
    .map((section) => `<option value="${section}">${section}</option>`)
    .join("");

  document.getElementById("sections").innerHTML = sectionsHTML;
}

document.addEventListener("change", (event) => {
  switch (event.target.id) {
    case "levels":
      setLevels(event);
      break;
    case "divisions":
      setDivisions(event);
      break;
    case "fawj":
      getStudentsListExam(event);
      break;
    case "triexambuilder2":
      examsList();
      break;
    case "examSelect":
      loadDistributionData(event.target.value);
      break;
    case "editExamSelect":
      loadExamData(event.target.value);
      break;
    default:
      break;
  }
});

function setLevels(event) {
  const niv = event.target.value;
  const divisions = [
    ...new Set(examsNivs[0].filter((e) => e[0].includes(niv)).map((e) => e[1])),
  ];
  const id = _.isLycee() ? "divisions" : "fawj";
  _.getid(id).innerHTML =
    '<option value=""> --الرجاء الاختيار -- </option>' +
    divisions.map((e) => ` <option value="${e}">${e}</option>`).join("");
  getStudentsListExam();
}

function setDivisions(event) {
  const niv = _.getid("levels").value;
  const div = event.target.value;
  const level = examsNivs[0].filter(
    (e) => e[0].includes(niv) && e[1].includes(div)
  );
  const levelOptions = [...new Set(level.map((e) => e[2]))].map(
    (e) => `<option value="${e}">${e}</option>`
  );
  _.getid("fawj").innerHTML =
    '<option value=""> --الرجاء الاختيار -- </option>' + levelOptions.join("");
  getStudentsListExam();
}

async function getStudentsListExam(event) {
  const niv = _.getid("levels").value;
  const div = _.getid("divisions").value;
  const fawj = _.getid("fawj").value;
  let students = await studentsTable
    .where({ s_niv: `${niv.trim()}`, s_annee: this_year })
    .and((eleve) => eleve.s_section.includes(fawj))
    .and((eleve) => (_.isLycee() ? eleve.s_choaba.includes(div.trim()) : true))
    .toArray();
  _.getid("totalStudents").innerHTML = `العدد: ${students.length}`;
  _.getid("excStudents").innerHTML = students.map(
    (e) =>
      `<option value="${e.s_matt}">${e.s_nom} ${e.s_prenom} [${e.s_birthday}]</option>`
  );
}

async function getLastMoyenSanawi() {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  const response = await _.fetchData(
    "scolarite/en_chiffre/suivi_bulletin/get_division",
    {
      annee: last_year,
      isAjax: true,
    },
    "text"
  );
  const optionArray = response
    .match(/<option value='(.*?)'>(.*?)<\/option>/g)
    .map((option) => {
      const match = option.match(/<option value='(.*?)'>(.*?)<\/option>/);
      return { value: match[1], text: match[2].trim() };
    })
    .filter((option) => option.value !== "");
  const results = [];
  // get moys
  const total = optionArray.length;
  for (let index = 0; index < total; index++) {
    const element = optionArray[index];
    const moys = await _.fetchData(
      "scolarite/en_chiffre/suivi_bulletin/get_eleves_etab",
      {
        annee: last_year,
        division: element.value,
        isAjax: true,
      },
      "text"
    );
    results.push(JSON.parse(moys).data);
    _.getid("countExamNote").innerHTML = ` تم تحميل ${index + 1}  من ${total}`;
    await _.sleep(600);
  }
  const index = _.isLycee() ? 6 : 5;
  const list = results.flat().map((u) => {
    return {
      matt: Number(u[0]),
      lastYear: u[u.length - 1],
      annee: this_year,
    };
  });

  const getMoys = await moyexambuilderTable
    .where({ annee: this_year })
    .and((note) => note.this_year != "")
    .toArray();
  const uniqueItems = _.unique_with_number(list, getMoys, "matt");
  await moyexambuilderTable.bulkAdd(uniqueItems);
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت العملية بنجاح",
  });
  _.getid("countExamNote").innerHTML = ``;
}

async function getMoyenByTri(tri) {
  try {
    notify.toast({
      type: "warning",
      color: "warning",
      message: "الرجاء الانتظار حتى اكتمال العملية",
    });

    // Get divisions data
    const divisions = await fetchDivisions();
    if (!divisions.length) {
      throw new Error("No divisions found");
    }

    // Process each division and collect results
    const results = await processDivisions(divisions, tri);

    // Update database with results
    await updateMoyenDatabase(results, tri);

    notify.toast({
      type: "done",
      color: "success",
      message: "تمت العملية بنجاح",
    });
    _.getid("countExamNote").innerHTML = ``;
  } catch (error) {
    console.error("Error in getMoyenByTri:", error);
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء العملية",
    });
  }
}

async function fetchDivisions() {
  const response = await _.fetchData(
    "scolarite/en_chiffre/suivi_bulletin/get_division",
    {
      annee: this_year,
      isAjax: true,
    },
    "text"
  );

  return response
    .match(/<option value='(.*?)'>(.*?)<\/option>/g)
    .map((option) => {
      const match = option.match(/<option value='(.*?)'>(.*?)<\/option>/);
      return { value: match[1], text: match[2].trim() };
    })
    .filter((option) => option.value !== "");
}

async function processDivisions(divisions, tri) {
  const results = [];
  const total = divisions.length;

  for (let index = 0; index < total; index++) {
    const division = divisions[index];
    const moys = await fetchDivisionMoys(division.value);
    results.push(JSON.parse(moys).data);

    _.getid("countExamNote").innerHTML = ` تم تحميل ${index + 1}  من ${total}`;
    await _.sleep(600);
  }

  return results.flat();
}

async function fetchDivisionMoys(divisionValue) {
  return await _.fetchData(
    "scolarite/en_chiffre/suivi_bulletin/get_eleves_etab",
    {
      annee: this_year,
      division: divisionValue,
      isAjax: true,
    },
    "text"
  );
}

async function updateMoyenDatabase(results, tri) {
  const moyIndex = tri == 1 ? 8 : tri == 2 ? 9 : 10;

  for (const student of results) {
    const existingRecord = await moyexambuilderTable
      .where({ matt: Number(student[0]), annee: this_year })
      .first();
    let data = {};
    if (existingRecord) {
      if (tri == 1) {
        data = {
          firstTrimester: student[moyIndex],
        };
      } else if (tri == 2) {
        data = {
          firstTrimester: student[moyIndex - 1],
          secondTrimester: student[moyIndex],
          bothTrimesters: (
            (Number(student[moyIndex]) + Number(student[moyIndex - 1])) /
            2
          ).toFixed(2),
        };
      } else {
        data = {};
      }
      await moyexambuilderTable
        .where({ matt: Number(student[0]), annee: this_year })
        .modify(data);
    } else {
      await moyexambuilderTable.add({
        matt: Number(student[0]),
        firstTrimester: student[moyIndex],
        annee: this_year,
      });
    }
  }
}

// تحميل الامتحانات في قائمة الاختيار
async function loadExams() {
  try {
    const exams = await exambuilderTable.toArray();
    const examSelect = document.getElementById("examSelect");
    const editExamSelect = document.getElementById("editExamSelect");

    const optionsHTML =
      '<option value="">--الرجاء الاختيار --</option>' +
      exams
        .map((exam) => {
          const sections = exam.sections ? exam.sections.join("، ") : "";
          return `<option value="${exam.id}">${exam.title} - ${sections}</option>`;
        })
        .join("");

    examSelect.innerHTML = optionsHTML;
    editExamSelect.innerHTML =
      '<option value="">--إضافة امتحان جديد--</option>' +
      exams
        .map((exam) => {
          const sections = exam.sections ? exam.sections.join("، ") : "";
          return `<option value="${exam.id}">${exam.title} - ${sections}</option>`;
        })
        .join("");
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء تحميل الامتحانات",
    });
  }
}

// حفظ بيانات الامتحان
async function saveExamData() {
  try {
    const examId = document.getElementById("editExamSelect").value;
    const selectedSections = Array.from(
      document.getElementById("sections").selectedOptions
    ).map((option) => option.value);
    const selectedHalls = Array.from(
      document.getElementById("selectedHalls").selectedOptions
    ).map((option) => option.value);

    if (!selectedSections.length || !selectedHalls.length) {
      notify.toast({
        type: "error",
        color: "error",
        message: "يرجى اختيار الأقسام والقاعات",
      });
      return;
    }

    const formData = {
      annee: this_year,
      tri: Number(document.getElementById("triexambuilder").value),
      title: document.getElementById("title").value,
      color: document.getElementById("color").value,
      sections: selectedSections,
      selectedHalls: selectedHalls,
      createdAt: new Date(),
    };

    if (!formData.tri || !formData.title) {
      notify.toast({
        type: "error",
        color: "error",
        message: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    if (examId) {
      await exambuilderTable.update(Number(examId), formData);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم تحديث الامتحان بنجاح",
      });
    } else {
      await exambuilderTable.add(formData);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم إضافة الامتحان بنجاح",
      });
    }

    loadExams();
    resetExamForm();
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء حفظ الامتحان",
    });
  }
}

// حفظ توزيع التلاميذ
async function saveDistribution() {
  try {
    const examId = document.getElementById("examSelect").value;
    if (!examId) {
      notify.toast({
        type: "error",
        color: "error",
        message: "يرجى اختيار الامتحان",
      });
      return;
    }

    const distributionData = {
      examId: Number(examId),
      direction: document.getElementById("distributionDirection").value,
      criteria: document.getElementById("distributionCriteria").value,
      scope: document.getElementById("distributionScope").value,
      startNumber: Number(document.getElementById("studentsStartNum").value),
    };

    if (
      !distributionData.direction ||
      !distributionData.criteria ||
      !distributionData.scope
    ) {
      notify.toast({
        type: "error",
        color: "error",
        message: "يرجى ملء جميع حقول التوزيع",
      });
      return;
    }

    // التحقق من وجود توزيع سابق لهذا الامتحان
    const existingDistribution = await examDistributionTable
      .where("examId")
      .equals(Number(examId))
      .first();

    if (existingDistribution) {
      // تحديث التوزيع الموجود
      await examDistributionTable.update(
        existingDistribution.id,
        distributionData
      );
    } else {
      // إضافة توزيع جديد
      await examDistributionTable.add(distributionData);
    }

    // توزيع التلاميذ
    await distributeStudents(distributionData);

    notify.toast({
      type: "done",
      color: "success",
      message: "تم حفظ التوزيع بنجاح",
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء حفظ التوزيع",
    });
  }
}

function sortStudents(allStudents, distributionData) {
  // ترتيب التلاميذ حسب المعيار المختار
  allStudents.sort((a, b) => {
    switch (distributionData.criteria) {
      case "name":
        return a.s_nom.localeCompare(b.s_nom);
      case "lastname":
        return a.s_prenom.localeCompare(b.s_prenom);
      case "division":
        return a.s_section - b.s_section;
      case "gender":
        return a.s_gender.localeCompare(b.s_gender);
      case "age":
        return new Date(a.s_birthday) - new Date(b.s_birthday);
      case "firstTrimester":
        return Number(a?.firstTrimester || 0) - Number(b?.firstTrimester || 0);
      case "secondTrimester":
        return (
          Number(a?.secondTrimester || 0) - Number(b?.secondTrimester || 0)
        );
      case "bothTrimesters":
        return Number(a?.bothTrimesters || 0) - Number(b?.bothTrimesters || 0);
      case "lastYear":
        return Number(a?.lastYear || 0) - Number(b?.lastYear || 0);
      // ... باقي المعايير
    }
  });

  // عكس الترتيب إذا كان تنازلياً
  if (distributionData.direction === "descending") {
    allStudents.reverse();
  }
  return allStudents;
}

// توزيع التلاميذ
async function distributeStudents(distributionData) {
  const exam = await exambuilderTable.get(distributionData.examId);
  let allStudents = [];

  for (const section of exam.sections) {
    const [niv, choaba, sectionNum] = section.split("-");
    let sectionStudents = await studentsTable
      .where({ s_niv: niv, s_annee: this_year })
      .and((student) => student.s_section.includes(sectionNum))
      .and((student) =>
        _.isLycee() ? student.s_choaba.includes(choaba) : true
      )
      .toArray();
    const studentId = sectionStudents.map((student) => student.s_matt);
    const notes = await moyexambuilderTable
      .where("matt")
      .anyOf(studentId)
      .and((r) => r.annee === this_year)
      .toArray();
    sectionStudents = sectionStudents.map((student) => {
      const note = notes.find((n) => n.matt == student.s_matt);
      return { ...student, ...note };
    });

    if (distributionData.scope == "perDivision") {
      sectionStudents = sortStudents(sectionStudents, distributionData);
    }
    allStudents = [...allStudents, ...sectionStudents];
  }

  if (distributionData.scope == "allDivisions") {
    allStudents = sortStudents(allStudents, distributionData);
  }

  // توزيع التلاميذ على القاعات
  const halls = await hallsTable
    .where("id")
    .anyOf(exam.selectedHalls.map(Number))
    .toArray();
  // حساب السعة الكلية للقاعات
  const totalCapacity = halls.reduce((sum, hall) => sum + hall.capacity, 0);

  let currentHallIndex = 0;
  let currentNumber = distributionData.startNumber;
  let studentsInCurrentHall = 1;
  let totalDistributedStudents = 0;

  // حذف التوزيع السابق لهذا الامتحان
  await examStudentsTable.where("examId").equals(exam.id).delete();

  for (const student of allStudents) {
    // التحقق من عدم تجاوز السعة الكلية للقاعات
    if (totalDistributedStudents >= totalCapacity) {
      break;
    }

    const hall = halls[currentHallIndex];

    // التحقق من امتلاء القاعة الحالية
    if (studentsInCurrentHall >= hall.capacity) {
      currentHallIndex = (currentHallIndex + 1) % halls.length;
      studentsInCurrentHall = 0;
    }

    await examStudentsTable.add({
      examId: exam.id,
      studentId: student.s_matt,
      hallId: hall.id,
      number: currentNumber++,
    });

    studentsInCurrentHall++;
    totalDistributedStudents++;
  }
  // إظهار إشعار بعدد التلاميذ الذين تم توزيعهم
  notify.toast({
    type: "info",
    color: "info",
    message: `تم توزيع ${totalDistributedStudents} تلميذ من أصل ${allStudents.length} تلميذ`,
  });
}

// إعادة تعيين نموذج الامتحان
function resetExamForm() {
  document.getElementById("triexambuilder").value = "";
  document.getElementById("title").value = "";
  document.getElementById("color").value = "#2c7be5";
  document.getElementById("sections").value = "";
  document.getElementById("selectedHalls").value = "";
}

/** Show exams  */
//
async function examsList() {
  const tri = _.getid("triexambuilder2").value;
  let getExams = await exambuilderTable
    .where({ annee: this_year, tri: Number(tri) })
    .toArray();
  const existingDistributions = await examDistributionTable.toArray();
  getExams = getExams.map((exam) => {
    const existingDistribution = existingDistributions.find(
      (dist) => dist.examId === exam.id
    );
    exam.startNumber = existingDistribution?.startNumber || "";
    exam.direction = existingDistribution?.direction || "";
    exam.scope = existingDistribution?.scope || "";
    exam.criteria = existingDistribution?.criteria || "";
    return exam;
  });
  const html = html_template(getExams);
  _.getid("examsList").innerHTML = html;
  btn_action();
}
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
function html_template(getExams) {
  const html = getExams
    .map((exam) => {
      return `
     
            <div class="card mb-3 border border-color border-r-4 p-3 hacen fs-2" style="background: rgba(${
              hexToRgb(exam.color).r
            },${hexToRgb(exam.color).g},${hexToRgb(exam.color).b}, 0.4)">
                <div class="row w-100 d-flex">
                    <div class="w-50 px-3">
                        <h3 class="mb-1 hacen fs-2">
                             اسم المادة:
                            <b> ${exam.title} </b>
                        </h3>
                        <div class="d-flex flex-star gap-1">
                            <p class="mb-1">
                                الأقسام: <b> ${exam.sections.join(", ")}  </b>
                            </p>
                        </div>
                        <div class="d-flex flex-star gap-1">
                            <p class="mb-1">
                                عدد القاعات: <b> ${
                                  exam.selectedHalls.length
                                } </b>
                            </p>
                            
                         

                        </div>

                        <div class="d-flex flex-star gap-1">
                           <p class="mb-1">
                                نطاق التوزيع: <b> ${getScope(exam.scope)}</b>
                            </p>
                        </div>
                        <div class="d-flex flex-star gap-1">
                            <p class="mb-1">
                               اتجاه التوزيع : <b> ${rank_sort(
                                 exam.direction
                               )} </b>
                            </p>
                            <p class="mb-1">
                                معيار التوزيع: <b> ${rank_option(
                                  exam.criteria
                                )} </b>
                            </p>
                           
                        </div>
                         <div class="d-flex flex-star gap-1">
                          <p class="mb-1">
                                أرقام التسجيل تبدأ من: <b> ${
                                  exam.startNumber
                                } </b>
                            </p>
                         
                      </div>

                       
                    </div>
                    <div class="w-50 ui form">
                        <div class=" three fields">
                            <div class="field m-0">
                                <button data-id="${
                                  exam.id
                                }" data-page="fulllist" data-type="1" class="exam-fulllist mb-2 btn btn-info w-100">
                                    قائمة التلاميذ
                                </button>
                            </div>
                            <div class="field m-0">
                                <button data-id="${
                                  exam.id
                                }" data-page="bitaka" data-type="2" class="exam-bitaka mb-2 btn btn-dark w-100">
                                    بطاقة تقنية
                                </button>
                            </div>
                             <div class="field m-0">
                                <button data-id="${
                                  exam.id
                                }" data-page="studentslist" data-type="3" class="exam-studentslist mb-2 btn btn-Neutral w-100">
                                    قوائم التلاميذ
                                </button>
                            </div>
                              </div>


                              <div class=" two fields">
                                <div class="field m-0">
                                    <button data-id="${
                                      exam.id
                                    }" data-page="reports" data-type="4" class="exam-reports mb-2 btn btn-Amber w-100">
                                        محاضر التوقيع
                                    </button>
                                </div>
                                <div class="field m-0">
                                  <button data-id="${
                                    exam.id
                                  }" data-page="placenbr" data-type="5" class="exam-placenbr mb-2 btn btn-Pink w-100">
                                        ترقيم المقاعد
                                    </button>
                                </div>
                                <div class="field m-0">
                                    <button data-id="${
                                      exam.id
                                    }" data-page="sallnbr" data-type="6" class="exam-sallnbr  mb-2 btn btn-Blue w-100">
                                        ترقيم القاعات
                                    </button>
                                </div>
                              </div>

                              <div class=" two fields">
                                <div class="field m-0">
                                    <button data-id="${
                                      exam.id
                                    }" data-page="sectionsCasing" data-type="7" class="exam-sectionscasing  mb-2 btn btn-Cyan w-100">
                                        أغلفة القاعات
                                    </button>
                                </div>
                                <div class="field m-0">
                                    <button data-id="${
                                      exam.id
                                    }" data-type="8" data-page="presents" class="exam-presents  mb-2 btn btn-Indigo b-5 w-100">
                                        قائمة تأكيد الحضور
                                    </button>
                                </div>
                              </div>
                              <button data-id="${
                                exam.id
                              }" data-type="7" class="exam-delete  mb-2 btn btn-danger w-100">
                                  حذف بيانات الاختبار
                                </button>
                        </div>
                    </div>
                </div>
            </div>
    `;
    })
    .join("");
  return html;
}
function btn_action() {
  document.querySelectorAll(".exam-bitaka").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );
  document.querySelectorAll(".exam-fulllist").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );
  document.querySelectorAll(".exam-studentslist").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );
  document.querySelectorAll(".exam-placenbr").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );

  document.querySelectorAll(".exam-reports").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );

  document.querySelectorAll(".exam-sallnbr").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );
  document.querySelectorAll(".exam-sectionscasing").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );
  document.querySelectorAll(".exam-presents").forEach((element) =>
    element.addEventListener("click", (event) => {
      _.to(
        `exam-${event.target.getAttribute(
          "data-page"
        )}/${event.target.getAttribute("data-id")}/${event.target.getAttribute(
          "data-type"
        )}`
      );
    })
  );

  document.querySelectorAll(".exam-delete").forEach((element) =>
    element.addEventListener("click", (event) => {
      delete_exam(event.target.getAttribute("data-id"));
    })
  );
}
async function delete_exam(id) {
  const deleteConfirm = confirm("هل تريد حدف الإمتحان؟");
  if (!deleteConfirm) return;
  const e = await exambuilderTable.where("").equals(Number(id)).delete();
  notify.toast({
    type: "done",
    color: "success",
    message: "تمت حذف الامتحان بنجاح",
  });
  examsList();
}
function get_faid(id) {
  let r = ["توزيع على القاعات المتاحة فقط", "توزيع على قاعات إضافية"];
  return r[id - 1];
}
function rank_sort(direction) {
  const directions = {
    ascending: "تصاعديا",
    descending: "تنازليا",
  };
  return directions[direction] || "تصاعديا";
}

function getScope(scope) {
  const scopes = {
    allDivisions: "توزيع على جميع الأقسام",
    availableHalls: "توزيع على القاعات المتاحة فقط",
    additionalHalls: "توزيع على قاعات إضافية",
  };
  return scopes[scope] || "توزيع على القاعات المتاحة فقط";
}

function rank_option(criteria) {
  const criteriaOptions = {
    name: "الاسم",
    lastname: "اللقب",
    id: "رقم التعريف",
    gender: "الجنس",
    registrationNumber: "رقم التسجيل(القيد)",
    lastYearAverage: "المعدل السنوي للسنة الماضية",
    firstTrimester: "معدل الفصل الأول",
    secondTrimester: "معدل الفصل الثاني",
    bothTrimesters: "معدل الفصلي الأول والثاني",
  };
  return criteriaOptions[criteria] || "الاسم";
}

let editingHallId = null;

async function loadHallsList() {
  try {
    const halls = await hallsTable.toArray();
    const hallsList = document.getElementById("hallsList");

    // تحميل القاعات المحجوزة
    const reservedHalls = await examHallsTable.toArray();
    const reservedHallIds = new Set(reservedHalls.map((h) => h.hallId));

    hallsList.innerHTML = halls
      .map((hall) => {
        const isReserved = reservedHallIds.has(hall.id);
        return `
        <tr>
          <td>${hall.code || ""}</td>
          <td>${hall.name}</td>
          <td>${hall.capacity}</td>
          <td>${
            isReserved
              ? '<span class="text-danger">محجوزة</span>'
              : '<span class="text-success">متاحة</span>'
          }</td>
          <td>
            <button onclick="editHall(${
              hall.id
            })" class="btn btn-primary hacen" ${isReserved ? "disabled" : ""}>
              تعديل
            </button>
            <button onclick="deleteHall(${
              hall.id
            })" class="btn btn-danger hacen" ${isReserved ? "disabled" : ""}>
              حذف
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء تحميل قائمة القاعات",
    });
  }
}

// تحديث الدالة loadHalls لتقوم بتحميل كل من القائمة المنسدلة وجدول القاعات
async function loadHalls() {
  try {
    const halls = await hallsTable.toArray();
    const hallsSelect = document.getElementById("selectedHalls");

    // تحميل القاعات المحجوزة
    const reservedHalls = await examHallsTable.toArray();
    const reservedHallIds = new Set(reservedHalls.map((h) => h.hallId));

    // تحديث القائمة المنسدلة
    hallsSelect.innerHTML = halls
      .map((hall) => {
        const isReserved = reservedHallIds.has(hall.id);
        return `<option value="${hall.id}" ${isReserved ? "disabled" : ""}>
          ${hall.name} (السعة: ${hall.capacity}) ${isReserved ? "(محجوزة)" : ""}
        </option>`;
      })
      .join("");

    // تحديث جدول القاعات
    await loadHallsList();
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء تحميل القاعات",
    });
  }
}

// تحديث دالة saveHall لتحديث الجدول بعد الحفظ
async function saveHall() {
  try {
    const formData = {
      code: document.getElementById("hallCode").value.trim(),
      name: document.getElementById("hallName").value.trim(),
      capacity: parseInt(document.getElementById("hallCapacity").value),
      status: "متاحة",
    };

    if (!formData.code || !formData.name || !formData.capacity) {
      notify.toast({
        type: "error",
        color: "error",
        message: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    if (editingHallId) {
      await hallsTable.update(editingHallId, formData);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم تحديث القاعة بنجاح",
      });
    } else {
      await hallsTable.add(formData);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم إضافة القاعة بنجاح",
      });
    }
    resetHallForm();
    await loadHalls(); // تحديث كل من القائمة المنسدلة والجدول
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء حفظ القاعة",
    });
  }
}

// تحديث دالة deleteHall لتحديث الجدول بعد الحذف
window.deleteHall = async function (hallId) {
  try {
    const confirmDelete = confirm("هل أنت متأكد من حذف هذه القاعة؟");
    if (confirmDelete) {
      await hallsTable.delete(hallId);
      notify.toast({
        type: "done",
        color: "success",
        message: "تم حذف القاعة بنجاح",
      });
      await loadHalls(); // تحديث كل من القائمة المنسدلة والجدول
    }
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء حذف القاعة",
    });
  }
};

function resetHallForm() {
  document.getElementById("hallCode").value = "";
  document.getElementById("hallName").value = "";
  document.getElementById("hallCapacity").value = "";
  editingHallId = null;
  document.getElementById("formTitle").textContent = "إضافة قاعة جديدة";
  document.getElementById("cancelBtn").classList.add("hidden");
}

// دالة لتحميل بيانات التوزيع
async function loadDistributionData(examId) {
  try {
    if (!examId) {
      resetDistributionForm();
      return;
    }

    const distribution = await examDistributionTable
      .where("examId")
      .equals(Number(examId))
      .first();

    if (distribution) {
      document.getElementById("distributionDirection").value =
        distribution.direction;
      document.getElementById("distributionCriteria").value =
        distribution.criteria;
      document.getElementById("distributionScope").value = distribution.scope;
      document.getElementById("studentsStartNum").value =
        distribution.startNumber;
    } else {
      resetDistributionForm();
    }
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء تحميل بيانات التوزيع",
    });
  }
}

// دالة لإعادة تعيين نموذج التوزيع
function resetDistributionForm() {
  document.getElementById("distributionDirection").value = "";
  document.getElementById("distributionCriteria").value = "";
  document.getElementById("distributionScope").value = "";
  document.getElementById("studentsStartNum").value = "";
}

// دالة لتحميل بيانات الامتحان
async function loadExamData(examId) {
  try {
    if (!examId) {
      resetExamForm();
      return;
    }

    const exam = await exambuilderTable.get(Number(examId));
    if (exam) {
      document.getElementById("triexambuilder").value = exam.tri;
      document.getElementById("title").value = exam.title;
      document.getElementById("color").value = exam.color;

      // تحديث الأقسام المختارة
      const sectionsSelect = document.getElementById("sections");
      Array.from(sectionsSelect.options).forEach((option) => {
        option.selected = exam.sections.includes(option.value);
      });

      // تحديث القاعات المختارة
      const hallsSelect = document.getElementById("selectedHalls");
      Array.from(hallsSelect.options).forEach((option) => {
        option.selected = exam.selectedHalls.includes(option.value);
      });
    }
  } catch (error) {
    notify.toast({
      type: "error",
      color: "error",
      message: "حدث خطأ أثناء تحميل بيانات الامتحان",
    });
  }
}
