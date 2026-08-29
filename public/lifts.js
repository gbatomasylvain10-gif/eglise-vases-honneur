console.log("🚗 Script lifts.js chargé");

let lifts = [];
let timeoutRechercheAdresse = null;

document.addEventListener("DOMContentLoaded", function () {
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const placesContainer = document.getElementById("placesContainer");
    const personnesContainer = document.getElementById("personnesContainer");

    typeRadios.forEach(function (radio) {
        radio.addEventListener("change", function () {
            if (this.value === "Offre") {
                placesContainer.style.display = "block";
                personnesContainer.style.display = "none";
            } else {
                placesContainer.style.display = "none";
                personnesContainer.style.display = "block";
            }
        });
    });

    const telInput = document.getElementById("telephone");
    if (telInput) {
        telInput.addEventListener("input", function (e) {
            e.target.value = e.target.value.replace(/\D/g, "");
            if (e.target.value.length > 10) e.target.value = e.target.value.slice(0, 10);
            clearTimeout(timeoutRechercheAdresse);
            timeoutRechercheAdresse = setTimeout(rechercherAdresseMemorisee, 500);
        });
    }

    const form = document.getElementById("formLift");
    if (form) form.addEventListener("submit", ajouterLift);

    document.getElementById("btnDeconnexion").addEventListener("click", async () => {
        const response = await fetch("/api/deconnexion", { method: "POST" });
        if (response.ok) window.location.href = "/connexion.html";
    });

    document.getElementById("btnTerminerJournee").addEventListener("click", terminerJournee);

    // Modals
    document.getElementById("btnModalAnnuler").addEventListener("click", fermerModalModifier);
    document.getElementById("btnModalEnregistrer").addEventListener("click", enregistrerModification);
    document.getElementById("btnAssignerAnnuler").addEventListener("click", fermerModalAssigner);
    document.getElementById("btnAssignerConfirmer").addEventListener("click", confirmerAssignation);

    // Fermer modals en cliquant à l'extérieur
    window.addEventListener("click", function(e) {
        if (e.target.id === "modalModifier") fermerModalModifier();
        if (e.target.id === "modalAssigner") fermerModalAssigner();
    });

    // AUTOMATISATION À 20H00
    setInterval(verifierFinDeJourneeAuto, 60000); // Vérifie chaque minute
    verifierFinDeJourneeAuto(); // Vérifie aussi au chargement

    chargerDonnees();
});

// ==========================================
// AUTOMATISATION 20H00
// ==========================================
function verifierFinDeJourneeAuto() {
    const now = new Date();
    if (now.getHours() === 20 && now.getMinutes() === 0) {
        const lastCleared = localStorage.getItem('lastLiftsCleared');
        const today = now.toDateString();
        
        if (lastCleared !== today) {
            if (confirm("🕗 Il est 20h00. Voulez-vous terminer la journée et supprimer tous les lifts automatiquement ?")) {
                terminerJourneeSilencieux();
                localStorage.setItem('lastLiftsCleared', today);
            }
        }
    }
}

async function terminerJourneeSilencieux() {
    try {
        await fetch("/api/lifts/terminer-journee", { method: "DELETE" });
        alert("✅ Journée terminée automatiquement. Tous les lifts ont été supprimés.");
        chargerDonnees();
    } catch (error) {
        console.error("Erreur auto-fin de journée:", error);
    }
}

// ==========================================
// RECHERCHE ADRESSE
// ==========================================
async function rechercherAdresseMemorisee() {
    const nom = document.getElementById("nomComplet").value.trim();
    const telephone = document.getElementById("telephone").value.trim();
    const adresseMemo = document.getElementById("adresseMemo");

    if (!nom || telephone.length < 10) {
        if (adresseMemo) adresseMemo.classList.add("hidden");
        return;
    }

    try {
        const response = await fetch(`/api/lifts/adresse/${encodeURIComponent(nom)}/${encodeURIComponent(telephone)}`);
        const result = await response.json();
        if (result.success && result.adresse) {
            document.getElementById("adresse").value = result.adresse.adresse || "";
            document.getElementById("secteur").value = result.adresse.secteur || "";
            if (adresseMemo) {
                adresseMemo.classList.remove("hidden");
                adresseMemo.textContent = "✓ Adresse retrouvée : " + result.adresse.adresse;
            }
        } else {
            if (adresseMemo) adresseMemo.classList.add("hidden");
        }
    } catch (error) { console.error("Erreur recherche adresse :", error); }
}

