import {
    FinalMoysTable,
    finalResTable,
    mawadTable,
    StatisTable,
} from "../../../../core/db/conn.js";
import { _ } from "../../../../core/helpers/helpers.js";
import { this_trim } from "../../../../core/helpers/const.js";
import { notify } from "../../../../core/helpers/notify.js";

document.addEventListener("click", async function (event) {
    const classList = event.target.classList;
    switch (true) {
        case classList.contains("dropStatData"):
            dropTable();
            break;
        case classList.contains("finalResults"):
            finalResultsData();
            break;
        case classList.contains("finalResultsMoys"):
            finalResultsMoysData();
            break;
        case classList.contains("studentsNotes"):
            studentsNotesData();
            break;
    }
});

async function dropTable() {
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    await FinalMoysTable.clear();
    await finalResTable.clear();
    await mawadTable.clear();
    await StatisTable.clear();
    notify.toast({
        type: "done",
        color: "success",
        message: "تمت العملية بنجاح",
    });
}

document.addEventListener("change", async function (event) {
    const classList = event.target.classList;
    switch (true) {
        case classList.contains("anneschool"):
            update_mark();
            break;
    }
});

async function update_mark() {
    const year = _.getid("anneschool").value;
    $divi.innerHTML = '<option value="all">تحميل الجميع</option>';
    if (year) {
        const data = await _.fetchData(
            "scolarite/en_chiffre/analyse_class/get_division",
            { annee: year, isAjax: true },
            "text"
        );
        console.log(data);
        $divi.innerHTML += data;
    }
}
function finalResultsData() {
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    if ($divi.value == "all") {
        load_marks(_.getid("anneschool").value);
    } else {
        load_by_one(_.getid("anneschool").value);
    }
}

