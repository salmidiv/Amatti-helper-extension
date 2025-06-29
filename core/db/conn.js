import { Dexie } from "../../assets/js/dexie.mjs";

// create tabels
const db = new Dexie("SalmiAmatti");
var db_tables = {
  settings: "++id, walaya,commune, school_name, modir_name, school_type",
  divisions: "++id, div,div_text, sub_div, sub_div_text, annee",
  isnad: "++id, mada, pmatt, pname, div, div_text, isAdmin, annee, trim",

  students: `++id, s_matt, s_nom, s_prenom, s_birthday, s_gender, s_niv,  s_choaba, s_section, s_regester_nbr,
             lieun, hand, numact, presume, sexe_elv, s_sifa, s_moiid, anneeinscr, daten, is_study,
            nom_elvlt, prenom_elvlt, lieunf, s_annee`,

  moreInfo: `++id, matricule, adresse, amz, anneeinscr, comnais, comres, daten, 
              diss_musiq, dnation, email_pere, hand, lieun, lieunf,
              mention_acte, nation, natorg, nom_elv, nom_elvlt, nom_mere,
              nom_pere, numact, payn, prenom_elv, prenom_elvlt, prenom_mere,
              presume, sexe_elv, tel, annee`,

  inoutstudents: `++id,s_matt, s_nom, s_prenom, s_gender, s_birthday, s_niv, distination, date_transfer, demandDate, s_type, s_annee`,

  stopstudents: `++id,s_matt, s_nom, s_prenom, s_gender, s_birthday, s_niv, s_choaba, s_section, chatb_date, chatb_sabab,s_type, s_annee`,

  personals: `++id, matt, nom, prenom, birthday, rotba, mada, gender, corrant_daraja,
                corrant_daraja_date, ccp, nss, adress, cap, couple, cp,
                email, nbrenf, enf10, enfado, enfsco, grps, nomar, nomarm,
                nomlt, nomltm, port, prenomar, prenomarm, prenomarp, prenomlt,
                prenomltm, prenomltp, tel,
                birthplace, birthwilaya, jinsiya, family_status, private_adress,
                Administrative_status, tawdif_date, date_current_grade,
                current_school, current_school_date, pedagogical_point,
                pedagogical_point_date, education, total_services`,
  finalRes: `++id, uuid, niv, niv_text, niv_sec, annee, tre, data`,
  mawad: `++id, niv, annee, tre, data`,
  FinalMoys: `++id, uuid, matt, nom, prenom, gender, birthdate, 
              niv, choaba, section, tre1, tre2, tre3, tre21, tre31,
              tre32, tre321, sanawi, annee`,
  statiss: `++id, matt, nom, prenom, dateN, division, matiere, 
            matiere_name, tag, dev, pratique, tath, exam, tre, annee`,
  istidrakHead: `++id, nivid, niv, shoaba, section, data, annee`,
  istidrakData: `++id, nivid, niv, shoaba, section, matt, data, module, annee`,
  istiksaa: `++id,s_matt, s_nom, s_prenom, s_gender, s_birthday, s_age, s_niv, 
              s_choba, s_section, s_wafid, s_moiid, s_annee,out,  [s_matt+s_annee]`,
  examHalls: `++id, examId, hallId, groupName, createdAt`,
  examGroups: `++id, examId, name, halls, createdAt`,
  examDistribution: `++id, examId, direction, criteria, scope, startNumber, createdAt`,
  examStudents: `++id, examId, studentId, hallId, number, createdAt`,
  moyexambuilder: `++id, matt, firstTrimester, secondTrimester, bothTrimesters, lastYear, annee`,
  exambuilder: `++id, annee, tri, title, color, niv, choaba, section, sallnbr, 
                sallsize, surplus, rankingSort, rankingOption, studentsStartNum,
                salleStartNum, excStudents, period, subject, levels, divisions, 
                groups, excludedStudents, createdAt, studentsCount, hallsCount`,
  halls: `++id, name, capacity, createdAt`,
  istidrak: `++id, matt, nom, birthday, moyenne, matieres, division, annee`,
};

await db.version(42).stores(db_tables);
await db.open();

let settingsTable = db.settings,
  divisionsTable = db.divisions,
  isnadTable = db.isnad,
  studentsTable = db.students,
  stopstudentsTable = db.stopstudents,
  inoutstudentsTable = db.inoutstudents,
  personalsTable = db.personals,
  exambuilderTable = db.exambuilder,
  moyexambuilderTable = db.moyexambuilder,
  moreInfoTable = db.moreInfo,
  finalResTable = db.finalRes,
  mawadTable = db.mawad,
  StatisTable = db.statiss,
  FinalMoysTable = db.FinalMoys,
  istidrakHeadTable = db.istidrakHead,
  istidrakDataTable = db.istidrakData,
  istiksaaDataTable = db.istiksaa,
  hallsTable = db.halls,
  examHallsTable = db.examHalls,
  examGroupsTable = db.examGroups,
  examDistributionTable = db.examDistribution,
  examStudentsTable = db.examStudents,
  istidrakTable = db.istidrak;

export {
  db,
  settingsTable,
  divisionsTable,
  isnadTable,
  studentsTable,
  stopstudentsTable,
  inoutstudentsTable,
  personalsTable,
  moyexambuilderTable,
  exambuilderTable,
  moreInfoTable,
  finalResTable,
  mawadTable,
  FinalMoysTable,
  StatisTable,
  istidrakHeadTable,
  istidrakDataTable,
  istiksaaDataTable,
  hallsTable,
  examHallsTable,
  examGroupsTable,
  examDistributionTable,
  examStudentsTable,
  istidrakTable,
};
