export default function Home() {
  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <div className="logo">Raluca Duran Nails</div>
          <a href="#contact" className="btn-primary">
            Programează-te
          </a>
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
                Manichiură semi cu apex, gel, construcție, întreținere, slim
                nails și nail art într-un studio elegant din Ploiești.
              </p>

              <a href="#contact" className="btn-primary">
                Rezervă acum
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}