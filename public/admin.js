// ============================================
// TABLEAU DE BORD ADMINISTRATEUR
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

console.log("🚀 Script admin.js chargé");


// ============================================
// VÉRIFIER LA CONNEXION
// ============================================

async function verifierConnexion() {

    try {

        console.log("🔐 Vérification de la connexion...");


        const response = await fetch("/api/session");


        if (!response.ok) {

            window.location.href = "/connexion.html";
            return;

        }


        const result = await response.json();


        if (!result.connecte) {

            window.location.href = "/connexion.html";
            return;

        }


        console.log("✅ Connecté en tant que :", result.utilisateur.nomComplet);


        const nomAdmin = document.getElementById("nomAdministrateur");


        if (nomAdmin && result.utilisateur) {

            nomAdmin.textContent = result.utilisateur.nomComplet;

        }


        // Charger toutes les statistiques
        chargerStatistiquesGenerales();

        chargerCategoriesIntelligentes();

        chargerEvangelisation();

    }


    catch (error) {

        console.error("❌ Erreur de vérification :", error);

        window.location.href = "/connexion.html";

    }

}


// ============================================
// DATE DU JOUR (badge)
// ============================================

function afficherDateBadge() {

    const badge = document.getElementById("dateBadge");


    if (!badge) return;


    const maintenant = new Date();

    const nomsMois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",

        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];


    badge.textContent = `${maintenant.getDate()} ${nomsMois[maintenant.getMonth()]} ${maintenant.getFullYear()}`;

}


// ============================================
// STATISTIQUES GÉNÉRALES
// ============================================

async function chargerStatistiquesGenerales() {

    try {

        console.log("📡 Chargement des statistiques générales...");


        const responseMembres = await fetch("/api/membres");


        if (!responseMembres.ok) return;


        const resultMembres = await responseMembres.json();


        if (!resultMembres.success) return;


        const membres = resultMembres.membres || [];


        const statTotal = document.getElementById("statTotalMembres");

        if (statTotal) statTotal.textContent = membres.length;


        const maintenant = new Date();

        const moisActuel = maintenant.getMonth();

        const anneeActuelle = maintenant.getFullYear();


        const nouveauxMembres = membres.filter(membre => {

            if (!membre.date_inscription) return false;

            const dateInscription = new Date(membre.date_inscription);

            return (
                dateInscription.getMonth() === moisActuel &&
                dateInscription.getFullYear() === anneeActuelle
            );

        });


        const statNouveaux = document.getElementById("statNouveauxMembres");

        if (statNouveaux) statNouveaux.textContent = nouveauxMembres.length;


        const barNouveaux = document.getElementById("barNouveaux");

        if (barNouveaux && membres.length > 0) {

            barNouveaux.style.width = Math.round((nouveauxMembres.length / membres.length) * 100) + "%";

        }


        const responsePresences = await fetch("/api/statistiques/presences");


        if (!responsePresences.ok) return;


        const resultPresences = await responsePresences.json();


        if (!resultPresences.success) return;


        const stats = resultPresences.statistiques;


        const statPresents = document.getElementById("statPresentsDernierCulte");

        if (statPresents) {

            statPresents.textContent = stats.dernierCulteDate
                ? `${stats.dernierCultePresences} / ${stats.totalMembres}`
                : "Aucun culte";

        }


        const statTaux = document.getElementById("statTauxPresence");

        if (statTaux) {

            statTaux.textContent = stats.dernierCulteDate ? `${stats.tauxPresence}%` : "0%";

        }


        const barPresents = document.getElementById("barPresents");

        if (barPresents && stats.dernierCulteDate) {

            barPresents.style.width = stats.tauxPresence + "%";

        }


        const barTaux = document.getElementById("barTaux");

        if (barTaux && stats.dernierCulteDate) {

            barTaux.style.width = stats.tauxPresence + "%";

        }


        const statCultes = document.getElementById("statNombreCultes");

        if (statCultes) statCultes.textContent = stats.nombreCultes;


        const statDate = document.getElementById("statDateDernierCulte");

        if (statDate) {

            if (stats.dernierCulteDate) {

                const dateCulte = new Date(stats.dernierCulteDate);

                statDate.textContent = dateCulte.toLocaleDateString("fr-CA", {

                    year: "numeric",

                    month: "long",

                    day: "numeric"

                });

            }

            else {

                statDate.textContent = "Aucun culte";

            }

        }


        console.log("✅ Statistiques générales chargées");

    }


    catch (error) {

        console.error("❌ Erreur statistiques :", error);

    }

}


