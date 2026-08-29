// ============================================
// CONNEXION UTILISATEUR
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================


// ============================================
// ÉLÉMENTS HTML
// ============================================

const loginForm =
    document.getElementById("loginForm");


const courriel =
    document.getElementById("courriel");


const motDePasse =
    document.getElementById("motDePasse");


const messageConnexion =
    document.getElementById(
        "messageConnexion"
    );



// ============================================
// AFFICHER UN MESSAGE
// ============================================

function afficherMessage(
    message,
    succes = false
) {

    messageConnexion.textContent =
        message;


    messageConnexion.style.display =
        "block";


    if (succes) {

        messageConnexion.style.color =
            "green";

    }

    else {

        messageConnexion.style.color =
            "red";

    }

}



// ============================================
// CONNEXION
// ============================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            courriel.value
                .trim()
                .toLowerCase();


        const password =
            motDePasse.value;


        // ========================================
        // VÉRIFICATION
        // ========================================

        if (!email || !password) {

            afficherMessage(
                "Veuillez remplir tous les champs."
            );

            return;

        }


        try {

            // ====================================
            // ENVOYER AU SERVEUR
            // ====================================

            const response =
                await fetch(
                    "/api/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            courriel:
                                email,

                            motDePasse:
                                password

                        })

                    }
                );


            const result =
                await response.json();


            // ====================================
            // ÉCHEC
            // ====================================

            if (!result.success) {

                afficherMessage(
                    result.message ||
                    "Connexion impossible."
                );

                return;

            }


            // ====================================
            // SUCCÈS
            // ====================================

            afficherMessage(
                "Connexion réussie.",
                true
            );


            console.log(
                "Utilisateur connecté :",
                result.utilisateur
            );


            // ====================================
            // REDIRECTION
            // ====================================

            setTimeout(
                function () {

                    window.location.href =
                        "/membres.html";

                },
                500
            );

        }


        catch (error) {

            console.error(
                "Erreur de connexion :",
                error
            );


            afficherMessage(
                "Impossible de contacter le serveur."
            );

        }

    }
);