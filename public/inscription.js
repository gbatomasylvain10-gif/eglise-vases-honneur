// ============================================
// INSCRIPTION EN LIGNE
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================


// ============================================
// FORMULAIRE
// ============================================

const inscriptionForm =
    document.getElementById("inscriptionForm");


// ============================================
// DATE DU CONSENTEMENT (auto = aujourd'hui)
// ============================================

const dateConsentement =
    document.getElementById("dateConsentement");


if (dateConsentement) {

    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();

    const mois = String(aujourdHui.getMonth() + 1).padStart(2, "0");

    const jour = String(aujourdHui.getDate()).padStart(2, "0");

    dateConsentement.value = `${annee}-${mois}-${jour}`;

}


// ============================================
// FILTRAGE DES TÉLÉPHONES (10 chiffres max)
// ============================================

function filtrerTelephone(champ) {

    if (!champ) return;

    champ.addEventListener("input", function (e) {

        // Supprimer tout ce qui n'est pas un chiffre
        e.target.value = e.target.value.replace(/\D/g, "");

        // Limiter à 10 chiffres
        if (e.target.value.length > 10) {

            e.target.value = e.target.value.slice(0, 10);

        }

    });

}


// Appliquer aux deux champs téléphone
filtrerTelephone(document.getElementById("telephone"));
filtrerTelephone(document.getElementById("telephoneUrgence"));


// ============================================
// VALIDATION PÉRIODE D'ARRIVÉE
// ============================================

const dateArrivee = document.getElementById("dateArrivee");

if (dateArrivee) {

    dateArrivee.addEventListener("input", function (e) {

        // Limiter à 20 caractères
        if (e.target.value.length > 20) {

            e.target.value = e.target.value.slice(0, 20);

        }

    });

}


function validerPeriodeArrivee(valeur) {

    if (!valeur) return true;


    // Chercher une année à 4 chiffres
    const matchAnnee = valeur.match(/\b(19|20)\d{2}\b/);


    if (!matchAnnee) {

        return false;

    }


    return true;

}


// ============================================
// CHAMPS CONDITIONNELS
// ============================================

function gererChampsConditionnels() {


    // ========================================
    // AUTRE SECTEUR
    // ========================================

    const secteur =
        document.getElementById("secteur");


    const autreSecteur =
        document.getElementById("autreSecteur");


    if (secteur && autreSecteur) {

        if (secteur.value === "Autre") {

            autreSecteur.style.display = "block";

        }

        else {

            autreSecteur.style.display = "none";

        }

    }


    // ========================================
    // AUTRE TRANSPORT
    // ========================================

    const transportCoche =
        document.querySelector('input[name="transport"]:checked');


    const autreTransport =
        document.getElementById("autreTransport");


    if (autreTransport) {

        if (transportCoche && transportCoche.value === "Autre") {

            autreTransport.style.display = "block";

        }

        else {

            autreTransport.style.display = "none";

        }

    }


    // ========================================
    // DÉPARTEMENT ACTUEL
    // ========================================

    const sertDepartementCoche =
        document.querySelector('input[name="sertDepartement"]:checked');


    const departementService =
        document.querySelector(".conditional-departement");


    if (departementService) {

        if (sertDepartementCoche && sertDepartementCoche.value === "Oui") {

            departementService.style.display = "block";

        }

        else {

            departementService.style.display = "none";

        }

    }


    // ========================================
    // SECTION INTÉGRATION DÉPARTEMENT
    // ========================================
    // Si la personne sert DÉJÀ dans un département,
    // on masque la question "Voulez-vous intégrer un département ?"
    // car c'est redondant.

    const sectionIntegration =
        document.querySelector(".section-integration-departement");


    const veutDepartementRadios =
        document.querySelectorAll('input[name="veutDepartement"]');


    if (sectionIntegration) {

        // Si la personne sert déjà dans un département
        if (sertDepartementCoche && sertDepartementCoche.value === "Oui") {

            // Masquer toute la section "Voulez-vous intégrer un département ?"
            sectionIntegration.style.display = "none";


            // Décocher les radios "veutDepartement" pour éviter les conflits
            veutDepartementRadios.forEach(function (radio) {

                radio.checked = false;

            });


            // Masquer aussi le champ de sélection du département souhaité
            const departementSouhaite =
                document.querySelector(".conditional-departement-souhaite");


            if (departementSouhaite) {

                departementSouhaite.style.display = "none";

            }

        }


        // Si la personne ne sert PAS dans un département
        else {

            // Afficher la section "Voulez-vous intégrer un département ?"
            sectionIntegration.style.display = "block";


            // Gérer l'affichage du champ de sélection selon la réponse
            const veutDepartementCoche =
                document.querySelector('input[name="veutDepartement"]:checked');


            const departementSouhaite =
                document.querySelector(".conditional-departement-souhaite");


            if (departementSouhaite) {

                if (veutDepartementCoche && veutDepartementCoche.value === "Oui") {

                    departementSouhaite.style.display = "block";

                }

                else {

                    departementSouhaite.style.display = "none";

                }

            }

        }

    }

}
// ============================================
// GESTION DU CHAMP DATE DU BAPTÊME
// ============================================

