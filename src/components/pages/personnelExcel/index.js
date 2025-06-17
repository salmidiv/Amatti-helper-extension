import { _ } from "../../../../core/helpers/helpers.js";
import { notify } from "../../../../core/helpers/notify.js";

document.addEventListener("click", async (event) => {
  const classList = event.target.classList;
  switch (true) {
    case classList.contains("loadUsers"):
      loadUsers();
      break;
    case classList.contains("loadUsersBita"):
      loadUsersBita();
      break;
  }
});

async function loadUsers() {
  notify.toast({
    type: "warning",
    color: "warning",
    message:
      "الرجاء الانتظار حتى إنتهاء عملية الجلب، العملية تأخذ وقتا طويلا، يرجى عدم غلق النافذة",
  });
  let excel = [];

  const allP = (await _.fetchData("pers/personnel/list_etablissement")).data;
  const ccpcnn = (await _.fetchData("pers/personnel/list_info_detail")).data;
  console.log(allP);
  console.log(ccpcnn);
  allP.forEach(function (o) {
    ccpcnn.forEach(function (c) {
      if (o[1] === c[0]) {
        o.push(c[4], c[5]);
      }
    });
  });
  for (var i = 0; i < allP.length; i++) {
    const elm = allP[i];
    const id = elm[1];
    const user = await _.fetchData("pers/personnel/info_personnel", {
      id: id,
    });
    const userData = [
      id,
      elm[2],
      elm[3],
      elm[4],
      elm[5],
      elm[6],
      elm[7],
      elm[8],
      elm[10],
      elm[11],
      user.adr,
      user.cap,
      user.couple,
      user.cp,
      user.email,
      user.nbrenf,
      user.enf10,
      user.enfado,
      user.enfsco,
      user.grps,
      user.nomar,
      user.nomarm,
      user.nomlt,
      user.nomltm,
      user.port,
      user.prenomar,
      user.prenomarm,
      user.prenomarp,
      user.prenomlt,
      user.prenomltm,
      user.prenomltp,
      user.tel,
    ];
    excel.push(userData);
  }
  ex(excel, "p");
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
}

function ex(array, type = "") {
  let Heading;
  let file_title;
  if (type == "p") {
    file_title = "ملف بيانات المستخدمين";
    Heading = [
      [
        "الرقم الوظيفي",
        "اللقب",
        "الاسم",
        "تاريخ الميلاد",
        "الرتبة",
        "المادة",
        "الدرجة",
        "تاريخ السريان",
        "حساب ccp",
        "رقم ض اجتماعي",
        "العنوان",
        "القدرة البصرية",
        "ثنائي القطاع",
        "الرمز البريدي",
        "البريد الالكتروني",
        "عدد الأولاد",
        "الأكبر من 10 سنوات",
        "المتمدرسين",
        "عدد المتكفل بهم",
        "زمرة الدم",
        "لقب الأب",
        "لقب الأم",
        "لقب باللاتينية",
        "لقب الأم باللاتينية",
        "رقم الهاتف",
        "الاسم",
        "اسم الأم",
        "اسم الأب",
        "الاسم باللاتينية",
        "اسم الأم باللاتينية",
        "اسم الأب اللاتينية",
        "رقم الهاتف",
      ],
    ];
  } else {
    var head_cem = [
      [
        "رقم التعريف الوطني",
        "اللقب",
        "الاسم",
        "الجنس",
        "تاريخ الميلاد",
        "المستوى",
        "رقم الفوج",
        "رقم التسجيل",
        "اسم الأب",
        "لقب الأم",
        "اسم الأم",
        "العنوان",
        "البريد الالكتروني",
        "رقم الهاتف",
        "اللقب باللاتينية",
        "الاسم باللاتينية",
        "العنوان بالعربية",
        "العنوان باللاتينية",
        "رمز البلدية",
        "سنة الميلاد",
        "رقم شهادة الميلاد",
        "بلد الميلاد",
        "مزدوج الجنسية",
        "الجنسية الأصلية",
        "الجنسية المكتسبة",
        "بحكم(مفترض)",
        "الإشارة إلى عقد الميلاد",
        "دوي الاحتياجات",
        "رمز البلدية",
        "diss_musiq",
        "amz",
      ],
      //  ['رقم التعريف الوطني', 'اللقب', 'الاسم', 'الجنس', 'تاريخ الميلاد', 'المستوى', 'رقم الفوج', 'رقم التسجيل', 'العنوان الكامل للولي الشرعي', 'اسم الأب', 'لقب الأم', 'اسم الأم', 'رقم الهاتف', 'البريد الالكتروني'],
    ];
    var head_ly = [
      [
        "رقم التعريف الوطني",
        "اللقب",
        "الاسم",
        "الجنس",
        "تاريخ الميلاد",
        "المستوى",
        "الشعبة",
        "رقم الفوج",
        "رقم التسجيل",
        "اسم الأب",
        "لقب الأم",
        "اسم الأم",
        "العنوان",
        "البريد الالكتروني",
        "رقم الهاتف",
        "اللقب باللاتينية",
        "الاسم باللاتينية",
        "العنوان بالعربية",
        "العنوان باللاتينية",
        "رمز البلدية",
        "سنة الميلاد",
        "رقم شهادة الميلاد",
        "بلد الميلاد",
        "مزدوج الجنسية",
        "الجنسية الأصلية",
        "الجنسية المكتسبة",
        "بحكم(مفترض)",
        "الإشارة إلى عقد الميلاد",
        "دوي الاحتياجات",
        "رمز البلدية",
        "diss_musiq",
        "amz",
      ],
    ];
    Heading = s_type == "ثانوي" ? head_ly : head_cem;
    file_title = "ملف بيانات التلاميذ وأولياءهم";
  }
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(array, { origin: "A2", skipHeader: true });
  XLSX.utils.sheet_add_aoa(ws, Heading); //heading: array of arrays
  XLSX.utils.book_append_sheet(wb, ws);
  wb.Props = {
    Title: "بيانات التلاميذ وأولياء التلاميذ",
    Subject: "salmi tahar - amatti",
    Author: "salmi tahar - amatti",
    CreatedDate: new Date(),
  };
  /* fix headers */
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 }];
  wb.Workbook = { Views: [{ RTL: true }] };
  var wscols = [{ wch: 100 }, { wch: 100 }, { wch: 10 }, { wch: 20 }];
  wb["!cols"] = wscols;
  XLSX.writeFile(wb, file_title + ".xlsx");
  $notifyApp.classList.add("d-none");
}

