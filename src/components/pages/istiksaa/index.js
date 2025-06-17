import { istiksaaDataTable } from "../../../../core/db/conn.js";
import { last_year, this_year } from "../../../../core/helpers/const.js";
import { _ } from "../../../../core/helpers/helpers.js";
function array_unique(value, index, self) {
  return self.indexOf(value) === index;
}
async function sections() {
  const rows = await istiksaaDataTable.where({ s_annee: this_year }).toArray();
  if (rows.length > 0) {
    let nivs = [];
    for (let index = 0; index < rows.length; index++) {
      const niv = rows[index];
      if (_.isLycee() && !_.isNull(niv.s_section) && !_.isNull(niv.s_choba)) {
        nivs.push(
          `${niv.s_niv.trim()}-${
            !_.isNull(niv.s_choba) ? niv.s_choba.trim() : ""
          }`
        );
      } else {
        if (!_.isNull(niv.s_niv)) {
          nivs.push(`${!_.isNull(niv.s_niv) ? niv.s_niv.trim() : ""}`);
        }
      }
    }
    var unique = nivs.filter(array_unique);
    let op = "";
    for (let index = 0; index < unique.length; index++) {
      const element = unique[index];
      op += `<option value="${element}">${element
        .split("-")
        .join(" ")}</option>`;
    }
    $classes.innerHTML += op;
  }
}

sections();