// ============================================
// CATÉGORIES INTELLIGENTES
// ============================================

async function chargerCategoriesIntelligentes() {

    try {

        console.log("📡 Chargement des catégories intelligentes...");


        const response = await fetch("/api/statistiques/categories");


        if (!response.ok) return;


        const result = await response.json();


        if (!result.success) return;


        const categories = result.categories;


        const catReguliers = document.getElementById("catReguliers");

        if (catReguliers) catReguliers.textContent = categories.pourcentageReguliers + "%";

        const catReguliersCount = document.getElementById("catReguliersCount");

        if (catReguliersCount) catReguliersCount.textContent = categories.reguliers;

        const barReguliers = document.getElementById("barReguliers");

        if (barReguliers) barReguliers.style.width = categories.pourcentageReguliers + "%";


        const catOccasionnels = document.getElementById("catOccasionnels");

        if (catOccasionnels) catOccasionnels.textContent = categories.pourcentageOccasionnels + "%";

        const catOccasionnelsCount = document.getElementById("catOccasionnelsCount");

        if (catOccasionnelsCount) catOccasionnelsCount.textContent = categories.occasionnels;

        const barOccasionnels = document.getElementById("barOccasionnels");

        if (barOccasionnels) barOccasionnels.style.width = categories.pourcentageOccasionnels + "%";


        const catAbsents = document.getElementById("catAbsents");

        if (catAbsents) catAbsents.textContent = categories.pourcentageAbsents + "%";

        const catAbsentsCount = document.getElementById("catAbsentsCount");

        if (catAbsentsCount) catAbsentsCount.textContent = categories.absents;

        const barAbsents = document.getElementById("barAbsents");

        if (barAbsents) barAbsents.style.width = categories.pourcentageAbsents + "%";


        const alertSuivi = document.getElementById("alertSuivi");

        const alertSuiviCount = document.getElementById("alertSuiviCount");


        if (alertSuivi && alertSuiviCount) {

            if (categories.aSuivre.length > 0) {

                alertSuivi.style.display = "flex";

                alertSuiviCount.textContent = categories.aSuivre.length;

            }

            else {

                alertSuivi.style.display = "none";

            }

        }


        afficherEvolution(categories.evolution);

        afficherPersonnesASuivre(categories.aSuivre);


        console.log("✅ Catégories intelligentes chargées");

    }


    catch (error) {

        console.error("❌ Erreur catégories :", error);

    }

}


// ============================================
// ÉVOLUTION MENSUELLE
// ============================================

function afficherEvolution(evolution) {

    const container = document.getElementById("evolutionContainer");

    if (!container) return;


    if (!evolution || evolution.length === 0) {

        container.innerHTML = `

            <p class="text-sm text-slate-500 w-full text-center self-center">

                📊 Aucune donnée d'évolution disponible.<br>

                Créez des cultes et enregistrez des présences pour voir l'évolution.

            </p>

        `;

        return;

    }


    container.innerHTML = "";


    evolution.forEach(function (mois) {

        let couleur = "bg-red-500";

        if (mois.taux >= 70) couleur = "bg-emerald-500";

        else if (mois.taux >= 40) couleur = "bg-amber-500";


        const hauteur = Math.max((mois.taux / 100) * 128, 8);


        const item = document.createElement("div");

        item.className = "flex-1 max-w-[100px] flex flex-col items-center";

        item.innerHTML = `

            <div class="w-full h-32 flex items-end justify-center">

                <div class="w-10 rounded-t-md ${couleur} transition-all duration-700" style="height: ${hauteur}px;"></div>

            </div>

            <p class="text-sm font-bold text-slate-800 mt-2">${mois.taux}%</p>

            <p class="text-xs text-slate-500">${mois.mois}</p>

            <p class="text-[10px] text-slate-400">${mois.nombreCultes} culte${mois.nombreCultes > 1 ? 's' : ''}</p>

        `;

        container.appendChild(item);

    });

}


// ============================================
// PERSONNES À SUIVRE
// ============================================

