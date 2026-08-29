// ============================================
// ÉVANGÉLISATION
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

console.log("📢 Script evangelisation.js chargé");


// ============================================
// CONFIGURATION DES ÉTAPES
// ============================================

const ETAPES = [
    { nom: "Rencontrée", emoji: "🤝", couleur: "slate", bg: "bg-slate-500", bgLight: "bg-slate-50", text: "text-slate-700" },
    { nom: "Contactée", emoji: "📞", couleur: "blue", bg: "bg-blue-500", bgLight: "bg-blue-50", text: "text-blue-700" },
    { nom: "Invitée", emoji: "💌", couleur: "purple", bg: "bg-purple-500", bgLight: "bg-purple-50", text: "text-purple-700" },
    { nom: "Première visite", emoji: "🚪", couleur: "amber", bg: "bg-amber-500", bgLight: "bg-amber-50", text: "text-amber-700" },
    { nom: "En suivi", emoji: "❤️", couleur: "pink", bg: "bg-pink-500", bgLight: "bg-pink-50", text: "text-pink-700" },
    { nom: "Intégrée", emoji: "✅", couleur: "emerald", bg: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700" }
];


// ============================================
// VARIABLES GLOBALES
// ============================================

let personnes = [];
let filtreActuel = "Toutes";
let rechercheActuelle = "";


// ============================================
// FILTRAGE DU TÉLÉPHONE
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("📄 DOM chargé");

    const telInput = document.getElementById("telephone");

    if (telInput) {

        telInput.addEventListener("input", function (e) {

            e.target.value = e.target.value.replace(/\D/g, "");

            if (e.target.value.length > 10) {

                e.target.value = e.target.value.slice(0, 10);

            }

        });

    }


    // Boutons de filtre
    document.querySelectorAll(".filtre-btn").forEach(function (btn) {

        btn.addEventListener("click", function () {

            filtreActuel = this.dataset.filtre;


            // Mettre à jour l'apparence des boutons
            document.querySelectorAll(".filtre-btn").forEach(function (b) {

                b.classList.remove("bg-teal-600", "text-white");

                b.classList.add("bg-white", "border", "border-stone-300", "text-slate-700");

            });


            this.classList.remove("bg-white", "border", "border-stone-300", "text-slate-700");

            this.classList.add("bg-teal-600", "text-white");


            afficherPersonnes();

        });

    });


    // Recherche
    const rechercheInput = document.getElementById("recherchePersonne");

    if (rechercheInput) {

        rechercheInput.addEventListener("input", function (e) {

            rechercheActuelle = e.target.value.toLowerCase();

            afficherPersonnes();

        });

    }


    // Formulaire d'ajout
    const form = document.getElementById("formNouvellePersonne");

    if (form) {

        form.addEventListener("submit", ajouterPersonne);

    }


    // Déconnexion
    const btnDeconnexion = document.getElementById("btnDeconnexion");

    if (btnDeconnexion) {

        btnDeconnexion.addEventListener("click", async () => {

            try {

                const response = await fetch("/api/deconnexion", { method: "POST" });

                if (response.ok) {

                    window.location.href = "/connexion.html";

                }

            }

            catch (error) {

                console.error("Erreur de déconnexion :", error);

            }

        });

    }


    // Chargement initial
    chargerDonnees();

});


// ============================================
// CHARGER LES DONNÉES (stats + personnes)
// ============================================

async function chargerDonnees() {

    try {

        console.log("📡 Chargement des données...");


        // Charger les statistiques (entonnoir)
        const responseStats = await fetch("/api/evangelisation/statistiques");


        if (!responseStats.ok) {

            throw new Error("Erreur lors du chargement des statistiques");

        }


        const resultStats = await responseStats.json();


        if (resultStats.success) {

            afficherEntonnoir(resultStats.statistiques);

        }


        // Charger la liste des personnes
        const responsePersonnes = await fetch("/api/evangelisation");


        if (!responsePersonnes.ok) {

            throw new Error("Erreur lors du chargement des personnes");

        }


        const resultPersonnes = await responsePersonnes.json();


                if (resultPersonnes.success) {

            personnes = resultPersonnes.personnes;

            afficherPersonnes();

            afficherResponsables(personnes);

        }


        console.log("✅ Données chargées");

    }


    catch (error) {

        console.error("❌ Erreur :", error);

        alert("❌ Erreur : " + error.message + "\n\nVous devez être connecté.");

        window.location.href = "/connexion.html";

    }

}


