import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="demo-site">
      <a className="skip-link" href="#main-content">
        Gå til hovedindhold
      </a>
      <header className="demo-header">
        <div className="store-shell demo-header__inner">
          <Link className="demo-brand" to="/" aria-label="UNQVerify demobutik">
            <span className="demo-brand__mark" aria-hidden="true">
              U
            </span>
            <span>
              <strong>NORDHANDEL</strong>
              <small>en UNQVerify-demobutik</small>
            </span>
          </Link>
          <nav aria-label="Primær navigation">
            <Link
              to="/"
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              Demobutik
            </Link>
            <Link
              to="/developer"
              aria-current={
                location.pathname === "/developer" ? "page" : undefined
              }
            >
              SDK-konsol
            </Link>
            <a href="https://www.aldersverificering.dk/docs/getting-started">
              Dokumentation <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <a
            className="demo-header__badge"
            href="https://www.aldersverificering.dk"
          >
            Testmiljø
          </a>
          <Link className="demo-header__mobile-link" to="/developer">
            SDK
          </Link>
        </div>
      </header>

      <Outlet />

      <footer className="demo-footer">
        <div className="store-shell demo-footer__grid">
          <div>
            <p className="demo-footer__brand">NORDHANDEL</p>
            <p>
              En fungerende referencebutik bygget med UNQVerify og MitID-test.
            </p>
          </div>
          <div>
            <p className="demo-footer__label">Ressourcer</p>
            <a href="https://www.aldersverificering.dk/docs/sdk/react">
              Integrationsguide
            </a>
            <a href="https://www.npmjs.com/package/@unqtech/age-verification-mitid">
              Npm-pakke
            </a>
            <a href="https://github.com/UNQTechDK/age-verification-demo">
              Kildekode
            </a>
          </div>
          <div>
            <p className="demo-footer__label">Om demoen</p>
            <p>
              Varer, butik og ordrer er fiktive. Der gennemføres ingen betaling.
            </p>
          </div>
        </div>
        <div className="store-shell demo-footer__bottom">
          <span>© {new Date().getFullYear()} UNQTech ApS</span>
          <span>MitID er et registreret varemærke tilhørende MitID.</span>
        </div>
      </footer>
    </div>
  );
}
