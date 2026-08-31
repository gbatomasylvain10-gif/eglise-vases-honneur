// ============================================
// BASE DE DONNÉES (PostgreSQL - Neon.tech)
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // Ajout pour hasher le mot de passe admin

// ============================================
// CONNEXION À LA BASE (Neon.tech)
// ============================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requis pour Neon.tech
  }
});

// ============================================
// CRÉATION DES TABLES ET DONNÉES PAR DÉFAUT
// ============================================

async function initialiserBaseDeDonnees() {
  try {
    const client = await pool.connect();
    console.log("✅ Connecté à la base de données PostgreSQL (Neon)");

    // Table Membres
    await client.query(`
      CREATE TABLE IF NOT EXISTS membres (
        id SERIAL PRIMARY KEY,
        nom_complet TEXT NOT NULL,
        date_naissance TEXT NOT NULL,
        sexe TEXT NOT NULL,
        statut_matrimonial TEXT NOT NULL,
        adresse TEXT NOT NULL,
        secteur TEXT NOT NULL,
        autre_secteur TEXT,
        transport TEXT NOT NULL,
        autre_transport TEXT,
        telephone TEXT NOT NULL,
        courriel TEXT NOT NULL,
        date_conversion TEXT,
        baptise TEXT NOT NULL,
        date_bapteme TEXT,
        eglise_origine TEXT,
        date_arrivee TEXT NOT NULL,
        fonction TEXT NOT NULL,
        dons TEXT,
        disponibilites TEXT,
        sert_departement TEXT NOT NULL,
        departement TEXT,
        veut_departement TEXT,
        contact_urgence TEXT NOT NULL,
        lien_parente TEXT NOT NULL,
        telephone_urgence TEXT NOT NULL,
        consentement INTEGER NOT NULL,
        date_consentement TEXT NOT NULL,
        date_inscription TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Utilisateurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id SERIAL PRIMARY KEY,
        nom_complet TEXT NOT NULL,
        courriel TEXT NOT NULL UNIQUE,
        mot_de_passe TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Utilisateur',
        actif INTEGER NOT NULL DEFAULT 1,
        date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Cultes
    await client.query(`
      CREATE TABLE IF NOT EXISTS cultes (
        id SERIAL PRIMARY KEY,
        date_culte TEXT NOT NULL,
        type_culte TEXT NOT NULL DEFAULT 'Culte dominical',
        notes TEXT,
        date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Présences
    await client.query(`
      CREATE TABLE IF NOT EXISTS presences (
        id SERIAL PRIMARY KEY,
        culte_id INTEGER NOT NULL REFERENCES cultes(id),
        membre_id INTEGER NOT NULL REFERENCES membres(id),
        present INTEGER NOT NULL DEFAULT 0,
        date_enregistrement TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(culte_id, membre_id)
      )
    `);

    // Table Évangélisation
    await client.query(`
      CREATE TABLE IF NOT EXISTS evangelisation (
        id SERIAL PRIMARY KEY,
        nom_complet TEXT NOT NULL,
        telephone TEXT,
        courriel TEXT,
        secteur TEXT,
        etape TEXT NOT NULL DEFAULT 'Rencontrée',
        responsable TEXT,
        notes TEXT,
        date_rencontre TEXT NOT NULL,
        date_dernier_contact TEXT,
        membre_id INTEGER,
        date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Lifts
    await client.query(`
      CREATE TABLE IF NOT EXISTS lifts (
        id SERIAL PRIMARY KEY,
        nom_complet TEXT NOT NULL,
        telephone TEXT,
        secteur TEXT,
        adresse TEXT,
        nombre_personnes INTEGER DEFAULT 1,
        type TEXT NOT NULL DEFAULT 'Demande',
        places INTEGER DEFAULT 0,
        statut TEXT NOT NULL DEFAULT 'En attente',
        notes TEXT,
        conducteur_id INTEGER,
        pris_en_charge INTEGER DEFAULT 0,
        date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Adresses Lifts
    await client.query(`
      CREATE TABLE IF NOT EXISTS adresses_lifts (
        id SERIAL PRIMARY KEY,
        nom_complet TEXT NOT NULL,
        telephone TEXT NOT NULL,
        adresse TEXT NOT NULL,
        secteur TEXT,
        date_modification TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(nom_complet, telephone)
      )
    `);

    // Table Départements
    await client.query(`
      CREATE TABLE IF NOT EXISTS departements (
        id SERIAL PRIMARY KEY,
        nom TEXT NOT NULL UNIQUE,
        description TEXT,
        responsable_id INTEGER REFERENCES membres(id),
        couleur TEXT DEFAULT '#3b82f6',
        icone TEXT DEFAULT '🏛️',
        date_creation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Membres-Départements
    await client.query(`
      CREATE TABLE IF NOT EXISTS membres_departements (
        id SERIAL PRIMARY KEY,
        membre_id INTEGER NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
        departement_id INTEGER NOT NULL REFERENCES departements(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'Membre',
        date_assignation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(membre_id, departement_id)
      )
    `);

    // ==========================================
    // CRÉATION D'UN ADMINISTRATEUR PAR DÉFAUT (Si la base est vide)
    // ==========================================
    const usersCheck = await client.query("SELECT COUNT(*) as count FROM utilisateurs");
    if (parseInt(usersCheck.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      await client.query(`
        INSERT INTO utilisateurs (nom_complet, courriel, mot_de_passe, role, actif)
        VALUES ('Administrateur Principal', 'admin@eglise-vases-honneur.ca', $1, 'Administrateur', 1)
      `, [hashedPassword]);
      console.log("✅ Utilisateur administrateur par défaut créé !");
      console.log("   👤 Courriel : admin@eglise-vases-honneur.ca");
      console.log("   🔑 Mot de passe : Admin123!");
    }

    client.release();
    console.log("✅ Tables créées/vérifiées avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données:", error);
  }
}

// Lancer l'initialisation automatiquement
initialiserBaseDeDonnees();

// ============================================
// EXPORT
// ============================================
module.exports = pool;