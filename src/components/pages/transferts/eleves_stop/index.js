import { this_year } from "../../../../../core/helpers/const.js";
import { _ } from "../../../../../core/helpers/helpers.js";

const table = document.querySelector("#eleves tbody");

const dropdownMenu = document.createElement("div");
dropdownMenu.classList.add("dropdown-menu");
dropdownMenu.classList.add("hacen");

const createMenuItem = (text, callback) => {
  const anchor = document.createElement("a");
  anchor.href = "#";
  anchor.textContent = text;
  anchor.style.padding = "1rem";
  anchor.style.fontSize = "1.3rem";
  anchor.style.color = "#000";
  anchor.addEventListener("click", callback);
  return anchor;
};

function handleRightMenu(event) {
  event.preventDefault();
  const row = event.target.closest("tr");

  if (row) {
    dropdownMenu.innerHTML = "";

    // Create menu items
    const printCertificate = createMenuItem("طباعة أمر بالشطب", function () {
      const rowData = Array.from(row.querySelectorAll("td")).map(
        (td) => td.textContent
      );
      _.to(
        "print-stop/" +
          rowData[1] +
          "/" +
          this_year +
          "/" +
          rowData[10] +
          "/" +
          rowData[9]
      );
    });

    dropdownMenu.appendChild(printCertificate);
    document.body.appendChild(dropdownMenu);
    dropdownMenu.style.display = `flex`;
    dropdownMenu.style.left = `${event.clientX + window.scrollX}px`;
    dropdownMenu.style.top = `${event.clientY + window.scrollY}px`;

    const closeMenu = () => {
      dropdownMenu.remove();
      document.removeEventListener("click", closeMenu);
    };
    document.addEventListener("click", closeMenu, { once: true });
  }
}

table.addEventListener("contextmenu", handleRightMenu);