async function load_marks(year) {
    const tre = year.slice(-1);
    let divs;
    try {
        divs = document.querySelectorAll(".divissionExt option");
    } catch (e) {
        console.error("Could not find #divi element:", e);
        return;
    }

    const validOptions = Array.from(divs).filter(
        (opt) => opt.value && opt.value !== "all"
    );
    const totalDivs = validOptions.length;
    let completedDivs = 0;
    let failedOptions = [];
    let progressElement = document.querySelector(".error-catch");
    if (!progressElement) {
        progressElement = document.createElement("div");
        progressElement.id = "waitText";
        progressElement.style.position = "fixed";
        progressElement.style.top = "10px";
        progressElement.style.left = "10px";
        progressElement.style.background = "#fff";
        progressElement.style.padding = "10px";
        progressElement.style.zIndex = "9999";
        document.body.appendChild(progressElement);
    }
    for (const option of validOptions) {
        const div = option.value;
        const text = option.text;
        const url = "scolarite/en_chiffre/analyse_class/get_list";
        const params = new URLSearchParams();
        params.append("trimestre", year);
        params.append("division", div);

        // Update progress
        completedDivs++;
        const progressText = `جاري التحميل: ${completedDivs}/${totalDivs} - قسم: ${text} (${Math.round(
            (completedDivs / totalDivs) * 100
        )}%)`;
        progressElement.textContent = progressText;
        console.log(progressText);

        try {
            const json = await fetch_data(url, params);

            if (!json || !json.data) {
                throw new Error("Invalid response data");
            }

            let res = json.data;
            let col = json.columns;

            // Process data based on trimester
            if (tre == 1) {
                // Keep as is
            }
            if (tre == 2) {
                res = res.map((innerArray) => [
                    ...innerArray.slice(0, 5),
                    ...innerArray
                        .slice(5)
                        .filter((_, index) => index % 2 !== 0),
                ]);
                const firstFiveItems = col.slice(0, 5);
                const filteredArr = col.filter((item) => item.includes("2"));
                col = firstFiveItems.concat(filteredArr);
            }
            if (tre == 3) {
                res = res.map((innerArray) => [
                    ...innerArray.slice(0, 5),
                    ...innerArray
                        .slice(5)
                        .filter(
                            (_, index) => (index - 2) % 3 === 0 && index >= 2
                        ),
                    sanawiMoy(innerArray, text),
                ]);
                const firstFiveItems = col.slice(0, 5);
                const filteredArr = col.filter((item) => item.includes("3"));
                const sana = filteredArr.concat("المعدل السنوي");
                col = firstFiveItems.concat(sana);
            }

            // Process results
            for (const [v, val] of res.entries()) {
                const uuid = generateUUID(`${val[1]}-${val[2]}-${val[3]}`);
                const d = {
                    uuid: uuid,
                    niv: div,
                    niv_text: text,
                    niv_sec: text.slice(-2),
                    annee: year,
                    tre: Number(tre),
                    data: JSON.stringify(val),
                };

                const data = await finalResTable
                    .where({ uuid, niv: div, tre: Number(tre), annee: year })
                    .first();

                if (data) {
                    await finalResTable
                        .where({
                            uuid,
                            niv: div,
                            tre: Number(tre),
                            annee: year,
                        })
                        .modify(d);
                } else {
                    await finalResTable.add(d);
                }
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // Process columns
            const d = {
                niv: div,
                annee: year,
                tre: Number(tre),
                data: JSON.stringify(col),
            };

            const data = await mawadTable
                .where({ niv: div, tre: Number(tre), annee: year })
                .first();

            if (data) {
                await mawadTable
                    .where({ niv: div, tre: Number(tre), annee: year })
                    .modify(d);
            } else {
                await mawadTable.add(d);
            }
        } catch (error) {
            console.error(`Failed to process division ${div}:`, error);
            failedOptions.push({ text, error: error.message });

            // Show immediate failure notification
            notify.toast({
                type: "error",
                color: "danger",
                message: `فشل تحميل قسم ${text}: ${error.message}`,
            });
        }

        // await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Final status report
    if (failedOptions.length > 0) {
        const failedMessage = `اكتملت العملية مع أخطاء. فشل تحميل: ${failedOptions
            .map((opt) => opt.text)
            .join(", ")}`;
        document.querySelector(".error-catch").textContent = failedMessage;

        notify.toast({
            type: "warning",
            color: "warning",
            message: failedMessage,
        });
        progressElement.textContent = failedMessage;
    } else {
        notify.toast({
            type: "done",
            color: "success",
            message: "تمت العملية بنجاح",
        });
        progressElement.textContent = "";
    }
}

async function loadmarks(year) {
    const tre = year.slice(-1);
    const divs = $divi.querySelectorAll("option");
    for (const option of divs) {
        if (option.value && option.value != "all") {
            const div = option.value;
            const text = option.text;
            const url = "scolarite/en_chiffre/analyse_class/get_list";
            const data = new URLSearchParams();
            data.append("trimestre", year);
            data.append("division", div);
            const json = await fetch_data(url, data);
            _.getid("waitText").innerHTML = "تم تحميل نتائج قسم: " + text;
            if (json.data) {
                let res = json.data;
                let col = json.columns;
                if (tre == 1) {
                    res = res;
                    col = col;
                }
                if (tre == 2) {
                    res = res.map((innerArray) => [
                        ...innerArray.slice(0, 5),
                        ...innerArray
                            .slice(5)
                            .filter((_, index) => index % 2 !== 0),
                    ]);
                    const firstFiveItems = col.slice(0, 5);
                    const filteredArr = col.filter((item) =>
                        item.includes("2")
                    );
                    col = firstFiveItems.concat(filteredArr);
                }
                if (tre == 3) {
                    res = res.map((innerArray) => [
                        ...innerArray.slice(0, 5),
                        ...innerArray
                            .slice(5)
                            .filter(
                                (_, index) =>
                                    (index - 2) % 3 === 0 && index >= 2
                            ),
                        sanawiMoy(innerArray, text),
                    ]);
                    const firstFiveItems = col.slice(0, 5);
                    const filteredArr = col.filter((item) =>
                        item.includes("3")
                    );
                    const sana = filteredArr.concat("المعدل السنوي");
                    col = firstFiveItems.concat(sana);
                }

                $.each(res, async function (v, val) {
                    const uuid = generateUUID(`${val[1]}-${val[2]}-${val[3]}`);
                    const d = {
                        uuid: uuid,
                        niv: div,
                        niv_text: text,
                        niv_sec: text.slice(-2),
                        annee: year,
                        tre: Number(year.toString().slice(-1)),
                        data: JSON.stringify(val),
                    };
                    const data = await finalResTable
                        .where({
                            uuid: uuid,
                            niv: div,
                            tre: Number(year.toString().slice(-1)),
                            annee: year,
                        })
                        .first();
                    console.log(data);
                    if (data) {
                        await finalResTable
                            .where({
                                uuid: uuid,
                                niv: div,
                                tre: Number(year.toString().slice(-1)),
                                annee: year,
                            })
                            .modify(d);
                    } else {
                        await finalResTable.add(d);
                    }
                });
                const d = {
                    niv: div,
                    annee: year,
                    tre: Number(year.toString().slice(-1)),
                    data: JSON.stringify(col),
                };
                const data = await mawadTable
                    .where({
                        niv: div,
                        tre: Number(year.toString().slice(-1)),
                        annee: year,
                    })
                    .first();
                if (data) {
                    await mawadTable
                        .where({
                            niv: div,
                            tre: Number(year.toString().slice(-1)),
                            annee: year,
                        })
                        .modify(d);
                } else {
                    await mawadTable.add(d);
                }
            }
        }
        //await _.sleep(800);
    }
    notify.toast({
        type: "done",
        color: "success",
        message: "تمت العملية بنجاح",
    });
    _.getid("waitText").innerHTML = "";
}
function sanawiMoy(ar, t) {
    const sums = ar
        .slice(-3)
        .reduce(
            (accumulator, currentValue) => accumulator + Number(currentValue),
            0
        );
    const total = _.isPrimary() && t.includes("أولى") ? 2 : 3;
    return (sums / total).toFixed(2);
}
function generateUUID(str) {
    let hash = 0,
        i,
        chr;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash.toString(16);
}
async function fetch_data(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: data,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// finalResultsMoys
function finalResultsMoysData() {
    // body...
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    if ($divi.value == "all") {
        load_Moys(_.getid("anneschool").value);
    } else {
        load_Moys_by_one(_.getid("anneschool").value);
    }
}
/*
$finalResultsMoys.addEventListener("click", async () => {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
  if ($divi.value == "all") {
    setTimeout(() => {
      load_Moys(_.getid("anneschool").value);
    }, 550);
  } else {
    setTimeout(() => {
      load_Moys_by_one(_.getid("anneschool").value);
    }, 550);
  }
});
*/
async function load_Moys(year) {
    let i = 0;
    let xs = _.isLycee() ? 7 : 6;
    const divs = $divi.querySelectorAll("option");
    for (const option of divs) {
        //i++
        //if ((i + 1) % 2 === 0) {
        //}
        if (option.value) {
            const div = option.value;
            const text = option.text;
            try {
                const response = await $.ajax({
                    url: "https://amatti.education.dz/scolarite/en_chiffre/suivi_bulletin/get_eleves_etab",
                    data: { division: div, annee: year.slice(0, -1) },
                    type: "POST",
                    dataType: "json",
                    async: false,
                });
                document.querySelector(".error-catch").innerHTML =
                    "تم تحميل نتائج قسم: " + text;

                // $waitText.innerHTML = "تم تحميل نتائج قسم: " + text;
                if (response.data) {
                    for (const val of response.data) {
                        const uuid = generateUUID(`${val[0]}`);
                        const d = {
                            uuid: uuid,
                            matt: Number(val[0]),
                            nom: val[1],
                            prenom: val[2],
                            gender: val[3],
                            birthdate: val[4],
                            niv: val[5],
                            choaba: _.isLycee() ? val[6].trim() : "",
                            section: Number(val[xs]),
                            tre1: n(Number(val[xs + 1])),
                            tre2: n(Number(val[xs + 2])),
                            tre3: n(Number(val[xs + 3])),
                            tre21: (
                                (n(Number(val[xs + 1])) +
                                    n(Number(val[xs + 2]))) /
                                2
                            ).toFixed(2),
                            tre31: (
                                (n(Number(val[xs + 1])) +
                                    n(Number(val[xs + 3]))) /
                                2
                            ).toFixed(2),
                            tre32: (
                                (n(Number(val[xs + 2])) +
                                    n(Number(val[xs + 3]))) /
                                2
                            ).toFixed(2),
                            tre321: (
                                (n(Number(val[xs + 1])) +
                                    n(Number(val[xs + 2])) +
                                    n(Number(val[xs + 3]))) /
                                3
                            ).toFixed(2),
                            sanawi: n(Number(val[xs + 4])),
                            annee: Number(year.slice(0, -1)),
                        };
                        const exist = await FinalMoysTable.where({
                            uuid: uuid,
                            matt: Number(val[0]),
                            annee: Number(year.slice(0, -1)),
                        }).first();
                        if (exist) {
                            await FinalMoysTable.where({
                                uuid: uuid,
                                matt: val[0],
                                annee: Number(year.slice(0, -1)),
                            }).modify(d);
                        } else {
                            await FinalMoysTable.add(d);
                        }
                        console.log(exist);
                        //await db.insertUpdate(
                        //  "Final_Moys",
                        //  {
                        //    uuid: uuid,
                        //    matt: val[0],
                        //    annee: year.slice(0, -1),
                        //  },
                        //  d
                        //);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
        await _.sleep(800);
    }
    notify.toast({
        type: "done",
        color: "success",
        message: "تمت العملية بنجاح",
    });
    document.querySelector(".error-catch").innerHTML = "";
}
function n(myNumber) {
    return isNaN(myNumber) ? 0 : myNumber;
}

function studentsNotesData() {
    // body...
    notify.toast({
        type: "warning",
        color: "warning",
        message: "الرجاء الانتظار حتى اكتمال العملية",
    });
    loadNotes($divi.value);
}
/*
$studentsNotes.addEventListener("click", async () => {
  notify.toast({
    type: "warning",
    color: "warning",
    message: "الرجاء الانتظار حتى اكتمال العملية",
  });
    loadNotes($divi.value);
});
*/
async function loadNotes(division) {
    let mattieres = [];
    const res = await _.fetchData(
        "matiere_hadjz",
        { division: division, annee: this_trim },
        "text"
    );

    let d = res.split("</option>");
    for (let index = 0; index < d.length; index++) {
        const elm = d[index];
        if (elm.replace(/\D/g, "") != "")
            mattieres.push({
                mat_text: elm.replace(/[^\u0600-\u06FF]/g, " ").trim(),
                mat: Number(elm.replace(/\D/g, "")),
            });
    }

    // this_trim
    let completedMatt = 0;

    const totalMatts = mattieres.length;
    for (let index = 0; index < totalMatts; index++) {
        const matiere = mattieres[index].mat;
        await _.sleep(800);
        const xs = _.isCem() ? "04" : "03";

        const data = await _.fetchData("eleve_hadjz", {
            annee: this_trim,
            division: division,
            matiere: matiere,
        });
        completedMatt++;

        for (let i = 0; i < data.data.length; i++) {
            const student = data.data[i];
            const d = {
                matt: student["matricule"],
                nom: student["nom"],
                prenom: student["prenom"],
                dateN: student["date_n"],
                matiere: matiere,
                matiere_name: mattieres[index].mat_text.trim(),
                division: division,
                tag: student["01"] ?? "",
                dev: student[xs] ?? "",
                pratique: student["02"] ?? "",
                tath: student["05"] ?? "",
                exam: student["09"] ?? "",
                tre: this_trim.toString().slice("-1"),
                annee: this_trim,
            };

            const exist = await StatisTable.where({
                matt: student["matricule"],
                matiere: matiere,
                division: division,
                tre: this_trim.toString().slice("-1"),
                annee: this_trim,
            }).first();

            if (exist) {
                await StatisTable.where({
                    matt: student["matricule"],
                    matiere: matiere,
                    division: division,
                    tre: this_trim.toString().slice("-1"),
                    annee: this_trim,
                }).modify(d);
            } else {
                await StatisTable.add(d);
            }
            document.querySelector(
                ".error-catch"
            ).innerHTML = `تم تحميل نتائج مادة: ${mattieres[
                index
            ].mat_text.trim()} [${totalMatts}/${completedMatt}]  (${Math.round(
                (completedMatt / totalMatts) * 100
            )}%)`;
        }

        //stat_data()
    }
    document.querySelector(".error-catch").innerHTML = "";
    notify.toast({
        type: "done",
        color: "success",
        message: "تمت العملية بنجاح",
    });
}