// ==========================================
// CHARGEMENT DES DONNÉES
// ==========================================
async function chargerDonnees() {
    try {
        const responseStats = await fetch("/api/lifts/statistiques");
        const resultStats = await responseStats.json();
        if (resultStats.success) afficherStatistiques(resultStats.statistiques);

        const responseLifts = await fetch("/api/lifts");
        const resultLifts = await responseLifts.json();
        if (resultLifts.success) {
            lifts = resultLifts.lifts;
            afficherListesParSecteur();
        }
    } catch (error) {
        console.error("❌ Erreur :", error);
        window.location.href = "/connexion.html";
    }
}

function afficherStatistiques(stats) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("statDemandes", stats.totalDemandes);
    set("statDemandesAttente", stats.demandesEnAttente);
    set("statOffres", stats.totalOffres);
    set("statOffresAttente", stats.offresEnAttente);
    set("statPlaces", stats.placesOffertes);
}

// ==========================================
// AFFICHAGE PAR SECTEUR
// ==========================================
function afficherListesParSecteur() {
    const container = document.getElementById("listeSecteurs");
    if (!container) return;

    if (lifts.length === 0) {
        container.innerHTML = `<div class="text-center py-12 bg-white rounded-xl border border-stone-200"><p class="text-4xl mb-2">📭</p><p class="text-sm text-slate-500">Aucun lift enregistré</p></div>`;
        return;
    }

    const secteurs = {};
    lifts.forEach(lift => {
        const secteur = lift.secteur || "Non précisé";
        if (!secteurs[secteur]) secteurs[secteur] = [];
        secteurs[secteur].push(lift);
    });

    const secteursTries = Object.keys(secteurs).sort((a, b) => {
        if (a === "Non précisé") return 1;
        if (b === "Non précisé") return -1;
        return a.localeCompare(b);
    });

    container.innerHTML = "";

    secteursTries.forEach(secteur => {
        const liftsSecteur = secteurs[secteur];
        const demandes = liftsSecteur.filter(l => l.type === "Demande" && !l.pris_en_charge);
        const offres = liftsSecteur.filter(l => l.type === "Offre");

        const totalPersonnes = demandes.reduce((sum, l) => sum + (l.nombre_personnes || 1), 0);
        const totalPlaces = offres.reduce((sum, l) => sum + (l.places || 0), 0);
        const deficit = totalPersonnes - totalPlaces;

        const section = document.createElement("div");
        section.className = "bg-white rounded-xl border border-stone-200 overflow-hidden";
        section.innerHTML = `
            <div class="bg-[#e8e2d5] px-4 py-3 flex items-center justify-between border-b border-stone-200">
                <div class="flex items-center gap-2"><span class="text-xl">📍</span><h3 class="font-bold text-slate-900">${secteur}</h3></div>
                <div class="flex gap-2 text-xs flex-wrap">
                    <span class="bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">🙋 ${demandes.length} • ${totalPersonnes} pers.</span>
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">🚗 ${offres.length} • ${totalPlaces} places</span>
                    ${deficit > 0 ? `<span class="bg-red-600 text-white px-2 py-1 rounded font-bold animate-pulse">⚠️ ${deficit} sans transport</span>` : ''}
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div><p class="text-xs font-bold uppercase text-red-600 mb-2">🙋 Demandes (${demandes.length})</p><div class="space-y-2 demandes-list"></div></div>
                <div><p class="text-xs font-bold uppercase text-blue-600 mb-2">🚗 Offres (${offres.length})</p><div class="space-y-2 offres-list"></div></div>
            </div>
        `;

        const demandesList = section.querySelector(".demandes-list");
        const offresList = section.querySelector(".offres-list");

        if (demandes.length === 0) demandesList.innerHTML = `<p class="text-xs text-slate-400 italic py-2">Aucune demande</p>`;
        else demandes.forEach(lift => demandesList.appendChild(creerCartePassager(lift, offres)));

        if (offres.length === 0) offresList.innerHTML = `<p class="text-xs text-slate-400 italic py-2">Aucune offre</p>`;
        else offres.forEach(lift => offresList.appendChild(creerCarteConducteur(lift)));

        container.appendChild(section);
    });
}

