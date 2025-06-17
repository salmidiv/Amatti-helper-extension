import { db } from "../../../core/db/conn.js";
import { segments, this_year } from "../../../core/helpers/const.js";
import { footer, header } from "../../../core/helpers/header.js";
import { _ } from "../../../core/helpers/helpers.js";
document.title = `قوائم التلاميذ المشطوبين`
load_data()
async function load_data() {
    const response = await db.stopstudents
        .where({ 's_annee': this_year })
        .toArray()
    groupedData(response)
}
function groupedData(response) {
    const groupedData = response.reduce((groups, item) => {
        const { s_niv } = item;
        const groupKey = `${s_niv}`;
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
    print(groupedData)
}

function print(groupedData) {
    let html = `<div class="sheet p-5mm h-auto">
            <div>${header}</div>`
    const thead = `
        <thead>
            <tr>
                <th class=" th_s" style="width: 35px;">الرقم  </th>
                <th class=" th_s" style="width: 130px;">رقم التعريف </th>
                <th class="th_s">الاسم واللقب </th>
                <th class="th_s" style="width: 50px;">الجنس</th>
                <th class="th_s" style="width: 100px;">تاريخ الميلاد</th>
                <th class="th_s" style="width:135px">المستوى</th>
                <th class="th_s" style="width: 80px;">تاريخ الشطب</th>
                <th class="th_s" style="width: 88px;">سبب الشطب</th>
            </tr>
        </thead>
    `
    let i = 0
    if(Object.keys(groupedData).length == 0) {
        html += `
            <h1 class="m-0 p-0 hacen fs-2 text-center">قوائم التلاميذ المشطوبين</h1>
            <div class="content">
                <table class="table mb-3 fs-4 hacen text-center">
                    ${thead}
                    <tbody id="$studentsList">
                        <tr>
                            <td colspan="8">
                            لا يوجد تلاميذ مشطوبين
                            </td>
                        <tr/>
                    </tbody>
                </table>
            </div>
        `
    }
    else {
        for (const key in groupedData) {
            html += `
            <h1 class="m-0 p-0 hacen fs-2 text-center">قوائم التلاميذ المشطوبين لمستوى: ال${key.split('-').join(' ')} ${_.isPrimary() ? 'ابتدائي' : localStorage.schoolType}</h1>
            <div class="content">
                <table class="table mb-3 fs-4 hacen text-center">
                ${thead}
                <tbody id="$studentsList">`
            html += create_table(groupedData[key])
            html += `</tbody></table></div>`
        }
    }

    html += `<div>${footer}</div></div>`
    document.body.innerHTML = html
}
function create_table(group) {
    let tr = ''
    let index = 1
    for (const item of group) {
        tr += `
        <tr>
            <td>${index++}</td>
            <td>${item.s_matt}</td>
            <td>${item.s_nom} ${item.s_prenom}</td>
            <td>${item.s_gender}</td>
            <td>${item.s_birthday}</td>
            <td>${item.s_niv ?? ''} ${item.s_choaba ?? ''} ${item.s_section ?? ''}</td>
            <td>${item.chatb_date ?? ''}</td>
            <td>${item.chatb_sabab}</td>
        </tr>`;
    }
    return tr
}





