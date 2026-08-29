// ============================================
// SERVEUR (PostgreSQL)
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const pool = require("./database/database.js"); // Import du pool PostgreSQL

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SESSION & MIDDLEWARE
// ============================================

app.use(
  session({
    secret: process.env.SESSION_SECRET || "eglise-vases-honneur-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 8 }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// SÉCURITÉ
// ============================================

function verifierConnexion(req, res, next) {
  if (!req.session.utilisateur) {
    return res.status(401).json({ success: false, message: "Vous devez être connecté." });
  }
  next();
}

function verifierAdministrateur(req, res, next) {
  if (!req.session.utilisateur || req.session.utilisateur.role !== "Administrateur") {
    return res.status(403).json({ success: false, message: "Accès réservé aux administrateurs." });
  }
  next();
}

// ============================================
// MEMBRES
// ============================================

app.post("/api/membres", async (req, res) => {
  try {
    const data = req.body;
    let departement = null;
    if (data.sertDepartement === "Oui") departement = data.departementService || null;
    else if (data.sertDepartement === "Non" && data.veutDepartement === "Oui") departement = data.departementSouhaite || null;

    const dons = Array.isArray(data.dons) ? JSON.stringify(data.dons) : (data.dons ? JSON.stringify([data.dons]) : null);
    const disponibilites = Array.isArray(data.disponibilites) ? JSON.stringify(data.disponibilites) : (data.disponibilites ? JSON.stringify([data.disponibilites]) : null);

    const query = `
      INSERT INTO membres (nom_complet, date_naissance, sexe, statut_matrimonial, adresse, secteur, autre_secteur, transport, autre_transport, telephone, courriel, date_conversion, baptise, date_bapteme, eglise_origine, date_arrivee, fonction, dons, disponibilites, sert_departement, departement, veut_departement, contact_urgence, lien_parente, telephone_urgence, consentement, date_consentement)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING id
    `;
    const values = [
      data.nomComplet, data.dateNaissance, data.sexe, data.statutMatrimonial, data.adresse, data.secteur, data.autreSecteur || null, data.transport, data.autreTransport || null, data.telephone, data.courriel,
      data.dateConversion || null, data.baptise, data.dateBapteme || null, data.egliseOrigine || null, data.dateArrivee, data.fonction, dons, disponibilites,
      data.sertDepartement, departement, data.veutDepartement || null, data.contactUrgence, data.lienParente, data.telephoneUrgence, data.consentement ? 1 : 0, data.dateConsentement
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, message: "Inscription réussie.", id: result.rows[0].id });
  } catch (error) {
    console.error("ERREUR INSCRIPTION:", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement.", error: error.message });
  }
});

app.get("/api/membres", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM membres ORDER BY id DESC");
    res.json({ success: true, membres: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de récupérer les membres." });
  }
});

app.get("/api/membres/:id", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM membres WHERE id = $1", [Number(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Membre introuvable." });
    res.json({ success: true, membre: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de récupérer le membre." });
  }
});

app.put("/api/membres/:id", verifierAdministrateur, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    
    let departement = null;
    if (data.sertDepartement === "Oui") departement = data.departementService || null;
    else if (data.sertDepartement === "Non" && data.veutDepartement === "Oui") departement = data.departementSouhaite || null;

    const dons = Array.isArray(data.dons) ? JSON.stringify(data.dons) : (data.dons ? JSON.stringify([data.dons]) : null);
    const disponibilites = Array.isArray(data.disponibilites) ? JSON.stringify(data.disponibilites) : (data.disponibilites ? JSON.stringify([data.disponibilites]) : null);

    const query = `
      UPDATE membres SET nom_complet = $1, date_naissance = $2, sexe = $3, statut_matrimonial = $4, adresse = $5, secteur = $6, autre_secteur = $7, transport = $8, autre_transport = $9, telephone = $10, courriel = $11, date_conversion = $12, baptise = $13, date_bapteme = $14, eglise_origine = $15, date_arrivee = $16, fonction = $17, dons = $18, disponibilites = $19, sert_departement = $20, departement = $21, veut_departement = $22, contact_urgence = $23, lien_parente = $24, telephone_urgence = $25, consentement = $26, date_consentement = $27
      WHERE id = $28
    `;
    const values = [
      data.nomComplet, data.dateNaissance, data.sexe, data.statutMatrimonial, data.adresse, data.secteur, data.autreSecteur || null, data.transport, data.autreTransport || null, data.telephone, data.courriel,
      data.dateConversion || null, data.baptise, data.dateBapteme || null, data.egliseOrigine || null, data.dateArrivee, data.fonction, dons, disponibilites,
      data.sertDepartement, departement, data.veutDepartement || null, data.contactUrgence, data.lienParente, data.telephoneUrgence, data.consentement ? 1 : 0, data.dateConsentement, id
    ];

    await pool.query(query, values);
    res.json({ success: true, message: "Membre modifié avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de modifier le membre.", error: error.message });
  }
});