// ============================================
// AFFICHER L'ENTONNOIR
// ============================================

function afficherEntonnoir(stats) {

    const entonnoir = document.getElementById("entonnoir");

    const totalGlobal = document.getElementById("totalGlobal");


    if (!entonnoir || !totalGlobal) return;


    totalGlobal.textContent = stats.total;


    entonnoir.innerHTML = "";


    ETAPES.forEach(function (etape, index) {

        const count = stats.parEtape[etape.nom] || 0;

        const pourcentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;


        const card = document.createElement("div");

        card.className = `bg-white rounded-xl p-4 border-t-4 border-t-${etape.couleur}-500 shadow-sm cursor-pointer transition hover:shadow-md hover:-translate-y-1`;


        card.innerHTML = `

            <div class="flex items-center justify-between mb-2">

                <span class="text-2xl">${etape.emoji}</span>

                <span class="text-xs font-bold text-${etape.couleur}-600 bg-${etape.couleur}-50 px-2 py-0.5 rounded">

                    ${pourcentage}%

                </span>

            </div>

            <p class="text-2xl font-extrabold text-slate-900">${count}</p>

            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">${etape.nom}</p>

            <div class="h-1 bg-stone-200 rounded-full mt-2 overflow-hidden">

                <div class="h-full ${etape.bg} rounded-full transition-all duration-700" style="width: ${pourcentage}%"></div>

            </div>

        `;


        // Clic sur une carte = filtrer par cette étape
        card.addEventListener("click", function () {

            filtreActuel = etape.nom;


            document.querySelectorAll(".filtre-btn").forEach(function (b) {

                b.classList.remove("bg-teal-600", "text-white");

                b.classList.add("bg-white", "border", "border-stone-300", "text-slate-700");

            });


            const btnCorrespondant = document.querySelector(`.filtre-btn[data-filtre="${etape.nom}"]`);

            if (btnCorrespondant) {

                btnCorrespondant.classList.remove("bg-white", "border", "border-stone-300", "text-slate-700");

                btnCorrespondant.classList.add("bg-teal-600", "text-white");

            }


            afficherPersonnes();


            // Scroller vers la liste
            document.getElementById("listePersonnes").scrollIntoView({ behavior: "smooth", block: "start" });

        });


        entonnoir.appendChild(card);

    });

}


// ============================================
// AFFICHER LA LISTE DES PERSONNES
// ============================================

