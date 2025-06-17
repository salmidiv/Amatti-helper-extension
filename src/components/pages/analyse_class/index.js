import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

notify.note(
  $notify,
  "يمكنكم الآن تحميل نتائج التملاميذ على شكل ملفات إكسل، للعمل بها على برنامج المستشار لصاحبه صالح حمادي."
);
notify.warning_note($notify, "تم حل مشكل تراكم البيانات في الملفات المنفصلة");

document.addEventListener("click", function (event) {
  const classList = event.target.classList;
  const target = event.target;
  switch (true) {
    case classList.contains("notesToExcel"):
      target.disabled = true;
      const originalText = target.textContent;
      target.textContent = "الرجاء الانتظار حتى اكتمال العملية";
      notesToExcel().finally(() => {
        target.disabled = false;
        target.textContent = originalText;
      });
      break;
    case classList.contains("allNotesToExcel"):
      target.disabled = true;
      const originalAllText = target.textContent;
      target.textContent = "الرجاء الانتظار حتى اكتمال العملية";
      allNotesToExcel().finally(() => {
        target.disabled = false;
        target.textContent = originalAllText;
      });
      break;
  }
});

// Utility function to validate trimestre
function validateTrimestre() {
  const trimestre = _.qSel("#annee_school").value;
  if (trimestre === "") {
    notify.toast({
      type: "error",
      color: "danger",
      message: "العملية لم تتم، الرجاء اختيار الفصل الدراسي",
    });
    return null;
  }
  return trimestre;
}

// Utility function to create and style worksheet
function createStyledWorksheet(data, columns) {
  const ws = XLSX.utils.json_to_sheet(data, {
    origin: "A2",
    skipHeader: true,
  });

  // Apply custom font styles to all cells
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (!ws[cell_ref]) continue;
      ws[cell_ref].s = {
        font: {
          name: "Arial",
          sz: 14,
          bold: R === 0, // Bold for headers
        },
      };
    }
  }

  // Add headers
  XLSX.utils.sheet_add_aoa(ws, [columns], { origin: "A1" });
  return ws;
}

// Utility function to create workbook with RTL support
function createWorkbook() {
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] };
  return wb;
}

// Utility function to fetch and process division data
async function processDivisionData(trimestre, division) {
  return await _.fetchData("/scolarite/en_chiffre/analyse_class/get_list/", {
    trimestre,
    division,
  });
}

async function notesToExcel() {
  const trimestre = validateTrimestre();
  if (!trimestre) return;

  const divisionList = _.qSelAll("#division option");
  let processedCount = 0;
  const totalDivisions = divisionList.length;

  // Process each division separately
  for (const divisionOption of divisionList) {
    const division = divisionOption.value;
    const divisionText = divisionOption.text;

    if (division === "") continue;

    // Create a new workbook for each division
    const wb = createWorkbook();

    const { columns, data } = await processDivisionData(trimestre, division);
    const ws = createStyledWorksheet(data, columns);

    // Add only this division's data to the workbook
    XLSX.utils.book_append_sheet(wb, ws, _.shortName(divisionText));

    // Save the workbook with this division's data only
    const fileName = `${divisionText} [${trimestre}].xlsx`;
    XLSX.writeFile(wb, fileName);

    processedCount++;
    const progress = Math.round((processedCount / totalDivisions) * 100);
    notify.toast({
      type: "warning",
      color: "warning",
      message: `جاري المعالجة... ${progress}%`,
    });
  }

  notify.toast({
    type: "done",
    color: "success",
    message: "تم تصدير جميع البيانات بنجاح",
  });
}

async function allNotesToExcel() {
  const trimestre = validateTrimestre();
  if (!trimestre) return;

  const wb = createWorkbook();
  const divisionList = _.qSelAll("#division option");
  let processedCount = 0;
  const totalDivisions = divisionList.length;

  // Process all divisions
  for (const divisionOption of divisionList) {
    const division = divisionOption.value;
    const divisionText = divisionOption.text;

    if (division === "") continue;

    const { columns, data } = await processDivisionData(trimestre, division);
    const ws = createStyledWorksheet(data, columns);
    console.log(divisionText);
    console.log(_.shortName(divisionText));
    XLSX.utils.book_append_sheet(wb, ws, _.shortName(divisionText));

    processedCount++;
    const progress = Math.round((processedCount / totalDivisions) * 100);
    notify.toast({
      type: "warning",
      color: "warning",
      message: `جاري المعالجة... ${progress}%`,
    });
  }

  const fileName = `نتائج التلاميذ للفصل ${trimestre}.xlsx`;
  XLSX.writeFile(wb, fileName);

  notify.toast({
    type: "done",
    color: "success",
    message: "تم تصدير جميع البيانات بنجاح",
  });
}