// ==========================================
// CARTES PASSAGER & CONDUCTEUR
// ==========================================
function creerCartePassager(lift, conducteursDisponibles) {
    const card = document.createElement("div");
    const conducteur = lift.conducteur_id ? conducteursDisponibles.find(c => c.id === lift.conducteur_id) : null;
    const couleurBadge = conducteur ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
    const nbPersonnes = lift.nombre_personnes || 1;
    const textePersonnes = nbPersonnes === 1 ? "👤 Seul(e)" : `👥 ${nbPersonnes} personnes`;

    card.className = `bg-stone-50 rounded-lg p-3 border-l-4 border-l-red-500 shadow-sm`;
    card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-1">
            <h4 class="font-bold text-slate-900 text-sm">${lift.nom_complet}</h4>
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${couleurBadge} whitespace-nowrap">${conducteur ? '✓ Assigné' : '⏳ En attente'}</span>
        </div>
        <div class="text-xs text-slate-600 space-y-0.5 mb-2">
            ${lift.telephone ? `<p>📞 ${lift.telephone}</p>` : ""}
            ${lift.adresse ? `<p>🏠 ${lift.adresse}</p>` : `<p class="italic text-slate-400">Aucune adresse</p>`}
            <p>${textePersonnes}</p>
            ${conducteur ? `<p class="text-emerald-700 font-semibold">🚗 ${conducteur.nom_complet}</p>` : ""}
            ${lift.notes ? `<p class="italic">💬 ${lift.notes}</p>` : ""}
        </div>
        <div class="flex gap-1 flex-wrap">
            ${!lift.conducteur_id ? `<button class="assigner-btn bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold px-2 py-1 rounded transition" data-id="${lift.id}" data-nom="${lift.nom_complet}" data-nb="${nbPersonnes}">🚗 Assigner</button>` : `
                <button class="pris-charge-btn bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold px-2 py-1 rounded transition" data-id="${lift.id}">✓ Pris en charge</button>
                <button class="desassigner-btn bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold px-2 py-1 rounded transition" data-id="${lift.id}">↩️</button>
            `}
            <button class="modifier-btn bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-semibold px-2 py-1 rounded transition" 
                data-id="${lift.id}" 
                data-nom="${lift.nom_complet}" 
                data-adresse="${(lift.adresse || "").replace(/"/g, '&quot;')}" 
                data-secteur="${lift.secteur || ""}" 
                data-type="${lift.type}" 
                data-places="${lift.places || 1}" 
                data-nb="${nbPersonnes}">✏️</button>
            <button class="supprimer-btn bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded transition" data-id="${lift.id}" data-nom="${lift.nom_complet}">🗑️</button>
        </div>
    `;

    card.querySelector(".assigner-btn")?.addEventListener("click", function () { ouvrirModalAssigner(this.dataset.id, this.dataset.nom, this.dataset.nb, conducteursDisponibles); });
    card.querySelector(".pris-charge-btn")?.addEventListener("click", function () { marquerPrisEnCharge(this.dataset.id); });
    card.querySelector(".desassigner-btn")?.addEventListener("click", function () { desassignerPassager(this.dataset.id); });
    // ✅ CORRECTION : On passe maintenant data-nb (nbPersonnes)
    card.querySelector(".modifier-btn")?.addEventListener("click", function () { 
        ouvrirModalModifier(this.dataset.id, this.dataset.nom, this.dataset.adresse, this.dataset.secteur, this.dataset.type, this.dataset.places, this.dataset.nb); 
    });
    card.querySelector(".supprimer-btn")?.addEventListener("click", function () { supprimerLift(this.dataset.id, this.dataset.nom); });

    return card;
}

function creerCarteConducteur(lift) {
    const card = document.createElement("div");
    const passagersAssignes = lifts.filter(l => l.conducteur_id === lift.id);
    const personnesAssignees = passagersAssignes.reduce((sum, l) => sum + (l.nombre_personnes || 1), 0);
    const placesRestantes = lift.places - personnesAssignees;

    card.className = `bg-stone-50 rounded-lg p-3 border-l-4 border-l-blue-500 shadow-sm`;
    card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-1">
            <h4 class="font-bold text-slate-900 text-sm">${lift.nom_complet}</h4>
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 whitespace-nowrap">💺 ${placesRestantes}/${lift.places}</span>
        </div>
        <div class="text-xs text-slate-600 space-y-0.5 mb-2">
            ${lift.telephone ? `<p>📞 ${lift.telephone}</p>` : ""}
            ${lift.adresse ? `<p>🏠 ${lift.adresse}</p>` : `<p class="italic text-slate-400">Aucune adresse</p>`}
            <p>💺 ${lift.places} place${lift.places > 1 ? 's' : ''} au total</p>
            ${passagersAssignes.length > 0 ? `<p class="text-blue-700 font-semibold">👥 ${passagersAssignes.length} passager${passagersAssignes.length > 1 ? 's' : ''} assigné${passagersAssignes.length > 1 ? 's' : ''}</p>` : ""}
            ${lift.notes ? `<p class="italic">💬 ${lift.notes}</p>` : ""}
        </div>
        <div class="flex gap-1 flex-wrap">
            <button class="modifier-btn bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-semibold px-2 py-1 rounded transition" 
                data-id="${lift.id}" 
                data-nom="${lift.nom_complet}" 
                data-adresse="${(lift.adresse || "").replace(/"/g, '&quot;')}" 
                data-secteur="${lift.secteur || ""}" 
                data-type="${lift.type}" 
                data-places="${lift.places || 1}" 
                data-nb="1">✏️</button>
            <button class="supprimer-btn bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-1 rounded transition" data-id="${lift.id}" data-nom="${lift.nom_complet}">🗑️</button>
        </div>
    `;

    // ✅ CORRECTION : On passe 1 pour nbPersonnes (non utilisé pour les conducteurs, mais requis par la signature de la fonction)
    card.querySelector(".modifier-btn")?.addEventListener("click", function () { 
        ouvrirModalModifier(this.dataset.id, this.dataset.nom, this.dataset.adresse, this.dataset.secteur, this.dataset.type, this.dataset.places, 1); 
    });
    card.querySelector(".supprimer-btn")?.addEventListener("click", function () { supprimerLift(this.dataset.id, this.dataset.nom); });

    return card;
}

