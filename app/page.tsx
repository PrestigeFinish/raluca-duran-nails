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
          <img src="/logo.png" alt="Raluca Duran Nails" style={{ height: "80px" }} />

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <a href="#services">Servicii</a>
            <a href="#about">Despre</a>
            <a href="#gallery">Galerie</a>
            <a href="#contact" className="btn-primary">
              Programează-te
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
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
                href="https://wa.me/40727707545"
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
            <h2
              className="hero-title"
              style={{
                fontSize: "60px",
                textAlign: "center",
                marginBottom: "50px",
              }}
            >
              Servicii & Prețuri
            </h2>

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

        <section className="section" id="about">
          <div
            className="container"
            style={{
              textAlign: "center",
              maxWidth: "900px",
            }}
          >
            <h2
              className="hero-title"
              style={{
                fontSize: "60px",
                marginBottom: "30px",
              }}
            >
              Despre studio
            </h2>

            <p
              style={{
                fontSize: "20px",
                lineHeight: "1.8",
                color: "#66584d",
              }}
            >
              Raluca Duran Nails este un studio boutique din Ploiești dedicat
              manichiurilor elegante, feminine și atent lucrate. Fiecare clientă
              beneficiază de atenție, confort și servicii realizate cu grijă
              pentru detalii.
            </p>
          </div>
        </section>

        <section className="section" id="gallery">
          <div className="container">
            <h2
              className="hero-title"
              style={{
                fontSize: "60px",
                textAlign: "center",
              }}
            >
              Galerie
            </h2>

            <div className="gallery-grid">
             <img
  className="gallery-item"
  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80"
  alt="Nail design"
/>

<img
  className="gallery-item"
  src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
  alt="Luxury nails"
/>

<img
  className="gallery-item"
  src="https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80"
  alt="Elegant manicure"
/>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div
            className="container"
            style={{
              textAlign: "center",
            }}
          >
            <h2
              className="hero-title"
              style={{
                fontSize: "60px",
                marginBottom: "20px",
              }}
            >
              Contact
            </h2>

            <p
              style={{
                fontSize: "20px",
                marginBottom: "16px",
                color: "#6d5d50",
              }}
            >
              Ploiești
            </p>

            <p
              style={{
                fontSize: "18px",
                marginBottom: "30px",
                color: "#8c7562",
              }}
            >
              Instagram coming soon
            </p>

            <a
              href="https://wa.me/40727707545"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Contactează-mă pe WhatsApp
            </a>
          </div>
        </section>

        <footer className="footer">
          © 2025 Raluca Duran Nails • Ploiești
        </footer>
      </main>
    </>
  );
}