function gererChampBapteme() {

    const baptiseRadios = document.querySelectorAll('input[name="baptise"]');

    const dateBaptemeField = document.querySelector(".conditional-bapteme");

    const dateBaptemeInput = document.getElementById("dateBapteme");


    if (!dateBaptemeField || !dateBaptemeInput) return;


    // Vérifier initialement
    const baptiseCoche = document.querySelector('input[name="baptise"]:checked');


    if (baptiseCoche && baptiseCoche.value === "Oui") {

        dateBaptemeField.style.display = "block";

        dateBaptemeInput.required = true;

    }

    else {

        dateBaptemeField.style.display = "none";

        dateBaptemeInput.required = false;

        dateBaptemeInput.value = "";

    }


    // Écouter les changements
    baptiseRadios.forEach(function (radio) {

        radio.addEventListener("change", function (e) {

            if (e.target.value === "Oui") {

                dateBaptemeField.style.display = "block";

                dateBaptemeInput.required = true;

            }

            else {

                dateBaptemeField.style.display = "none";

                dateBaptemeInput.required = false;

                dateBaptemeInput.value = "";

            }

        });

    });

}


// ============================================
// ÉCOUTEURS POUR CHAMPS CONDITIONNELS
// ============================================

// Secteur
const secteur = document.getElementById("secteur");

if (secteur) {

    secteur.addEventListener("change", gererChampsConditionnels);

}


// Transport
const transports = document.querySelectorAll('input[name="transport"]');

transports.forEach(function (radio) {

    radio.addEventListener("change", gererChampsConditionnels);

});


// Sert dans un département
const sertDepartement = document.querySelectorAll('input[name="sertDepartement"]');

sertDepartement.forEach(function (radio) {

    radio.addEventListener("change", gererChampsConditionnels);

});


// Veut intégrer un département
const veutDepartement = document.querySelectorAll('input[name="veutDepartement"]');

veutDepartement.forEach(function (radio) {

    radio.addEventListener("change", gererChampsConditionnels);

});


// ============================================
// RÉCUPÉRER LES DONNÉES DU FORMULAIRE
// ============================================

function recupererDonnees() {


    const formData = new FormData(inscriptionForm);


    // Récupérer les dons cochés
    const dons = [];

    document.querySelectorAll('input[name="dons"]:checked').forEach(function (checkbox) {

        dons.push(checkbox.value);

    });


    // Récupérer les disponibilités cochées
    const disponibilites = [];

    document.querySelectorAll('input[name="disponibilites"]:checked').forEach(function (checkbox) {

        disponibilites.push(checkbox.value);

    });


    return {

        // IDENTITÉ
        nomComplet: formData.get("nomComplet"),
        dateNaissance: formData.get("dateNaissance"),
        sexe: formData.get("sexe"),
        statutMatrimonial: formData.get("statutMatrimonial"),


        // COORDONNÉES
        adresse: formData.get("adresse"),
        secteur: formData.get("secteur"),
        autreSecteur: formData.get("autreSecteur") || "",
        transport: formData.get("transport"),
        autreTransport: formData.get("autreTransport") || "",
        telephone: formData.get("telephone"),
        courriel: formData.get("courriel"),


        // PARCOURS SPIRITUEL
        dateConversion: formData.get("dateConversion") || "",
        baptise: formData.get("baptise"),
        dateBapteme: formData.get("dateBapteme") || "",
        egliseOrigine: formData.get("egliseOrigine") || "",
        dateArrivee: formData.get("dateArrivee"),
        fonction: formData.get("fonction"),


        // DONS / DISPONIBILITÉS
        dons: dons,
        disponibilites: disponibilites,


        // DÉPARTEMENT
        sertDepartement: formData.get("sertDepartement"),
        departementService: formData.get("departementService") || "",
        veutDepartement: formData.get("veutDepartement") || "",
        departementSouhaite: formData.get("departementSouhaite") || "",


        // CONTACT D'URGENCE
        contactUrgence: formData.get("contactUrgence"),
        lienParente: formData.get("lienParente"),
        telephoneUrgence: formData.get("telephoneUrgence"),


        // CONSENTEMENT
        consentement: document.getElementById("consentement").checked,
        dateConsentement: formData.get("dateConsentement")

    };

}


// ============================================
// VALIDATION AVANT ENVOI
// ============================================

