import GallerySection from "../../components/GallerySection";

export default function MakeupPage() {
  const makeupServices = [
    { name: "Make-up de zi", price: "Preț la cerere" },
    { name: "Make-up de seară", price: "Preț la cerere" },
    { name: "Make-up eveniment", price: "Preț la cerere" },
    { name: "Make-up mireasă", price: "Preț la cerere" },
    { name: "Machiaj ședință foto", price: "Preț la cerere" },
    { name: "Pachet nails + make-up", price: "Preț la cerere" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <img className="nav-logo" src="/logo-makeup.png" alt="Raluca Duran Make-up" />

          <div className="nav-links">
            <a href="/">Nails</a>
            <a href="#services">Servicii</a>
            <a href="#packages">Pachete</a>
            <a href="/programare?category=makeup" className="btn-primary">
              Programare
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <p className="hero-subtitle">Make-up • Ploiești</p>

              <h1 className="hero-title hero-title-main">
                Make-up by
                <br />
                Raluca Duran
              </h1>

              <p className="hero-text">
                Machiaj elegant, feminin și luminos pentru evenimente, ședințe
                foto, ocazii speciale și momente în care vrei să te simți impecabil.
              </p>

              <div className="hero-actions">
                <a href="/programare?category=makeup" className="btn-primary">
                  Programează make-up
                </a>

                <a href="/" className="btn-secondary">
                  Înapoi la Nails
                </a>
              </div>
            </div>

            <img className="bg-logo" src="/logo-makeup.png" alt="Raluca Duran Make-up" />
          </div>
        </section>

        <section className="section section-soft" id="services">
          <div className="container">
            <h2 className="hero-title section-title">Servicii Make-up</h2>
            <p className="section-lead">
              Machiaj adaptat stilului tău, evenimentului și trăsăturilor tale.
              Prețurile pot varia în funcție de complexitate și durată.
            </p>

            <div className="services-grid">
              {makeupServices.map((service, index) => (
                <div key={index} className="service-card">
                  <span>{service.name}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="packages">
          <div className="container">
            <h2 className="hero-title section-title">Pachete Beauty</h2>
            <p className="section-lead">
              Pentru evenimente importante, poți combina serviciile de make-up
              cu serviciile de nails într-o experiență completă.
            </p>

            <div className="cards-grid">
              <div className="info-card">
                <h3>Event Ready</h3>
                <p>Make-up de eveniment + nails pentru un look complet și elegant.</p>
              </div>

              <div className="info-card">
                <h3>Bridal Beauty</h3>
                <p>Pachet dedicat mireselor: machiaj rafinat și manichiură premium pentru ziua cea mare.</p>
              </div>

              <div className="info-card">
                <h3>Photoshoot Look</h3>
                <p>Machiaj potrivit pentru ședințe foto, content, evenimente sau apariții speciale.</p>
              </div>

              <div className="info-card">
                <h3>Gift Voucher</h3>
                <p>O experiență beauty oferită cadou pentru aniversări, surprize sau momente speciale.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <h2 className="hero-title section-title">Galerie Make-up</h2>
            <GallerySection category="makeup" />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="hero-title section-title">Ce spun clientele</h2>

            <div className="testimonial-grid">
              <div className="testimonial-card">
                <p>“Machiaj elegant, rezistent și exact pe stilul pe care mi-l doream.”</p>
                <strong>Clientă fericită</strong>
              </div>

              <div className="testimonial-card">
                <p>“Un look feminin, luminos și foarte bine realizat pentru eveniment.”</p>
                <strong>Clientă fericită</strong>
              </div>

              <div className="testimonial-card">
                <p>“Recomand cu drag pentru răbdare, atenție și rezultat impecabil.”</p>
                <strong>Clientă fericită</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <h2 className="hero-title section-title">Întrebări frecvente</h2>

            <div className="faq-grid">
              <div className="faq-card">
                <strong>Cum fac o programare?</strong>
                <p>Programările se fac direct din formularul de programare.</p>
              </div>

              <div className="faq-card">
                <strong>Faceți make-up pentru mireasă?</strong>
                <p>Da, se poate discuta un pachet dedicat pentru ziua evenimentului.</p>
              </div>

              <div className="faq-card">
                <strong>Pot combina make-up cu nails?</strong>
                <p>Da, există opțiunea de pachet nails + make-up pentru evenimente.</p>
              </div>

              <div className="faq-card">
                <strong>Unde se realizează serviciile?</strong>
                <p>În Ploiești. Detaliile exacte se oferă la programare.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-links">
              <a href="/">Nails</a>
              <a href="/makeup">Make-up</a>
              <a href="/programare">Programare</a>
              <a href="#">Instagram coming soon</a>
            </div>

            <p>© 2026 Raluca Duran Beauty • Ploiești</p>
          </div>
        </footer>
      </main>
    </>
  );
}
