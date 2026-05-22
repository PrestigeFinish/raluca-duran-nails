import GallerySection from "../components/GallerySection";

export default function Home() {
  const nailServices = [
    "Semi cu apex",
    "Construcție gel",
    "Întreținere gel",
    "Slim nails",
    "French",
    "Nail art",
  ];

  return (
    <>
      <nav className="navbar premium-nav">
        <div className="container nav-inner">
          <img className="nav-logo" src="/logo.png" alt="Raluca Duran Nails" />

          <div className="nav-links">
            <a href="#services">Servicii</a>
            <a href="#gallery">Galerie</a>
            <a href="#loyalty">Loyalty</a>
            <a href="/login">Cont</a>
            <a href="/programare?category=nails" className="btn-primary">
              Programare
            </a>
          </div>
        </div>
      </nav>

      <main>
        <section className="premium-hero">
          <div className="container premium-hero-grid">
            <div className="premium-hero-content">
              <p className="premium-kicker">Luxury Nails & Make-up • Ploiești</p>

              <h1 className="hero-title premium-title">
                Beauty experience by
                <br />
                Raluca Duran
              </h1>

              <p className="premium-text">
                Manichiuri premium, make-up elegant și o experiență creată pentru
                femeile care vor detalii impecabile.
              </p>

              <div className="hero-actions">
                <a href="/programare?category=nails" className="btn-primary">
                  Rezervă Nails
                </a>

                <a href="/programare?category=makeup" className="btn-secondary">
                  Rezervă Make-up
                </a>

                <a href="/login" className="btn-secondary">
                  Intră în cont
                </a>
              </div>
            </div>

            <div className="premium-hero-visual">
              <img src="/logo.png" alt="Raluca Duran Beauty" />
              <div className="luxury-badge">
                <span>Premium</span>
                <strong>Beauty Studio</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="premium-stats">
          <div className="container premium-stats-grid">
            <div>
              <strong>Luxury</strong>
              <span>experiență premium</span>
            </div>
            <div>
              <strong>Nails</strong>
              <span>design feminin & elegant</span>
            </div>
            <div>
              <strong>Make-up</strong>
              <span>evenimente & bridal</span>
            </div>
            <div>
              <strong>Rewards</strong>
              <span>puncte loyalty</span>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <h2 className="hero-title section-title">Servicii premium</h2>
            <p className="section-lead">
              Două direcții beauty, aceeași atenție pentru detalii: nails impecabil
              și make-up rafinat.
            </p>

            <div className="premium-service-layout">
              <div className="premium-service-card">
                <span className="premium-label">01</span>
                <h3>Nails</h3>
                <p>
                  Semi cu apex, gel, construcție, întreținere, slim nails, french
                  și nail art personalizat.
                </p>

                <div className="mini-service-list">
                  {nailServices.map((service) => (
                    <span key={service}>{service}</span>
                  ))}
                </div>

                <a href="/programare?category=nails" className="btn-primary">
                  Rezervă Nails
                </a>
              </div>

              <div className="premium-service-card dark">
                <span className="premium-label">02</span>
                <h3>Make-up</h3>
                <p>
                  Machiaj pentru evenimente, ședințe foto, bridal, glam sau look-uri
                  naturale, feminine și elegante.
                </p>

                <div className="mini-service-list">
                  <span>Make-up zi</span>
                  <span>Make-up seară</span>
                  <span>Bridal</span>
                  <span>Glam</span>
                </div>

                <a href="/programare?category=makeup" className="btn-primary">
                  Rezervă Make-up
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="gallery">
          <div className="container">
            <h2 className="hero-title section-title">Lucrări care vorbesc</h2>
            <p className="section-lead">
              Galerie administrabilă din admin. Tu doar urci pozele, iar ele apar
              automat aici.
            </p>

            <div className="premium-gallery-frame">
              <GallerySection category="nails" />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="hero-title section-title">De ce Raluca Duran Beauty</h2>

            <div className="premium-why-grid">
              <div>
                <strong>01</strong>
                <h3>Detalii impecabile</h3>
                <p>Fiecare serviciu este lucrat atent, curat și personalizat.</p>
              </div>

              <div>
                <strong>02</strong>
                <h3>Experiență premium</h3>
                <p>Programări clare, cont client, istoric și beneficii loyalty.</p>
              </div>

              <div>
                <strong>03</strong>
                <h3>Look complet</h3>
                <p>Nails și make-up într-un singur loc, pentru evenimente speciale.</p>
              </div>

              <div>
                <strong>04</strong>
                <h3>Rezervare rapidă</h3>
                <p>Alegi serviciul, data și ora direct online.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="premium-loyalty" id="loyalty">
          <div className="container premium-loyalty-box">
            <div>
              <p className="premium-kicker">Beauty rewards</p>
              <h2 className="hero-title section-title">Loyalty care chiar contează</h2>
              <p>
                Primești puncte la fiecare programare finalizată. La fiecare 5
                puncte primești încă 5% reducere, până la 20%.
              </p>
            </div>

            <div className="loyalty-card">
              <strong>5 puncte</strong>
              <span>5% reducere</span>
              <strong>10 puncte</strong>
              <span>10% reducere</span>
              <strong>20 puncte</strong>
              <span>20% reducere</span>

              <a href="/register" className="btn-primary">
                Creează cont
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container premium-cta">
            <h2 className="hero-title section-title">
              Ești pregătită pentru următoarea programare?
            </h2>

            <p className="section-lead">
              Alege serviciul, data și ora. Totul este rapid, clar și elegant.
            </p>

            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <a href="/programare?category=nails" className="btn-primary">
                Programează Nails
              </a>
              <a href="/programare?category=makeup" className="btn-secondary">
                Programează Make-up
              </a>
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container account-section">
            <h2 className="hero-title section-title">Contul tău beauty</h2>

            <p className="section-lead">
              Intră în cont pentru programări, istoric, puncte loyalty și reduceri.
            </p>

            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <a href="/login" className="btn-primary">
                Intră în cont
              </a>
              <a href="/register" className="btn-secondary">
                Creează cont
              </a>
            </div>
          </div>
        </section>

        <footer className="premium-footer">
          <div className="container premium-footer-grid">
            <div>
              <img className="footer-logo" src="/logo.png" alt="Raluca Duran Beauty" />
              <p>Raluca Duran Beauty • Luxury Nails & Make-up</p>
            </div>

            <div>
              <h3>Linkuri rapide</h3>
              <a href="/programare?category=nails">Booking Nails</a>
              <a href="/programare?category=makeup">Booking Make-up</a>
              <a href="/login">Cont client</a>
            </div>

            <div>
              <h3>Contact</h3>
              <a href="tel:0727707545">0727 707 545</a>
              <a href="#">WhatsApp link aici</a>
              <a href="#">TikTok link aici</a>
              <a href="#">Instagram link aici</a>
            </div>
          </div>

          <p className="footer-copy">© 2026 Raluca Duran Beauty</p>
        </footer>
      </main>
    </>
  );
}
