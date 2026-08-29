// ============================================
// GESTION DES MEMBRES
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================


const membersTableBody =
    document.getElementById(
        "membersTableBody"
    );


const nombreMembres =
    document.getElementById(
        "nombreMembres"
    );


// ============================================
// FILTRES
// ============================================

const recherche =
    document.getElementById(
        "recherche"
    );


const filtreSecteur =
    document.getElementById(
        "filtreSecteur"
    );


const filtreDepartement =
    document.getElementById(
        "filtreDepartement"
    );


const filtreFonction =
    document.getElementById(
        "filtreFonction"
    );


const resetFiltres =
    document.getElementById(
        "resetFiltres"
    );



// ============================================
// STOCKAGE DES MEMBRES
// ============================================

let membres = [];



// ============================================
// CHARGER LES MEMBRES
// ============================================

async function chargerMembres() {

    try {

        const response =
            await fetch(
                "/api/membres"
            );


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        membres =
            result.membres;


        afficherMembres(membres);

    }

    catch (error) {

        console.error(
            "Erreur :",
            error
        );


        nombreMembres.textContent =
            "Erreur lors du chargement.";


        membersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    Impossible de charger les membres.

                </td>

            </tr>

        `;

    }

}



// ============================================
// AFFICHER LES MEMBRES
// ============================================

function afficherMembres(liste) {

    membersTableBody.innerHTML = "";


    nombreMembres.textContent =
        `${liste.length} membre(s) affiché(s)`;


    if (liste.length === 0) {

        membersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    Aucun membre ne correspond
                    à votre recherche.

                </td>

            </tr>

        `;

        return;

    }



    liste.forEach(function (membre) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${membre.id}
            </td>

            <td>

                <a
                    href="/membre.html?id=${membre.id}"
                >

                    ${membre.nom_complet}

                </a>

            </td>

            <td>
                ${membre.telephone}
            </td>

            <td>
                ${membre.courriel}
            </td>

            <td>
                ${membre.secteur}
            </td>

            <td>
                ${membre.departement || "—"}
            </td>

            <td>
                ${membre.fonction}
            </td>

        `;


        membersTableBody.appendChild(row);

    });

}



// ============================================
// APPLIQUER LES FILTRES
// ============================================

function appliquerFiltres() {


    const texte =
        recherche.value
            .toLowerCase()
            .trim();


    const secteur =
        filtreSecteur.value;


    const departement =
        filtreDepartement.value;


    const fonction =
        filtreFonction.value;



    const resultat =
        membres.filter(function (membre) {


            // ================================
            // RECHERCHE
            // ================================

            const rechercheCorrespond =
                !texte ||

                membre.nom_complet
                    .toLowerCase()
                    .includes(texte)

                ||

                membre.telephone
                    .toLowerCase()
                    .includes(texte)

                ||

                membre.courriel
                    .toLowerCase()
                    .includes(texte);



            // ================================
            // SECTEUR
            // ================================

            const secteurCorrespond =
                !secteur ||

                membre.secteur === secteur;



            // ================================
            // DÉPARTEMENT
            // ================================

            const departementCorrespond =
                !departement ||

                membre.departement === departement;



            // ================================
            // FONCTION
            // ================================

            const fonctionCorrespond =
                !fonction ||

                membre.fonction === fonction;



            return (

                rechercheCorrespond &&

                secteurCorrespond &&

                departementCorrespond &&

                fonctionCorrespond

            );

        });



    afficherMembres(resultat);

}



// ============================================
// ÉCOUTER LA RECHERCHE
// ============================================

recherche.addEventListener(
    "input",
    appliquerFiltres
);


filtreSecteur.addEventListener(
    "change",
    appliquerFiltres
);


filtreDepartement.addEventListener(
    "change",
    appliquerFiltres
);


filtreFonction.addEventListener(
    "change",
    appliquerFiltres
);



// ============================================
// RÉINITIALISER
// ============================================

resetFiltres.addEventListener(
    "click",
    function () {

        recherche.value = "";

        filtreSecteur.value = "";

        filtreDepartement.value = "";

        filtreFonction.value = "";

        afficherMembres(membres);

    }
);



// ============================================
// LANCEMENT
// ============================================

chargerMembres();