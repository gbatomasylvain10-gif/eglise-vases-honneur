// ============================================
// CONNEXION
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================


const connexionForm =
    document.getElementById(
        "connexionForm"
    );


const messageConnexion =
    document.getElementById(
        "messageConnexion"
    );


// ============================================
// SOUMISSION
// ============================================

connexionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const courriel =
            document.getElementById(
                "courriel"
            ).value.trim();


        const motDePasse =
            document.getElementById(
                "motDePasse"
            ).value;


        // ====================================
        // MESSAGE
        // ====================================

        messageConnexion.style.display =
            "block";

        messageConnexion.textContent =
            "Connexion en cours...";


        try {

            const response =
                await fetch(
                    "/api/connexion",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            courriel:
                                courriel,

                            motDePasse:
                                motDePasse

                        })

                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.message
                );

            }


            // =================================
            // CONNEXION RÉUSSIE
            // =================================

            window.location.href =
                "/admin.html";


        }

        catch (error) {

            console.error(
                "Erreur de connexion :",
                error
            );


            messageConnexion.textContent =
                error.message ||
                "Impossible de se connecter.";

        }

    }
);