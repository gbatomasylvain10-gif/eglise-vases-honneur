// ============================================
// MODIFICATION D'UN MEMBRE
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================


// ============================================
// RÉCUPÉRER L'ID DU MEMBRE
// ============================================

const params =
    new URLSearchParams(
        window.location.search
    );


const id =
    params.get("id");


// ============================================
// FORMULAIRE
// ============================================

const modifierForm =
    document.getElementById(
        "modifierForm"
    );


// ============================================
// BOUTON ANNULER
// ============================================

const retourMembre =
    document.getElementById(
        "retourMembre"
    );


if (retourMembre && id) {

    retourMembre.href =
        `/membre.html?id=${encodeURIComponent(id)}`;

}


// ============================================
// VÉRIFICATION DE L'ID
// ============================================

if (!id) {

    alert(
        "Aucun membre sélectionné."
    );

    window.location.href =
        "/membres.html";

}


// ============================================
// CHARGER LE MEMBRE
// ============================================

async function chargerMembre() {

    try {

        console.log(
            "Chargement du membre ID :",
            id
        );


        const response =
            await fetch(
                `/api/membres/${encodeURIComponent(id)}`
            );


        if (!response.ok) {

            throw new Error(
                `Erreur HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Impossible de récupérer le membre."
            );

        }


        const membre =
            result.membre;


        console.log(
            "Membre chargé :",
            membre
        );


        remplirFormulaire(membre);

    }


    catch (error) {

        console.error(
            "Erreur lors du chargement :",
            error
        );


        alert(
            "Impossible de charger les informations du membre."
        );


        window.location.href =
            "/membres.html";

    }

}


// ============================================
// REMPLIR LE FORMULAIRE
// ============================================

function remplirFormulaire(membre) {


    // ========================================
    // IDENTITÉ
    // ========================================

    setValue(
        "nomComplet",
        membre.nom_complet
    );


    setValue(
        "dateNaissance",
        membre.date_naissance
    );


    setRadio(
        "sexe",
        membre.sexe
    );


    setValue(
        "statutMatrimonial",
        membre.statut_matrimonial
    );


    // ========================================
    // COORDONNÉES
    // ========================================

    setValue(
        "adresse",
        membre.adresse
    );


    setValue(
        "secteur",
        membre.secteur
    );


    setValue(
        "autreSecteur",
        membre.autre_secteur
    );


    setRadio(
        "transport",
        membre.transport
    );


    setValue(
        "autreTransport",
        membre.autre_transport
    );


    setValue(
        "telephone",
        membre.telephone
    );


    setValue(
        "courriel",
        membre.courriel
    );


    // ========================================
    // PARCOURS SPIRITUEL
    // ========================================

    setValue(
        "dateConversion",
        membre.date_conversion
    );


    setRadio(
        "baptise",
        membre.baptise
    );


    setValue(
        "dateBapteme",
        membre.date_bapteme
    );


    setValue(
        "egliseOrigine",
        membre.eglise_origine
    );


    setValue(
        "dateArrivee",
        membre.date_arrivee
    );


    setValue(
        "fonction",
        membre.fonction
    );


    // ========================================
    // DONS
    // ========================================

    cocherListe(
        "dons",
        membre.dons
    );


    // ========================================
    // DISPONIBILITÉS
    // ========================================

    cocherListe(
        "disponibilites",
        membre.disponibilites
    );


    // ========================================
    // DÉPARTEMENT
    // ========================================

    setRadio(
        "sertDepartement",
        membre.sert_departement
    );


    setValue(
        "departementService",
        membre.departement
    );


    setRadio(
        "veutDepartement",
        membre.veut_departement
    );


    setValue(
        "departementSouhaite",
        membre.departement
    );


    // ========================================
    // CONTACT D'URGENCE
    // ========================================

    setValue(
        "contactUrgence",
        membre.contact_urgence
    );


    setValue(
        "lienParente",
        membre.lien_parente
    );


    setValue(
        "telephoneUrgence",
        membre.telephone_urgence
    );


    // ========================================
    // CONSENTEMENT
    // ========================================

    const consentement =
        document.getElementById(
            "consentement"
        );


    if (consentement) {

        consentement.checked =
            Number(membre.consentement) === 1;

    }


    setValue(
        "dateConsentement",
        membre.date_consentement
    );


    // ========================================
    // AFFICHER / MASQUER LES CHAMPS AUTRE
    // ========================================

    gererChampsConditionnels();

}


// ============================================
// REMPLIR UN CHAMP
// ============================================

function setValue(
    idChamp,
    valeur
) {

    const champ =
        document.getElementById(
            idChamp
        );


    if (!champ) {

        return;

    }


    champ.value =
        valeur || "";

}


// ============================================
// SÉLECTIONNER UN RADIO
// ============================================

function setRadio(
    nom,
    valeur
) {

    if (!valeur) {

        return;

    }


    const radios =
        document.querySelectorAll(
            `input[name="${nom}"]`
        );


    radios.forEach(
        function (radio) {

            radio.checked =
                radio.value === valeur;

        }
    );

}


// ============================================
// COCHER UNE LISTE DE CHECKBOX
// ============================================

function cocherListe(
    nom,
    valeur
) {

    let liste = [];


    if (!valeur) {

        liste = [];

    }


    else {

        try {

            const resultat =
                JSON.parse(valeur);


            if (
                Array.isArray(resultat)
            ) {

                liste =
                    resultat;

            }

            else {

                liste =
                    [valeur];

            }

        }


        catch (error) {

            liste =
                [valeur];

        }

    }


    const cases =
        document.querySelectorAll(
            `input[name="${nom}"]`
        );


    cases.forEach(
        function (checkbox) {

            checkbox.checked =
                liste.includes(
                    checkbox.value
                );

        }
    );

}


// ============================================
// CHAMPS CONDITIONNELS
// ============================================

function gererChampsConditionnels() {


    // ========================================
    // AUTRE SECTEUR
    // ========================================

    const secteur =
        document.getElementById(
            "secteur"
        );


    const autreSecteur =
        document.getElementById(
            "autreSecteur"
        );


    if (
        secteur &&
        autreSecteur
    ) {

        if (
            secteur.value === "Autre"
        ) {

            autreSecteur.style.display =
                "block";

        }

        else {

            autreSecteur.style.display =
                "none";

        }

    }


    // ========================================
    // AUTRE TRANSPORT
    // ========================================

    const transport =
        document.querySelector(
            'input[name="transport"]:checked'
        );


    const autreTransport =
        document.getElementById(
            "autreTransport"
        );


    if (
        autreTransport
    ) {

        if (
            transport &&
            transport.value === "Autre"
        ) {

            autreTransport.style.display =
                "block";

        }

        else {

            autreTransport.style.display =
                "none";

        }

    }

}


// ============================================
// ÉCOUTER LE SECTEUR
// ============================================

const secteur =
    document.getElementById(
        "secteur"
    );


if (secteur) {

    secteur.addEventListener(
        "change",
        gererChampsConditionnels
    );

}


// ============================================
// ÉCOUTER LE TRANSPORT
// ============================================

const transports =
    document.querySelectorAll(
        'input[name="transport"]'
    );


transports.forEach(
    function (radio) {

        radio.addEventListener(
            "change",
            gererChampsConditionnels
        );

    }
);


// ============================================
// PRÉPARER LES DONNÉES DU FORMULAIRE
// ============================================

function recupererDonnees() {


    const formData =
        new FormData(
            modifierForm
        );


    const dons = [];


    document
        .querySelectorAll(
            'input[name="dons"]:checked'
        )
        .forEach(
            function (checkbox) {

                dons.push(
                    checkbox.value
                );

            }
        );


    const disponibilites = [];


    document
        .querySelectorAll(
            'input[name="disponibilites"]:checked'
        )
        .forEach(
            function (checkbox) {

                disponibilites.push(
                    checkbox.value
                );

            }
        );


    return {

        // ====================================
        // IDENTITÉ
        // ====================================

        nomComplet:
            formData.get(
                "nomComplet"
            ),

        dateNaissance:
            formData.get(
                "dateNaissance"
            ),

        sexe:
            formData.get(
                "sexe"
            ),

        statutMatrimonial:
            formData.get(
                "statutMatrimonial"
            ),


        // ====================================
        // COORDONNÉES
        // ====================================

        adresse:
            formData.get(
                "adresse"
            ),

        secteur:
            formData.get(
                "secteur"
            ),

        autreSecteur:
            formData.get(
                "autreSecteur"
            ),

        transport:
            formData.get(
                "transport"
            ),

        autreTransport:
            formData.get(
                "autreTransport"
            ),

        telephone:
            formData.get(
                "telephone"
            ),

        courriel:
            formData.get(
                "courriel"
            ),


        // ====================================
        // PARCOURS SPIRITUEL
        // ====================================

        dateConversion:
            formData.get(
                "dateConversion"
            ),

        baptise:
            formData.get(
                "baptise"
            ),

        dateBapteme:
            formData.get(
                "dateBapteme"
            ),

        egliseOrigine:
            formData.get(
                "egliseOrigine"
            ),

        dateArrivee:
            formData.get(
                "dateArrivee"
            ),

        fonction:
            formData.get(
                "fonction"
            ),


        // ====================================
        // DONS
        // ====================================

        dons:
            dons,


        // ====================================
        // DISPONIBILITÉS
        // ====================================

        disponibilites:
            disponibilites,


        // ====================================
        // DÉPARTEMENT
        // ====================================

        sertDepartement:
            formData.get(
                "sertDepartement"
            ),

        departementService:
            formData.get(
                "departementService"
            ),

        veutDepartement:
            formData.get(
                "veutDepartement"
            ),

        departementSouhaite:
            formData.get(
                "departementSouhaite"
            ),


        // ====================================
        // CONTACT D'URGENCE
        // ====================================

        contactUrgence:
            formData.get(
                "contactUrgence"
            ),

        lienParente:
            formData.get(
                "lienParente"
            ),

        telephoneUrgence:
            formData.get(
                "telephoneUrgence"
            ),


        // ====================================
        // CONSENTEMENT
        // ====================================

        consentement:
            document.getElementById(
                "consentement"
            ).checked,

        dateConsentement:
            formData.get(
                "dateConsentement"
            )

    };

}


// ============================================
// ENREGISTRER LES MODIFICATIONS
// ============================================

modifierForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ====================================
        // VÉRIFIER L'ID
        // ====================================

        if (!id) {

            alert(
                "ID du membre introuvable."
            );

            return;

        }


        // ====================================
        // RÉCUPÉRER LES DONNÉES
        // ====================================

        const donnees =
            recupererDonnees();


        console.log(
            "Données à envoyer :",
            donnees
        );


        // ====================================
        // BOUTON
        // ====================================

        const bouton =
            modifierForm.querySelector(
                'button[type="submit"]'
            );


        const texteOriginal =
            bouton.textContent;


        bouton.disabled =
            true;


        bouton.textContent =
            "⏳ Enregistrement...";


        try {

            // ==================================
            // ENVOYER AU SERVEUR
            // ==================================

            const response =
                await fetch(
                    `/api/membres/${encodeURIComponent(id)}`,
                    {

                        method:
                            "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                donnees
                            )

                    }
                );


            const result =
                await response.json();


            console.log(
                "Réponse serveur :",
                result
            );


            // ==================================
            // ERREUR
            // ==================================

            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
                    "Impossible d'enregistrer les modifications."
                );

            }


            // ==================================
            // SUCCÈS
            // ==================================

            alert(
                "✅ Les informations du membre ont été modifiées avec succès."
            );


            // ==================================
            // RETOUR À LA FICHE
            // ==================================

            window.location.href =
                `/membre.html?id=${encodeURIComponent(id)}`;

        }


        catch (error) {

            console.error(
                "Erreur lors de la modification :",
                error
            );


            alert(
                "❌ Une erreur est survenue :\n\n" +
                error.message
            );


            bouton.disabled =
                false;


            bouton.textContent =
                texteOriginal;

        }

    }
);


// ============================================
// LANCEMENT
// ============================================

chargerMembre();