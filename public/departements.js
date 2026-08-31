console.log("🏛️ Script departements.js chargé");

let departements = [];
let membres = [];
let departementActifId = null;

// ==========================================
// DÉMARRAGE
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    console.log("📄 DOM chargé pour départements");

    const form = document.getElementById("formDepartement");
    if (form) form.addEventListener("submit", enregistrerDepartement);

    document.getElementById("btnDeconnexion").addEventListener("click", async () => {
        const response = await fetch("/api/deconnexion", { method: "POST" });
        if (response.ok) window.location.href = "/connexion.html";
    });

    const btnAnnuler = document.getElementById("btnAnnuler");
    if (btnAnnuler) btnAnnuler.addEventListener("click", reinitialiserFormulaire);

    document.getElementById("btnFermerModal").addEventListener("click", fermerModalMembres);
    document.getElementById("btnAjouterMembre").addEventListener("click", ajouterMembreDepartement);

    // Fermer modal en cliquant à l'extérieur
    window.addEventListener("click", function (e) {
        if (e.target.id === "modalMembres") fermerModalMembres();
    });

    chargerDonnees();
});

// ==========================================
// CHARGEMENT DES DONNÉES
// ==========================================
async function chargerDonnees() {
    try {
        // Charger les départements
        const responseDepartements = await fetch("/api/departements");
        const resultDepartements = await responseDepartements.json();
        if (resultDepartements.success) {
            departements = resultDepartements.departements;
            afficherDepartements();
        }

        // Charger les statistiques
        const responseStats = await fetch("/api/departements/statistiques");
        const resultStats = await responseStats.json();
        if (resultStats.success) {
            afficherStatistiques(resultStats.statistiques);
        }

        // Charger tous les membres (pour les selects)
        const responseMembres = await fetch("/api/membres");
        const resultMembres = await responseMembres.json();
        if (resultMembres.success) {
            membres = resultMembres.membres;
            remplirSelectResponsable();
        }

        console.log("✅ Données chargées");
    } catch (error) {
        console.error("❌ Erreur :", error);
        alert("❌ Erreur de chargement : " + error.message);
    }
}

// ==========================================
// AFFICHER LES STATISTIQUES
// ==========================================
function afficherStatistiques(stats) {
    const container = document.getElementById("statsDepartements");
    if (!container) return;

    if (!stats || stats.length === 0) {
        container.innerHTML = `<p class="text-sm text-slate-500 text-center py-8 col-span-full">Aucun département créé</p>`;
        return;
    }

    const totalMembres = stats.reduce((sum, d) => sum + parseInt(d.nombre_membres), 0);

    container.innerHTML = `
        <div class="bg-white rounded-xl p-4 border border-stone-200 border-t-4 border-t-teal-500 text-center">
            <p class="text-2xl font-extrabold text-slate-900">${stats.length}</p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">🏛️ Départements</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-stone-200 border-t-4 border-t-blue-500 text-center">
            <p class="text-2xl font-extrabold text-slate-900">${totalMembres}</p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">👥 Membres assignés</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-stone-200 border-t-4 border-t-amber-500 text-center">
            <p class="text-2xl font-extrabold text-slate-900">${totalMembres > 0 ? Math.round(totalMembres / stats.length) : 0}</p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">📊 Moyenne/département</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-stone-200 border-t-4 border-t-emerald-500 text-center">
            <p class="text-2xl font-extrabold text-slate-900">${membres.length}</p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">👥 Total membres</p>
        </div>
    `;
}

// ==========================================
// REMPLIR LE SELECT DU RESPONSABLE
// ==========================================
function remplirSelectResponsable() {
    const select = document.getElementById("responsable_id");
    if (!select) return;

    select.innerHTML = `<option value="">Aucun responsable</option>`;

    membres.forEach(m => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = m.nom_complet;
        select.appendChild(option);
    });
}

