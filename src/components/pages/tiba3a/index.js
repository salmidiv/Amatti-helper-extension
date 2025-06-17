import { settingsTable } from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";
const fetch_data = async () => {
  const data = await settingsTable.toArray();
  const modir = _.big(data.length, 0) ? data[0].modir_name : "";
  return modir;
};
notify.warning_note(
  $notify,
  "تم إصلاح خاصية إدراج الختم"
  //"تحديث جديد لخاصية إضافة الختم للكشوف، حيث أصبحت الأبعاد غير مهمة (فقط يجب قص الختم على الحواف) وذلك بسبب إضافة خاصية تحديد الأبعاد مباشرة بعد رفع الصورة باستخدام عناصر التحريك الملونة بالأزرق، يجب إخفاء عناصر التحريك بعد الإنتهاء من عملية تحديد الأبعاد المناسبة لكي لا تظهر أثناء الطباعة"
);

_.btnEvent(_.getid("add_admin_name"), "click", addAdminName);
_.btnEvent(_.getid("add_modir_name"), "click", ModirName);
_.btnEvent(_.getid("add_nbr_to_paper"), "click", NbrToPaper);
_.btnEvent(_.getid("color_small_moy"), "click", colorSmallMoy);
_.btnEvent(_.getid("add_stamp"), "change", AddStamp);

function addAdminName() {
  let div = $("#division option:selected").text(),
    local_admin_name = localStorage.adminName,
    codiv = document.getElementsByTagName("table"),
    e = document.getElementById("division"),
    niv_name = e.options[e.selectedIndex].text;

  const admin_name = prompt(
    `يرجو منكم ادخال اسم الأستاذ مسؤول القسم لقسم:${niv_name} ، حتى يتم ادراجه في الكشوف`,
    local_admin_name
  );
  if (!admin_name) return;
  localStorage.adminName = admin_name;
  codiv = document.getElementsByTagName("table");
  var pit = document.querySelectorAll(`td:contains('الاستاذ الرئيسي')`);

  for (var i = 0; i < pit.length; i++) {
    pit[
      i
    ].innerHTML = `<span style="font-weight:bold;font-size:12;">&nbsp;&nbsp;الاستاذ الرئيسي <span style="font-weight:bold;font-size:12;">( ${admin_name})</span ></span>  `;
  }
}

async function ModirName() {
  let div = $("#division option:selected").text(),
    local_modir_name = await fetch_data(),
    codiv = document.getElementsByTagName("table"),
    modir_name = prompt(
      "يرجو منكم ادخال اسم المدير حتى يتم ادراجه في الكشوف",
      local_modir_name
    );
  localStorage.modir_name = modir_name;
  var pit = document.querySelectorAll("#myDiv img");
  var pitArray = Array.from(pit);
  const results = pitArray.filter((element) => {
    console.log(element, element.src);
    if (element.src.includes("data:image/png;base64")) {
      return true;
    }
    return false;
  });

  for (var i = 0; i < results.length; i++) {
    var sS = document.getElementById("modir_" + i);
    if (sS) sS.remove();

    const modir_span = `<span id = "modir_${i}" style = "font-weight: bold; top: 0px; position: absolute; left: 3rem; z-index:99"> ${modir_name}</span> `;
    var targetDiv = results[i].parentNode.parentNode.children[2];
    if (targetDiv) {
      targetDiv.style.position = "relative";
      targetDiv.style.height += "151.181px";
      targetDiv.innerHTML += modir_span;
    }
  }
}

function colorSmallMoy() {
  var codiv = document.getElementsByTagName("table");
  let cl = 6;
  let cls = 6;
  let max = 10;
  let last = 4;
  last = _.isPrimary() ? 3 : last;
  cl = _.isPrimary() ? 8 : cl;
  max = _.isPrimary() ? 5 : max;
  cl = _.isLycee() ? 6 : cl;
  last = _.isLycee() ? 9 : last;
  for (var p = 1; p < codiv.length; p += 4) {
    let t_rows = codiv[p].rows;
    for (var i = 1; i < t_rows.length - 8; i++) {
      let t_cell = t_rows[i].cells[cl];
      const moy = t_cell.innerText.replace(/^\D+/g, "");
      if (Number(moy) && moy < max) t_cell.style = "background: #ff8c8c";
      if (t_cell.innerText.includes("معفى"))
        t_cell.style = "background: #ada3a3";
    }
  }
}

