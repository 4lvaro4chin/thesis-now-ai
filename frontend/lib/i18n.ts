export type Language = 'es' | 'en' | 'pt';

export const translations = {
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
  pt: {
    // Login page
    'login.welcome': 'Bem-vindo',
    'login.createAccount': 'Comece agora',
    'login.subtitle.login': 'Acesse sua revisão bibliográfica',
    'login.subtitle.signup': 'Crie sua conta para começar',
    'login.email': 'E-mail',
    'login.password': 'Senha',
    'login.signIn': 'Entrar',
    'login.signUp': 'Criar conta',
    'login.signingIn': 'Entrando...',
    'login.signingUp': 'Criando conta...',
    'login.noAccount': 'Não tem conta?',
    'login.haveAccount': 'Já tem conta?',
    'login.createOne': 'Criar uma',
    'login.signInInstead': 'Entrar',
    'login.terms': 'Termos de Serviço',
    'login.privacy': 'Política de Privacidade',
    'login.accept': 'Ao continuar, você aceita nossos',
    'login.and': 'e',

    // Errors
    'error.invalidCredentials': 'Credenciais inválidas',
    'error.userNotFound': 'Usuário não encontrado',
    'error.weakPassword': 'A senha é muito fraca',
    'error.emailInUse': 'Este e-mail já está registrado',
    'error.networkError': 'Erro de conexão. Tente novamente',
    'error.default': 'Algo deu errado. Tente novamente',

    // Navbar
    'navbar.signIn': 'Entrar',
    'navbar.startFree': 'Começar grátis',
    'navbar.logout': 'Sair',
  },
};

export function detectLanguage(): Language {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'es' || saved === 'en' || saved === 'pt') {
      return saved as Language;
    }
  }

  if (typeof navigator === 'undefined') return 'es';
  const lang = navigator.language.split('-')[0];
  if (lang === 'en') return 'en';
  if (lang === 'pt') return 'pt';
  return 'es';
}
