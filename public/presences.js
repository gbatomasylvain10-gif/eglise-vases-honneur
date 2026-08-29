// ============================================
// GESTION DES PRÉSENCES
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

console.log("🚀 Script presences.js chargé");

// ============================================
// COULEURS POUR LES AVATARS
// ============================================

const avatarColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'
];


function getAvatarColor(id) {
    return avatarColors[id % avatarColors.length];
}


function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
}


// ============================================
// INITIALISATION
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("📄 DOM chargé");


    // ========================================
    // ÉLÉMENTS DU DOM
    // ========================================

    const formNouveauCulte = document.getElementById("formNouveauCulte");

    const selectCulte = document.getElementById("selectCulte");

    const infoCulte = document.getElementById("infoCulte");

    const sectionPresences = document.getElementById("sectionPresences");

    const listeMembres = document.getElementById("listeMembres");

    const btnCocherTous = document.getElementById("btnCocherTous");

    const btnDecocherTous = document.getElementById("btnDecocherTous");

    const btnEnregistrerPresences = document.getElementById("btnEnregistrerPresences");

    const searchMembers = document.getElementById("searchMembers");


    // Éléments statistiques
    const statPresents = document.getElementById("statPresents");

    const statAbsents = document.getElementById("statAbsents");

    const statTotal = document.getElementById("statTotal");

    const statTauxCircle = document.getElementById("statTauxCircle");

    const statTauxText = document.getElementById("statTauxText");

    const progressCircle = document.getElementById("progressCircle");

    const progressBar = document.getElementById("progressBar");

    const dateCulteInput = document.getElementById("dateCulte");


    // ========================================
    // DATE PAR DÉFAUT (aujourd'hui)
    // ========================================

    if (dateCulteInput) {

        const maintenant = new Date();

        const annee = maintenant.getFullYear();

        const mois = String(maintenant.getMonth() + 1).padStart(2, "0");

        const jour = String(maintenant.getDate()).padStart(2, "0");

        dateCulteInput.value = `${annee}-${mois}-${jour}`;

    }


    // ========================================
    // CHARGER LA LISTE DES CULTES
    // ========================================

    async function chargerCultes() {

        try {

            console.log("📡 Chargement des cultes...");

            const response = await fetch("/api/cultes");


            if (!response.ok) {

                throw new Error("Erreur lors du chargement des cultes");

            }


            const result = await response.json();


            if (!result.success) {

                throw new Error(result.message);

            }


            const cultes = result.cultes || [];

            console.log("✅ Cultes chargés :", cultes.length);


            // Vider la liste déroulante
            selectCulte.innerHTML = '<option value="">-- Sélectionnez un culte --</option>';


            // Ajouter chaque culte
            cultes.forEach(function (culte) {

                const option = document.createElement("option");

                option.value = culte.id;

                const dateFormatee = new Date(culte.date_culte).toLocaleDateString("fr-CA", {

                    year: "numeric",

                    month: "long",

                    day: "numeric"

                });

                option.textContent = `${dateFormatee} — ${culte.type_culte}`;

                selectCulte.appendChild(option);

            });

        }


        catch (error) {

            console.error("❌ Erreur :", error);

            alert("❌ Erreur : " + error.message + "\n\nVous devez être connecté pour accéder à cette page.");

            window.location.href = "/connexion.html";

        }

    }


    // ========================================
    // CRÉER UN NOUVEAU CULTE
    // ========================================

    if (formNouveauCulte) {

        formNouveauCulte.addEventListener("submit", async function (event) {

            event.preventDefault();


            const donnees = {

                dateCulte: document.getElementById("dateCulte").value,

                typeCulte: document.getElementById("typeCulte").value,

                notes: document.getElementById("notesCulte").value

            };


            try {

                const response = await fetch("/api/cultes", {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(donnees)

                });


                const result = await response.json();


                if (!response.ok || !result.success) {

                    throw new Error(result.message);

                }


                alert("✅ Culte créé avec succès !");


                // Réinitialiser le formulaire
                formNouveauCulte.reset();

                const maintenant = new Date();

                const annee = maintenant.getFullYear();

                const mois = String(maintenant.getMonth() + 1).padStart(2, "0");

                const jour = String(maintenant.getDate()).padStart(2, "0");

                dateCulteInput.value = `${annee}-${mois}-${jour}`;


                // Recharger la liste des cultes
                await chargerCultes();


                // Sélectionner automatiquement le nouveau culte
                selectCulte.value = result.id;

                selectCulte.dispatchEvent(new Event("change"));

            }


            catch (error) {

                console.error("❌ Erreur :", error);

                alert("❌ Erreur : " + error.message);

            }

        });

    }


    // ========================================
    // SÉLECTION D'UN CULTE
    // ========================================

    if (selectCulte) {

        selectCulte.addEventListener("change", async function () {

            const culteId = selectCulte.value;


            if (!culteId) {

                if (infoCulte) infoCulte.style.display = "none";

                if (sectionPresences) sectionPresences.style.display = "none";

                return;

            }


            try {

                // Récupérer les infos du culte
                const responseCulte = await fetch(`/api/cultes/${culteId}`);

                const resultCulte = await responseCulte.json();


                if (!resultCulte.success) {

                    throw new Error(resultCulte.message);

                }


                const culte = resultCulte.culte;


                // Afficher les infos
                document.getElementById("infoDate").textContent =

                    new Date(culte.date_culte).toLocaleDateString("fr-CA", {

                        year: "numeric",

                        month: "long",

                        day: "numeric"

                    });

                document.getElementById("infoType").textContent = culte.type_culte;

                document.getElementById("infoNotes").textContent = culte.notes || "Aucune note";


                if (infoCulte) infoCulte.style.display = "block";


                // Charger les présences
                await chargerPresences(culteId);

            }


            catch (error) {

                console.error("❌ Erreur :", error);

                alert("❌ Erreur : " + error.message);

            }

        });

    }


    // ========================================
    // CHARGER LES PRÉSENCES
    // ========================================

    async function chargerPresences(culteId) {

        try {

            console.log("📡 Chargement des présences pour le culte", culteId);


            // Récupérer la liste des membres
            const responseMembres = await fetch("/api/membres");

            const resultMembres = await responseMembres.json();


            if (!resultMembres.success) {

                throw new Error(resultMembres.message);

            }


            const membres = resultMembres.membres || [];

            console.log("✅ Membres chargés :", membres.length);


            // Récupérer les présences existantes pour ce culte
            const responsePresences = await fetch(`/api/cultes/${culteId}/presences`);

            const resultPresences = await responsePresences.json();


            const presencesExistantes = {};


            if (resultPresences.success) {

                resultPresences.presences.forEach(function (p) {

                    presencesExistantes[p.membre_id] = p.present === 1;

                });

            }


            console.log("✅ Présences existantes :", presencesExistantes);


            // Afficher la liste des membres
            listeMembres.innerHTML = "";


            membres.forEach(function (membre) {

                const isChecked = presencesExistantes[membre.id] || false;


                const div = document.createElement("div");

                div.className = `member-card ${isChecked ? 'present' : 'absent'}`;

                div.dataset.memberId = membre.id;

                div.dataset.memberName = membre.nom_complet.toLowerCase();


                const initials = getInitials(membre.nom_complet);

                const color = getAvatarColor(membre.id);

                const secteur = membre.secteur || '';

                const fonction = membre.fonction || '';


                div.innerHTML = `

                    <div class="member-avatar ${isChecked ? 'present' : ''}" style="background: ${isChecked ? '' : color};">

                        ${initials}

                    </div>

                    <div class="member-info">

                        <div class="member-name">${membre.nom_complet}</div>

                        <div class="member-details">

                            ${secteur ? `<span class="member-detail-badge">📍 ${secteur}</span>` : ''}

                            ${fonction ? `<span class="member-detail-badge">👤 ${fonction}</span>` : ''}

                        </div>

                    </div>

                    <label class="toggle-switch">

                        <input

                            type="checkbox"

                            class="checkbox-presence"

                            data-membre-id="${membre.id}"

                            ${isChecked ? "checked" : ""}

                        >

                        <span class="toggle-slider"></span>

                    </label>

                `;


                // Clic sur la carte pour toggler la case
                div.addEventListener("click", function (e) {

                    // Ne pas déclencher si on clique sur le toggle lui-même
                    if (e.target.classList.contains('toggle-slider') ||

                        e.target.classList.contains('checkbox-presence')) {

                        return;

                    }


                    const checkbox = div.querySelector('.checkbox-presence');

                    checkbox.checked = !checkbox.checked;

                    checkbox.dispatchEvent(new Event('change'));

                });


                listeMembres.appendChild(div);

            });


            // Afficher la section des présences
            if (sectionPresences) sectionPresences.style.display = "block";


            // Mettre à jour les statistiques
            mettreAJourStatistiques();


            // Ajouter les écouteurs pour mise à jour en temps réel
            document.querySelectorAll(".checkbox-presence").forEach(function (checkbox) {

                checkbox.addEventListener("change", function () {

                    const card = this.closest('.member-card');

                    const avatar = card.querySelector('.member-avatar');


                    if (this.checked) {

                        card.classList.remove('absent');

                        card.classList.add('present');

                        avatar.classList.add('present');

                        avatar.style.background = '';

                    }

                    else {

                        card.classList.remove('present');

                        card.classList.add('absent');

                        avatar.classList.remove('present');

                        avatar.style.background = getAvatarColor(parseInt(this.dataset.membreId));

                    }


                    mettreAJourStatistiques();

                });

            });


            // Recherche
            if (searchMembers) {

                searchMembers.value = '';

                searchMembers.addEventListener("input", function () {

                    const search = this.value.toLowerCase();

                    document.querySelectorAll('.member-card').forEach(function (card) {

                        const name = card.dataset.memberName;

                        card.style.display = name.includes(search) ? '' : 'none';

                    });

                });

            }

        }


        catch (error) {

            console.error("❌ Erreur :", error);

            alert("❌ Erreur : " + error.message);

        }

    }


    // ========================================
    // METTRE À JOUR LES STATISTIQUES ET LE CERCLE
    // ========================================

    function mettreAJourStatistiques() {

        const checkboxes = document.querySelectorAll(".checkbox-presence");

        const total = checkboxes.length;

        let presents = 0;


        checkboxes.forEach(function (cb) {

            if (cb.checked) {

                presents++;

            }

        });


        const absents = total - presents;

        const taux = total > 0 ? Math.round((presents / total) * 100) : 0;


        // Mettre à jour les valeurs
        if (statPresents) statPresents.textContent = presents;

        if (statAbsents) statAbsents.textContent = absents;

        if (statTotal) statTotal.textContent = total;

        if (statTauxCircle) statTauxCircle.textContent = taux + '%';

        if (statTauxText) statTauxText.textContent = taux + '%';


        // Mettre à jour le cercle de progression
        if (progressBar && progressCircle) {

            // Circonférence du cercle (2 * PI * r = 2 * 3.14 * 85 ≈ 534)
            const circumference = 534;

            const offset = circumference - (taux / 100) * circumference;


            progressBar.style.strokeDashoffset = offset;


            // Changer la classe pour la couleur
            progressCircle.classList.remove('progress-low', 'progress-medium', 'progress-good', 'progress-excellent');


            if (taux <= 30) {

                progressCircle.classList.add('progress-low');

            }

            else if (taux <= 60) {

                progressCircle.classList.add('progress-medium');

            }

            else if (taux <= 80) {

                progressCircle.classList.add('progress-good');

            }

            else {

                progressCircle.classList.add('progress-excellent');

            }

        }

    }


    // ========================================
    // COCHER / DÉCOCHER TOUS
    // ========================================

    if (btnCocherTous) {

        btnCocherTous.addEventListener("click", function () {

            document.querySelectorAll(".checkbox-presence").forEach(function (cb) {

                if (cb.closest('.member-card').style.display !== 'none') {

                    cb.checked = true;

                    cb.dispatchEvent(new Event('change'));

                }

            });

        });

    }


    if (btnDecocherTous) {

        btnDecocherTous.addEventListener("click", function () {

            document.querySelectorAll(".checkbox-presence").forEach(function (cb) {

                cb.checked = false;

                cb.dispatchEvent(new Event('change'));

            });

        });

    }


    // ========================================
    // ENREGISTRER LES PRÉSENCES
    // ========================================

    if (btnEnregistrerPresences) {

        btnEnregistrerPresences.addEventListener("click", async function () {

            const culteId = selectCulte.value;


            if (!culteId) {

                alert("⚠️ Veuillez sélectionner un culte.");

                return;

            }


            const checkboxes = document.querySelectorAll(".checkbox-presence");

            const presences = [];


            checkboxes.forEach(function (cb) {

                presences.push({

                    membreId: parseInt(cb.dataset.membreId),

                    present: cb.checked

                });

            });


            if (presences.length === 0) {

                alert("⚠️ Aucun membre à enregistrer.");

                return;

            }


            const donnees = {

                culteId: parseInt(culteId),

                presences: presences

            };


            try {

                btnEnregistrerPresences.disabled = true;

                btnEnregistrerPresences.textContent = "⏳ Enregistrement...";


                const response = await fetch("/api/presences", {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(donnees)

                });


                const result = await response.json();


                if (!response.ok || !result.success) {

                    throw new Error(result.message);

                }


                alert(
                    "✅ Présences enregistrées avec succès !\n\n" +
                    `Présents : ${result.nombrePresents} / ${result.nombreTotal}\n` +
                    `Taux : ${Math.round((result.nombrePresents / result.nombreTotal) * 100)}%`
                );

            }


            catch (error) {

                console.error("❌ Erreur :", error);

                alert("❌ Erreur : " + error.message);

            }


            finally {

                btnEnregistrerPresences.disabled = false;

                btnEnregistrerPresences.textContent = "💾 Enregistrer les présences";

            }

        });

    }


    // ========================================
    // LANCEMENT
    // ========================================

    console.log("🚀 Lancement du chargement des cultes...");

    chargerCultes();

});