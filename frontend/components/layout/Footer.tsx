export function Footer() {
  return (
    <footer className="bg-navy py-9">
      <div className="max-w-prose mx-auto px-6 sm:px-8 md:px-12 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="text-base font-semibold -tracking-wide text-white/70">
            Thesis<span className="text-green-400">Now</span>
          </div>
          <p className="text-sm italic text-white/30 mt-1">Tu revisión bibliográfica, en minutos.</p>
        </div>
        <div className="flex gap-5">
          <a
            href="#privacy"
            className="text-xs text-white/30 hover:text-white/70 transition-colors duration-180 no-underline"
          >
            Privacidad
          </a>
          <a
            href="#terms"
            className="text-xs text-white/30 hover:text-white/70 transition-colors duration-180 no-underline"
          >
            Términos
          </a>
          <a
            href="#contact"
            className="text-xs text-white/30 hover:text-white/70 transition-colors duration-180 no-underline"
          >
            Contacto
          </a>
          <a
            href="#website"
            className="text-xs text-white/30 hover:text-white/70 transition-colors duration-180 no-underline"
          >
            thesisnow.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