function AddStamp() {
  var s = document.getElementById("add_stamp");
  var img = document.createElement("img");
  img.src = URL.createObjectURL(s.files[0]);
  img.width = "133";
  img.height = "133";
  var codiv = document.getElementsByTagName("table");

  // تعديل طريقة إنشاء الصورة لتكون قابلة للتمديد والتحريك من جميع الجهات
  var stri = `
    <div class="stamp-container" style="position: relative; width: 113.39px; height: 113.39px; cursor: move;">
      <img src="${img.src}" class="resizable-stamp" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"/>
      <div class="resize-handle top-left" style="position: absolute; width: 10px; height: 10px; background: #4285f4; top: 0; left: 0; cursor: nw-resize; border-radius: 2px; z-index: 20; opacity: 0; transition: opacity 0.2s;"></div>
      <div class="resize-handle top-right" style="position: absolute; width: 10px; height: 10px; background: #4285f4; top: 0; right: 0; cursor: ne-resize; border-radius: 2px; z-index: 20; opacity: 0; transition: opacity 0.2s;"></div>
      <div class="resize-handle bottom-left" style="position: absolute; width: 10px; height: 10px; background: #4285f4; bottom: 0; left: 0; cursor: sw-resize; border-radius: 2px; z-index: 20; opacity: 0; transition: opacity 0.2s;"></div>
      <div class="resize-handle bottom-right" style="position: absolute; width: 10px; height: 10px; background: #4285f4; bottom: 0; right: 0; cursor: se-resize; border-radius: 2px; z-index: 20; opacity: 0; transition: opacity 0.2s;"></div>
    </div>
  `;

  var pit = document.querySelectorAll("#myDiv img");
  var pitArray = Array.from(pit);
  const results = pitArray.filter((element) => {
    if (element.src.includes("data:image/png;base64")) {
      return true;
    }
    return false;
  });

  for (var i = 0; i < results.length; i++) {
    var sS = document.getElementById("span_" + i);
    if (sS) sS.remove();

    var span = `<span id="span_${i}" style="font-weight: bold; top: 0px; position: absolute; left: 5rem;"> ${stri}</span>`;
    var targetDiv = results[i].parentNode.parentNode.children[2];
    targetDiv.style.position = "relative";
    targetDiv.style.height += "151.181px";
    targetDiv.innerHTML += span;

    // إضافة وظيفة التمديد للصورة بعد إضافتها للصفحة مع زيادة وقت الانتظار
    const currentIndex = i;
    setTimeout(() => {
      const stampContainer = document
        .getElementById(`span_${currentIndex}`)
        .querySelector(".stamp-container");
      if (stampContainer) {
        initResizable(stampContainer);
      }
    }, 500);
  }

  // Reset the file input after processing
  s.value = "";
}

