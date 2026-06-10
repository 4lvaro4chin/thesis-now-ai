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

    // Search page
    'search.section.builder': 'Constructor',
    'search.title': 'Construye tu búsqueda',
    'search.subtitle': 'Ajusta los operadores booleanos y selecciona las bases de datos donde buscar.',
    'search.section.operators': 'Operadores booleanos',
    'search.operators.hint': 'Usa estos operadores para refinar tu búsqueda:',
    'search.operators.and': 'Incluye todos los términos',
    'search.operators.or': 'Incluye alguno de los términos',
    'search.operators.not': 'Excluye el término',
    'search.operators.trunc': 'Busca palabras con prefijo',
    'search.section.databases': 'Bases de datos',
    'search.databases.hint': 'Selecciona dónde deseas buscar:',
    'search.button.back': 'Volver',
    'search.button.execute': 'Ejecutar búsqueda',

    // Searching page
    'searching.title': 'Búsqueda en progreso',
    'searching.subtitle': 'Estamos buscando en múltiples bases de datos...',
    'searching.status.articles': 'artículos',
    'searching.status.searching': 'Buscando...',
    'searching.status.waiting': 'Esperando...',
    'searching.articles.found': 'artículos encontrados hasta ahora',
    'searching.estimated_time': 'Tiempo estimado: ~2 minutos 15 segundos',
    'searching.button.view': 'Ver resultados provisionales',

    // Results page
    'results.title': 'Resultados',
    'results.subtitle': 'Se encontraron',
    'results.articles': 'artículos en 6 bases de datos',
    'results.relevance.high': 'Alta',
    'results.relevance.medium': 'Media',
    'results.relevance.low': 'Baja',
    'results.sort.relevance': 'Relevancia: Alta a Baja',
    'results.sort.newest': 'Año: Más reciente',
    'results.sort.oldest': 'Año: Más antiguo',
    'results.filter.all': 'Todas las bases',
    'results.search.placeholder': 'Filtrar por palabra clave...',
    'results.button.more': 'Ver más',
    'results.button.load': 'Cargar más resultados',
    'results.export.selected': 'artículos seleccionados',
    'results.button.download': 'Descargar',
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

    // Search page
    'search.section.builder': 'Builder',
    'search.title': 'Build your search',
    'search.subtitle': 'Adjust boolean operators and select the databases where to search.',
    'search.section.operators': 'Boolean Operators',
    'search.operators.hint': 'Use these operators to refine your search:',
    'search.operators.and': 'Includes all terms',
    'search.operators.or': 'Includes some of the terms',
    'search.operators.not': 'Excludes the term',
    'search.operators.trunc': 'Search words with prefix',
    'search.section.databases': 'Databases',
    'search.databases.hint': 'Select where you want to search:',
    'search.button.back': 'Back',
    'search.button.execute': 'Execute search',

    // Searching page
    'searching.title': 'Search in progress',
    'searching.subtitle': 'We are searching across multiple databases...',
    'searching.status.articles': 'articles',
    'searching.status.searching': 'Searching...',
    'searching.status.waiting': 'Waiting...',
    'searching.articles.found': 'articles found so far',
    'searching.estimated_time': 'Estimated time: ~2 minutes 15 seconds',
    'searching.button.view': 'View provisional results',

    // Results page
    'results.title': 'Results',
    'results.subtitle': 'Found',
    'results.articles': 'articles in 6 databases',
    'results.relevance.high': 'High',
    'results.relevance.medium': 'Medium',
    'results.relevance.low': 'Low',
    'results.sort.relevance': 'Relevance: High to Low',
    'results.sort.newest': 'Year: Most Recent',
    'results.sort.oldest': 'Year: Oldest',
    'results.filter.all': 'All databases',
    'results.search.placeholder': 'Filter by keyword...',
    'results.button.more': 'View more',
    'results.button.load': 'Load more results',
    'results.export.selected': 'articles selected',
    'results.button.download': 'Download',
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

    // Search page
    'search.section.builder': 'Construtor',
    'search.title': 'Construa sua pesquisa',
    'search.subtitle': 'Ajuste os operadores booleanos e selecione os bancos de dados onde pesquisar.',
    'search.section.operators': 'Operadores Booleanos',
    'search.operators.hint': 'Use esses operadores para refinar sua pesquisa:',
    'search.operators.and': 'Inclui todos os termos',
    'search.operators.or': 'Inclui alguns dos termos',
    'search.operators.not': 'Exclui o termo',
    'search.operators.trunc': 'Pesquisa palavras com prefixo',
    'search.section.databases': 'Bancos de dados',
    'search.databases.hint': 'Selecione onde você deseja pesquisar:',
    'search.button.back': 'Voltar',
    'search.button.execute': 'Executar pesquisa',

    // Searching page
    'searching.title': 'Pesquisa em andamento',
    'searching.subtitle': 'Estamos pesquisando em múltiplos bancos de dados...',
    'searching.status.articles': 'artigos',
    'searching.status.searching': 'Pesquisando...',
    'searching.status.waiting': 'Aguardando...',
    'searching.articles.found': 'artigos encontrados até agora',
    'searching.estimated_time': 'Tempo estimado: ~2 minutos 15 segundos',
    'searching.button.view': 'Ver resultados provisórios',

    // Results page
    'results.title': 'Resultados',
    'results.subtitle': 'Encontrados',
    'results.articles': 'artigos em 6 bancos de dados',
    'results.relevance.high': 'Alta',
    'results.relevance.medium': 'Média',
    'results.relevance.low': 'Baixa',
    'results.sort.relevance': 'Relevância: Alta para Baixa',
    'results.sort.newest': 'Ano: Mais recente',
    'results.sort.oldest': 'Ano: Mais antigo',
    'results.filter.all': 'Todos os bancos',
    'results.search.placeholder': 'Filtrar por palavra-chave...',
    'results.button.more': 'Ver mais',
    'results.button.load': 'Carregar mais resultados',
    'results.export.selected': 'artigos selecionados',
    'results.button.download': 'Baixar',
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
