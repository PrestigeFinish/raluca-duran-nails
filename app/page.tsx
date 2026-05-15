export default function Home() {
  const services = [
    { name: "Semi cu apex", price: "90 lei" },
    { name: "Construcție 1–3", price: "120 lei" },
    { name: "Construcție 4–6", price: "140 lei" },
    { name: "Întreținere gel 1–3", price: "120 lei" },
    { name: "Întreținere gel 4–6", price: "150 lei" },
    { name: "Slim construcție", price: "170 lei" },
    { name: "Slim întreținere", price: "160 lei" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-inner">
          <img
            src="/logo.png"
            alt="Raluca Duran Nails"
            style={{ height: "70px" }}
          />

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
                Eleganță, finețe și manichiuri create cu atenție la fiecare
                detaliu. Semi, gel, construcție, slim nails și nail art.
              </p>

              <a href="#contact" className="btn-primary">
                Rezervă acum
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2
              className="hero-title"
              style={{
                fontSize: "54px",
                marginBottom: "50px",
                textAlign: "center",
              }}
            >
              Servicii & Prețuri
            </h2>

            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              {services.map((service, index) => (
                <div
                  key={index}
                  style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  }}
                >
                  <span>{service.name}</span>
                  <strong>{service.price}</strong>
                </div>
              ))}
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
                fontSize: "54px",
                marginBottom: "20px",
              }}
            >
              Programează-te
            </h2>

            <p
              style={{
                fontSize: "20px",
                marginBottom: "30px",
                color: "#6d5d50",
              }}
            >
              Ploiești • Nail appointments by Raluca Duran
            </p>

            <a href="#" className="btn-primary">
              Contactează-mă
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
