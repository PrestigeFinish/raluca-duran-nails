import GallerySection from "@/components/GallerySection";
export default function Home() {
  const nailServices = [
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
            <a href="#beauty">Beauty</a>
            <a href="/makeup">Make-up</a>
        <a href="/programare?category=nails" className="btn-primary">
  Programare
</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <p className="hero-subtitle">Nails • Ploiești</p>

              <h1 className="hero-title hero-title-main">
                Nail studio by
                <br />
                Raluca Duran
              </h1>

              <p className="hero-text">
                Manichiuri elegante, feminine și atent lucrate: semi cu apex,
                gel, construcție, întreținere, slim nails și nail art.
              </p>

              <div className="hero-actions">
             <a href="/programare?category=nails" className="btn-primary">
  Programează-te
</a>

                <a href="/makeup" className="btn-secondary">
                  Vezi Make-up
                </a>
              </div>
            </div>

            <img className="bg-logo" src="/logo.png" alt="Raluca Duran Nails" />
          </div>
        </section>

        <section className="section section-soft" id="services">
          <div className="container">
            <h2 className="hero-title section-title">Servicii & Prețuri</h2>
            <p className="section-lead">
              Alege serviciul potrivit pentru stilul tău. Pentru nail art,
              prețul poate varia în funcție de complexitatea modelului.
            </p>

            <div className="services-grid">
              {nailServices.map((service, index) => (
                <div key={index} className="service-card">
                  <span>{service.name}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="beauty">
          <div className="container">
            <h2 className="hero-title section-title">Beauty by Raluca Duran</h2>
            <p className="section-lead">
              Pe lângă nail studio, Raluca oferă și servicii de make-up pentru
              evenimente, ședințe foto și momente speciale.
            </p>

            <div className="cards-grid">
              <div className="info-card">
                <h3>Nails</h3>
                <p>
                  Manichiuri premium, slim nails, construcție, întreținere și
                  detalii fine pentru un look elegant.
                </p>
              </div>

              <div className="info-card">
                <h3>Make-up</h3>
                <p>
                  Machiaj feminin și rafinat pentru evenimente, poze, ocazii
                  speciale și momente importante.
                </p>
                <br />
                <a href="/makeup" className="btn-secondary">
                  Deschide pagina Make-up
                </a>
              </div>

              <div className="info-card">
                <h3>Pachet Event Ready</h3>
                <p>
                  Nails + make-up pentru zile în care vrei să ai tot look-ul
                  pregătit într-un singur loc.
                </p>
              </div>

              <div className="info-card">
                <h3>Gift Voucher</h3>
                <p>
                  O idee elegantă de cadou pentru aniversări, surprize sau
                  momente speciale.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container">
            <h2 className="hero-title section-title">Galerie Nails</h2>

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

        <section className="section">
          <div className="container">
            <h2 className="hero-title section-title">Ce spun clientele</h2>

            <div className="testimonial-grid">
              <div className="testimonial-card">
                <p>
                  “Un rezultat elegant, curat și lucrat cu multă atenție la
                  detalii.”
                </p>
                <strong>Clientă fericită</strong>
              </div>

              <div className="testimonial-card">
                <p>
                  “Atmosferă plăcută, răbdare și o manichiură care arată
                  impecabil.”
                </p>
                <strong>Clientă fericită</strong>
              </div>

              <div className="testimonial-card">
                <p>
                  “Recomand cu drag pentru servicii feminine, fine și
                  profesionale.”
                </p>
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
                <p>Momentan, programările se fac rapid prin WhatsApp.</p>
              </div>

              <div className="faq-card">
                <strong>Pot trimite un model înainte?</strong>
                <p>
                  Da, poți trimite inspirația sau modelul dorit înainte de
                  programare.
                </p>
              </div>

              <div className="faq-card">
                <strong>Unde este studioul?</strong>
                <p>Studioul este în Ploiești. Detaliile se oferă la programare.</p>
              </div>

              <div className="faq-card">
                <strong>Faceți și make-up?</strong>
                <p>
                  Da, există o pagină separată pentru serviciile de make-up by
                  Raluca Duran.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-links">
              <a href="/">Nails</a>
              <a href="/makeup">Make-up</a>
              <a href="https://wa.me/40727707545" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a href="#">Instagram coming soon</a>
            </div>

            <p>© 2026 Raluca Duran Beauty • Ploiești</p>
          </div>
        </footer>
      </main>
    </>
  );
}
