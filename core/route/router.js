import { _ } from "../helpers/helpers.js";
import { route } from "./route.js";
_.check_online_connection();
route.run();
route.addRoutes({
  "/home_page": { Path: "home_page" },
  "/etab_scolarite": { Path: "etab_scolarite" },
  "/scolarite/examen_national/valid_libre": { Path: "etab_scolarite" },
  "/el_hadjz": { Path: "pages/hajz/index" },
  "/madjlis": { Path: "pages/madjlis/index" },
  "/scolarite/passage_eleves/rattrapage": { Path: "pages/rattrapage/index" },
  "/el_isnad": { Path: "el_isnad/index" },
  "/pers/integration": { Path: "pages/integration/index" },
  "/tiba3a": { Path: "pages/tiba3a/index" },
  "/scolarite/examen_national/inscription": {
    Path: "pages/examen_national/index",
  },
  "/scolarite/en_chiffre/analyse_class": {
    Path: "pages/analyse_class/index",
  },
  "/scolarite/en_chiffre/suivi_bulletin": {
    Path: "pages/suivi_bulletin/index",
  },
  "/pers/personnel": {
    Path: "pages/personnelExcel/index",
  },
  "/scolarite/transferts/eleves_out": {
    Path: "pages/transferts/eleves_out/index",
  },
  "/scolarite/passage_eleves/dossier_eleve": {
    Path: "entryData/index",
  },
  "/scolarite/moktassabat/cem": {
    Path: "pages/moktassabat/index",
    // page: true,
  },
  "/high_school": {
    Path: "pages/high_school/index",
  },
  "/high_school-observations": {
    Path: "pages/high_school/index",
  },
  "/meduim_school": {
    Path: "pages/high_school/index",
  },
  "/meduim_school-observations": {
    Path: "pages/high_school/index",
  },
  "/printDivisionList": {
    Path: "studentsPapers/printDivisionList",
    page: true,
    uri: 1,
  },
  "/istiksaa": {
    Path: "pages/istiksaa/index",
    page: true,
    uri: 1,
  },
  "/istiksaa_prof": {
    Path: "pages/istiksaa_prof/index",
    page: true,
    uri: 1,
  },
  "/scolarite/dossier_eleves/eleves": { Path: "dossier_eleves" },
  "/printNotesList": {
    Path: "studentsPapers/printNotesList",
    page: true,
    uri: 1,
  },
  "/scrapsniv": { Path: "studentsPapers/scraps", page: true, uri: 1 },
  "/risto-cards": { Path: "studentsPapers/risto-cards", page: true, uri: 1 },
  "/all-scraps": { Path: "studentsPapers/scraps", page: true, uri: 1 },
  "/one-scrap": { Path: "studentsPapers/scraps", page: true, uri: 1 },
  "/scraps-nisf": { Path: "studentsPapers/scraps", page: true, uri: 1 },
  "/nisf-list": { Path: "studentsPapers/nisfList", page: true, uri: 1 },
  "/external-list": { Path: "studentsPapers/nisfList", page: true, uri: 1 },
  "/wafid-list": { Path: "studentsPapers/wafidOutList", page: true, uri: 1 },
  "/out-list": { Path: "studentsPapers/wafidOutList", page: true, uri: 1 },
  "/stop-list": { Path: "studentsPapers/stopList", page: true, uri: 1 },
  "/replay-list": { Path: "studentsPapers/replayList", page: true, uri: 1 },
  "/istida": { Path: "studentsPapers/istida", page: true, uri: 1 },
  "/indar": { Path: "studentsPapers/indar", page: true, uri: 1 },
  "/tawbikh": { Path: "studentsPapers/tawbikh", page: true, uri: 1 },
  "/ijazat": {
    Path: "studentsPapers/students-list-by-moy",
    page: true,
    uri: 1,
  },
  //
  "/nisfBitaka": {
    Path: "studentsPapers/nisfBitaka",
    page: true,
    uri: 1,
  },
  "/no-sport": {
    Path: "studentsPapers/no-sport",
    page: true,
    uri: 1,
  },
  "/idara-data": { Path: "rgf/idaraData", page: true, uri: 1 },
  "/teachers-list": { Path: "presPapers/teachersList", page: true, uri: 1 },
  "/scraps-teachers": {
    Path: "presPapers/scrapsTeachers",
    page: true,
    uri: 1,
  },
  "/tandim": {
    Path: "presPapers/tandim",
    page: true,
    uri: 1,
  },
  "/exam-sallnbr": {
    Path: "etab_scolarite/exam-builder/sallnbr",
    page: true,
    uri: 1,
  },
  "/exam-fulllist": {
    Path: "etab_scolarite/exam-builder/exam-fulllist",
    page: true,
    uri: 1,
  },
  "/exam-bitaka": {
    Path: "etab_scolarite/exam-builder/exam-bitaka",
    page: true,
    uri: 1,
  },
  "/exam-studentslist": {
    Path: "etab_scolarite/exam-builder/exam-studentslist",
    page: true,
    uri: 1,
  },
  "/exam-reports": {
    Path: "etab_scolarite/exam-builder/exam-reports",
    page: true,
    uri: 1,
  },
  "/exam-placenbr": {
    Path: "etab_scolarite/exam-builder/exam-placenbr",
    page: true,
    uri: 1,
  },
  "/exam-sectionsCasing": {
    Path: "etab_scolarite/exam-builder/exam-sectionsCasing",
    page: true,
    uri: 1,
  },
  "/exam-presents": {
    Path: "etab_scolarite/exam-builder/exam-presents",
    page: true,
    uri: 1,
  },
  "/end-stats": {
    Path: "pages/madjlis/end-stats",
    page: true,
    uri: 1,
  },
  "end-stats-comp": {
    Path: "pages/madjlis/end-stats-comp",
    page: true,
    uri: 1,
  },
  "/end-stats-2": {
    Path: "pages/madjlis/end-stats-2",
    page: true,
    uri: 1,
  },
  "/ostad-state": {
    Path: "pages/madjlis/ostad_state",
    page: true,
    uri: 1,
  },
  wathikat_ostad: {
    Path: "pages/wathikat_ostad",
    amatti: true,
  },
  "/module_stats_div": {
    Path: "pages/madjlis/module_stats_div",
    page: true,
    uri: 1,
  },

  "/scolarite/passage_eleves/fiche_orientation": {
    Path: "pages/passage_eleves/fiche_orientation",
  },
  "/scolarite/passage_eleves/fiche_orientation_2as": {
    Path: "pages/passage_eleves/fiche_orientation",
  },
  "/karar_nihai": {
    Path: "pages/karar_nihai/index",
  },
  "/print-chatb": {
    Path: "pages/print-chatb/index",
    page: true,
    uri: 1,
  },

  "/istidrak": {
    Path: "pages/istidrak/index",
    page: true,
    uri: 1,
  },

  "/istidrak_list2": {
    Path: "pages/istidrak/istidrak_list2",
    page: true,
    uri: 1,
  },
  "/istidrak_istida": {
    Path: "pages/istidrak/istidrak_istida",
    page: true,
    uri: 1,
  },
  "/bem_state": {
    Path: "pages/bem/index",
    page: true,
    uri: 1,
  },
  "/bac_state": {
    Path: "pages/bac/index",
    page: true,
    uri: 1,
    jquery: true,
  },

  "/distribute": {
    Path: "pages/distribute/index",
    page: true,
    uri: 1,
  },
  "/scolarite/transferts/eleves_in": {
    Path: "pages/transferts/eleves_in/index",
  },
  "/print-tasjil": {
    Path: "pages/print-tasjil/index",
    page: true,
    uri: 1,
  }, //
  "/scolarite/dossier_eleves/eleves_stop": {
    Path: "pages/transferts/eleves_stop/index",
  },
  "/print-stop": {
    Path: "pages/print-stop/index",
    page: true,
    uri: 1,
  },
  "/taqiim": {
    Path: "pages/taqiim/index",
    page: true,
    uri: 1,
  },
});
route.start();
