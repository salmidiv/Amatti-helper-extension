import { this_year_text } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

document.addEventListener("click", async (event) => {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("examenNationalData"):
      examenNationalData();
      break;
  }
});

async function examenNationalData() {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال عملية التحميل",
  });
  const data = await _.fetchData(
    "scolarite/examen_national/inscription/printQr",
    {},
    "text"
  );
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, "text/html");
  const columns = Array.from(doc.querySelectorAll(".column"));

  const extractedData = columns.map((column) => {
    const table = column.querySelector("table");
    if (!table) return null;
    const td = table.querySelector("td");
    if (!td) return null;
    const data = td.innerHTML;
    return extractData(data);
  });
  const sortedData = extractedData.sort((a, b) =>
    a.section.localeCompare(b.section)
  );
  const header = ["رقم التعريف الوطني", "الاسم الكامل", "القسم", "كلمة المرور"];
  const sheetData = [
    header,
    ...sortedData.map(({ matt, name, section, pass }) => [
      matt,
      name,
      section,
      pass,
    ]),
  ];
  var wb = { Workbook: { Views: [{ RTL: true }] }, Sheets: {}, SheetNames: [] };

  var ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 15 }];

  const headerRange = XLSX.utils.decode_range(ws["!ref"]);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: {
          patternType: "solid",
          fgColor: { rgb: "00dce6f1" },
          bgColor: { rgb: "00dce6f1" },
        },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const s = _.isCem() ? "التعليم المتوسط" : _.isLycee() ? "الباكالوريا" : "";
  s != ""
    ? XLSX.writeFile(
        wb,
        `بيانات التلاميذ المترشحين لشهادة ${s} ${this_year_text}.xlsx`
      )
    : "";
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
}

function extractData(htmlString) {
  const nameMatch = htmlString.match(/اللقب و الاسم:\s*([\u0600-\u06FF\s]+)/);
  const sectionMatch = htmlString.match(
    /الفوج التربوي:\s*([\u0600-\u06FF\s0-9]+)/
  );
  const mattMatch = htmlString.match(/إسم المستخدم\s*:\s*([0-9]+)/);
  const passMatch = htmlString.match(/كلمة المرور:\s*<span[^>]*>\s*([\S]+)/);

  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    section: sectionMatch ? sectionMatch[1].replace(/\s+/g, " ").trim() : null,
    matt: mattMatch ? mattMatch[1].trim() : null,
    pass: passMatch ? passMatch[1].trim() : null,
  };
}
