// ============================================
// FORMULAIRE ÉGLISE VASES D'HONNEUR
// Gestion des champs conditionnels
// ============================================



// ============================================
// 1. SECTEUR D'HABITATION
// ============================================

const secteur =
    document.getElementById("secteur");

const autreSecteur =
    document.getElementById("autreSecteur");


secteur.addEventListener("change", function () {

    if (this.value === "Autre") {

        autreSecteur.classList.add("active");

        autreSecteur.required = true;

    } else {

        autreSecteur.classList.remove("active");

        autreSecteur.required = false;

        autreSecteur.value = "";

    }

});



// ============================================
// 2. MOYEN DE TRANSPORT
// ============================================

const transportOptions =
    document.querySelectorAll(
        'input[name="transport"]'
    );

const autreTransport =
    document.getElementById("autreTransport");


transportOptions.forEach(function (option) {

    option.addEventListener(
        "change",
        function () {

            if (this.value === "Autre") {

                autreTransport.classList.add(
                    "active"
                );

                autreTransport.required = true;

            } else {

                autreTransport.classList.remove(
                    "active"
                );

                autreTransport.required = false;

                autreTransport.value = "";

            }

        }
    );

});



// ============================================
// 3. BAPTÊME
// ============================================

const baptiseOptions =
    document.querySelectorAll(
        'input[name="baptise"]'
    );

const dateBaptemeContainer =
    document.getElementById(
        "dateBaptemeContainer"
    );

const dateBapteme =
    document.getElementById(
        "dateBapteme"
    );


// Au chargement : cacher la date
dateBaptemeContainer.classList.remove(
    "active"
);

dateBapteme.required = false;


baptiseOptions.forEach(function (option) {

    option.addEventListener(
        "change",
        function () {

            // ================================
            // BAPTISÉ : OUI
            // ================================

            if (this.value === "Oui") {

                dateBaptemeContainer.classList.add(
                    "active"
                );

                dateBapteme.required = false;

            }


            // ================================
            // BAPTISÉ : NON
            // ================================

            else {

                dateBaptemeContainer.classList.remove(
                    "active"
                );

                dateBapteme.required = false;

                // Effacer la date
                dateBapteme.value = "";

            }

        }
    );

});



// ============================================
// 4. DÉPARTEMENT
// ============================================

const serviceOptions =
    document.querySelectorAll(
        'input[name="sertDepartement"]'
    );


const departementActuel =
    document.getElementById(
        "departementActuel"
    );


const nouveauDepartement =
    document.getElementById(
        "nouveauDepartement"
    );


const departementSouhaite =
    document.getElementById(
        "departementSouhaite"
    );


const departementService =
    document.getElementById(
        "departementService"
    );


const departementSouhaiteSelect =
    document.getElementById(
        "departementSouhaiteSelect"
    );


const veutDepartementOptions =
    document.querySelectorAll(
        'input[name="veutDepartement"]'
    );



// ============================================
// ÉTAT INITIAL
// ============================================

// Cacher le département actuel
departementActuel.classList.remove(
    "active"
);


// Cacher la question d'intégration
nouveauDepartement.classList.remove(
    "active"
);


// Cacher le département souhaité
departementSouhaite.classList.remove(
    "active"
);



// ============================================
// QUESTION : SERvez-VOUS DANS UN DÉPARTEMENT ?
// ============================================

serviceOptions.forEach(function (option) {

    option.addEventListener(
        "change",
        function () {


            // =================================
            // OUI
            // =================================

            if (this.value === "Oui") {

                // Afficher le département actuel
                departementActuel.classList.add(
                    "active"
                );

                // Cacher la question d'intégration
                nouveauDepartement.classList.remove(
                    "active"
                );

                // Cacher le département souhaité
                departementSouhaite.classList.remove(
                    "active"
                );


                // Effacer le choix souhaité
                departementSouhaiteSelect.value = "";


                // Effacer Oui / Non intégration
                veutDepartementOptions.forEach(
                    function (input) {

                        input.checked = false;

                    }
                );

            }



            // =================================
            // NON
            // =================================

            else {

                // Cacher le département actuel
                departementActuel.classList.remove(
                    "active"
                );


                // Effacer le département actuel
                departementService.value = "";


                // Afficher la question d'intégration
                nouveauDepartement.classList.add(
                    "active"
                );

            }

        }
    );

});



// ============================================
// QUESTION : VOULEZ-VOUS INTÉGRER UN DÉPARTEMENT ?
// ============================================

veutDepartementOptions.forEach(
    function (option) {

        option.addEventListener(
            "change",
            function () {


                // =============================
                // OUI
                // =============================

                if (this.value === "Oui") {

                    // Afficher les départements
                    departementSouhaite.classList.add(
                        "active"
                    );

                }


                // =============================
                // NON
                // =============================

                else {

                    // Cacher les départements
                    departementSouhaite.classList.remove(
                        "active"
                    );


                    // Aucun département
                    departementSouhaiteSelect.value = "";

                }

            }
        );

    }
);



// ============================================
// 5. DATE DU CONSENTEMENT
// ============================================

const dateConsentement =
    document.getElementById(
        "dateConsentement"
    );


const aujourdHui =
    new Date();


const annee =
    aujourdHui.getFullYear();


const mois =
    String(
        aujourdHui.getMonth() + 1
    ).padStart(2, "0");


const jour =
    String(
        aujourdHui.getDate()
    ).padStart(2, "0");


dateConsentement.value =
    `${annee}-${mois}-${jour}`;



// ============================================
// 6. ENVOI DU FORMULAIRE
// ============================================

const form =
    document.getElementById("registrationForm");


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // ========================================
    // RÉCUPÉRATION DES DONNÉES
    // ========================================

    const formData = new FormData(form);

    const data = {};


    formData.forEach((value, key) => {

        if (data[key]) {

            if (!Array.isArray(data[key])) {

                data[key] = [data[key]];

            }

            data[key].push(value);

        }

        else {

            data[key] = value;

        }

    });


    // ========================================
    // ENVOI AU SERVEUR
    // ========================================

    try {

        const response = await fetch(
            "/api/membres",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(data)

            }
        );


        const result =
            await response.json();


        // ====================================
        // SUCCÈS
        // ====================================

        if (result.success) {

            alert(

                "Merci pour votre soumission !\n\n" +

                "Votre inscription a bien été enregistrée.\n\n" +

                "Un responsable de l'accueil ou de " +

                "l'administration vous contactera " +

                "sous peu.\n\n" +

                "Que Dieu vous bénisse abondamment !"

            );


            // Réinitialiser le formulaire

            form.reset();


            // Restaurer la date du consentement

            const aujourdHui =
                new Date();

            const annee =
                aujourdHui.getFullYear();

            const mois =
                String(
                    aujourdHui.getMonth() + 1
                ).padStart(2, "0");

            const jour =
                String(
                    aujourdHui.getDate()
                ).padStart(2, "0");


            dateConsentement.value =
                `${annee}-${mois}-${jour}`;


            // Cacher les champs conditionnels

            autreSecteur.classList.remove("active");

            autreTransport.classList.remove("active");

            dateBaptemeContainer.classList.remove("active");

            departementActuel.classList.remove("active");

            nouveauDepartement.classList.remove("active");

        }

        else {

            alert(

                "Une erreur est survenue.\n\n" +

                result.message

            );

        }

    }

    catch (error) {

        console.error(
            "Erreur :",
            error
        );


        alert(

            "Impossible de communiquer avec le serveur.\n\n" +

            "Vérifiez que le serveur est bien démarré."

        );

    }

});