function afficherPersonnes() {

    const container = document.getElementById("listePersonnes");

    const nombreSpan = document.getElementById("nombrePersonnes");


    if (!container) return;


    // Filtrer
    let personnesFiltrees = personnes;


    if (filtreActuel !== "Toutes") {

        personnesFiltrees = personnes.filter(p => p.etape === filtreActuel);

    }


    if (rechercheActuelle) {

        personnesFiltrees = personnesFiltrees.filter(p =>

            p.nom_complet.toLowerCase().includes(rechercheActuelle) ||

            (p.secteur && p.secteur.toLowerCase().includes(rechercheActuelle)) ||

            (p.responsable && p.responsable.toLowerCase().includes(rechercheActuelle))

        );

    }


    nombreSpan.textContent = personnesFiltrees.length;


    if (personnesFiltrees.length === 0) {

        container.innerHTML = `

            <div class="text-center py-12 bg-white rounded-xl border border-stone-200">

                <p class="text-4xl mb-2">📭</p>

                <p class="text-slate-500 text-sm">Aucune personne ne correspond à votre recherche.</p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    personnesFiltrees.forEach(function (personne) {

        const etapeConfig = ETAPES.find(e => e.nom === personne.etape) || ETAPES[0];

        const indexEtape = ETAPES.findIndex(e => e.nom === personne.etape);

        const prochaineEtape = ETAPES[indexEtape + 1];


        const card = document.createElement("div");

        card.className = `bg-white rounded-xl p-4 border-l-4 border-l-${etapeConfig.couleur}-500 shadow-sm hover:shadow-md transition`;


        // Date formatée
        const dateRencontre = personne.date_rencontre ? new Date(personne.date_rencontre).toLocaleDateString("fr-CA") : "?";

        const dateContact = personne.date_dernier_contact ? new Date(personne.date_dernier_contact).toLocaleDateString("fr-CA") : "?";


        card.innerHTML = `

            <div class="flex flex-wrap items-start justify-between gap-3 mb-3">

                <div class="flex-1 min-w-[200px]">

                    <div class="flex items-center gap-2 mb-1">

                        <span class="text-xl">${etapeConfig.emoji}</span>

                        <h4 class="font-bold text-slate-900 text-base">${personne.nom_complet}</h4>

                        <span class="text-xs font-bold uppercase px-2 py-0.5 rounded bg-${etapeConfig.couleur}-50 text-${etapeConfig.couleur}-700">

                            ${personne.etape}

                        </span>

                    </div>

                    <div class="text-xs text-slate-500 space-y-0.5">

                        ${personne.telephone ? `<p>📞 ${personne.telephone}</p>` : ""}

                        ${personne.courriel ? `<p>✉️ ${personne.courriel}</p>` : ""}

                        ${personne.secteur ? `<p>📍 ${personne.secteur}</p>` : ""}

                        ${personne.responsable ? `<p>👤 Responsable : ${personne.responsable}</p>` : ""}

                        <p>📅 Rencontre : ${dateRencontre}</p>

                        <p>🔄 Dernier contact : ${dateContact}</p>

                        ${personne.notes ? `<p class="italic">💬 ${personne.notes}</p>` : ""}

                    </div>

                </div>

                <div class="flex flex-col gap-2">

                    ${prochaineEtape ? `

                        <button class="avancer-btn bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap" data-id="${personne.id}" data-nom="${personne.nom_complet}" data-etape="${prochaineEtape.nom}">

                            ${prochaineEtape.emoji} → ${prochaineEtape.nom}

                        </button>

                    ` : `

                        <span class="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-lg text-center whitespace-nowrap">

                            ✅ Parcours terminé

                        </span>

                    `}

                    <button class="supprimer-btn bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition whitespace-nowrap" data-id="${personne.id}" data-nom="${personne.nom_complet}">

                        🗑️ Supprimer

                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });


    // Ajouter les écouteurs
    document.querySelectorAll(".avancer-btn").forEach(function (btn) {

        btn.addEventListener("click", function () {

            faireAvancerEtape(this.dataset.id, this.dataset.nom, this.dataset.etape);

        });

    });


    document.querySelectorAll(".supprimer-btn").forEach(function (btn) {

        btn.addEventListener("click", function () {

            supprimerPersonne(this.dataset.id, this.dataset.nom);

        });

    });

}


// ============================================
// AJOUTER UNE PERSONNE
// ============================================

async function ajouterPersonne(event) {

    event.preventDefault();


    const donnees = {

        nom_complet: document.getElementById("nomComplet").value,

        telephone: document.getElementById("telephone").value || null,

        courriel: document.getElementById("courriel").value || null,

        secteur: document.getElementById("secteur").value || null,

        responsable: document.getElementById("responsable").value || null,

        notes: document.getElementById("notes").value || null

    };


    if (!donnees.nom_complet.trim()) {

        alert("⚠️ Le nom complet est obligatoire.");

        return;

    }


    try {

        const response = await fetch("/api/evangelisation", {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify(donnees)

        });


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }


        alert("✅ Personne ajoutée avec succès !");


        // Réinitialiser le formulaire
        document.getElementById("formNouvellePersonne").reset();


        // Recharger
        chargerDonnees();

    }


    catch (error) {

        console.error("Erreur :", error);

        alert("❌ Erreur : " + error.message);

    }

}


