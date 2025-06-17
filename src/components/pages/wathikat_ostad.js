import { _ } from "../../../core/helpers/helpers.js";
  const tables = document.getElementsByTagName("table");
  const hideShowButton = document.querySelector("#hide-show");
hideShowButton.addEventListener("click", () => {
  Array.from(tables).forEach(table => {
    if (table.rows.length > 5) {
      Array.from(table.rows).forEach(row => {
        const cell0 = row.cells[0];
        const lastCellIndex = row.cells.length - 1;
        const cell1 = row.cells[lastCellIndex];
        const cell2 = _.isLycee() ? row.cells[lastCellIndex - 1] : null;

        [cell0, cell1, cell2].forEach(cell => {
          if (cell) cell.classList.toggle("d-none");
        });
      });
    }
  });
});

let max_moy = _.isPrimary() ? 5 : 10;
let _index = _.isLycee() ? 3 : 2;

Array.from(tables).forEach((table, tableIndex) => {
  if (table.rows.length <= 5) return;

  let total = 0;
  let empty = 0;
  let row_nbr = table.rows.length;

  Array.from(table.rows).slice(1).forEach(row => {
    let cell1 = row.cells[row.cells.length - _index].innerHTML;
    empty += cell1 === "" ? 1 : 0;
    total += cell1 ? Number(cell1) : 0;
  });

  const moy_module = (total / (row_nbr - empty - 1) || 0).toFixed(2);

  let tr = `<tr id="moy-${tableIndex}">
    <td align="center"> </td>
    <td align="center">معدل المادة</td>
    <td style="background:#b1b1b1" align="center">${moy_module}</td>
    <td colspan="${table.rows[0].cells.length - 3}" style="border: 0"></td>
    <td align="center"></td>
  </tr>`;
  
  table.insertAdjacentHTML('beforeend', tr);
});


