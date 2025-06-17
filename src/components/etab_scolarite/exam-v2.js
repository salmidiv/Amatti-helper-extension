console.log("run");
import {
  exambuilderTable,
  moyexambuilderTable,
  studentsTable,
  hallsTable,
  examHallsTable,
  examGroupsTable,
} from "../../../core/db/conn.js";
import { last_year, this_year } from "../../../core/helpers/const.js";
import { _ } from "../../../core/helpers/helpers.js";
import { notify } from "../../../core/helpers/notify.js";

// Event Listeners
document.addEventListener("click", async function (event) {
  const classList = event.target.classList;
  const target = event.target;
  initializeExamBuilder();
  // Handle edit hall button click
  if (target.closest(".edit-hall")) {
    const button = target.closest(".edit-hall");
    const hallId = button.dataset.id;
    await editHall(hallId);
    return;
  }

  // Handle other button clicks
  switch (true) {
    case classList.contains("save-exam-setup"):
      saveExamSetup();
      break;
    case classList.contains("add-hall"):
      addHall();
      break;
    case classList.contains("update-hall"):
      addHall();
      break;
    case classList.contains("distribute-students"):
      distributeStudents();
      break;
    case classList.contains("delete-hall"):
      deleteHall(event.target.dataset.id);
      break;
    case classList.contains("delete-exam"):
      deleteExam(event.target.dataset.id);
      break;
    case classList.contains("view-exam"):
      viewExam(event.target.dataset.id);
      break;
    case classList.contains("add-exam-group"):
      addExamGroup();
      break;
    case classList.contains("delete-exam-group"):
      deleteExamGroup(event.target.dataset.id);
      break;
  }
});

// Add change event listeners for select elements
document.addEventListener("change", async function (event) {
  switch (event.target.id) {
    case "exam-levels":
      await updateDivisions();
      break;
    case "exam-divisions":
      await updateGroups();
      break;
    case "exam-select":
      // No need to call loadExamGroups here since we removed the exam groups selection
      break;
  }
});

// Initialize the exam builder
async function initializeExamBuilder() {
  await loadLevels();
  await loadHalls();
  await loadHallsForExamSetup();
  await loadExams();

  // Add event listener for exam selection
  const examListSelect = _.getid("exam-list-select");
  if (examListSelect) {
    examListSelect.removeEventListener("change", updateExamDetails);
    examListSelect.addEventListener("change", updateExamDetails);
  }
}

// Load levels from database
async function loadLevels() {
  const results = await studentsTable
    .where("s_annee")
    .equals(this_year)
    .toArray();

  const uniqueLevels = [
    ...new Set(results.map((student) => student.s_niv.trim())),
  ];

  // Get currently selected values
  const selectedLevels = Array.from(_.getid("exam-levels").selectedOptions).map(
    (opt) => opt.value
  );

  // Create options HTML while preserving selected state
  const levelsHTML = uniqueLevels
    .map(
      (level) =>
        `<option value="${level}" ${
          selectedLevels.includes(level) ? "selected" : ""
        }>${level}</option>`
    )
    .join("");

  // Only update if there are new options
  if (_.getid("exam-levels").options.length !== uniqueLevels.length) {
    _.getid("exam-levels").innerHTML = levelsHTML;
  }
}

// Update divisions based on selected levels
async function updateDivisions() {
  const selectedLevels = Array.from(_.getid("exam-levels").selectedOptions).map(
    (opt) => opt.value
  );

  if (selectedLevels.length === 0) {
    _.getid("exam-divisions").innerHTML =
      '<option value="">--الرجاء الاختيار --</option>';
    _.getid("exam-groups").innerHTML =
      '<option value="">--الرجاء الاختيار --</option>';
    return;
  }

  const results = await studentsTable
    .where("s_annee")
    .equals(this_year)
    .and((student) => selectedLevels.includes(student.s_niv.trim()))
    .toArray();

  const uniqueDivisions = [
    ...new Set(results.map((student) => student.s_choaba?.trim() || "")),
  ].filter(Boolean);

  // Get currently selected values
  const selectedDivisions = Array.from(
    _.getid("exam-divisions").selectedOptions
  ).map((opt) => opt.value);

  const divisionsHTML = uniqueDivisions
    .map(
      (division) =>
        `<option value="${division}" ${
          selectedDivisions.includes(division) ? "selected" : ""
        }>${division}</option>`
    )
    .join("");

  _.getid("exam-divisions").innerHTML =
    '<option value="">--الرجاء الاختيار --</option>' + divisionsHTML;

  // Update groups after divisions are updated
  await updateGroups();
}