// ============================================
// FAIRE AVANCER L'ÉTAPE
// ============================================

async function faireAvancerEtape(id, nom, nouvelleEtape) {

    if (!confirm(`Faire avancer "${nom}" à l'étape "${nouvelleEtape}" ?`)) {

        return;

    }


    try {

        const response = await fetch(`/api/evangelisation/${id}`, {

            method: "PUT",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ etape: nouvelleEtape })

        });


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }


        alert(`✅ "${nom}" est maintenant à l'étape "${nouvelleEtape}"`);


        chargerDonnees();

    }


    catch (error) {

        console.error("Erreur :", error);

        alert("❌ Erreur : " + error.message);

    }

}


// ============================================
// SUPPRIMER UNE PERSONNE
// ============================================

async function supprimerPersonne(id, nom) {

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${nom}" ?\n\nCette action est irréversible.`)) {

        return;

    }


    try {

        const response = await fetch(`/api/evangelisation/${id}`, {

            method: "DELETE"

        });


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(result.message);

        }


        alert(`✅ "${nom}" a été supprimé.`);


        chargerDonnees();

    }


    catch (error) {

        console.error("Erreur :", error);

        alert("❌ Erreur : " + error.message);

    }

}
// ============================================
// AFFICHER LES RESPONSABLES DU SUIVI
// ============================================

function afficherResponsables(listePersonnes) {

    const container = document.getElementById("listeResponsables");

    if (!container) return;


    if (!listePersonnes || listePersonnes.length === 0) {

        container.innerHTML = `
            <p class="text-sm text-slate-500 text-center py-8 col-span-full">
                Aucune personne enregistrée pour l'instant.
            </p>
        `;

        return;

    }


    // Grouper par responsable
    const responsables = {};


    listePersonnes.forEach(function (p) {

        const nomResponsable = (p.responsable && p.responsable.trim() !== "") ? p.responsable : "Non assigné";

        if (!responsables[nomResponsable]) responsables[nomResponsable] = [];

        responsables[nomResponsable].push(p);

    });


    // Trier ("Non assigné" à la fin)
    const noms = Object.keys(responsables).sort(function (a, b) {

        if (a === "Non assigné") return 1;

        if (b === "Non assigné") return -1;

        return a.localeCompare(b);

    });


    container.innerHTML = "";


    noms.forEach(function (nom) {

        const liste = responsables[nom];

        const actifs = liste.filter(function (p) { return p.etape !== "Intégrée"; }).length;


        const card = document.createElement("div");

        card.className = "bg-white rounded-xl border border-stone-200 overflow-hidden";

        card.innerHTML = `

            <div class="bg-[#e8e2d5] px-4 py-3 flex items-center justify-between border-b border-stone-200">

                <div class="flex items-center gap-2">

                    <span class="text-xl">👤</span>

                    <h4 class="font-bold text-slate-900">${nom}</h4>

                </div>

                <span class="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded font-semibold">

                    ${liste.length} personne${liste.length > 1 ? 's' : ''} • ${actifs} en suivi

                </span>

            </div>

            <div class="p-4 space-y-2 liste-personnes"></div>

        `;


        const listeDiv = card.querySelector(".liste-personnes");


        liste.forEach(function (p) {

            const etapeConfig = ETAPES.find(function (e) { return e.nom === p.etape; }) || ETAPES[0];


            const ligne = document.createElement("div");

            ligne.className = "flex items-center justify-between gap-2 bg-stone-50 rounded-lg px-3 py-2 border border-stone-200";

            ligne.innerHTML = `

                <div class="flex items-center gap-2 min-w-0">

                    <span>${etapeConfig.emoji}</span>

                    <span class="text-sm font-semibold text-slate-800 truncate">${p.nom_complet}</span>

                </div>

                <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-${etapeConfig.couleur}-50 text-${etapeConfig.couleur}-700 whitespace-nowrap">

                    ${p.etape}

                </span>

            `;

            listeDiv.appendChild(ligne);

        });


        container.appendChild(card);

    });

}