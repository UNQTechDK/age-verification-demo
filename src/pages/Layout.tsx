import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="demo-site">
      <a className="skip-link" href="#main-content">
        Gå til hovedindhold
      </a>
      <header className="demo-header">
        <div className="demo-announcement">
          En demobutik fra UNQVerify <span aria-hidden="true">·</span> Prøv
          alderskontrol med MitID
        </div>
        <div className="store-shell demo-header__inner">
          <Link className="demo-brand" to="/" aria-label="UNQVerify demobutik">
            <img
              src="/unqverify-logo.png"
              alt="UNQVerify"
              width="1069"
              height="231"
            />
            <span className="demo-brand__label">DEMOBUTIK</span>
          </Link>
          <nav aria-label="Primær navigation">
            <Link
              to="/"
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              Butikken
            </Link>
            <Link
              to="/developer"
              aria-current={
                location.pathname === "/developer" ? "page" : undefined
              }
            >
              SDK-konsol
            </Link>
            <a
              className="demo-nav-signup"
              href="https://www.aldersverificering.dk/opret-konto"
            >
              Opret testkonto <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <a className="demo-header__cart" href="/#kurv">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 7h14l1 14H4L5 7Z" />
              <path d="M8 8V6a4 4 0 0 1 8 0v2" />
            </svg>
            <span>Din kurv</span>
          </a>
        </div>
      </header>

      <Outlet />

      <footer className="demo-footer">
        <div className="store-shell demo-footer__grid">
          <div>
            <img
              className="demo-footer__logo"
              src="/unqverify-logo.png"
              alt="UNQVerify"
              width="1069"
              height="231"
            />
            <p className="demo-footer__brand">NORDHANDEL</p>
            <p>
              En fungerende referencebutik bygget med UNQVerify og MitID-test.
            </p>
          </div>
          <div>
            <p className="demo-footer__label">Ressourcer</p>
            <a href="https://www.aldersverificering.dk/docs/getting-started">
              Dokumentation
            </a>
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