// ==========================================
// AFFICHER LES DÉPARTEMENTS
// ==========================================
function afficherDepartements() {
    const container = document.getElementById("listeDepartements");
    if (!container) return;

    if (departements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-xl border border-stone-200">
                <p class="text-4xl mb-2">🏛️</p>
                <p class="text-sm text-slate-500">Aucun département créé pour l'instant</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    departements.forEach(dept => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition";
        
        const couleurFond = dept.couleur || '#3b82f6';
        
        card.innerHTML = `
            <div class="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200" style="background-color: ${couleurFond}15; border-left: 5px solid ${couleurFond};">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${dept.icone || '🏛️'}</span>
                    <div>
                        <h4 class="font-bold text-slate-900 text-lg">${dept.nom}</h4>
                        ${dept.responsable_nom ? `<p class="text-xs text-slate-600 font-medium">👤 Responsable : ${dept.responsable_nom}</p>` : '<p class="text-xs text-slate-400 italic">Aucun responsable assigné</p>'}
                    </div>
                </div>
                <div class="flex gap-2 flex-wrap">
                    <button class="voir-membres-btn bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg transition border border-blue-200" data-id="${dept.id}" data-nom="${dept.nom}">
                        👥 Voir membres
                    </button>
                    <button class="modifier-btn bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-2 rounded-lg transition border border-amber-200" data-id="${dept.id}">
                        ✏️ Modifier
                    </button>
                    <button class="supprimer-btn bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-lg transition border border-red-200" data-id="${dept.id}" data-nom="${dept.nom}" title="Supprimer">
                        🗑️
                    </button>
                </div>
            </div>
            ${dept.description ? `<div class="px-4 py-3 bg-stone-50"><p class="text-sm text-slate-600">${dept.description}</p></div>` : ''}
        `;

        // Événements
        card.querySelector(".voir-membres-btn").addEventListener("click", function () {
            ouvrirModalMembres(this.dataset.id, this.dataset.nom);
        });
        card.querySelector(".modifier-btn").addEventListener("click", function () {
            modifierDepartement(this.dataset.id);
        });
        card.querySelector(".supprimer-btn").addEventListener("click", function () {
            supprimerDepartement(this.dataset.id, this.dataset.nom);
        });

        container.appendChild(card);
    });
}

// ==========================================
// ENREGISTRER (CRÉER OU MODIFIER)
// ==========================================
async function enregistrerDepartement(event) {
    event.preventDefault();

    const id = document.getElementById("departementId").value;
    const donnees = {
        nom: document.getElementById("nom").value,
        description: document.getElementById("description").value,
        responsable_id: document.getElementById("responsable_id").value || null,
        couleur: document.getElementById("couleur").value,
        icone: document.getElementById("icone").value
    };

    if (!donnees.nom.trim()) {
        alert("⚠️ Le nom du département est obligatoire.");
        return;
    }

    try {
        let url = "/api/departements";
        let method = "POST";

        if (id) {
            url = `/api/departements/${id}`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donnees)
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        alert(id ? "✅ Département modifié avec succès !" : "✅ Département créé avec succès !");
        reinitialiserFormulaire();
        chargerDonnees();
    } catch (error) {
        alert("❌ Erreur : " + error.message);
    }
}

// ==========================================
// MODIFIER UN DÉPARTEMENT
// ==========================================
function modifierDepartement(id) {
    const dept = departements.find(d => d.id == id);
    if (!dept) return;

    document.getElementById("departementId").value = dept.id;
    document.getElementById("nom").value = dept.nom;
    document.getElementById("description").value = dept.description || "";
    document.getElementById("responsable_id").value = dept.responsable_id || "";
    document.getElementById("couleur").value = dept.couleur || "#3b82f6";
    document.getElementById("icone").value = dept.icone || "🏛️";

    const formTitre = document.getElementById("formTitre");
    const formSousTitre = document.getElementById("formSousTitre");
    const btnAnnuler = document.getElementById("btnAnnuler");

    if (formTitre) formTitre.textContent = "Modifier";
    if (formSousTitre) formSousTitre.textContent = `Modifier "${dept.nom}"`;
    if (btnAnnuler) btnAnnuler.classList.remove("hidden");

    // Afficher le formulaire s'il était caché
    const formContainer = document.getElementById("formContainer") || document.getElementById("formDepartement").parentElement;
    if (formContainer && formContainer.classList.contains('hidden')) {
        formContainer.classList.remove('hidden');
    }

    // Scroll vers le formulaire
    document.getElementById("formDepartement").scrollIntoView({ behavior: "smooth", block: "center" });
}