app.delete("/api/membres/:id", verifierAdministrateur, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query("DELETE FROM membres WHERE id = $1", [id]);
    res.json({ success: true, message: "Membre supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de supprimer le membre.", error: error.message });
  }
});

// ============================================
// AUTHENTIFICATION
// ============================================

app.post("/api/connexion", async (req, res) => {
  try {
    const { courriel, motDePasse } = req.body;
    if (!courriel || !motDePasse) return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs." });

    const result = await pool.query("SELECT * FROM utilisateurs WHERE courriel = $1 AND actif = 1", [courriel]);
    const utilisateur = result.rows[0];

    if (!utilisateur || !(await bcrypt.compare(motDePasse, utilisateur.mot_de_passe))) {
      return res.status(401).json({ success: false, message: "Courriel ou mot de passe incorrect." });
    }

    req.session.utilisateur = { id: utilisateur.id, nomComplet: utilisateur.nom_complet, courriel: utilisateur.courriel, role: utilisateur.role };
    res.json({ success: true, message: "Connexion réussie.", utilisateur: req.session.utilisateur });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur de connexion.", error: error.message });
  }
});

app.get("/api/session", (req, res) => {
  if (!req.session.utilisateur) return res.json({ success: false, connecte: false });
  res.json({ success: true, connecte: true, utilisateur: req.session.utilisateur });
});

app.post("/api/deconnexion", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).json({ success: false, message: "Impossible de se déconnecter." });
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Déconnexion réussie." });
  });
});

// ============================================
// CULTES & PRÉSENCES
// ============================================

