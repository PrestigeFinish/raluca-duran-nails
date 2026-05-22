import GallerySection from "../components/GallerySection";

export default function Home() {
  return (
    <>
      <nav className="navbar premium-nav">
        <div className="container nav-inner">
          <a href="/">
            <img className="nav-logo" src="/logo.png" alt="Raluca Duran Beauty" />
          </a>

          <div className="nav-links">
            <a href="/nails">Nails</a>
            <a href="/makeup">Make-up</a>
            <a href="/programare?category=nails">Booking</a>
            <a href="/login">Cont</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="TikTok">TikTok</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="premium-hero">
          <div className="container premium-hero-grid">
            <div className="premium-hero-content">
              <p className="premium-kicker">Raluca Duran Beauty • Ploiești</p>

              <h1 className="hero-title premium-title">
                Nails premium.
                <br />
                Make-up elegant.
                <br />
                Beauty experience.
              </h1>

              <p className="premium-text">
                Un studio dedicat detaliilor impecabile: manichiuri elegante,
                slim nails, nail art, make-up pentru evenimente și o experiență
                online completă pentru programări, cont client și loyalty.
              </p>

              <div className="hero-actions">
                <a href="/nails" className="btn-primary">Pagina Nails</a>
                <a href="/makeup" className="btn-secondary">Pagina Make-up</a>
                <a href="/login" className="btn-secondary">Intră în cont</a>
              </div>
            </div>

            <div className="premium-hero-visual clean-logo-visual">
              <img src="/logo.png" alt="Raluca Duran Beauty" />
            </div>
          </div>
        </section>

        <section className="premium-stats">
          <div className="container premium-stats-grid">
            <div><strong>Nails</strong><span>activitatea principală</span></div>
            <div><strong>Make-up</strong><span>evenimente & glam</span></div>
            <div><strong>Online</strong><span>programări rapide</span></div>
            <div><strong>Loyalty</strong><span>puncte & reduceri</span></div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <h2 className="hero-title section-title">Alege experiența</h2>
            <p className="section-lead">
              Două pagini separate, fiecare cu servicii, prețuri, galerie și booking dedicat.
            </p>

            <div className="premium-service-layout">
              <div className="premium-service-card">
                <span className="premium-label">Main service</span>
                <h3>Nails</h3>
                <p>
                  Semi cu apex, construcție, întreținere, slim nails, french,
                  nail art și detalii fine pentru o manichiură premium.
                </p>

                <div className="mini-service-list">
                  <span>Semi cu apex</span>
                  <span>Gel</span>
                  <span>Slim nails</span>
                  <span>French</span>
                  <span>Nail art</span>
                </div>

                <a href="/nails" className="btn-primary">Vezi Nails</a>
              </div>

              <div className="premium-service-card dark">
                <span className="premium-label">Beauty add-on</span>
                <h3>Make-up</h3>
                <p>
                  Machiaj de zi, seară, eveniment, bridal și look-uri elegante
                  pentru momente speciale.
                </p>

                <div className="mini-service-list">
                  <span>Eveniment</span>
                  <span>Bridal</span>
                  <span>Glam</span>
                  <span>Photoshoot</span>
                </div>

                <a href="/makeup" className="btn-primary">Vezi Make-up</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="gallery">
          <div className="container">
            <h2 className="hero-title section-title">Galerie Nails</h2>
            <p className="section-lead">
              Galerie administrabilă din admin. Tu doar urci pozele, iar ele apar automat.
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
              <div><strong>01</strong><h3>Detalii curate</h3><p>Lucrări feminine, elegante și atent finisate.</p></div>
              <div><strong>02</strong><h3>Booking online</h3><p>Alegi serviciul, data și ora direct pe site.</p></div>
              <div><strong>03</strong><h3>Cont client</h3><p>Vezi programările, istoricul, punctele și reducerile.</p></div>
              <div><strong>04</strong><h3>Loyalty</h3><p>Strângi puncte și primești reduceri până la 20%.</p></div>
            </div>
          </div>
        </section>

        <section className="premium-loyalty">
          <div className="container premium-loyalty-box">
            <div>
              <p className="premium-kicker">Beauty rewards</p>
              <h2 className="hero-title section-title">Loyalty pentru clientele care revin</h2>
              <p>
                La fiecare programare finalizată primești puncte. 5 puncte = 5% reducere,
                10 puncte = 10%, până la 20%.
              </p>
            </div>

            <div className="loyalty-card">
              <strong>5 puncte</strong><span>5% reducere</span>
              <strong>10 puncte</strong><span>10% reducere</span>
              <strong>20 puncte</strong><span>20% reducere</span>
              <a href="/register" className="btn-primary">Creează cont</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container premium-cta">
            <h2 className="hero-title section-title">Pregătită pentru următoarea programare?</h2>
            <p className="section-lead">
              Alege Nails sau Make-up și rezervă direct online.
            </p>

            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <a href="/programare?category=nails" className="btn-primary">Booking Nails</a>
              <a href="/programare?category=makeup" className="btn-secondary">Booking Make-up</a>
              <a href="/login" className="btn-secondary">Cont client</a>
            </div>
          </div>
        </section>

        <footer className="premium-footer">
          <div className="container premium-footer-grid">
            <div>
              <img className="footer-logo" src="/logo.png" alt="Raluca Duran Beauty" />
              <p>Raluca Duran Beauty • Nails & Make-up</p>
            </div>

            <div>
              <h3>Pagini</h3>
              <a href="/nails">Nails</a>
              <a href="/makeup">Make-up</a>
              <a href="/programare?category=nails">Booking Nails</a>
              <a href="/programare?category=makeup">Booking Make-up</a>
              <a href="/login">Cont client</a>
            </div>

            <div>
              <h3>Social & contact</h3>
              <a href="tel:0727707545">0727 707 545</a>
              <a href="#">WhatsApp link aici</a>
              <a href="#">Instagram link aici</a>
              <a href="#">TikTok link aici</a>
            </div>
          </div>

          <p className="footer-copy">© 2026 Raluca Duran Beauty</p>
        </footer>
      </main>
    </>
  );
}
