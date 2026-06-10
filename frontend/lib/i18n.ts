type Language = 'es' | 'en';

const translations = {
  es: {
    // Login page
    'login.welcome': 'Bienvenido',
    'login.createAccount': 'Comienza ahora',
    'login.subtitle.login': 'Accede a tu revisión bibliográfica',
    'login.subtitle.signup': 'Crea tu cuenta para comenzar',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.signIn': 'Iniciar sesión',
    'login.signUp': 'Crear cuenta',
    'login.signingIn': 'Iniciando sesión...',
    'login.signingUp': 'Creando cuenta...',
    'login.noAccount': '¿No tienes cuenta?',
    'login.haveAccount': '¿Ya tienes cuenta?',
    'login.createOne': 'Crear una',
    'login.signInInstead': 'Inicia sesión',
    'login.terms': 'Términos de Servicio',
    'login.privacy': 'Política de Privacidad',
    'login.accept': 'Al continuar aceptas nuestros',
    'login.and': 'y',

    // Errors
    'error.invalidCredentials': 'Credenciales inválidas',
    'error.userNotFound': 'Usuario no encontrado',
    'error.weakPassword': 'La contraseña es muy débil',
    'error.emailInUse': 'Este email ya está registrado',
    'error.networkError': 'Error de conexión. Intenta de nuevo',
    'error.default': 'Algo salió mal. Intenta de nuevo',

    // Navbar
    'navbar.signIn': 'Iniciar sesión',
    'navbar.startFree': 'Empezar gratis',
    'navbar.logout': 'Salir',
  },
  en: {
    // Login page
    'login.welcome': 'Welcome',
    'login.createAccount': 'Get Started',
    'login.subtitle.login': 'Access your bibliography review',
    'login.subtitle.signup': 'Create your account to begin',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signIn': 'Sign In',
    'login.signUp': 'Create Account',
    'login.signingIn': 'Signing in...',
    'login.signingUp': 'Creating account...',
    'login.noAccount': "Don't have an account?",
    'login.haveAccount': 'Already have an account?',
    'login.createOne': 'Create one',
    'login.signInInstead': 'Sign in',
    'login.terms': 'Terms of Service',
    'login.privacy': 'Privacy Policy',
    'login.accept': 'By continuing, you accept our',
    'login.and': 'and',

    // Errors
    'error.invalidCredentials': 'Invalid email or password',
    'error.userNotFound': 'User not found',
    'error.weakPassword': 'Password is too weak',
    'error.emailInUse': 'Email already registered',
    'error.networkError': 'Connection error. Try again',
    'error.default': 'Something went wrong. Try again',

    // Navbar
    'navbar.signIn': 'Sign In',
    'navbar.startFree': 'Start Free',
    'navbar.logout': 'Logout',
  },
};

export function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'es';
  const lang = navigator.language.split('-')[0];
  return (lang === 'en' ? 'en' : 'es') as Language;
}

export function useTranslation(lang?: Language) {
  const currentLang = lang || detectLanguage();

  return {
    t: (key: string) => {
      return (translations[currentLang] as Record<string, string>)[key] || key;
    },
    lang: currentLang,
  };
}