// Update groups based on selected divisions
async function updateGroups() {
  const selectedLevels = Array.from(_.getid("exam-levels").selectedOptions).map(
    (opt) => opt.value
  );
  const selectedDivisions = Array.from(
    _.getid("exam-divisions").selectedOptions
  ).map((opt) => opt.value);

  if (selectedLevels.length === 0) {
    _.getid("exam-groups").innerHTML =
      '<option value="">--الرجاء الاختيار --</option>';
    return;
  }

  const results = await studentsTable
    .where("s_annee")
    .equals(this_year)
    .and((student) => selectedLevels.includes(student.s_niv.trim()))
    .and(
      (student) =>
        selectedDivisions.length === 0 ||
        selectedDivisions.includes(student.s_choaba?.trim() || "")
    )
    .toArray();

  const uniqueGroups = [
    ...new Set(results.map((student) => student.s_section?.trim() || "")),
  ].filter(Boolean);

  // Get currently selected values
  const selectedGroups = Array.from(_.getid("exam-groups").selectedOptions).map(
    (opt) => opt.value
  );

  const groupsHTML = uniqueGroups
    .map(
      (group) =>
        `<option value="${group}" ${
          selectedGroups.includes(group) ? "selected" : ""
        }>${group}</option>`
    )
    .join("");

  _.getid("exam-groups").innerHTML =
    '<option value="">--الرجاء الاختيار --</option>' + groupsHTML;
}

