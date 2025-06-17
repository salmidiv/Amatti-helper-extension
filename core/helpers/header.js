import { settingsTable } from "../../../core/db/conn.js";
import { this_year } from "./const.js";
import { _ } from "./helpers.js";

let setting = await settingsTable.toArray();
export const header = `
<header class="hacen">
    <p class="fs-3 fw-bold text-center m-2">
        الجمهورية الجزائرية الديمقراطية الشعبية
    </p>
    <p class="fs-3 fw-bold text-center m-2">
        وزارة التربية الوطنية
    </p>
    <div style="display: flex; justify-content: space-between;">
        <div>
            <p class="fs-3 m-1">
                مديرية التربية لولاية
                ${setting[0].walaya}
            </p>
            <p class="fs-3 m-1">
                ${
                  _.isPrimary()
                    ? setting[0].school_type
                    : setting[0].school_type + "ة"
                } 
                ${setting[0].school_name}
            </p>
        </div>
        <p class="fs-3 m-1">
            السنة الدراسية:
            ${this_year}-${this_year + 1}
        </p>
    </div>
</header>
`;
export const header2 = `
 <header class="fs-c">
        <div style="display: flex; justify-content: space-between">
          <p class="fs-3 fw-bold text-center m-1">وزارة التربية الوطنية</p>
          <p class="fs-3 m-1">  مديرية التربية لولاية
                ${setting[0].walaya}</p>
        </div>
        <div style="display: flex; justify-content: space-between">
          <p class="fs-3 m-1">  ${
            _.isPrimary()
              ? setting[0].school_type
              : setting[0].school_type + "ة"
          } 
                ${setting[0].school_name}</p>
          <p class="fs-3 m-1"> السنة الدراسية:
            ${this_year}-${this_year + 1}</p>
        </div>
      </header>

`;
export const footer = `
<p dir="rtl" class="fs-3 hacen m-1 flex end-align">
    حرر بــ: ${
      setting[0].commune
    }، في&#8202;&#8202;<span contenteditable="true"> ${_.today()} </span>
</p>
<p dir="rtl" class="fs-3 hacen m-1 ml-5 flex end-align">
    <span>إمضاء المدير</span>
</p>
`;

export const footer2 = `
<p dir="rtl" class="fs-4 hacen m-1 flex end-align">
    حرر بــ: ${
      setting[0].commune
    }، في&#8202;&#8202;<span contenteditable="true"> ${_.today()} </span>
</p>
`;
