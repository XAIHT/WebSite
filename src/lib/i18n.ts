export const languages = {
  en: 'English',
  es: 'Español',
};

export const defaultLang = 'en';

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.login': 'Login',
    'nav.panel': 'User Panel',
    'nav.logout': 'Logout',

    'home.title': 'XAIHT - Technological Research Company',
    'home.subtitle': 'Innovation and Excellence in Technology',
    'home.welcome': 'Welcome to XAIHT',
    'home.description': 'We are a leading technological research company dedicated to innovation, development, and implementation of cutting-edge solutions.',
    'home.features.title': 'What We Offer',
    'home.features.research': 'Advanced Research',
    'home.features.research.desc': 'We conduct cutting-edge research in various technological fields.',
    'home.features.innovation': 'Innovation',
    'home.features.innovation.desc': 'We develop innovative solutions to complex problems.',
    'home.features.consulting': 'Consulting',
    'home.features.consulting.desc': 'Expert guidance for your technological projects.',
    'home.cta': 'Get Started',

    'login.title': 'Login',
    'login.subtitle': 'Access your account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.demo': 'Demo credentials: demo@xaiht.com / demo123',
    'login.google': 'Sign in with Google',
    'login.no_account': "Don't have an account?",

    'register.title': 'Create an Account',
    'register.subtitle': 'Join us to get started',
    'register.name': 'Full Name',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirm_password': 'Confirm Password',
    'register.submit': 'Sign Up',
    'register.google': 'Sign up with Google',
    'register.has_account': 'Already have an account?',

    'panel.title': 'User Panel',
    'panel.welcome': 'Welcome back',
    'panel.dashboard': 'Dashboard',
    'panel.profile': 'Profile',
    'panel.settings': 'Settings',
    'panel.projects': 'Projects',
    'panel.stats.title': 'Statistics',
    'panel.stats.projects': 'Active Projects',
    'panel.stats.tasks': 'Completed Tasks',
    'panel.stats.team': 'Team Members',

    'footer.rights': 'All rights reserved.',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.login': 'Iniciar Sesión',
    'nav.panel': 'Panel de Usuario',
    'nav.logout': 'Cerrar Sesión',

    'home.title': 'XAIHT - Empresa de Investigación Tecnológica',
    'home.subtitle': 'Innovación y Excelencia en Tecnología',
    'home.welcome': 'Bienvenido a XAIHT',
    'home.description': 'Somos una empresa líder en investigación tecnológica dedicada a la innovación, desarrollo e implementación de soluciones de vanguardia.',
    'home.features.title': 'Qué Ofrecemos',
    'home.features.research': 'Investigación Avanzada',
    'home.features.research.desc': 'Realizamos investigación de vanguardia en diversos campos tecnológicos.',
    'home.features.innovation': 'Innovación',
    'home.features.innovation.desc': 'Desarrollamos soluciones innovadoras para problemas complejos.',
    'home.features.consulting': 'Consultoría',
    'home.features.consulting.desc': 'Asesoramiento experto para sus proyectos tecnológicos.',
    'home.cta': 'Comenzar',

    'login.title': 'Iniciar Sesión',
    'login.subtitle': 'Accede a tu cuenta',
    'login.email': 'Correo Electrónico',
    'login.password': 'Contraseña',
    'login.submit': 'Entrar',
    'login.demo': 'Credenciales de demostración: demo@xaiht.com / demo123',
    'login.google': 'Iniciar sesión con Google',
    'login.no_account': '¿No tienes una cuenta?',

    'register.title': 'Crear una Cuenta',
    'register.subtitle': 'Únete para comenzar',
    'register.name': 'Nombre Completo',
    'register.email': 'Correo Electrónico',
    'register.password': 'Contraseña',
    'register.confirm_password': 'Confirmar Contraseña',
    'register.submit': 'Registrarse',
    'register.google': 'Registrarse con Google',
    'register.has_account': '¿Ya tienes una cuenta?',

    'panel.title': 'Panel de Usuario',
    'panel.welcome': 'Bienvenido de nuevo',
    'panel.dashboard': 'Tablero',
    'panel.profile': 'Perfil',
    'panel.settings': 'Configuración',
    'panel.projects': 'Proyectos',
    'panel.stats.title': 'Estadísticas',
    'panel.stats.projects': 'Proyectos Activos',
    'panel.stats.tasks': 'Tareas Completadas',
    'panel.stats.team': 'Miembros del Equipo',

    'footer.rights': 'Todos los derechos reservados.',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
  },
} as const;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