// Load halls from database
async function loadHalls() {
  try {
    const halls = await hallsTable.toArray();
    const hallsList = _.getid("halls-list");
    if (!hallsList) return;

    let html = "";
    halls.forEach((hall, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${hall.name}</td>
          <td>${hall.capacity}</td>
          <td>
            <button class="btn btn-sm btn-primary hacen edit-hall" data-id="${
              hall.id
            }">
              <i class="fas fa-edit"></i> تعديل
            </button>
            <button class="btn btn-sm btn-danger hacen delete-hall" data-id="${
              hall.id
            }">
              <i class="fas fa-trash"></i> حذف
            </button>
          </td>
        </tr>
      `;
    });

    hallsList.innerHTML = html;

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-hall").forEach((button) => {
      button.addEventListener("click", () => editHall(button.dataset.id));
    });

    document.querySelectorAll(".delete-hall").forEach((button) => {
      button.addEventListener("click", async () => {
        if (confirm("هل أنت متأكد من حذف هذه القاعة؟")) {
          const hallId = parseInt(button.dataset.id);
          await hallsTable.delete(hallId);
          await loadHalls();
          notify.toast({
            type: "success",
            color: "success",
            message: "تم حذف القاعة بنجاح",
          });
        }
      });
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء تحميل القاعات",
    });
  }
}

// Load halls for exam setup
async function loadHallsForExamSetup() {
  const halls = await hallsTable.toArray();

  // Get currently selected values
  const selectedHalls = Array.from(_.getid("exam-halls").selectedOptions).map(
    (opt) => parseInt(opt.value)
  );

  const hallsHTML = halls
    .map(
      (hall) =>
        `<option value="${hall.id}" ${
          selectedHalls.includes(hall.id) ? "selected" : ""
        }>${hall.name} (${hall.capacity} مقعد)</option>`
    )
    .join("");

  _.getid("exam-halls").innerHTML =
    '<option value="">--الرجاء الاختيار --</option>' + hallsHTML;
}

// Add event listener for exam halls selection
_.getid("exam-halls").addEventListener("change", async function () {
  // Preserve selected values when reloading
  const selectedHalls = Array.from(this.selectedOptions).map((opt) =>
    parseInt(opt.value)
  );

  // Reload halls while preserving selection
  await loadHallsForExamSetup();

  // Restore selection
  Array.from(_.getid("exam-halls").options).forEach((option) => {
    if (selectedHalls.includes(parseInt(option.value))) {
      option.selected = true;
    }
  });
});

// Save exam setup
async function saveExamSetup() {
  const examData = {
    period: _.getid("exam-period").value,
    subject: _.getid("exam-subject").value,
    levels: Array.from(_.getid("exam-levels").selectedOptions).map(
      (opt) => opt.value
    ),
    divisions: Array.from(_.getid("exam-divisions").selectedOptions).map(
      (opt) => opt.value
    ),
    groups: Array.from(_.getid("exam-groups").selectedOptions).map(
      (opt) => opt.value
    ),
    halls: Array.from(_.getid("exam-halls").selectedOptions).map((opt) =>
      parseInt(opt.value)
    ),
    createdAt: new Date().toISOString(),
  };

  if (!examData.period || !examData.subject || examData.levels.length === 0) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "الرجاء ملء جميع الحقول المطلوبة",
    });
    return;
  }

  try {
    const examId = await exambuilderTable.add(examData);

    // Create exam group with selected halls
    if (examData.halls.length > 0) {
      await examGroupsTable.add({
        examId: examId,
        name: "المجموعة الرئيسية",
        halls: examData.halls,
        createdAt: new Date().toISOString(),
      });
    }

    notify.toast({
      type: "success",
      color: "success",
      message: "تم حفظ إعدادات الامتحان بنجاح",
    });
    await loadExams();
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء حفظ إعدادات الامتحان",
    });
  }
}

// Add new hall
async function addHall() {
  const name = _.getid("hall-name").value;
  const capacity = parseInt(_.getid("hall-capacity").value);

  if (!name || !capacity) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "الرجاء ملء جميع الحقول المطلوبة",
    });
    return;
  }

  try {
    // Check if we're in update mode
    const updateButton = document.querySelector(".update-hall");
    if (updateButton) {
      // Update existing hall
      const hallId = parseInt(updateButton.dataset.id);
      await hallsTable.update(hallId, { name, capacity });

      // Reset the form and button
      _.getid("hall-name").value = "";
      _.getid("hall-capacity").value = "";
      updateButton.textContent = "إضافة قاعة";
      updateButton.classList.remove("update-hall");
      updateButton.classList.add("add-hall");
      delete updateButton.dataset.id;

      notify.toast({
        type: "success",
        color: "success",
        message: "تم تحديث القاعة بنجاح",
      });
    } else {
      // Add new hall
      await hallsTable.add({ name, capacity });
      _.getid("hall-name").value = "";
      _.getid("hall-capacity").value = "";
      notify.toast({
        type: "success",
        color: "success",
        message: "تم إضافة القاعة بنجاح",
      });
    }

    await loadHalls();
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء العملية",
    });
  }
}

// Delete hall
async function deleteHall(id) {
  if (!confirm("هل أنت متأكد من حذف هذه القاعة؟")) return;

  try {
    await hallsTable.delete(parseInt(id));
    await loadHalls();
    notify.toast({
      type: "success",
      color: "success",
      message: "تم حذف القاعة بنجاح",
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء حذف القاعة",
    });
  }
}

// Edit hall
async function editHall(id) {
  try {
    console.log("Editing hall with ID:", id);
    const hall = await hallsTable.get(parseInt(id));
    if (!hall) {
      notify.toast({
        type: "error",
        color: "danger",
        message: "لم يتم العثور على القاعة",
      });
      return;
    }

    const hallNameInput = _.getid("hall-name");
    const hallCapacityInput = _.getid("hall-capacity");
    const addButton = document.querySelector(".add-hall");

    if (!hallNameInput || !hallCapacityInput) {
      notify.toast({
        type: "error",
        color: "danger",
        message: "لم يتم العثور على حقول النموذج",
      });
      return;
    }

    // Update form values
    hallNameInput.value = hall.name;
    hallCapacityInput.value = hall.capacity;

    // Update button if found
    if (addButton) {
      addButton.textContent = "تحديث القاعة";
      addButton.classList.remove("add-hall");
      addButton.classList.add("update-hall");
      addButton.dataset.id = id;
    } else {
      console.log("Add button not found, but form values updated successfully");
    }
  } catch (error) {
    console.error("Error in editHall:", error);
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء تحميل بيانات القاعة",
    });
  }
}

// Distribute students
async function distributeStudents() {
  const examId = _.getid("exam-select").value;
  const method = _.getid("distribution-method").value;
  const criteria = _.getid("sorting-criteria").value;
  const scope = _.getid("distribution-scope").value;

  if (!examId || !method || !criteria) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "الرجاء ملء جميع الحقول المطلوبة",
    });
    return;
  }

  try {
    // Get exam data
    const exam = await exambuilderTable.get(parseInt(examId));
    if (!exam) {
      throw new Error("لم يتم العثور على الامتحان");
    }

    // Get exam groups and halls
    const groups = await examGroupsTable
      .where("examId")
      .equals(parseInt(examId))
      .toArray();

    if (!groups || groups.length === 0) {
      throw new Error("لم يتم العثور على قاعات مخصصة لهذا الامتحان");
    }

    // Get all halls from all groups
    const hallIds = groups.flatMap((group) => group.halls);
    const halls = await Promise.all(
      hallIds.map(async (hallId) => {
        const hall = await hallsTable.get(parseInt(hallId));
        if (!hall) {
          throw new Error(`لم يتم العثور على القاعة رقم ${hallId}`);
        }
        return hall;
      })
    );

    if (halls.length === 0) {
      throw new Error("لا توجد قاعات متاحة للتوزيع");
    }

    // Get filtered students
    const students = await getFilteredStudents(exam);
    if (!students || students.length === 0) {
      throw new Error("لا يوجد تلاميذ للتوزيع");
    }

    // Calculate total capacity
    const totalCapacity = halls.reduce((sum, hall) => sum + hall.capacity, 0);
    if (totalCapacity < students.length) {
      throw new Error(
        `سعة القاعات (${totalCapacity}) أقل من عدد التلاميذ (${students.length})`
      );
    }

    // Distribute students
    const distribution = distributeStudentsToHalls(
      students,
      halls,
      method,
      criteria,
      scope
    );

    // Display results
    displayDistributionResults(distribution);

    notify.toast({
      type: "success",
      color: "success",
      message: `تم توزيع ${students.length} تلميذ بنجاح`,
    });
  } catch (error) {
    console.error("Error in distributeStudents:", error);
    notify.toast({
      type: "error",
      color: "danger",
      message: error.message || "حدث خطأ أثناء توزيع التلاميذ",
    });
  }
}

// Get filtered students based on exam criteria
async function getFilteredStudents(exam) {
  try {
    const students = await studentsTable
      .where("s_annee")
      .equals(this_year)
      .and((student) => exam.levels.includes(student.s_niv.trim()))
      .and(
        (student) =>
          exam.divisions.length === 0 ||
          exam.divisions.includes(student.s_choaba?.trim() || "")
      )
      .and(
        (student) =>
          exam.groups.length === 0 ||
          exam.groups.includes(student.s_section?.trim() || "")
      )
      .toArray();

    return students;
  } catch (error) {
    console.error("Error in getFilteredStudents:", error);
    throw new Error("حدث خطأ أثناء جلب بيانات التلاميذ");
  }
}

// Distribute students to halls based on criteria
function distributeStudentsToHalls(students, halls, method, criteria, scope) {
  let sortedStudents = [...students];

  // Sort students based on criteria
  switch (criteria) {
    case "name":
      sortedStudents.sort((a, b) => a.s_nom.localeCompare(b.s_nom));
      break;
    case "surname":
      sortedStudents.sort((a, b) => a.s_prenom.localeCompare(b.s_prenom));
      break;
    case "registration":
      sortedStudents.sort((a, b) => {
        // Convert registration numbers to strings and pad with zeros if needed
        const aReg = String(a.s_matt || "").padStart(10, "0");
        const bReg = String(b.s_matt || "").padStart(10, "0");
        return aReg.localeCompare(bReg);
      });
      break;
    case "gender":
      sortedStudents.sort((a, b) => a.s_gender.localeCompare(b.s_gender));
      break;
    case "first-semester":
      sortedStudents.sort((a, b) => (a.moy1 || 0) - (b.moy1 || 0));
      break;
    case "both-semesters":
      sortedStudents.sort(
        (a, b) =>
          (a.moy1 || 0) + (a.moy2 || 0) - ((b.moy1 || 0) + (b.moy2 || 0))
      );
      break;
  }

  // Reverse if descending
  if (method === "descending") {
    sortedStudents.reverse();
  }

  // Shuffle if random
  if (method === "random") {
    sortedStudents = sortedStudents.sort(() => Math.random() - 0.5);
  }

  // Distribute students to halls
  const distribution = {};

  if (scope === "separate") {
    // Group students by level
    const studentsByLevel = {};
    sortedStudents.forEach((student) => {
      if (!studentsByLevel[student.s_niv]) {
        studentsByLevel[student.s_niv] = [];
      }
      studentsByLevel[student.s_niv].push(student);
    });

    // Distribute each level separately
    Object.entries(studentsByLevel).forEach(([level, levelStudents]) => {
      distribution[level] = distributeLevelStudents(levelStudents, halls);
    });
  } else {
    // Distribute all students together
    distribution.all = distributeLevelStudents(sortedStudents, halls);
  }

  return distribution;
}

// Distribute students of a single level to halls
function distributeLevelStudents(students, halls) {
  const distribution = {};
  let currentHallIndex = 0;
  let currentHallCount = 0;

  students.forEach((student) => {
    if (currentHallCount >= halls[currentHallIndex].capacity) {
      currentHallIndex = (currentHallIndex + 1) % halls.length;
      currentHallCount = 0;
    }

    if (!distribution[halls[currentHallIndex].name]) {
      distribution[halls[currentHallIndex].name] = [];
    }

    distribution[halls[currentHallIndex].name].push(student);
    currentHallCount++;
  });

  return distribution;
}

// Display distribution results
function displayDistributionResults(distribution) {
  let html = '<div class="distribution-results">';

  Object.entries(distribution).forEach(([level, halls]) => {
    html += `<h3 class="hacen">${
      level === "all" ? "جميع المستويات" : level
    }</h3>`;

    Object.entries(halls).forEach(([hallName, students]) => {
      html += `
        <div class="hall-distribution mb-3">
          <h4 class="hacen">${hallName} (${students.length} تلميذ)</h4>
          <table class="table hacen fs-2">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>الاسم</th>
                <th>اللقب</th>
                <th>رقم التسجيل</th>
                <th> المستوى</th>
                <th>الشعبة </th>
                <th>الفوج </th>
                <th>الجنس</th>
              </tr>
            </thead>
            <tbody>
              ${students
                .map(
                  (student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.s_nom}</td>
                  <td>${student.s_prenom}</td>
                  <td>${student.s_matt}</td>
                  <td>${student.s_niv || ""}</td>
                  <td>${student.s_choaba || ""}</td>
                  <td>${student.s_section || ""}</td>
                  <td>${student.s_gender}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    });
  });

  html += "</div>";
  _.getid("distribution-results").innerHTML = html;
}