// ==========================================
// SUPPRIMER UN DÉPARTEMENT
// ==========================================
async function supprimerDepartement(id, nom) {
    if (!confirm(`⚠️ Supprimer le département "${nom}" ?\n\nTous les membres assignés seront retirés de ce département.`)) return;

    try {
        const response = await fetch(`/api/departements/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        alert("✅ Département supprimé avec succès !");
        chargerDonnees();
    } catch (error) {
        alert("❌ Erreur : " + error.message);
    }
}

// ==========================================
// RÉINITIALISER LE FORMULAIRE
// ==========================================
function reinitialiserFormulaire() {
    const form = document.getElementById("formDepartement");
    if (form) form.reset();
    
    document.getElementById("departementId").value = "";
    
    const formTitre = document.getElementById("formTitre");
    const formSousTitre = document.getElementById("formSousTitre");
    const btnAnnuler = document.getElementById("btnAnnuler");

    if (formTitre) formTitre.textContent = "Nouveau";
    if (formSousTitre) formSousTitre.textContent = "Créer un département";
    if (btnAnnuler) btnAnnuler.classList.add("hidden");

    // Cacher le formulaire si on utilise le mode "caché"
    const formContainer = document.getElementById("formContainer");
    if (formContainer) formContainer.classList.add("hidden");
}

// ==========================================
// MODAL MEMBRES — OUVRIR
// ==========================================
async function ouvrirModalMembres(deptId, deptNom) {
    departementActifId = deptId;
    document.getElementById("modalTitre").textContent = `👥 Membres de "${deptNom}"`;
    
    const dept = departements.find(d => d.id == deptId);
    document.getElementById("modalDescription").textContent = dept && dept.description ? dept.description : "";

    remplirSelectMembresDisponibles(deptId);
    await chargerMembresDepartement(deptId);

    document.getElementById("modalMembres").style.display = "flex";
}

function fermerModalMembres() {
    document.getElementById("modalMembres").style.display = "none";
    departementActifId = null;
}

// ==========================================
// REMPLIR LE SELECT DES MEMBRES DISPONIBLES
// ==========================================
function remplirSelectMembresDisponibles(deptId) {
    const select = document.getElementById("selectMembre");
    if (!select) return;

    select.innerHTML = `<option value="">Sélectionner un membre...</option>`;

    membres.forEach(m => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = m.nom_complet;
        select.appendChild(option);
    });
}

// ==========================================
// CHARGER LES MEMBRES D'UN DÉPARTEMENT
// ==========================================
async function chargerMembresDepartement(deptId) {
    const container = document.getElementById("listeMembresDepartement");
    if (!container) return;

    try {
        const response = await fetch(`/api/departements/${deptId}/membres`);
        const result = await response.json();

        if (!result.success) throw new Error(result.message);

        const membresDept = result.membres;

        if (membresDept.length === 0) {
            container.innerHTML = `<p class="text-sm text-slate-500 text-center py-4 italic">Aucun membre dans ce département</p>`;
            return;
        }

        container.innerHTML = "";

        membresDept.forEach(m => {
            const ligne = document.createElement("div");
            ligne.className = "flex items-center justify-between gap-2 bg-stone-50 rounded-lg px-4 py-3 border border-stone-200 hover:border-amber-300 transition";
            ligne.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                        ${m.nom_complet.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-semibold text-slate-900 text-sm">${m.nom_complet}</p>
                        <p class="text-xs text-slate-500">${m.telephone || ''} ${m.courriel ? '• ' + m.courriel : ''}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200">${m.role}</span>
                    <button class="retirer-btn bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-2 py-1.5 rounded transition border border-red-200" data-membre-id="${m.membre_id}" data-membre-nom="${m.nom_complet}" title="Retirer">
                        ✕
                    </button>
                </div>
            `;

            ligne.querySelector(".retirer-btn").addEventListener("click", function () {
                retirerMembreDepartement(this.dataset.membreId, this.dataset.membreNom);
            });

            container.appendChild(ligne);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-sm text-red-500 text-center py-4">Erreur : ${error.message}</p>`;
    }
}

// ==========================================
// AJOUTER UN MEMBRE AU DÉPARTEMENT
// ==========================================
async function ajouterMembreDepartement() {
    const membreId = document.getElementById("selectMembre").value;
    const role = document.getElementById("selectRole").value;

    if (!membreId) {
        alert("⚠️ Veuillez sélectionner un membre.");
        return;
    }

    if (!departementActifId) {
        alert("⚠️ Aucun département sélectionné.");
        return;
    }

    try {
        const response = await fetch(`/api/departements/${departementActifId}/membres`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ membre_id: membreId, role: role })
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        document.getElementById("selectMembre").value = "";
        await chargerMembresDepartement(departementActifId);
        chargerDonnees();
    } catch (error) {
        alert("❌ Erreur : " + error.message);
    }
}

// ==========================================
// RETIRER UN MEMBRE DU DÉPARTEMENT
// ==========================================
async function retirerMembreDepartement(membreId, membreNom) {
    if (!confirm(`Retirer "${membreNom}" de ce département ?`)) return;

    if (!departementActifId) return;

    try {
        const response = await fetch(`/api/departements/${departementActifId}/membres/${membreId}`, {
            method: "DELETE"
        });

        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message);

        await chargerMembresDepartement(departementActifId);
        chargerDonnees();
    } catch (error) {
        alert("❌ Erreur : " + error.message);
    }
}