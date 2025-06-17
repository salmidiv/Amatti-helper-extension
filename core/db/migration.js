
// create tabels
db = new Dexie("OFFLINEamatti")
var db_tables = {
    settings: '++id, walaya,commune, school_name, modir_name, school_type',
    divisions: '++id, div,div_text, sub_div, sub_div_text',
    students: `++id, adresse,amz,anneeinscr,comnais,comres,daten,diss_musiq,dnation,
                email_pere,hand,lieun,lieunf,matricule,mention_acte,nation,natorg,
                nom_elv, nom_elvlt, nom_mere, nom_pere, numact, payn, prenom_elv, prenom_elvlt,
                prenom_mere, presume, s_annee, s_birthday, s_choaba, s_gender,
                s_matt, s_niv, s_nom, s_prenom, s_regester_nbr, s_section, s_type, sexe_elv, tel`,

}
db.version(1).stores(db_tables);