// Load exams list
async function loadExams() {
  const exams = await exambuilderTable.toArray();
  const examsHTML =
    '<option value="">--الرجاء الاختيار --</option>' +
    exams
      .map(
        (exam) =>
          `<option value="${exam.id}">${exam.period} - ${
            exam.subject
          } (${exam.levels.join(", ")})</option>`
      )
      .join("");

  // Only update if the content has changed
  const examListSelect = _.getid("exam-list-select");
  const examSelect = _.getid("exam-select");

  if (examListSelect && examListSelect.innerHTML !== examsHTML) {
    examListSelect.innerHTML = examsHTML;
  }

  if (examSelect && examSelect.innerHTML !== examsHTML) {
    examSelect.innerHTML = examsHTML;
  }
}

// Update exam details when an exam is selected
async function updateExamDetails() {
  console.log("updateExamDetails called");
  try {
    const examId = _.getid("exam-list-select").value;
    console.log("Selected exam ID:", examId);

    if (!examId) {
      _.getid("exam-info-content").innerHTML = "";
      _.getid("exam-halls-content").innerHTML = "";
      _.getid("exam-students-content").innerHTML = "";
      return;
    }

    const exam = await exambuilderTable.get(parseInt(examId));
    console.log("Exam data:", exam);

    if (!exam) {
      throw new Error("لم يتم العثور على الامتحان");
    }

    // Update exam info
    const infoHTML = `
      <div class="exam-info-details">
        <p><strong>الفترة:</strong> ${
          exam.period === "1"
            ? "الفصل الأول"
            : exam.period === "2"
            ? "الفصل الثاني"
            : "الفصل الثالث"
        }</p>
        <p><strong>المادة:</strong> ${exam.subject}</p>
        <p><strong>المستويات:</strong> ${exam.levels.join(", ")}</p>
        <p><strong>الشعب:</strong> ${
          exam.divisions.length > 0 ? exam.divisions.join(", ") : "جميع الشعب"
        }</p>
        <p><strong>الأفواج:</strong> ${
          exam.groups.length > 0 ? exam.groups.join(", ") : "جميع الأفواج"
        }</p>
      </div>
    `;
    _.getid("exam-info-content").innerHTML = infoHTML;

    // Update exam halls
    const groups = await examGroupsTable
      .where("examId")
      .equals(parseInt(examId))
      .toArray();

    console.log("Exam groups:", groups);

    if (!groups || groups.length === 0) {
      _.getid("exam-halls-content").innerHTML =
        "<p>لا توجد قاعات مخصصة لهذا الامتحان</p>";
    } else {
      const hallsHTML = await Promise.all(
        groups.map(async (group) => {
          const halls = await Promise.all(
            group.halls.map(async (hallId) => {
              const hall = await hallsTable.get(parseInt(hallId));
              return hall
                ? `<div class="hall-item">${hall.name} (${hall.capacity} مقعد)</div>`
                : "";
            })
          );
          return `
            <div class="exam-group mb-3">
              <h4 class="hacen">${group.name}</h4>
              <div class="halls-list">
                ${halls.join("")}
              </div>
            </div>
          `;
        })
      );
      _.getid("exam-halls-content").innerHTML = hallsHTML.join("");
    }

    // Update exam students
    const students = await getFilteredStudents(exam);
    console.log("Filtered students:", students);

    if (!students || students.length === 0) {
      _.getid("exam-students-content").innerHTML =
        "<p>لا يوجد تلاميذ مسجلين في هذا الامتحان</p>";
    } else {
      // Get all halls for this exam
      const allHalls = await Promise.all(
        groups
          .flatMap((group) => group.halls)
          .map(async (hallId) => {
            const hall = await hallsTable.get(parseInt(hallId));
            return hall;
          })
      );

      // Distribute students to halls
      const distribution = distributeStudentsToHalls(
        students,
        allHalls,
        "ascending",
        "registration",
        "all"
      );

      // Create a map of student registration numbers to their assigned halls
      const studentHalls = {};
      Object.entries(distribution.all).forEach(([hallName, hallStudents]) => {
        hallStudents.forEach((student) => {
          studentHalls[student.s_matt] = hallName;
        });
      });

      const studentsHTML = `
        <table class="table hacen fs-2">
          <thead>
            <tr>
              <th>الترتيب</th>
              <th>الاسم</th>
              <th>اللقب</th>
              <th>رقم التسجيل</th>
              <th>المستوى</th>
              <th>الشعبة</th>
              <th>الفوج</th>
              <th>القاعة</th>
            </tr>
          </thead>
          <tbody>
            ${students
              .map(
                (student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${student.s_nom}</td>
                <td>${student.s_prenom}</td>
                <td>${student.s_matt}</td>
                <td>${student.s_niv}</td>
                <td>${student.s_choaba || ""}</td>
                <td>${student.s_section || ""}</td>
                <td>${studentHalls[student.s_matt] || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
      _.getid("exam-students-content").innerHTML = studentsHTML;
    }
  } catch (error) {
    console.error("Error in updateExamDetails:", error);
    notify.toast({
      type: "error",
      color: "danger",
      message: error.message || "حدث خطأ أثناء عرض تفاصيل الامتحان",
    });
  }
}

// Delete exam
async function deleteExam(id) {
  if (!confirm("هل أنت متأكد من حذف هذا الامتحان؟")) return;

  try {
    await exambuilderTable.delete(parseInt(id));
    await loadExams();
    notify.toast({
      type: "success",
      color: "success",
      message: "تم حذف الامتحان بنجاح",
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء حذف الامتحان",
    });
  }
}

// View exam details
async function viewExam(id) {
  const exam = await exambuilderTable.get(parseInt(id));
  if (!exam) return;

  // TODO: Implement exam details view
  notify.toast({
    type: "info",
    color: "info",
    message: "عرض تفاصيل الامتحان قيد التطوير",
  });
}

// Add exam group
async function addExamGroup() {
  const examId = _.getid("exam-select").value;
  const groupName = _.getid("group-name").value;
  const selectedHalls = Array.from(_.getid("group-halls").selectedOptions).map(
    (opt) => opt.value
  );

  if (!examId || !groupName || selectedHalls.length === 0) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "الرجاء ملء جميع الحقول المطلوبة",
    });
    return;
  }

  try {
    await examGroupsTable.add({
      examId: parseInt(examId),
      name: groupName,
      halls: selectedHalls,
      createdAt: new Date().toISOString(),
    });

    _.getid("group-name").value = "";
    _.getid("group-halls").value = "";

    await loadExamGroups();
    notify.toast({
      type: "success",
      color: "success",
      message: "تم إضافة المجموعة بنجاح",
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء إضافة المجموعة",
    });
  }
}

// Load exam groups
async function loadExamGroups() {
  const examId = _.getid("exam-select").value;
  if (!examId) return;

  const groups = await examGroupsTable
    .where("examId")
    .equals(parseInt(examId))
    .toArray();

  const groupsHTML = groups
    .map(
      (group) => `
      <div class="exam-group mb-3">
        <h4 class="hacen">${group.name}</h4>
        <div class="halls-list">
          ${group.halls
            .map((hallId) => {
              const hall = hallsTable.get(parseInt(hallId));
              return `<div class="hall-item">${hall.name} (${hall.capacity})</div>`;
            })
            .join("")}
        </div>
        <button class="btn btn-sm btn-danger hacen delete-exam-group" data-id="${
          group.id
        }">حذف المجموعة</button>
      </div>
    `
    )
    .join("");

  const examGroupsList = _.getid("exam-groups-list");
  if (examGroupsList) {
    examGroupsList.innerHTML = groupsHTML;
  }
}

// Delete exam group
async function deleteExamGroup(id) {
  if (!confirm("هل أنت متأكد من حذف هذه المجموعة؟")) return;

  try {
    await examGroupsTable.delete(parseInt(id));
    await loadExamGroups();
    notify.toast({
      type: "success",
      color: "success",
      message: "تم حذف المجموعة بنجاح",
    });
  } catch (error) {
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء حذف المجموعة",
    });
  }
}

// Initialize when the modal is opened
//document.addEventListener("DOMContentLoaded", () => {
//  const modal = document.getElementById("exams-builder-v2-modal");
//  console.log(modal);
//  if (modal) {
//    console.log(modal);
//    modal.addEventListener("show", initializeExamBuilder);
//  }
//});