$printList.addEventListener("click", async () => {
  const schoolAgeRanges = {
    lycee: [14, 15, 16, 17, 18, 19, 20, 21],
    cem: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    primary: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  };
  const ara = (() => {
    if (_.isLycee()) return schoolAgeRanges.lycee;
    if (_.isCem()) return schoolAgeRanges.cem;
    if (_.isPrimary()) return schoolAgeRanges.primary;
    return []; // Default empty array
  })();

  let id = $classes.value;
  let nivPart = id.split("-")[0];
  let chobaPart = _.isLycee() ? id.split("-")[1].trim() : "";
  try {
    // 11  Fetch old list (2022)
    oldList(nivPart, chobaPart, ara);

    // 12 Fetch new list (this_year)
    newList(nivPart, chobaPart, ara);

    // 12-1 Fetch list with s_wafid = 1 (this_year)
    twoList(nivPart, chobaPart, ara);

    // 13 Fetch list with s_moiid = 1 (this_year)
    moiidList(nivPart, chobaPart, ara);

    // 13-1 Fetch list with s_wafid = 1 and s_moiid = 1 (this_year)
    moiidwafidList(nivPart, chobaPart, ara);

    // Update document title and text
    document.title = "استقصاء " + id.split("-").join(" ");
    $t.innerHTML = "استقصاء " + id.split("-").join(" ");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
async function oldList(nivPart, chobaPart, ara) {
  const rows = await istiksaaDataTable
    .where("s_niv")
    .startsWith(nivPart)
    .and(
      (item) =>
        (!_.isLycee() || item.s_choba.includes(chobaPart)) &&
        item.s_annee === last_year &&
        item.out === 0
    )
    .toArray();
  $elevenone.innerHTML = "";
  let totla = [];
  let girl = [];
  if (rows.length < 1) {
    $twelveone.innerHTML =
      '<tr><h1 class="m-0 text-center fw-bold">لا يوجد</h1></tr>';
  }
  if (rows.length > 0) {
    for (let i = 0; i < ara.length; i++) {
      let d = 0,
        g = 0;
      for (let index = 0; index < rows.length; index++) {
        if (i == 0) {
          if (_.age(rows[index].s_birthday, last_year) <= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, last_year) <= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i == ara.length - 1) {
          if (_.age(rows[index].s_birthday, last_year) >= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, last_year) >= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i != 0 && i != ara.length - 1) {
          if (_.age(rows[index].s_birthday, last_year) == Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, last_year) == Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
      }
      totla[i] = d;
      girl[i] = g;
    }
    let tr = `<tr><th>السن</th>`;
    for (let index = 0; index < ara.length; index++) {
      tr += `<th>${ara[index]}</th>`;
    }
    tr += `<th>المجموع</th>`;
    tr += `</tr><tr><th>مجموع</th>`;
    for (let index = 0; index < totla.length; index++) {
      tr += `<td>${totla[index]}</td>`;
    }
    tr += `<th>${count(totla)}</th>`;
    tr += `</tr><tr><th>إناث</th>`;
    for (let index = 0; index < girl.length; index++) {
      tr += `<td>${girl[index]}</td>`;
    }
    tr += `<th>${count(girl)}</th>`;
    tr += `</tr>`;
    $elevenone.innerHTML = tr;
  }
}
function count(array) {
  return array.reduce((sum, num) => sum + num, 0);
}

async function newList(nivPart, chobaPart, ara) {
  const rows = await istiksaaDataTable
    .where("s_niv")
    .startsWith(nivPart)
    .and(
      (item) =>
        (!_.isLycee() || item.s_choba.includes(chobaPart)) &&
        item.s_annee === this_year &&
        item.out === 0
    )
    .toArray();
  console.log(rows);
  $twelveone.innerHTML = "";
  let totla = [];
  let girl = [];
  if (rows.length < 1) {
    $twelveone.innerHTML =
      '<tr><h1 class="m-0 text-center fw-bold">لا يوجد</h1></tr>';
  }
  if (rows.length > 0) {
    for (let i = 0; i < ara.length; i++) {
      let d = 0,
        g = 0;
      for (let index = 0; index < rows.length; index++) {
        if (i == 0) {
          if (_.age(rows[index].s_birthday, this_year) <= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) <= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i == ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) >= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) >= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i != 0 && i != ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) == Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) == Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
      }
      totla[i] = d;
      girl[i] = g;
    }
    let tr = `<tr><th>السن</th>`;
    for (let index = 0; index < ara.length; index++) {
      tr += `<th>${ara[index]}</th>`;
    }
    tr += `<th>المجموع</th>`;
    tr += `</tr><tr><th>مجموع</th>`;
    for (let index = 0; index < totla.length; index++) {
      tr += `<td>${totla[index]}</td>`;
    }
    tr += `<th>${count(totla)}</th>`;
    tr += `</tr><tr><th>إناث</th>`;
    for (let index = 0; index < girl.length; index++) {
      tr += `<td>${girl[index]}</td>`;
    }
    tr += `<th>${count(girl)}</th>`;
    tr += `</tr>`;
    $twelveone.innerHTML = tr;
  }
}
async function twoList(nivPart, chobaPart, ara) {
  const rows = await istiksaaDataTable
    .where("s_niv")
    .startsWith(nivPart)
    .and(
      (item) =>
        (!_.isLycee() || item.s_choba.includes(chobaPart)) &&
        item.s_wafid === 1 &&
        item.s_annee === this_year &&
        item.out === 0
    )
    .toArray();
  $twelvetwo.innerHTML = "";
  let totla = [];
  let girl = [];
  if (rows.length < 1) {
    $twelvetwo.innerHTML =
      '<tr><h1 class="m-0 text-center fw-bold">لا يوجد</h1></tr>';
  }
  if (rows.length > 0) {
    for (let i = 0; i < ara.length; i++) {
      let d = 0,
        g = 0;
      for (let index = 0; index < rows.length; index++) {
        if (i == 0) {
          if (_.age(rows[index].s_birthday, this_year) <= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) <= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i == ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) >= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) >= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i != 0 && i != ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) == Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) == Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
      }
      totla[i] = d;
      girl[i] = g;
    }
    let tr = `<tr><th>السن</th>`;
    for (let index = 0; index < ara.length; index++) {
      tr += `<th>${ara[index]}</th>`;
    }
    tr += `<th>المجموع</th>`;
    tr += `</tr><tr><th>مجموع</th>`;
    for (let index = 0; index < totla.length; index++) {
      tr += `<td>${totla[index]}</td>`;
    }
    tr += `<th>${count(totla)}</th>`;
    tr += `</tr><tr><th>إناث</th>`;
    for (let index = 0; index < girl.length; index++) {
      tr += `<td>${girl[index]}</td>`;
    }
    tr += `<th>${count(girl)}</th>`;
    tr += `</tr>`;
    $twelvetwo.innerHTML = tr;
  }
}
async function moiidList(nivPart, chobaPart, ara) {
  const rows = await istiksaaDataTable
    .where("s_niv")
    .startsWith(nivPart)
    .and(
      (item) =>
        (!_.isLycee() || item.s_choba.includes(chobaPart)) &&
        item.s_moiid === 1 &&
        item.s_annee === this_year &&
        item.out === 0
    )
    .toArray();
  $moiidone.innerHTML = "";
  let totla = [];
  let girl = [];
  if (rows.length < 1) {
    $moiidone.innerHTML =
      '<tr><h1 class="m-0 text-center fw-bold">لا يوجد</h1></tr>';
  }
  if (rows.length > 0) {
    for (let i = 0; i < ara.length; i++) {
      let d = 0,
        g = 0;
      for (let index = 0; index < rows.length; index++) {
        if (i == 0) {
          if (_.age(rows[index].s_birthday, this_year) <= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) <= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i == ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) >= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) >= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i != 0 && i != ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) == Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) == Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
      }
      totla[i] = d;
      girl[i] = g;
    }
    let tr = `<tr><th>السن</th>`;
    for (let index = 0; index < ara.length; index++) {
      tr += `<th>${ara[index]}</th>`;
    }
    tr += `<th>المجموع</th>`;
    tr += `</tr><tr><th>مجموع</th>`;
    for (let index = 0; index < totla.length; index++) {
      tr += `<td>${totla[index]}</td>`;
    }
    tr += `<th>${count(totla)}</th>`;
    tr += `</tr><tr><th>إناث</th>`;
    for (let index = 0; index < girl.length; index++) {
      tr += `<td>${girl[index]}</td>`;
    }
    tr += `<th>${count(girl)}</th>`;
    tr += `</tr>`;
    $moiidone.innerHTML = tr;
  }
}
async function moiidwafidList(nivPart, chobaPart, ara) {
  const rows = await istiksaaDataTable
    .where("s_niv")
    .startsWith(nivPart)
    .and(
      (item) =>
        (!_.isLycee() || item.s_choba.includes(chobaPart)) &&
        item.s_wafid === 1 &&
        item.s_moiid === 1 &&
        item.s_annee === this_year &&
        item.out === 0
    )
    .toArray();
  console.log(rows);
  $wafidtwo.innerHTML = "";
  let totla = [];
  let girl = [];
  if (rows.length < 1) {
    $wafidtwo.innerHTML =
      '<tr><h1 class="m-0 text-center fw-bold">لا يوجد</h1></tr>';
  }
  if (rows.length > 0) {
    for (let i = 0; i < ara.length; i++) {
      let d = 0,
        g = 0;
      for (let index = 0; index < rows.length; index++) {
        if (i == 0) {
          if (_.age(rows[index].s_birthday, this_year) <= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) <= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i == ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) >= Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) >= Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
        if (i != 0 && i != ara.length - 1) {
          if (_.age(rows[index].s_birthday, this_year) == Number(ara[i])) d++;
          if (
            _.age(rows[index].s_birthday, this_year) == Number(ara[i]) &&
            rows[index].s_gender.includes("أنثى")
          )
            g++;
        }
      }
      totla[i] = d;
      girl[i] = g;
    }
    let tr = `<tr><th>السن</th>`;
    for (let index = 0; index < ara.length; index++) {
      tr += `<th>${ara[index]}</th>`;
    }
    tr += `<th>المجموع</th>`;
    tr += `</tr><tr><th>مجموع</th>`;
    for (let index = 0; index < totla.length; index++) {
      tr += `<td>${totla[index]}</td>`;
    }
    tr += `<th>${count(totla)}</th>`;
    tr += `</tr><tr><th>إناث</th>`;
    for (let index = 0; index < girl.length; index++) {
      tr += `<td>${girl[index]}</td>`;
    }
    tr += `<th>${count(girl)}</th>`;
    tr += `</tr>`;
    $wafidtwo.innerHTML = tr;
  }
}