function afficherPersonnesASuivre(personnes) {

    const container = document.getElementById("listeASuivre");

    if (!container) return;


    if (!personnes || personnes.length === 0) {

        container.innerHTML = `

            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-700 text-sm font-medium">

                ✅ Excellent ! Aucune personne ne nécessite un suivi particulier.<br>

                Tous les membres sont bien intégrés.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    personnes.forEach(function (personne) {

        let bordure = "border-l-red-500";

        let badge = "bg-red-50 text-red-700";


        if (personne.categorie === "Régulier") {

            bordure = "border-l-emerald-600";

            badge = "bg-emerald-50 text-emerald-700";

        }

        else if (personne.categorie === "Occasionnel") {

            bordure = "border-l-amber-500";

            badge = "bg-amber-50 text-amber-700";

        }


        const item = document.createElement("div");

        item.className = `bg-[#fcfaf7] border border-stone-200 border-l-4 ${bordure} rounded-xl p-4 flex flex-wrap items-center gap-3 hover:shadow-md transition`;

        item.innerHTML = `

            <span class="text-xs font-bold uppercase px-2 py-1 rounded-md ${badge}">

                ${personne.categorie}

            </span>

            <div class="flex-1 min-w-[150px]">

                <p class="font-semibold text-slate-800 text-sm">${personne.nom}</p>

                <p class="text-xs text-slate-500">

                    ${personne.secteur ? '📍 ' + personne.secteur : ''}

                    ${personne.fonction ? ' — 👤 ' + personne.fonction : ''}

                </p>

            </div>

            <span class="text-xs italic text-amber-800 bg-amber-50 px-3 py-1 rounded-lg">

                ${personne.raison}

            </span>

            <a href="/membre.html?id=${personne.id}" class="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition">

                Voir la fiche

            </a>

        `;

        container.appendChild(item);

    });

}


// ============================================
// ÉVANGÉLISATION (MISSION)
// ============================================

async function chargerEvangelisation() {

    try {

        console.log("📡 Chargement des statistiques d'évangélisation...");


        const response = await fetch("/api/evangelisation/statistiques");


        if (!response.ok) return;


        const result = await response.json();


        if (!result.success) return;


        afficherMission(result.statistiques);


        console.log("✅ Statistiques d'évangélisation chargées");

    }


    catch (error) {

        console.error("❌ Erreur évangélisation :", error);

    }

}


// ============================================
// AFFICHER L'ENTONNOIR DE MISSION
// ============================================

function afficherMission(stats) {

    const container = document.getElementById("missionContainer");

    const totalSpan = document.getElementById("missionTotal");


    if (!container) return;


    if (totalSpan) totalSpan.textContent = stats.total;


    const ETAPES = [

        { nom: "Rencontrée", emoji: "🤝", couleur: "slate" },

        { nom: "Contactée", emoji: "📞", couleur: "blue" },

        { nom: "Invitée", emoji: "💌", couleur: "purple" },

        { nom: "Première visite", emoji: "🚪", couleur: "amber" },

        { nom: "En suivi", emoji: "❤️", couleur: "pink" },

        { nom: "Intégrée", emoji: "✅", couleur: "emerald" }

    ];


    container.innerHTML = "";


    ETAPES.forEach(function (etape) {

        const count = stats.parEtape[etape.nom] || 0;

        const pourcentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;


        const card = document.createElement("div");

        card.className = `bg-white rounded-xl p-3 border border-stone-200 border-t-4 border-t-${etape.couleur}-500 text-center shadow-sm`;

        card.innerHTML = `

            <div class="text-xl mb-1">${etape.emoji}</div>

            <p class="text-xl font-extrabold text-slate-900">${count}</p>

            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">${etape.nom}</p>

            <p class="text-[10px] text-${etape.couleur}-600 font-semibold mt-0.5">${pourcentage}%</p>

        `;

        container.appendChild(card);

    });

}


// ============================================
// DÉMARRAGE
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("📄 DOM chargé");


    afficherDateBadge();


    const btnDeconnexion = document.getElementById("btnDeconnexion");


    if (btnDeconnexion) {

        btnDeconnexion.addEventListener("click", async () => {

            try {

                const response = await fetch("/api/deconnexion", { method: "POST" });


                if (response.ok) {

                    alert("Vous avez été déconnecté avec succès.");

                    window.location.href = "/connexion.html";

                }

                else {

                    alert("Erreur lors de la déconnexion.");

                }

            }

            catch (error) {

                console.error("Erreur de déconnexion :", error);

                alert("Erreur de connexion au serveur.");

            }

        });

    }


    const stickyHeader = document.getElementById("stickyHeader");


    if (stickyHeader) {

        let lastScrollY = window.scrollY;


        window.addEventListener("scroll", () => {

            const currentScrollY = window.scrollY;


            if (currentScrollY > lastScrollY && currentScrollY > 100) {

                stickyHeader.style.transform = "translateY(-100%)";

            }

            else {

                stickyHeader.style.transform = "translateY(0)";

            }

            lastScrollY = currentScrollY;

        });

    }
    


    verifierConnexion();

});