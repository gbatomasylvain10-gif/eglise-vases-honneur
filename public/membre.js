// ============================================
// FICHE MEMBRE
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================


// ============================================
// RÉCUPÉRER L'ID DANS L'URL
// ============================================

const params =
    new URLSearchParams(
        window.location.search
    );


const id =
    params.get("id");


// ============================================
// ÉLÉMENTS DE LA PAGE
// ============================================

const modifierMembre =
    document.getElementById(
        "modifierMembre"
    );

// ============================================
// VÉRIFIER L'ID
// ============================================

if (!id) {

    console.error(
        "Aucun ID de membre dans l'URL."
    );

}

// ============================================
// CONFIGURER LE BOUTON MODIFIER
// ============================================

if (
    modifierMembre &&
    id
) {

    modifierMembre.href =
        `/modifier.html?id=${encodeURIComponent(id)}`;

}

// ============================================
// SUPPRIMER LE MEMBRE
// ============================================

const supprimerMembre =
    document.getElementById("supprimerMembre");


if (supprimerMembre && id) {

    supprimerMembre.addEventListener(
        "click",
        async function () {

            const confirmation =
                confirm(
                    "⚠️ Voulez-vous vraiment supprimer ce membre ?\n\n" +
                    "Cette action est définitive."
                );


            if (!confirmation) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `/api/membres/${id}`,
                        {
                            method: "DELETE"
                        }
                    );


                const result =
                    await response.json();


                if (!result.success) {

                    throw new Error(
                        result.message
                    );

                }


                alert(
                    "✅ Le membre a été supprimé avec succès."
                );


                window.location.href =
                    "/membres.html";

            }


            catch (error) {

                console.error(
                    "Erreur lors de la suppression :",
                    error
                );


                alert(
                    "❌ Impossible de supprimer le membre."
                );

            }

        }
    );

}

// ============================================
// CHARGER LE MEMBRE
// ============================================

async function chargerMembre() {

    try {

        if (!id) {

            throw new Error(
                "Aucun ID de membre."
            );

        }


        console.log(
            "Chargement du membre ID :",
            id
        );


        const response =
            await fetch(
                `/api/membres/${encodeURIComponent(id)}`
            );


        console.log(
            "Statut API :",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Erreur HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Réponse API :",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Impossible de récupérer le membre."
            );

        }


        const membre =
            result.membre;


        console.log(
            "Membre récupéré :",
            membre
        );


        // ====================================
        // IDENTITÉ
        // ====================================

        document.getElementById(
            "nomMembre"
        ).textContent =
            membre.nom_complet || "—";


        document.getElementById(
            "idMembre"
        ).textContent =
            `ID : ${membre.id}`;


        document.getElementById(
            "nomComplet"
        ).textContent =
            membre.nom_complet || "—";


        document.getElementById(
            "dateNaissance"
        ).textContent =
            membre.date_naissance || "—";


        document.getElementById(
            "sexe"
        ).textContent =
            membre.sexe || "—";


        document.getElementById(
            "statutMatrimonial"
        ).textContent =
            membre.statut_matrimonial || "—";


        // ====================================
        // COORDONNÉES
        // ====================================

        document.getElementById(
            "adresse"
        ).textContent =
            membre.adresse || "—";


        document.getElementById(
            "secteur"
        ).textContent =
            membre.secteur || "—";


        document.getElementById(
            "transport"
        ).textContent =
            membre.transport || "—";


        document.getElementById(
            "telephone"
        ).textContent =
            membre.telephone || "—";


        document.getElementById(
            "courriel"
        ).textContent =
            membre.courriel || "—";


        // ====================================
        // PARCOURS SPIRITUEL
        // ====================================

        document.getElementById(
            "dateConversion"
        ).textContent =
            membre.date_conversion || "—";


        document.getElementById(
            "baptise"
        ).textContent =
            membre.baptise || "—";


        document.getElementById(
            "dateBapteme"
        ).textContent =
            membre.date_bapteme || "—";


        document.getElementById(
            "egliseOrigine"
        ).textContent =
            membre.eglise_origine || "—";


        document.getElementById(
            "dateArrivee"
        ).textContent =
            membre.date_arrivee || "—";


        document.getElementById(
            "fonction"
        ).textContent =
            membre.fonction || "—";


        // ====================================
        // DONS
        // ====================================

        document.getElementById(
            "dons"
        ).textContent =
            formaterListe(
                membre.dons
            );


        // ====================================
        // DISPONIBILITÉS
        // ====================================

        document.getElementById(
            "disponibilites"
        ).textContent =
            formaterListe(
                membre.disponibilites
            );


        // ====================================
        // DÉPARTEMENT
        // ====================================

        document.getElementById(
            "sertDepartement"
        ).textContent =
            membre.sert_departement || "—";


        document.getElementById(
            "departement"
        ).textContent =
            membre.departement || "—";


        document.getElementById(
            "veutDepartement"
        ).textContent =
            membre.veut_departement || "—";


        // ====================================
        // CONTACT D'URGENCE
        // ====================================

        document.getElementById(
            "contactUrgence"
        ).textContent =
            membre.contact_urgence || "—";


        document.getElementById(
            "lienParente"
        ).textContent =
            membre.lien_parente || "—";


        document.getElementById(
            "telephoneUrgence"
        ).textContent =
            membre.telephone_urgence || "—";


        // ====================================
        // CONSENTEMENT
        // ====================================

        document.getElementById(
            "consentement"
        ).textContent =
            Number(membre.consentement) === 1
                ? "Oui"
                : "Non";


        document.getElementById(
            "dateConsentement"
        ).textContent =
            membre.date_consentement || "—";


        document.getElementById(
            "dateInscription"
        ).textContent =
            membre.date_inscription || "—";

    }


    catch (error) {

        console.error(
            "Erreur lors du chargement du membre :",
            error
        );


        document.getElementById(
            "nomMembre"
        ).textContent =
            "Membre introuvable";


        document.getElementById(
            "idMembre"
        ).textContent =
            "Impossible de charger cette fiche.";

    }

}


// ============================================
// TRANSFORMER LES LISTES JSON
// ============================================

function formaterListe(valeur) {

    if (!valeur) {

        return "—";

    }


    try {

        const liste =
            JSON.parse(valeur);


        if (
            Array.isArray(liste)
        ) {

            return liste.length > 0
                ? liste.join(", ")
                : "—";

        }

    }

    catch (error) {

        return valeur;

    }


    return valeur;

}


// ============================================
// LANCEMENT
// ============================================

chargerMembre();