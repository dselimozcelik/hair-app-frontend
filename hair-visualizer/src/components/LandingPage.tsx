import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero section fades in immediately on mount
    if (heroRef.current) {
      setTimeout(() => {
        heroRef.current?.classList.add("opacity-100");
      }, 100);
    }

    // Features section fades in on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);

    return () => {
      if (featuresRef.current) observer.unobserve(featuresRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Navigation */}
      <header className="w-full px-6 py-4 md:px-12 lg:px-24 flex items-center justify-between">
        <div className="text-xl font-semibold">Hair Visualizer</div>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="hover:opacity-70 transition-opacity duration-300">Home</Link>
          <Link to="/visualizer" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-300">
            Try Demo
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 flex flex-col items-center justify-center text-center opacity-0 transition-opacity duration-1000"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
          Saç rengini hayal etmek hiç bu kadar kolay olmamıştı.
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
          Fotoğrafınızı yükleyin, fırça ile istediğiniz bölgeyi seçin ve saç renginizi görselleştirin. 
          Anında sonuçlar, profesyonel kalite.
        </p>
        <Link
          to="/visualizer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-all duration-300 hover:gap-3"
        >
          Uygulamayı Dene
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      {/* Hero Image Placeholder */}
      <section className="w-full px-6 md:px-12 lg:px-24 mb-20 md:mb-32">
        <div className="max-w-6xl mx-auto w-full">
          <div className="w-full h-64 md:h-96 lg:h-[500px] bg-gray-300 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="text-gray-500 text-lg">Görsel Placeholder</div>
          </div>
        </div>
      </section>

      {/* Features/App Introduction Section */}
      <section 
        ref={featuresRef}
        className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 opacity-0 transition-opacity duration-1000"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Feature 1 */}
            <div className="w-full space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Kolay Kullanım
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Fotoğrafınızı yükleyin, fırça ile saç bölgesini seçin. Sezgisel arayüz sayesinde 
                dakikalar içinde sonuçları görebilirsiniz.
              </p>
              <div className="mt-6 w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-sm">Görsel Placeholder</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="w-full space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Hassas Kontrol
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Fırça boyutunu ayarlayın, çiz ve silme modları ile istediğiniz kadar hassas 
                seçim yapın. Her detayı kontrolünüz altında.
              </p>
              <div className="mt-6 w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-sm">Görsel Placeholder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="w-full px-6 md:px-12 lg:px-24 py-20 md:py-32 text-center">
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen başlayın
          </h2>
          <p className="text-lg text-gray-700 mb-10">
            Denemek için hemen uygulamayı açın ve saç renginizi görselleştirin.
          </p>
          <Link
            to="/visualizer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-all duration-300 hover:gap-3"
          >
            Uygulamayı Başlat
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

