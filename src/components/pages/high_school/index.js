import { _ } from "../../../../core/helpers/helpers.js";
import { this_year } from "../../../../core/helpers/const.js";
import { notify } from "../../../../core/helpers/notify.js";

notify.note(
  $notify,
  "هام لجميع المستشارين، يمكنكم الآن تنزيل ملفات الاكسل الخاصة بحجز الملاحظات، وإعادة رفعها للموقع مباشرة لحجز الملاحظات بشكل أسرع"
);
notify.warning_note(
  $notify,
  "ملاحظة: في حال لم تدرج أي ملاحظات لأحد التلاميذ، فسيتم تجازه، ولمعرفة التلميذ الذي تم تجاوزه إبحث في القائمة عن التلميذ الذي بجانبه 'إدراج ملاحظات'"
);
notify.warning_note(
  $notify,
  "بالنسبة للمرات اللاحقة لتعديل ملاحظات التلاميذ، يمكنكم الآن التعديل مباشرة على الملفات المنجزة وحذف بيانات التلاميذ الغير معنيين بعملية التعديل من الملف ورفعها مرة أخرى"
);

document.addEventListener("click", function (event) {
  const classList = event.target.classList;
  const target = event.target;
  switch (true) {
    case classList.contains("listsToExcel"):
      target.disabled = true;
      const originalText = target.textContent;
      target.textContent = "الرجاء الانتظار حتى اكتمال العملية";
      listsToExcel().finally(() => {
        target.disabled = false;
        target.textContent = originalText;
      });
      break;
    case classList.contains("insertFromExcel"):
      target.disabled = true;
      const originalText2 = target.textContent;
      target.textContent = "الرجاء الانتظار حتى اكتمال العملية";
      insertFromExcel().finally(() => {
        target.disabled = false;
        target.textContent = originalText2;
      });
      break;
  }
});
// Utility function to create and style worksheet
function createStyledWorksheet(data, columns) {
  const ws = XLSX.utils.json_to_sheet(data, {
    origin: "A2",
    skipHeader: true,
  });
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
async function processDivisionData(division) {
  const response = await _.fetchData("getHighSchoolObservationsList", {
    division,
  });

  // Remove the last item from the data array if it exists
  if (response.data && response.data.length > 0) {
    response.data.map((d) => d.pop()); // Remove the last item
  }

  return response;
}
async function listsToExcel() {
  const divisionList = _.qSelAll("#divisions option");
  let processedCount = 0;
  const totalDivisions = divisionList.length;
  // Process each division separately
  const columns = [
    "رقم التعريف",
    "للقب والاسم",
    "تاريخ الميلاد",
    "الإختبارات النفس-تقنية",
    "استبيان الميول و الاهتمامات",
    "مقابلات الإرشاد المدرسي",
    "الملاحظات المستخلصة",
  ];
  for (const divisionOption of divisionList) {
    const division = divisionOption.value;
    const divisionText = divisionOption.text;
    if (division === "") continue;
    // Create a new workbook for each division
    const wb = createWorkbook();

    const { data } = await processDivisionData(division);
    const ws = createStyledWorksheet(data, columns);

    // Add only this division's data to the workbook
    XLSX.utils.book_append_sheet(wb, ws, _.shortName(divisionText));

    // Save the workbook with this division's data only
    const fileName = `${divisionText} [${this_year}].xlsx`;
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

async function insertFromExcel() {
  /*
   form data for add
   note11   "الإختبارات النفس-تقنية",
   note22  "استبيان الميول و الاهتمامات",
   note33  "مقابلات الإرشاد المدرسي",
   note44    "الملاحظات المستخلصة"
  matricule   "رقم التعريف",
   */
  try {
    // إنشاء عنصر input لاختيار الملف
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls";

    // إضافة مستمع حدث لعندما يتم اختيار ملف
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) {
        notify.toast({
          type: "error",
          color: "danger",
          message: "لم يتم اختيار أي ملف",
        });
        return;
      }

      notify.toast({
        type: "warning",
        color: "warning",
        message: "جاري قراءة الملف، الرجاء الانتظار",
      });

      // قراءة الملف باستخدام SheetJS
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // الحصول على الورقة الأولى
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // تحويل البيانات إلى مصفوفة من الكائنات
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // التحقق من وجود بيانات
        if (jsonData.length <= 1) {
          notify.toast({
            type: "error",
            color: "danger",
            message: "الملف لا يحتوي على بيانات كافية",
          });
          return;
        }
        // الحصول على رؤوس الأعمدة (الصف الأول)
        const headers = jsonData[0];

        // التحقق من وجود العمود المطلوب (رقم التعريف)
        const matriculeIndex = headers.findIndex((header) =>
          header.includes("التعريف")
        );
        const note11Index = headers.findIndex((header) =>
          header.includes("النفس-تقنية")
        );
        const note22Index = headers.findIndex((header) =>
          header.includes("الاهتمامات")
        );
        const note33Index = headers.findIndex((header) =>
          header.includes("الإرشاد")
        );
        const note44Index = headers.findIndex((header) =>
          header.includes("المستخلصة")
        );

        if (matriculeIndex === -1) {
          notify.toast({
            type: "error",
            color: "danger",
            message: "الملف لا يحتوي على عمود 'رقم التعريف'",
          });
          return;
        }

        // معالجة البيانات وإرسالها
        let successCount = 0;
        let errorCount = 0;
        //jsonData.length
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const matricule = row[matriculeIndex];
          const note11 = row[note11Index] || "";
          const note22 = row[note22Index] || "";
          const note33 = row[note33Index] || "";
          const note44 = row[note44Index] || "";
          // التحقق من وجود رقم التعريف
          if (
            !matricule ||
            [note11, note22, note33, note44].every((note) => note == "")
          )
            continue;

          // إعداد البيانات للإرسال
          const formData = {
            matricule,
            note11,
            note22,
            note33,
            note44,
          };

          try {
            //const getHighSchoolObservations = await $.ajax({
            //     type: 'POST',
            //     url: 'getHighSchoolObservations',
            //     dataType: 'JSON',
            //     data: {matricule} ,
            //  });
            const url = "editHighSchoolObservations"; //"saveHighSchoolObservations"
            console.log(url);
            /// إرسال البيانات إلى الخادم
            const response = await $.ajax({
              type: "POST",
              url,
              dataType: "JSON",
              data: $.param(formData),
            });

            if (response == 1) {
              successCount++;
            } else {
              errorCount++;
            }

            // عرض تقدم العملية
            const progress = Math.round((i / (jsonData.length - 1)) * 100);
            notify.toast({
              type: "warning",
              color: "warning",
              message: `جاري المعالجة... ${progress}%`,
            });

            // إضافة تأخير صغير لتجنب إرهاق الخادم
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error("Error updating record:", error);
            errorCount++;
          }
        }

        // عرض ملخص النتائج
        notify.toast({
          type: "done",
          color: "success",
          message: `تمت العملية: ${successCount} سجل ناجح، ${errorCount} سجل فاشل`,
        });
      };

      reader.onerror = () => {
        notify.toast({
          type: "error",
          color: "danger",
          message: "حدث خطأ أثناء قراءة الملف",
        });
      };

      reader.readAsArrayBuffer(file);
    });

    // تشغيل نافذة اختيار الملف
    fileInput.click();
  } catch (error) {
    console.error("Error in insertFromExcel:", error);
    notify.toast({
      type: "error",
      color: "danger",
      message: "حدث خطأ أثناء تنفيذ العملية",
    });
  }
}
