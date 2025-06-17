import { segments, extension_url } from "../helpers/const.js";
let style =
  segments[1] && segments[1] == "home_page"
    ? "width: 90%!important;margin: 0px auto;"
    : "";

export let temp = `
        <div id="$amatti_app" class="no-print card h-45 w-100 bg-1 px-3 br-4 mb-2 border-d border-Sky" style="${style}">
            <div class="head ml-3">
                <h2 class="hacen m-0 logo d-flex align-items-center">
                    <img src=" ${extension_url}/assets/img/robot.gif" alt="مساعد الرقمنة" width="36px" height="36px">
                        مساعد الرقمنة v2 - <span id="version" class="badge badge-primary"></span>
                </h2>
                <!--<button class="btn btn-dark">الدعم المادي</button>-->
            </div>
            <div id="amattiContent" class="flex-l hacen"></div>
            <a class="btn-n help mr-3" href="https://www.facebook.com/groups/salmi.tahar.amatti" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                    <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path><path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
                </svg>
            </a>
        </div>
        <button 
          onclick="$('#helper-modal').modal('show')"
        class="d-flex fs-2 align-items-center gap-1 hacen card bg-1 px-3 br-4 p-2 border-d border-Sky robot">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="23px" width="23px" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 2C13.5 2.44425 13.3069 2.84339 13 3.11805V5H18C19.6569 5 21 6.34315 21 8V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V8C3 6.34315 4.34315 5 6 5H11V3.11805C10.6931 2.84339 10.5 2.44425 10.5 2C10.5 1.17157 11.1716 0.5 12 0.5C12.8284 0.5 13.5 1.17157 13.5 2ZM0 10H2V16H0V10ZM24 10H22V16H24V10ZM9 14.5C9.82843 14.5 10.5 13.8284 10.5 13C10.5 12.1716 9.82843 11.5 9 11.5C8.17157 11.5 7.5 12.1716 7.5 13C7.5 13.8284 8.17157 14.5 9 14.5ZM16.5 13C16.5 12.1716 15.8284 11.5 15 11.5C14.1716 11.5 13.5 12.1716 13.5 13C13.5 13.8284 14.1716 14.5 15 14.5C15.8284 14.5 16.5 13.8284 16.5 13Z"></path></svg>
            <span>
                 الربوت المساعد  
            </span>
        </button>
    <div id="$notify" class="w-100" style="${style}"></div>
    <a href="https://amatti.education.dz/logout" class="btn btn-danger hacen fs-2" style="position: fixed;
    bottom: 45px;
    z-index: 999;
    left: 5px;"> تسجيل الخروج </a>
`;
