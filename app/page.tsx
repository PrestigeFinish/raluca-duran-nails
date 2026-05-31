import GallerySection from "../components/GallerySection";import { createClient } from "@supabase/supabase-js";export const dynamic = "force-dynamic";const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);export default async function Home() {const { data: activeOffer } = await supabase.from("monthly_offers").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();const nailServices = [{ name: "Semi cu apex", price: "80 lei" },{ name: "Construcție gel", price: "130 lei" },{ name: "Întreținere gel", price: "110 lei" },{ name: "Slim construcție", price: "150 lei" },{ name: "Slim întreținere", price: "130 lei" },{ name: "Demontare", price: "80 lei" },{ name: "French glass", price: "+50 lei" },{ name: "Nail art, stickere și decorațiuni", price: "Incluse în preț" },];

return (<>

      <div className="nav-links">
        <a href="#services">Nails</a>
        <a href="/makeup">Make-up</a>
        <a href="#gallery">Galerie</a>
        <a href="#loyalty">Loyalty</a>
        <a href="/login">Cont</a>
        <a href="#">Instagram</a>
        <a href="#">TikTok</a>
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
          <p className="premium-kicker">Nails • Make-up • Ploiești</p>

          <h1 className="hero-title premium-title">
            Nail studio by
            <br />
            Raluca Duran
          </h1>

          <p className="beauty-signature">
            Beauty experience by Raluca Duran
          </p>

          <p className="premium-text">
            Manichiuri elegante, feminine și atent lucrate: semi cu apex,
            gel, construcție, întreținere, slim nails și nail art.
            Pentru momente speciale, studioul oferă și servicii de make-up.
          </p>

         <div className="hero-actions">

        <div className="premium-hero-visual clean-logo-visual">
          <img src="/logo.png" alt="Raluca Duran Nails" />
        </div>
      </div>
    </section>
    {activeOffer && (

    <section className="premium-stats">
      <div className="container premium-stats-grid">
        <div>
          <strong>Nails</strong>
          <span>semi, gel, slim & art</span>
        </div>
        <div>
          <strong>Make-up</strong>
          <span>evenimente & glam</span>
        </div>
        <div>
          <strong>Online</strong>
          <span>programări rapide</span>
        </div>
        <div>
          <strong>Rewards</strong>
          <span>puncte loyalty</span>
        </div>
      </div>
    </section>

    <section className="section" id="services">
      <div className="container">
        <h2 className="hero-title section-title">Servicii & Prețuri Nails</h2>
        <p className="section-lead">
          Alege serviciul potrivit pentru stilul tău. Pentru nail art,
          prețul poate varia în funcție de complexitatea modelului.
        </p>

        <div className="services-grid premium-price-grid">
          {nailServices.map((service, index) => (
            <div key={index} className="service-card premium-price-card">
              <span>{service.name}</span>
              <strong>{service.price}</strong>
            </div>
          ))}
        </div>
        <p className="section-lead" style={{ marginTop: 28 }}>

Pentru construcții / întrețineri peste mărimea 4 se adaugă +10 lei / mărime.

        <div className="center-actions">
          <a href="/programare?category=nails" className="btn-primary">
            Programează Nails
          </a>
        </div>
      </div>
    </section>

    <section className="section section-soft">
      <div className="container">
        <div className="premium-makeup-banner">
          <div>
            <p className="premium-kicker">Make-up by Raluca Duran</p>
            <h2 className="hero-title section-title">
              Look complet pentru evenimente
            </h2>
            <p>
              Machiaj elegant, feminin și luminos pentru evenimente, ședințe
              foto, ocazii speciale și momente în care vrei să te simți impecabil.
            </p>
          </div>

          <div className="makeup-banner-actions">
            <a href="/makeup" className="btn-primary">
              Deschide pagina Make-up
            </a>
            <a href="/programare?category=makeup" className="btn-secondary">
              Programare Make-up
            </a>
          </div>
        </div>
      </div>
    </section>

    <section className="section section-soft" id="gallery">
      <div className="container">
        <h2 className="hero-title section-title">Galerie Nails</h2>
        <p className="section-lead">
          Galerie administrabilă din admin. Pozele încărcate pentru Nails apar automat aici.
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
            <h3>Detalii curate</h3>
            <p>Lucrări feminine, elegante și atent finisate.</p>
          </div>

          <div>
            <strong>02</strong>
            <h3>Booking online</h3>
            <p>Alegi serviciul, data și ora direct pe site.</p>
          </div>

          <div>
            <strong>03</strong>
            <h3>Cont client</h3>
            <p>Vezi programările, istoricul, punctele și reducerile.</p>
          </div>

          <div>
            <strong>04</strong>
            <h3>Loyalty</h3>
            <p>Strângi puncte și primești reduceri până la 20%.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="premium-loyalty" id="loyalty">
      <div className="container premium-loyalty-box">
        <div>
          <p className="premium-kicker">Beauty rewards</p>
          <h2 className="hero-title section-title">
            Loyalty pentru clientele care revin
          </h2>
          <p>
            La fiecare programare finalizată primești puncte. 5 puncte =
            5% reducere, 10 puncte = 10%, până la 20%.
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
            Programare Nails
          </a>
          <a href="/programare?category=makeup" className="btn-secondary">
            Programare Make-up
          </a>
          <a href="/login" className="btn-secondary">
            Cont client
          </a>
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
          <a href="/">Nails</a>
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

);}