// ==========================================
// MODALS (Assignation & Modification)
// ==========================================
function ouvrirModalAssigner(passagerId, passagerNom, passagerNb, conducteurs) {
    document.getElementById("modalPassagerId").value = passagerId;
    document.getElementById("modalPassagerNombre").value = passagerNb;
    document.getElementById("modalAssignerNom").textContent = "Passager : " + passagerNom + " (" + passagerNb + " pers.)";

    const select = document.getElementById("modalConducteurSelect");
    const warning = document.getElementById("modalAssignerWarning");
    select.innerHTML = "";
    warning.classList.add("hidden");

    let availableCount = 0;
    conducteurs.forEach(c => {
        const passagersAssignes = lifts.filter(l => l.conducteur_id === c.id);
        const personnesAssignees = passagersAssignes.reduce((sum, l) => sum + (l.nombre_personnes || 1), 0);
        const placesRestantes = c.places - personnesAssignees;

        const option = document.createElement("option");
        option.value = c.id;
        
        // PROTECTION STRICTE : Si pas assez de places, on désactive et on prévient
        if (placesRestantes < passagerNb) {
            option.disabled = true;
            option.textContent = `❌ ${c.nom_complet} — Complet (${placesRestantes} place(s) restante(s))`;
        } else {
            option.textContent = `✅ ${c.nom_complet} — ${placesRestantes} place(s) restante(s)`;
            availableCount++;
        }
        select.appendChild(option);
    });

    if (availableCount === 0) {
        warning.textContent = "⚠️ Aucun conducteur n'a assez de places disponibles pour ce groupe.";
        warning.classList.remove("hidden");
    }

    document.getElementById("modalAssigner").style.display = "flex";
}

function fermerModalAssigner() { document.getElementById("modalAssigner").style.display = "none"; }

async function confirmerAssignation() {
    const passagerId = document.getElementById("modalPassagerId").value;
    const conducteurId = document.getElementById("modalConducteurSelect").value;

    if (!conducteurId) { alert("⚠️ Veuillez choisir un conducteur valide."); return; }

    try {
        const response = await fetch("/api/lifts/assigner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passager_id: passagerId, conducteur_id: conducteurId })
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);
        fermerModalAssigner();
        chargerDonnees();
    } catch (error) { alert("❌ Erreur : " + error.message); }
}

