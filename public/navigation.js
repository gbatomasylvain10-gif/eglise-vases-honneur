// ============================================
// SYSTÈME DE NAVIGATION UNIVERSEL
// ÉGLISE VASES D'HONNEUR DE JONQUIÈRE
// ============================================

console.log("🧭 Script navigation.js chargé");

document.addEventListener("DOMContentLoaded", function () {
    // 1. Injecter le menu mobile (hamburger)
    injecterMenuMobile();
    
    // 2. Injecter le menu desktop (sidebar)
    injecterMenuDesktop();
    
    // 3. Gérer les événements (clics, déconnexion)
    gererEvenementsNavigation();
    
    // 4. Marquer la page active
    marquerPageActive();
});

// ============================================
// INJECTER LE MENU MOBILE (Hamburger)
// ============================================
function injecterMenuMobile() {
    const btnHamburger = document.createElement('button');
    btnHamburger.id = 'btnHamburger';
    btnHamburger.className = 'fixed top-4 left-4 z-50 md:hidden bg-[#2b2d32] text-amber-500 w-14 h-14 flex items-center justify-center rounded-2xl shadow-2xl border border-slate-700 active:scale-95 transition-transform';
    btnHamburger.innerHTML = `
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
    `;
    document.body.appendChild(btnHamburger);

    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'fixed inset-0 bg-black/60 z-[55] md:hidden opacity-0 pointer-events-none transition-opacity duration-300';
    document.body.appendChild(overlay);

    const sidebarMenu = document.createElement('div');
    sidebarMenu.id = 'sidebarMenu';
    sidebarMenu.className = 'fixed left-0 top-0 bottom-0 w-72 bg-[#2b2d32] text-slate-300 z-[60] shadow-2xl md:hidden flex flex-col transform -translate-x-full transition-transform duration-300 ease-in-out';
    sidebarMenu.innerHTML = `
        <div class="p-6 text-center border-b border-slate-700/50 bg-[#25272c] pt-20">
            <div class="text-amber-500 text-3xl font-serif mb-2">✝</div>
            <h2 class="text-sm font-semibold tracking-wider text-slate-100 uppercase">Vases d'Honneur</h2>
            <p class="text-xs text-slate-400">Jonquière</p>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2 text-sm font-medium overflow-y-auto">
            <a href="/admin.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🏠</span><span>Tableau de Bord</span>
            </a>
            <a href="/membres.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>👥</span><span>Membres</span>
            </a>
            <a href="/presences.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🙏</span><span>Suivi Pastoral</span>
            </a>
            <a href="/evangelisation.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>📢</span><span>Évangélisation</span>
            </a>
            <a href="/lifts.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🚐</span><span>Transport/Lifts</span>
            </a>
            <a href="/departements.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🏛️</span><span>Départements</span>
            </a>
            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 cursor-not-allowed opacity-60">
                <span>📅</span><span>Événements (Bientôt)</span>
            </a>
        </nav>
        <div class="p-4 border-t border-slate-700/50 bg-[#25272c]">
            <button id="btnDeconnexionMobile" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition text-sm font-medium">
                <span>🚪</span><span>Déconnexion</span>
            </button>
        </div>
    `;
    document.body.appendChild(sidebarMenu);
}

// ============================================
// INJECTER LE MENU DESKTOP (Sidebar)
// ============================================
function injecterMenuDesktop() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'w-64 bg-[#2b2d32] text-slate-300 flex-col shrink-0 min-h-screen hidden md:flex relative z-40';
    sidebar.innerHTML = `
        <div class="p-6 text-center border-b border-slate-700/50">
            <div class="text-amber-500 text-2xl font-serif mb-1">✝</div>
            <h2 class="text-sm font-semibold tracking-wider text-slate-100 uppercase">Vases d'Honneur</h2>
            <p class="text-xs text-slate-400">Jonquière</p>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-1 text-sm font-medium">
            <a href="/admin.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🏠</span><span>Tableau de Bord</span>
            </a>
            <a href="/membres.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>👥</span><span>Membres</span>
            </a>
            <a href="/presences.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🙏</span><span>Suivi Pastoral</span>
            </a>
            <a href="/evangelisation.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>📢</span><span>Évangélisation</span>
            </a>
            <a href="/lifts.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🚐</span><span>Transport/Lifts</span>
            </a>
            <a href="/departements.html" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition">
                <span>🏛️</span><span>Départements</span>
            </a>
            <a href="#" class="nav-link flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 cursor-not-allowed opacity-60">
                <span>📅</span><span>Événements (Bientôt)</span>
            </a>
        </nav>
        <div class="p-4 border-t border-slate-700/50">
            <button id="btnDeconnexion" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition text-sm font-medium">
                <span>🚪</span><span>Déconnexion</span>
            </button>
        </div>
    `;
    
    const mainContainer = document.querySelector('.min-h-full');
    if (mainContainer) {
        mainContainer.insertBefore(sidebar, mainContainer.firstChild);
    } else {
        document.body.insertBefore(sidebar, document.body.firstChild);
    }
}

// ============================================
// GÉRER LES ÉVÉNEMENTS
// ============================================
function gererEvenementsNavigation() {
    const btnHamburger = document.getElementById('btnHamburger');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    const toggleMenu = () => {
        const isClosed = sidebarMenu.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebarMenu.classList.remove('-translate-x-full');
            sidebarMenu.classList.add('translate-x-0');
            sidebarOverlay.classList.remove('opacity-0', 'pointer-events-none');
            sidebarOverlay.classList.add('opacity-100');
        } else {
            sidebarMenu.classList.remove('translate-x-0');
            sidebarMenu.classList.add('-translate-x-full');
            sidebarOverlay.classList.remove('opacity-100');
            sidebarOverlay.classList.add('opacity-0', 'pointer-events-none');
        }
    };

    if (btnHamburger) btnHamburger.addEventListener('click', toggleMenu);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleMenu);

    const btnDeconnexion = document.getElementById("btnDeconnexion");
    const btnDeconnexionMobile = document.getElementById("btnDeconnexionMobile");

    const handleDeconnexion = async () => {
        try {
            const response = await fetch("/api/deconnexion", { method: "POST" });
            if (response.ok) {
                window.location.href = "/connexion.html";
            } else {
                alert("Erreur lors de la déconnexion.");
            }
        } catch (error) {
            console.error("Erreur de déconnexion :", error);
            alert("Erreur de connexion au serveur.");
        }
    };

    if (btnDeconnexion) btnDeconnexion.addEventListener("click", handleDeconnexion);
    if (btnDeconnexionMobile) btnDeconnexionMobile.addEventListener("click", handleDeconnexion);
}

// ============================================
// MARQUER LA PAGE ACTIVE
// ============================================
function marquerPageActive() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && currentPage.includes(href.replace('/', ''))) {
            link.classList.remove('text-slate-400', 'hover:bg-slate-700/50', 'hover:text-slate-200');
            link.classList.add('bg-[#3d5a45]', 'text-white', 'shadow-sm');
        }
    });
}