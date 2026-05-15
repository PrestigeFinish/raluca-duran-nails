export default function Home() {
  const services = [
    { name: "Semi cu apex", price: "90 lei" },
    { name: "Construcție gel 1–3", price: "120 lei" },
    { name: "Construcție gel 4–6", price: "140 lei" },
    { name: "Întreținere gel 1–3", price: "120 lei" },
    { name: "Întreținere gel 4–6", price: "150 lei" },
    { name: "Slim construcție", price: "170 lei" },
    { name: "Slim întreținere", price: "160 lei" },
    { name: "Demontare", price: "50 lei" },
    { name: "French glass", price: "50 lei" },
    { name: "French de interior", price: "100 lei" },
    { name: "Nail art", price: "Preț variabil" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <img className="nav-logo" src="/logo.png" alt="Raluca Duran Nails" />

          <div className="nav-links">
            <a href="#services">Servicii</a>
            <a href="#makeup">Make-up</a>
            <a href="/makeup">Pagina Make-up</a>
            <a
              href="https://wa.me/40727707545?text=Bună! Aș dori o programare la Raluca Duran Nails 💅"
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
              <p className="hero-subtitle">PLOIEȘTI</p>

              <h1 className="hero-title hero-title-main">
                Nail studio by
                <br />
                Raluca Duran
              </h1>

              <p className="hero-text">
                Eleganță, feminitate și manichiuri create cu atenție la fiecare
                detaliu într-un studio premium din Ploiești.
              </p>

              <a
                href="https://wa.me/40727707545?text=Bună! Aș dori o programare la Raluca Duran Nails 💅"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Rezervă acum
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <h2 className="hero-title section-title">Servicii & Prețuri</h2>

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

        <section className="section" id="makeup">
          <div className="container">
            <div className="feature-card">
              <p className="hero-subtitle">NEW BEAUTY SERVICE</p>
              <h2 className="hero-title section-title" style={{ marginBottom: "24px" }}>
                Make-up by Raluca Duran
              </h2>
              <p className="hero-text" style={{ margin: "0 auto 32px" }}>
                Pe lângă nail studio, Raluca oferă și servicii de make-up pentru
                evenimente, ședințe foto și momente speciale.
              </p>
              <a href="/makeup" className="btn-primary">
                Vezi pagina de make-up
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="hero-title section-title">Galerie</h2>

            <div className="gallery-grid">
              <img className="gallery-item" src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80" alt="Nail design" />
              <img className="gallery-item" src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80" alt="Luxury nails" />
              <img className="gallery-item" src="https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80" alt="Elegant manicure" />
            </div>
          </div>
        </section>

        <footer className="footer">
          © 2026 Raluca Duran Nails • Ploiești
        </footer>
      </main>
    </>
  );
}