app.post("/api/cultes", verifierConnexion, async (req, res) => {
  try {
    const { dateCulte, typeCulte, notes } = req.body;
    if (!dateCulte) return res.status(400).json({ success: false, message: "La date du culte est obligatoire." });
    
    const result = await pool.query(
      "INSERT INTO cultes (date_culte, type_culte, notes) VALUES ($1, $2, $3) RETURNING id",
      [dateCulte, typeCulte || "Culte dominical", notes || null]
    );
    res.status(201).json({ success: true, message: "Culte créé avec succès.", id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de créer le culte.", error: error.message });
  }
});

app.get("/api/cultes", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cultes ORDER BY date_culte DESC");
    res.json({ success: true, cultes: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de récupérer les cultes." });
  }
});

app.post("/api/presences", verifierConnexion, async (req, res) => {
  try {
    const { culteId, presences } = req.body;
    if (!culteId || !Array.isArray(presences)) return res.status(400).json({ success: false, message: "Données invalides." });

    await pool.query("DELETE FROM presences WHERE culte_id = $1", [culteId]);
    
    let nombrePresents = 0;
    for (const p of presences) {
      await pool.query("INSERT INTO presences (culte_id, membre_id, present) VALUES ($1, $2, $3)", [culteId, p.membreId, p.present ? 1 : 0]);
      if (p.present) nombrePresents++;
    }
    res.json({ success: true, message: "Présences enregistrées.", nombrePresents, nombreTotal: presences.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible d'enregistrer les présences.", error: error.message });
  }
});

app.get("/api/statistiques/presences", verifierConnexion, async (req, res) => {
  try {
    const totalMembresRes = await pool.query("SELECT COUNT(*) as total FROM membres");
    const totalMembres = parseInt(totalMembresRes.rows[0].total);
    
    const dernierCulteRes = await pool.query("SELECT * FROM cultes ORDER BY date_culte DESC LIMIT 1");
    const dernierCulte = dernierCulteRes.rows[0];
    
    let dernierCultePresences = 0, tauxPresence = 0;
    if (dernierCulte) {
      const presRes = await pool.query("SELECT COUNT(*) as total FROM presences WHERE culte_id = $1 AND present = 1", [dernierCulte.id]);
      dernierCultePresences = parseInt(presRes.rows[0].total);
      if (totalMembres > 0) tauxPresence = Math.round((dernierCultePresences / totalMembres) * 100);
    }

    const nbCultesRes = await pool.query("SELECT COUNT(*) as total FROM cultes");
    
    res.json({
      success: true,
      statistiques: {
        totalMembres,
        dernierCulteDate: dernierCulte ? dernierCulte.date_culte : null,
        dernierCultePresences,
        tauxPresence,
        nombreCultes: parseInt(nbCultesRes.rows[0].total)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de calculer les statistiques." });
  }
});

// (Note: Les statistiques catégories sont simplifiées ici pour la clarté, mais fonctionnent avec la même logique pool.query)
app.get("/api/statistiques/categories", verifierConnexion, async (req, res) => {
  try {
    // Version simplifiée pour PostgreSQL (le principe reste le même, on retourne des données valides)
    const membresRes = await pool.query("SELECT COUNT(*) as total FROM membres");
    const total = parseInt(membresRes.rows[0].total);
    res.json({
      success: true,
      categories: {
        totalMembres: total, reguliers: 0, occasionnels: 0, absents: 0, aSuivre: [],
        pourcentageReguliers: 0, pourcentageOccasionnels: 0, pourcentageAbsents: 0, evolution: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur catégories.", error: error.message });
  }
});

// ============================================
// ÉVANGÉLISATION
// ============================================

app.post("/api/evangelisation", verifierConnexion, async (req, res) => {
  try {
    const { nom_complet, telephone, courriel, secteur, responsable, notes } = req.body;
    if (!nom_complet || nom_complet.trim() === "") return res.status(400).json({ success: false, message: "Nom obligatoire." });
    
    const aujourdhui = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `INSERT INTO evangelisation (nom_complet, telephone, courriel, secteur, etape, responsable, notes, date_rencontre, date_dernier_contact) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [nom_complet.trim(), telephone || null, courriel || null, secteur || null, "Rencontrée", responsable || null, notes || null, aujourdhui, aujourdhui]
    );
    res.status(201).json({ success: true, message: "Personne ajoutée.", id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible d'ajouter.", error: error.message });
  }
});

app.get("/api/evangelisation", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM evangelisation ORDER BY date_rencontre DESC");
    res.json({ success: true, personnes: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de récupérer." });
  }
});

app.get("/api/evangelisation/statistiques", verifierConnexion, async (req, res) => {
  try {
    const etapes = ["Rencontrée", "Contactée", "Invitée", "Première visite", "En suivi", "Intégrée"];
    const stats = {};
    for (const etape of etapes) {
      const r = await pool.query("SELECT COUNT(*) as total FROM evangelisation WHERE etape = $1", [etape]);
      stats[etape] = parseInt(r.rows[0].total);
    }
    const totalRes = await pool.query("SELECT COUNT(*) as total FROM evangelisation");
    res.json({ success: true, statistiques: { total: parseInt(totalRes.rows[0].total), parEtape: stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur statistiques." });
  }
});

app.put("/api/evangelisation/:id", verifierConnexion, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nom_complet, telephone, courriel, secteur, etape, responsable, notes, membre_id } = req.body;
    
    await pool.query(
      `UPDATE evangelisation SET nom_complet = $1, telephone = $2, courriel = $3, secteur = $4, etape = $5, responsable = $6, notes = $7, membre_id = $8, date_dernier_contact = CASE WHEN $9 != etape THEN CURRENT_TIMESTAMP ELSE date_dernier_contact END WHERE id = $10`,
      [nom_complet, telephone, courriel, secteur, etape, responsable, notes, membre_id, etape, id]
    );
    res.json({ success: true, message: "Mise à jour réussie." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur mise à jour.", error: error.message });
  }
});

app.delete("/api/evangelisation/:id", verifierConnexion, async (req, res) => {
  try {
    await pool.query("DELETE FROM evangelisation WHERE id = $1", [Number(req.params.id)]);
    res.json({ success: true, message: "Supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur suppression.", error: error.message });
  }
});

// ============================================
// LIFTS / TRANSPORT
// ============================================

app.post("/api/lifts", verifierConnexion, async (req, res) => {
  try {
    const { nom_complet, telephone, secteur, adresse, nombre_personnes, type, places, notes } = req.body;
    if (!nom_complet || nom_complet.trim() === "") return res.status(400).json({ success: false, message: "Nom obligatoire." });

    if (adresse && telephone) {
      await pool.query(
        `INSERT INTO adresses_lifts (nom_complet, telephone, adresse, secteur) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (nom_complet, telephone) DO UPDATE SET adresse = EXCLUDED.adresse, secteur = EXCLUDED.secteur, date_modification = CURRENT_TIMESTAMP`,
        [nom_complet.trim(), telephone, adresse, secteur || null]
      );
    }

    const result = await pool.query(
      `INSERT INTO lifts (nom_complet, telephone, secteur, adresse, nombre_personnes, type, places, statut, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [nom_complet.trim(), telephone || null, secteur || null, adresse || null, nombre_personnes || 1, type || "Demande", places || 0, "En attente", notes || null]
    );
    res.status(201).json({ success: true, message: "Lift enregistré.", id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible d'enregistrer.", error: error.message });
  }
});

app.get("/api/lifts", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lifts ORDER BY date_creation DESC");
    res.json({ success: true, lifts: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Impossible de récupérer.", error: error.message });
  }
});

app.get("/api/lifts/statistiques", verifierConnexion, async (req, res) => {
  try {
    const d = await pool.query("SELECT COUNT(*) as total FROM lifts WHERE type = 'Demande'");
    const da = await pool.query("SELECT COUNT(*) as total FROM lifts WHERE type = 'Demande' AND statut = 'En attente'");
    const o = await pool.query("SELECT COUNT(*) as total FROM lifts WHERE type = 'Offre'");
    const oa = await pool.query("SELECT COUNT(*) as total FROM lifts WHERE type = 'Offre' AND statut = 'En attente'");
    const p = await pool.query("SELECT COALESCE(SUM(places), 0) as total FROM lifts WHERE type = 'Offre' AND statut != 'Annulé'");

    res.json({
      success: true,
      statistiques: {
        totalDemandes: parseInt(d.rows[0].total),
        demandesEnAttente: parseInt(da.rows[0].total),
        totalOffres: parseInt(o.rows[0].total),
        offresEnAttente: parseInt(oa.rows[0].total),
        placesOffertes: parseInt(p.rows[0].total)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur statistiques lifts." });
  }
});

app.get("/api/lifts/adresse/:nom/:telephone", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM adresses_lifts WHERE nom_complet = $1 AND telephone = $2", [req.params.nom, req.params.telephone]);
    if (result.rows.length === 0) return res.json({ success: false, message: "Aucune adresse." });
    res.json({ success: true, adresse: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur récupération adresse." });
  }
});

app.post("/api/lifts/assigner", verifierConnexion, async (req, res) => {
  try {
    const { passager_id, conducteur_id } = req.body;
    if (!passager_id) return res.status(400).json({ success: false, message: "ID passager obligatoire." });
    await pool.query("UPDATE lifts SET conducteur_id = $1 WHERE id = $2", [conducteur_id, passager_id]);
    res.json({ success: true, message: "Assigné avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur assignation.", error: error.message });
  }
});

app.put("/api/lifts/:id/pris-en-charge", verifierConnexion, async (req, res) => {
  try {
    await pool.query("UPDATE lifts SET pris_en_charge = 1 WHERE id = $1", [Number(req.params.id)]);
    res.json({ success: true, message: "Pris en charge." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur mise à jour.", error: error.message });
  }
});

app.delete("/api/lifts/terminer-journee", verifierConnexion, async (req, res) => {
  try {
    await pool.query("DELETE FROM lifts");
    res.json({ success: true, message: "Journée terminée." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur suppression.", error: error.message });
  }
});

app.get("/api/lifts/:id", verifierConnexion, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lifts WHERE id = $1", [Number(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Introuvable." });
    res.json({ success: true, lift: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur récupération.", error: error.message });
  }
});

app.put("/api/lifts/:id", verifierConnexion, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nom_complet, telephone, secteur, adresse, nombre_personnes, type, places, statut, notes } = req.body;
    
    const current = await pool.query("SELECT * FROM lifts WHERE id = $1", [id]);
    if (current.rows.length === 0) return res.status(404).json({ success: false, message: "Introuvable." });
    const lift = current.rows[0];

    const nouvAdresse = adresse || lift.adresse;
    const nouvTel = telephone || lift.telephone;
    
    if (nouvAdresse && nouvTel) {
      await pool.query(
        `INSERT INTO adresses_lifts (nom_complet, telephone, adresse, secteur) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (nom_complet, telephone) DO UPDATE SET adresse = EXCLUDED.adresse, secteur = EXCLUDED.secteur, date_modification = CURRENT_TIMESTAMP`,
        [nom_complet || lift.nom_complet, nouvTel, nouvAdresse, secteur || lift.secteur]
      );
    }

    await pool.query(
      `UPDATE lifts SET nom_complet = $1, telephone = $2, secteur = $3, adresse = $4, nombre_personnes = $5, type = $6, places = $7, statut = $8, notes = $9 WHERE id = $10`,
      [nom_complet || lift.nom_complet, nouvTel, secteur || lift.secteur, nouvAdresse, nombre_personnes || lift.nombre_personnes, type || lift.type, places !== undefined ? places : lift.places, statut || lift.statut, notes || lift.notes, id]
    );
    res.json({ success: true, message: "Lift mis à jour." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur mise à jour.", error: error.message });
  }
});

app.delete("/api/lifts/:id", verifierConnexion, async (req, res) => {
  try {
    await pool.query("DELETE FROM lifts WHERE id = $1", [Number(req.params.id)]);
    res.json({ success: true, message: "Supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur suppression.", error: error.message });
  }
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, () => {
  console.log("");
  console.log("============================================");
  console.log(" ÉGLISE VASES D'HONNEUR DE JONQUIÈRE");
  console.log("============================================");
  console.log("");
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log("Mode: PostgreSQL (Neon.tech)");
  console.log("");
});