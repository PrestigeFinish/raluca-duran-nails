export default function MakeupPage() {
  const services = [
    { name: "Make-up de zi", price: "Preț la cerere" },
    { name: "Make-up de seară", price: "Preț la cerere" },
    { name: "Make-up eveniment", price: "Preț la cerere" },
    { name: "Make-up mireasă", price: "Preț la cerere" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <img className="nav-logo" src="/logo.png" alt="Raluca Duran Beauty" />

          <div className="nav-links">
            <a href="/">Nails</a>
            <a href="#services">Servicii</a>
            <a
              href="https://wa.me/40727707545?text=Bună! Aș dori o programare pentru make-up la Raluca Duran ✨"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Programează-te
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <img className="bg-logo" src="/logo.png" alt="" />

          <div className="container">
            <div className="hero-content">
              <p className="hero-subtitle">MAKE-UP • PLOIEȘTI</p>

              <h1 className="hero-title hero-title-main">
                Make-up by
                <br />
                Raluca Duran
              </h1>

              <p className="hero-text">
                Machiaj elegant și feminin pentru evenimente, ședințe foto,
                ocazii speciale și momente în care vrei să te simți impecabil.
              </p>

              <a
                href="https://wa.me/40727707545?text=Bună! Aș dori o programare pentru make-up la Raluca Duran ✨"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Rezervă make-up
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <h2 className="hero-title section-title">Servicii Make-up</h2>

            <div className="services-grid">
              {services.map((service, index) => (
                <div key={index} className="service-card">
                  <span>{service.name}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="hero-title section-title">Galerie Make-up</h2>

            <div className="gallery-grid">
              <img className="gallery-item" src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80" alt="Make-up look" />
              <img className="gallery-item" src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80" alt="Beauty makeup" />
              <img className="gallery-item" src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80" alt="Makeup studio" />
            </div>
          </div>
        </section>

        <footer className="footer">
          © 2026 Raluca Duran Beauty • Ploiești
        </footer>
      </main>
    </>
  );
}
