import { _ } from "../../../core/helpers/helpers.js";
import {this_year, this_trim} from "../../../core/helpers/const.js";
import {header, footer} from "../../../core/helpers/header.js"; 
import {notify } from "../../../core/helpers/notify.js";

  let title = 'قائمة التلاميذ المعفيين من الرياضة';
  document.title = title;
run()

async function get_matiers(all_classes) {
  	const all_mat = [];
  	for (var i = 0; i < all_classes.length; i++) {
  	const response = await _.fetchData(
		    "matiere_hadjz",
		    { division: all_classes[i].value, annee: this_trim },
		    "text"
	 	);
  	const optionArray = response
    .match(/<option value='(.*?)'>(.*?)<\/option>/g)
    .map((option) => {
      const match = option.match(/<option value='(.*?)'>(.*?)<\/option>/);
      return { value: match[1], text: match[2].trim() };
    })
   .filter((option) => option.text.includes("رياضية"));
   	const m = optionArray.length != 0?  optionArray[0].value : ""
	all_mat.push(m)
  	}
  	return all_mat;
}


async function allClass() {
	const response = await _.fetchData(
	    "scolarite/en_chiffre/suivi_bulletin/get_division",
	    {
	      annee: this_year,
	      isAjax: true,
	    },
	    "text"
	 );
  const optionArray = response
    .match(/<option value='(.*?)'>(.*?)<\/option>/g)
    .map((option) => {
      const match = option.match(/<option value='(.*?)'>(.*?)<\/option>/);
      return { value: match[1], text: match[2].trim() };
    })
    .filter((option) => option.value !== "");
    return optionArray
}
async function run() {
/*
  if (_.isPrimary()) {
    _.qSel("#content").innerHTML = '<h1 style="text-align: center; font-size: 20px; font-weight: 800;line-height: 25px;text-align:center">مادة التربية البدنية غير موجودة في الطور الابتدائي </h1>';
  	return false
  }
  */
   notify.toast({
    type: "done",
    color: "success",
    message: "تم حفظ البيانات بنجاح",
  });
    var stop = false;
    const all_classes = await allClass();
    let all_sport = [];
    const key = 'value';
    const all_class = [
      ...new Map(all_classes.map((item) => [item[key], item])).values(),
    ];
    let annee = this_trim;
    let matieres = _.isCem() ? 15 : await get_matiers(all_class);
    const moyindex = _.isPrimary() ? "09" : "01"
    for (var i = 0; i < all_class.length; i++) {
      	const matie = Array.isArray(matieres) ? matieres[i] : matieres;
		const response = await _.fetchData(
		    "eleve_hadjz",
		    { annee: annee, division: all_class[i].value, matiere: matie }
	 	);
		const data = typeof response.data == "undefined" ? [] : response.data 
		console.log(data)
        for (let index = 0; index < data.length; index++) {
            if (data[index][moyindex]?.includes('معفى')) {
              let note = {
                tagwim: data[index]['01'],
                dev: data[index]['03'],
                exam: data[index]['09'],
                fullnam: data[index].nom + ' ' + data[index].prenom,
                birth: data[index].date_n,
                matt: data[index].matricule,
                div: all_class[i].value,
                divtext: all_class[i].text,
              };
              all_sport.push(note);
            }
        }
    }
    console.log(all_sport)
    if (all_sport.length == 0) _.qSel("#content").innerHTML = '<h1 style="text-align: center; font-size: 20px; font-weight: 800;line-height: 25px;text-align:center"> لا توجد لديك اعفاءات</h1>';

    const html = all_sport.map((student,i) => {
    	return  `<tr>
                  <td>${student.divtext.split(' ').filter(e => e !== "").join(' ')} </td>
                  <td>${i + 1} </td>
                  <td>${student.fullnam} </td>
                  <td>${student.birth} </td>
                  <td> </td>
                </tr>`

    }).join(' ')
    _.qSel("#content").innerHTML = header
    _.qSel("#content").innerHTML += `<h1 style="text-align: center; font-size: 20px; font-weight: 800;line-height: 25px;">
                التلاميذ المعفيين من التربية البدنية 
              </h1>`
    _.qSel("#content").innerHTML += `
    	<table id="table"  style=" text-align:center;font-weight:bold; font-size:14px; width: 100%;" border="1" contenteditable="true">
                <thead>
                  <tr>
                    <th style="width:240px">المستوى</th>
                    <th class="th_s">الرقم </th>
                    <th class="th_s" style="width: 230px;">الاسم واللقب </th>
                    <th class="th_s" style="width:90px">تاريخ الميلاد</th>
                    <th style="min-width:200px">ملاحظات</th>
                  </tr>
                </thead>
                <tbody class="data">
                </tbody>
              </table>
    `
     _.qSel(".data").innerHTML = html
    _.qSel("#content").innerHTML += footer

   
    _.re_order(0);
}