// ✅ CORRECTION : Ajout du paramètre nbPersonnes
function ouvrirModalModifier(id, nom, adresse, secteur, type, places, nbPersonnes) {
    document.getElementById("modalLiftId").value = id;
    document.getElementById("modalNom").textContent = nom;
    document.getElementById("modalNouvelleAdresse").value = adresse;
    document.getElementById("modalNouveauSecteur").value = secteur;
    document.getElementById("modalLiftType").value = type;
    
    // Afficher le champ "Places" UNIQUEMENT si c'est une Offre (conducteur)
    if (type === "Offre") {
        document.getElementById("modalPlacesContainer").style.display = "block";
        document.getElementById("modalPlaces").value = places || 1;
        document.getElementById("modalNombrePersonnesContainer").style.display = "none";
    } 
    // Afficher le champ "Nombre de personnes" UNIQUEMENT si c'est une Demande (passager)
    else if (type === "Demande") {
        document.getElementById("modalPlacesContainer").style.display = "none";
        document.getElementById("modalNombrePersonnesContainer").style.display = "block";
        document.getElementById("modalNombrePersonnes").value = nbPersonnes || 1;
    } 
    else {
        document.getElementById("modalPlacesContainer").style.display = "none";
        document.getElementById("modalNombrePersonnesContainer").style.display = "none";
    }

    document.getElementById("modalModifier").style.display = "flex";
}

function fermerModalModifier() { document.getElementById("modalModifier").style.display = "none"; }

// ✅ CORRECTION : Envoi de nombre_personnes si c'est une Demande
async function enregistrerModification() {
    const id = document.getElementById("modalLiftId").value;
    const nouvelleAdresse = document.getElementById("modalNouvelleAdresse").value;
    const nouveauSecteur = document.getElementById("modalNouveauSecteur").value;
    const type = document.getElementById("modalLiftType").value;

    const payload = { adresse: nouvelleAdresse, secteur: nouveauSecteur };

    // Si c'est un conducteur, on met à jour les places
    if (type === "Offre") {
        payload.places = parseInt(document.getElementById("modalPlaces").value) || 1;
    } 
    // Si c'est un passager, on met à jour le nombre de personnes
    else if (type === "Demande") {
        payload.nombre_personnes = parseInt(document.getElementById("modalNombrePersonnes").value) || 1;
    }

    try {
        const response = await fetch(`/api/lifts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        fermerModalModifier();
        chargerDonnees();
    } catch (error) { alert("❌ Erreur : " + error.message); }
}

// ==========================================
// ACTIONS DIVERSES
// ==========================================
async function desassignerPassager(passagerId) {
    try {
        const response = await fetch("/api/lifts/assigner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passager_id: passagerId, conducteur_id: null })
        });
        if (!(await response.json()).success) throw new Error("Échec");
        chargerDonnees();
    } catch (error) { alert("❌ Erreur : " + error.message); }
}

async function marquerPrisEnCharge(passagerId) {
    if (!confirm("Confirmer que ce passager a été pris en charge ?")) return;
    try {
        const response = await fetch(`/api/lifts/${passagerId}/pris-en-charge`, { method: "PUT" });
        if (!(await response.json()).success) throw new Error("Échec");
        chargerDonnees();
    } catch (error) { alert("❌ Erreur : " + error.message); }
}

async function terminerJournee() {
    if (!confirm("⚠️ ATTENTION\n\nCette action va supprimer TOUS les lifts.\n\nÊtes-vous sûr ?")) return;
    await terminerJourneeSilencieux();
}

async function ajouterLift(event) {
    event.preventDefault();
    const donnees = {
        nom_complet: document.getElementById("nomComplet").value,
        telephone: document.getElementById("telephone").value || null,
        secteur: document.getElementById("secteur").value || null,
        adresse: document.getElementById("adresse").value || null,
        type: document.querySelector('input[name="type"]:checked').value,
        places: document.getElementById("places").value ? parseInt(document.getElementById("places").value) : 0,
        nombre_personnes: document.getElementById("nombre_personnes").value ? parseInt(document.getElementById("nombre_personnes").value) : 1,
        notes: document.getElementById("notes").value || null
    };

    if (!donnees.nom_complet.trim()) { alert("⚠️ Le nom complet est obligatoire."); return; }

    try {
        const response = await fetch("/api/lifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(donnees) });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        alert("✅ Lift ajouté avec succès !");
        document.getElementById("formLift").reset();
        document.getElementById("placesContainer").style.display = "none";
        document.getElementById("personnesContainer").style.display = "block";
        document.getElementById("adresseMemo").classList.add("hidden");
        chargerDonnees();
    } catch (error) { alert("❌ Erreur : " + error.message); }
}

async function supprimerLift(id, nom) {
    if (!confirm(`Supprimer "${nom}" ?`)) return;
    try {
        const response = await fetch(`/api/lifts/${id}`, { method: "DELETE" });
        if (!(await response.json()).success) throw new Error("Échec");
        chargerDonnees();
    } catch (error) { alert("❌ Erreur : " + error.message); }
}