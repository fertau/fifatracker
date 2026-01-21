type Language = 'es' | 'en';

const translations = {
    es: {
        // General
        'app.name': 'FIFA Tracker',
        'app.tagline': 'Tu Arena de Competición Personal',

        // Navigation
        'nav.home': 'Inicio',
        'nav.play': 'Jugar',
        'nav.stats': 'Estadísticas',
        'nav.profile': 'Perfil',
        'nav.settings': 'Ajustes',

        // Stats
        'stats.title': 'Estadísticas Avanzadas',
        'stats.rank': 'Ranking Comunidad',
        'stats.streak': 'Racha Actual',
        'stats.nemesis': 'Tu Némesis',
        'stats.duo': 'Mejor Dupla',
        'stats.performance': 'Evolución de Rendimiento',
        'stats.wins': 'Victorias',
        'stats.losses': 'Derrotas',
        'stats.draws': 'Empates',

        // Settings
        'settings.language': 'Idioma',
        'settings.privacy': 'Privacidad',
        'settings.logout': 'Cerrar Sesión',

        // Profiles
        'profile.achievements': 'Logros Desbloqueados',
        'profile.security': 'Seguridad',
        'profile.changePin': 'Cambiar PIN',
    },
    en: {
        // General
        'app.name': 'FIFA Tracker',
        'app.tagline': 'Your Personal Competition Arena',

        // Navigation
        'nav.home': 'Home',
        'nav.play': 'Play',
        'nav.stats': 'Stats',
        'nav.profile': 'Profile',
        'nav.settings': 'Settings',

        // Stats
        'stats.title': 'Advanced Stats',
        'stats.rank': 'Community Ranking',
        'stats.streak': 'Current Streak',
        'stats.nemesis': 'Your Nemesis',
        'stats.duo': 'Best Duo',
        'stats.performance': 'Performance Evolution',
        'stats.wins': 'Wins',
        'stats.losses': 'Losses',
        'stats.draws': 'Draws',

        // Settings
        'settings.language': 'Language',
        'settings.privacy': 'Privacy',
        'settings.logout': 'Logout',

        // Profiles
        'profile.achievements': 'Unlocked Achievements',
        'profile.security': 'Security',
        'profile.changePin': 'Change PIN',
    }
};

let currentLang: Language = (localStorage.getItem('app_lang') as Language) || 'es';

export function setLanguage(lang: Language) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    window.location.reload(); // Simple way to re-render everything with new labels
}

export function getLanguage(): Language {
    return currentLang;
}

export function t(key: keyof typeof translations['es']): string {
    return translations[currentLang][key] || key;
}