function validerFormulaire(donnees) {


    // Téléphone mobile : exactement 10 chiffres
    if (!/^[0-9]{10}$/.test(donnees.telephone)) {

        return "Le téléphone mobile doit contenir exactement 10 chiffres.";

    }


    // Téléphone urgence : exactement 10 chiffres
    if (!/^[0-9]{10}$/.test(donnees.telephoneUrgence)) {

        return "Le téléphone du contact d'urgence doit contenir exactement 10 chiffres.";

    }


    // Date de naissance : vérification de base
    if (!donnees.dateNaissance) {

        return "La date de naissance est obligatoire.";

    }


    // Date de conversion (si fournie)
    if (donnees.dateConversion && !donnees.dateConversion.match(/^\d{4}-\d{2}-\d{2}$/)) {

        return "Le format de la date de conversion est invalide.";

    }


    // Si baptisé = Oui, la date du baptême est obligatoire
    if (donnees.baptise === "Oui" && !donnees.dateBapteme) {

        return "Veuillez indiquer la date du baptême d'eau.";

    }


    // Période d'arrivée : doit contenir une année à 4 chiffres
    if (!validerPeriodeArrivee(donnees.dateArrivee)) {

        return "La période d'arrivée doit contenir une année valide (4 chiffres). Exemple : 'janvier 2024'.";

    }


    return null;

}


// ============================================
// ENVOI DU FORMULAIRE
// ============================================

inscriptionForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // ========================================
    // RÉCUPÉRER LES DONNÉES
    // ========================================

    const donnees = recupererDonnees();


    console.log("Données à envoyer :", donnees);


    // ========================================
    // VALIDATION
    // ========================================

    const erreurValidation = validerFormulaire(donnees);


    if (erreurValidation) {

        alert("⚠️ " + erreurValidation);

        return;

    }


    // ========================================
    // BOUTON
    // ========================================

    const bouton = inscriptionForm.querySelector('button[type="submit"]');

    const texteOriginal = bouton.textContent;


    bouton.disabled = true;

    bouton.textContent = "⏳ Envoi en cours...";


    try {

        // ========================================
        // ENVOYER AU SERVEUR
        // ========================================

        const response = await fetch("/api/membres", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(donnees)

        });


        const result = await response.json();


        console.log("Réponse serveur :", result);


        // ========================================
        // ERREUR
        // ========================================

        if (!response.ok || !result.success) {

            throw new Error(result.message || "Impossible d'enregistrer l'inscription.");

        }


        // ========================================
        // SUCCÈS
        // ========================================

        alert("✅ Votre inscription a été enregistrée avec succès !\n\nBienvenue à l'Église Vases d'Honneur de Jonquière.");


        // ========================================
        // RÉINITIALISER LE FORMULAIRE
        // ========================================

        inscriptionForm.reset();


        // Remettre la date du consentement à aujourd'hui
        const maintenant = new Date();

        const annee = maintenant.getFullYear();

        const mois = String(maintenant.getMonth() + 1).padStart(2, "0");

        const jour = String(maintenant.getDate()).padStart(2, "0");

        dateConsentement.value = `${annee}-${mois}-${jour}`;


        // Masquer à nouveau le champ baptême
        gererChampBapteme();


        // Remettre les champs conditionnels à leur état initial
        gererChampsConditionnels();


        // ========================================
        // RETOUR AU TABLEAU DE BORD
        // ========================================

        window.location.href = "/admin.html";

    }


    catch (error) {

        console.error("Erreur lors de l'inscription :", error);


        alert("❌ Une erreur est survenue :\n\n" + error.message);


        bouton.disabled = false;

        bouton.textContent = texteOriginal;

    }

});


// ============================================
// BARRE DE PROGRESSION
// ============================================

function updateProgressBar() {

    const sections = document.querySelectorAll('.form-section');
    const steps = document.querySelectorAll('.progress-step');


    sections.forEach(function (section, index) {

        const step = steps[index];

        if (!step) return;


        // Vérifier si la section a des champs requis remplis
        const requiredFields = section.querySelectorAll('[required]');

        let allFilled = true;


        requiredFields.forEach(function (field) {

            if (field.type === 'radio') {

                const radioGroup = section.querySelectorAll(`input[name="${field.name}"]`);

                const isChecked = Array.from(radioGroup).some(function (r) {

                    return r.checked;

                });


                if (!isChecked) {

                    allFilled = false;

                }

            }


            else if (field.type === 'checkbox') {

                if (!field.checked) {

                    allFilled = false;

                }

            }


            else {

                if (!field.value || field.value.trim() === '') {

                    allFilled = false;

                }

            }

        });


        // Mettre à jour le statut de l'étape
        if (allFilled && requiredFields.length > 0) {

            step.classList.add('completed');

            step.classList.remove('active');

        }


        else if (index === 0 || (steps[index - 1] && steps[index - 1].classList.contains('completed'))) {

            step.classList.add('active');

            step.classList.remove('completed');

        }

    });

}


// Écouter les changements dans le formulaire
inscriptionForm.addEventListener('input', updateProgressBar);
inscriptionForm.addEventListener('change', updateProgressBar);


// ============================================
// LANCEMENT
// ============================================

gererChampsConditionnels();
gererChampBapteme();
updateProgressBar();