// ============================================
// CRÉATION DU COMPTE ADMINISTRATEUR
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

const bcrypt = require("bcrypt");
const db = require("./database/database.js");


// ============================================
// INFORMATIONS DU COMPTE
// ============================================

const nomComplet = "Administrateur";
const courriel = "admin@eglise-vases-honneur.ca";
const motDePasse = "Admin123!";


// ============================================
// VÉRIFIER SI LE COMPTE EXISTE
// ============================================

const utilisateurExistant = db.prepare(`
    SELECT id
    FROM utilisateurs
    WHERE courriel = ?
`).get(courriel);


if (utilisateurExistant) {

    console.log("");
    console.log("============================================");
    console.log("LE COMPTE ADMINISTRATEUR EXISTE DÉJÀ");
    console.log("============================================");
    console.log("");

    process.exit(0);
}


// ============================================
// HACHER LE MOT DE PASSE
// ============================================

const motDePasseHash = bcrypt.hashSync(
    motDePasse,
    12
);


// ============================================
// CRÉER LE COMPTE
// ============================================

const statement = db.prepare(`

    INSERT INTO utilisateurs (

        nom_complet,
        courriel,
        mot_de_passe,
        role,
        actif

    )

    VALUES (?, ?, ?, ?, ?)

`);


statement.run(

    nomComplet,
    courriel,
    motDePasseHash,
    "Administrateur",
    1

);


// ============================================
// CONFIRMATION
// ============================================

console.log("");
console.log("============================================");
console.log("COMPTE ADMINISTRATEUR CRÉÉ");
console.log("============================================");

console.log("Nom :", nomComplet);
console.log("Courriel :", courriel);
console.log("Rôle : Administrateur");

console.log("============================================");
console.log("");


// ============================================
// FERMER LA BASE
// ============================================

db.close();