async function loadUsersBita() {
  notify.toast({
    type: "warning",
    color: "warning",
    message:
      "الرجاء الانتظار حتى إنتهاء عملية الجلب، العملية تأخذ وقتا طويلا، يرجى عدم غلق النافذة",
  });
  const allP = (await _.fetchData("pers/personnel/list_etablissement")).data;
  let result = [];
  for await (const user of allP) {
    const userData = await _.fetchData(
      `pers/personnel/fiche/${user[1]}`,
      {},
      "text"
    );
    result.push(futch_d(userData));
  }
  to_excel(result);
  notify.toast({
    type: "done",
    color: "success",
    message: "تم تحميل البيانات بنجاح",
  });
}

function httpGets(theUrl, callback = function () {}) {
  //
  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      callback(xmlhttp.responseText);
    }
  };
  xmlhttp.open("GET", theUrl, false);
  xmlhttp.send();
}
function futch_d(text) {
  //console.log(text);
  var parser = new DOMParser(),
    doc = parser.parseFromString(text, "text/html"),
    words = [],
    split = "\n\t\t\t\t\t",
    t_data = [],
    result = doc.evaluate(
      "//div//text()",
      doc.body,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
  for (let i = 0; i < result.snapshotLength; i++) {
    let node = result.snapshotItem(i).nodeValue.trim();
    if (node.length > 0) words.push(node);
  }

  let services_index = words.indexOf("مجمل الخدمات");
  t_data.push(
    words[2].split(":")[1].trim(),
    words[3].split(split)[1].split(":")[1].trim(),
    words[3].split(split)[3],
    words[4].split(":")[1].trim(),
    words[5].split(split)[1],
    words[6].split(split)[1],
    words[7].split(split)[1],
    words[8].split(split)[1].trim(),
    words[8].split(split)[4].trim(),
    words[9].split(split)[1].trim(),
    words[11].split(":")[1].trim(),
    words[13].split("\n")[1].trim(),
    words[13].split("\n")[4] ? words[13].split("\n")[4].trim() : "",
    words[14].split("\n")[0].split(":")[1].trim(),
    words[14].split("\n")[3] ? words[14].split("\n")[3].trim() : "",
    words[15].split("\n")[0].split(":")[1].trim(),
    words[15].split("\n")[3].trim() ?? "",
    words[16].split("المؤسسة")[1].trim(),
    words[17].split(":")[1].trim(),
    words[18].split(split)[1]
      ? words[18].split(split)[1].split(":")[1].trim()
      : "",
    words[18].split(split)[3] ? words[18].split(split)[3].trim() : "",
    services_index > 25 ? words[23] : "",
    services_index > 25 ? words[24] : "",
    services_index > 25 ? words[25] : ""
  );
  if (words.length != services_index + 7) {
    let ser = [];
    for (
      let index = words.indexOf("إلى") + 1;
      index < words.length;
      index += 6
    ) {
      t_data.push(
        words[index],
        words[index + 1],
        words[index + 2],
        words[index + 3],
        words[index + 4],
        words[index + 5]
      );
    }
  }
  return t_data;
}

function to_excel(res) {
  let Heading = [
    [
      "الرقم الوظيفي",
      "اللقب",
      "الاسم",
      "تاريخ الميلاد",
      "مكان الميلاد",
      "الولاية",
      "الجنسية",
      "الحالة العائلية",
      "عدد الأولاد",
      "العنوان الشخصي",
      "الرتبة الحالية",
      "مادة التخصص /التفتيش",
      "الوضعية الإدارية",
      "الدرجة",
      "تاريخ سريانها",
      "تاريخ التوظيف",
      "تاريخ التعين في الرتبة الحالية",
      "اسم المؤسسة",
      "تاريخ التعين في المؤسسة الحالية",
      "النقطة التربوية",
      "تاريخها",
      "المؤهل",
      "تاريخ الشهادة",
      "التخصص",
      "مجمل الخدمات",
    ],
  ];
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(res, { origin: "A2", skipHeader: true });
  console.log(ws);
  XLSX.utils.sheet_add_aoa(ws, Heading); //heading: array of arrays
  XLSX.utils.book_append_sheet(wb, ws);
  const file_title = "بيانات بطاقة  المعلومات للمستخدمين";
  wb.Props = {
    Title: file_title,
    Subject: "salmi tahar - amatti",
    Author: "salmi tahar - amatti",
    CreatedDate: new Date(),
  };
  var wscols = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 }];
  wb.Workbook = { Views: [{ RTL: true }] };
  var wscols = [{ wch: 300 }, { wch: 300 }, { wch: 60 }, { wch: 80 }];
  wb["!cols"] = wscols;
  console.log(wb);
  XLSX.writeFile(wb, `${file_title}.xlsx`);
  $notifyApp.classList.add("d-none");
}
function calcAge(params) {
    // calc age
    
}