// وظيفة لتمكين خاصية تغيير حجم الختم من جميع الجهات وتحريكه
function initResizable(container) {
  // التحقق من وجود العنصر
  if (!container) {
    console.log("خطأ: العنصر container غير موجود");
    return;
  }

  // التحقق من وجود العناصر الفرعية
  const stamp = container.querySelector(".resizable-stamp");
  const handles = container.querySelectorAll(".resize-handle");

  if (!stamp) {
    console.log("خطأ: العنصر resizable-stamp غير موجود");
    return;
  }

  if (handles.length === 0) {
    console.log("خطأ: عناصر resize-handle غير موجودة");
    return;
  }

  // إضافة منطقة السحب في وسط الختم
  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.style.cssText =
    "position: absolute; width: 30px; height: 30px; background: rgba(66, 133, 244, 0.3); top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: move; border-radius: 50%; z-index: 10; opacity: 0; transition: opacity 0.2s;";
  container.appendChild(dragHandle);

  // Add hover effect to show handles
  container.addEventListener("mouseenter", () => {
    handles.forEach((handle) => {
      handle.style.opacity = "1";
    });
    dragHandle.style.opacity = "1";
  });

  container.addEventListener("mouseleave", () => {
    handles.forEach((handle) => {
      handle.style.opacity = "0";
    });
    dragHandle.style.opacity = "0";
  });

  let isResizing = false;
  let isDragging = false;
  let currentHandle = null;
  let originalWidth,
    originalHeight,
    originalX,
    originalY,
    originalTop,
    originalLeft;
  let lastWidth, lastHeight, lastTop, lastLeft;

  // إضافة مستمع حدث للسحب
  dragHandle.addEventListener("mousedown", function (e) {
    isDragging = true;
    originalX = e.clientX;
    originalY = e.clientY;
    originalLeft = parseFloat(getComputedStyle(container).left) || 0;
    originalTop = parseFloat(getComputedStyle(container).top) || 0;
    e.preventDefault();
  });

  // إضافة مستمعي أحداث لتغيير الحجم
  handles.forEach((handle) => {
    handle.addEventListener("mousedown", function (e) {
      isResizing = true;
      currentHandle = handle;
      originalWidth = parseFloat(getComputedStyle(container).width);
      originalHeight = parseFloat(getComputedStyle(container).height);
      originalX = e.clientX;
      originalY = e.clientY;
      originalLeft = parseFloat(getComputedStyle(container).left) || 0;
      originalTop = parseFloat(getComputedStyle(container).top) || 0;
      e.preventDefault();
    });
  });

  document.addEventListener("mousemove", function (e) {
    // معالجة تغيير الحجم
    if (isResizing) {
      let deltaX = e.clientX - originalX;
      let deltaY = e.clientY - originalY;
      let newWidth = originalWidth;
      let newHeight = originalHeight;
      let newTop = originalTop;
      let newLeft = originalLeft;

      // تحديد التغييرات بناءً على المقبض المستخدم
      if (currentHandle.classList.contains("top-left")) {
        newWidth = originalWidth - deltaX;
        newHeight = originalHeight - deltaY;
        newLeft = originalLeft + deltaX;
        newTop = originalTop + deltaY;
      } else if (currentHandle.classList.contains("top-right")) {
        newWidth = originalWidth + deltaX;
        newHeight = originalHeight - deltaY;
        newTop = originalTop + deltaY;
      } else if (currentHandle.classList.contains("bottom-left")) {
        newWidth = originalWidth - deltaX;
        newHeight = originalHeight + deltaY;
        newLeft = originalLeft + deltaX;
      } else if (currentHandle.classList.contains("bottom-right")) {
        newWidth = originalWidth + deltaX;
        newHeight = originalHeight + deltaY;
      }

      // لا نحافظ على نسبة العرض إلى الارتفاع (حسب طلب المستخدم)
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      // تطبيق التغييرات على الحاوية الحالية
      container.style.width = newWidth + "px";
      container.style.height = newHeight + "px";
      container.style.top = newTop + "px";
      container.style.left = newLeft + "px";

      // تخزين القيم الحالية لاستخدامها في مزامنة الأختام الأخرى
      lastWidth = newWidth;
      lastHeight = newHeight;
      lastTop = newTop;
      lastLeft = newLeft;

      // مزامنة جميع الأختام الأخرى
      syncAllStamps(container, newWidth, newHeight, newTop, newLeft);

      e.preventDefault();
    }

    // معالجة السحب
    if (isDragging) {
      let deltaX = e.clientX - originalX;
      let deltaY = e.clientY - originalY;
      let newTop = originalTop + deltaY;
      let newLeft = originalLeft + deltaX;

      // تطبيق التغييرات على الحاوية الحالية
      container.style.top = newTop + "px";
      container.style.left = newLeft + "px";

      // تخزين القيم الحالية لاستخدامها في مزامنة الأختام الأخرى
      lastTop = newTop;
      lastLeft = newLeft;

      // مزامنة جميع الأختام الأخرى (فقط الموقع)
      syncAllStamps(container, null, null, newTop, newLeft);

      e.preventDefault();
    }
  });

  document.addEventListener("mouseup", function () {
    isResizing = false;
    isDragging = false;
    currentHandle = null;
  });
}

// وظيفة لمزامنة جميع الأختام
function syncAllStamps(currentContainer, width, height, top, left) {
  // البحث عن جميع حاويات الأختام
  const allStampContainers = document.querySelectorAll(".stamp-container");

  allStampContainers.forEach((container) => {
    // تجاهل الحاوية الحالية التي تم تعديلها
    if (container === currentContainer) return;

    // تطبيق نفس التغييرات على جميع الحاويات الأخرى
    if (width !== null && height !== null) {
      container.style.width = width + "px";
      container.style.height = height + "px";
    }

    if (top !== null && left !== null) {
      container.style.top = top + "px";
      container.style.left = left + "px";
    }
  });
}

function NbrToPaper() {
  let tr_nbr = _.isLycee() ? 5 : 4;
  var _div = document.getElementById("sub_div"),
    tbls = document.getElementsByTagName("table"),
    text = _.isLycee() ? "التقييم" : "القسم :";

  var thElements = document.querySelectorAll("th");

  var pit = Array.from(thElements).filter(function (element) {
    return element.textContent.includes(text);
  });
  var nbr = tbls.length / 4,
    to = 1;
  for (var i = 0; i < pit.length; i++) {
    pit[i].parentNode.firstChild.innerHTML = to++ + " / " + pit.length;
  }
}
