const parentDivone = document.getElementById("export").parentElement;
const parentDiv = document.getElementById("exportGlobal").parentElement;

const buttonex = document.createElement("button");
buttonex.type = "button";
buttonex.id = "excl";
buttonex.className = "btn btn-dark p-1 px-4 h-38 hacen";
buttonex.textContent = "تحميل الشبكة التحليلة على شكل اكسل";

const button = document.createElement("button");
button.type = "button";
button.id = "totalex";
button.className = "btn btn-Amber p-1 px-4 h-38 hacen";
button.textContent = "تحميل الشبكة الاجمالية على شكل اكسل";

parentDivone.appendChild(buttonex);
parentDiv.appendChild(button);

buttonex.addEventListener("click", async () => {
    const trimSelect = document.getElementById("lst_prof");
    const lstMatiereSelect = document.getElementById("lst_matiere");
    const trim_01_value = trimSelect.value;
    const trim_01_text = trimSelect.options[trimSelect.selectedIndex].text;

    const lst_matiere_value = lstMatiereSelect.value;
    const lst_matiere_text =
        lstMatiereSelect.options[lstMatiereSelect.selectedIndex].text;

    await down(
        trim_01_value,
        lst_matiere_value,
        trim_01_text,
        lst_matiere_text,
        true
    );
});

button.addEventListener("click", down);

async function down(
    trim_01_value,
    lst_matiere_value,
    trim_01_text,
    lst_matiere_text,
    isone
) {
    const url = isone
        ? "getMatrixCompCem/" + lst_matiere_value + "/" + trim_01_value
        : "getMatrixGlobal";
    try {
        const response = await fetch(
            "https://amatti.education.dz/scolarite/moktassabat/cem/" + url
        ); // Replace with your data URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, "text/html");
        const table = doc.querySelector("table");
        if (!table) {
            throw new Error("No table found on the page");
        }
        /*
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
      const nameCell = document.createElement("td");
      const moduleCell = document.createElement("td");

      nameCell.textContent = "Name";
      moduleCell.textContent = "Module";
      row.insertBefore(moduleCell, row.firstChild); // Add module in position 2
      row.insertBefore(nameCell, moduleCell); // Add name in position 1
    });
    */
        const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"></head>
            <body>
                ${table.outerHTML}
            </body>
        </html>
    `;
        const blob = new Blob([html], { type: "application/vnd.ms-excel" });
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        const faleName = isone
            ? "الشبكة التحليلة لـ" + trim_01_text + " مادة " + lst_matiere_text
            : "الشبكة الإجمالية";
        downloadLink.download = faleName + ".xls"; // Excel will open this as a spreadsheet
        downloadLink.click();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
