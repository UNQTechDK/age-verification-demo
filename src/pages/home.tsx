import { useEffect, useMemo, useState } from "react";
import {
  getVerifiedAge,
  init,
  isVerified,
  resetVerification,
  startVerificationWithPopup,
  startVerificationWithRedirect,
  type VerificationOutcome,
} from "@unqtech/age-verification-mitid";

type Product = {
  id: "lager" | "aperitif" | "mint";
  name: string;
  description: string;
  price: number;
  age: 16 | 18;
  imagePosition: string;
};

const products: Product[] = [
  {
    id: "lager",
    name: "Kyst Lager",
    description: "Lys, alkoholfri demovare med et konfigureret 16-årskrav.",
    price: 42,
    age: 16,
    imagePosition: "0% 50%",
  },
  {
    id: "aperitif",
    name: "Fjord Aperitif",
    description:
      "Fiktiv spiritusvare, der løfter kurvens alderskrav til 18 år.",
    price: 249,
    age: 18,
    imagePosition: "50% 50%",
  },
  {
    id: "mint",
    name: "Nord Mint",
    description: "Fiktiv nikotinpose til demonstration af et fast 18-årskrav.",
    price: 49,
    age: 18,
    imagePosition: "100% 50%",
  },
];

function getOutcomeMessage(outcome: VerificationOutcome): string {
  switch (outcome.code) {
    case "UNDER_AGE":
      return "Alderskravet blev ikke opfyldt.";
    case "POPUP_CLOSED":
    case "USER_CANCELLED":
    case "POPUP_TIMEOUT":
      return "Verifikationen blev afbrudt, før den var færdig.";
    case "POPUP_BLOCKED":
      return "Popup-vinduet blev blokeret. Tillad popups, og prøv igen.";
    case "NETWORK_ERROR":
      return "Der opstod en netværksfejl. Prøv igen.";
    case "TOKEN_INVALID":
      return "Verifikationssvaret kunne ikke valideres. Prøv igen.";
    case "UNTRUSTED_ORIGIN":
      return "Verifikationssvaret kom fra en ukendt kilde og blev afvist.";
    default:
      return outcome.message || "Verifikationen kunne ikke gennemføres.";
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Home() {
  const [cart, setCart] = useState<Record<Product["id"], number>>({
    lager: 1,
    aperitif: 0,
    mint: 0,
  });
  const [mode, setMode] = useState<"redirect" | "popup">("redirect");
  const [verifiedAge, setVerifiedAge] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);

  const cartProducts = useMemo(
    () => products.filter((product) => cart[product.id] > 0),
    [cart],
  );
  const itemCount = cartProducts.reduce(
    (total, product) => total + cart[product.id],
    0,
  );
  const subtotal = cartProducts.reduce(
    (total, product) => total + product.price * cart[product.id],
    0,
  );
  const requiredAge = cartProducts.reduce(
    (highest, product) => Math.max(highest, product.age),
    0,
  );
  const isAgeApproved =
    isVerified() && verifiedAge !== null && verifiedAge >= requiredAge;

  const refreshVerification = () => {
    const age = getVerifiedAge();
    setVerifiedAge(typeof age === "number" ? age : null);
  };

  useEffect(() => {
    refreshVerification();
    const handler = () => refreshVerification();
    window.addEventListener("unqverify:updated", handler);
    return () => window.removeEventListener("unqverify:updated", handler);
  }, []);

  useEffect(() => {
    setOrderComplete(false);
    setErrorMessage("");
  }, [cart]);

  const updateQuantity = (id: Product["id"], delta: number) => {
    setCart((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(9, current[id] + delta)),
    }));
  };

  const configureVerification = () => {
    const redirectPath =
      mode === "popup" ? "/verify-popup" : "/verification-result";
    const redirectUri = `${window.location.origin}${redirectPath}`;

    init({
      publicKey: import.meta.env.VITE_PUBLIC_KEY,
      ageToVerify: requiredAge,
      redirectUri,
      onVerified: () => {
        setLoading(false);
        setErrorMessage("");
        refreshVerification();
      },
      onDenied: (outcome) => {
        setLoading(false);
        setErrorMessage(getOutcomeMessage(outcome));
        refreshVerification();
      },
      onCancelled: (outcome) => {
        setLoading(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onError: (outcome) => {
        setLoading(false);
        setErrorMessage(getOutcomeMessage(outcome));
      },
      onFailure: () => {
        setLoading(false);
        setErrorMessage(
          "Testflowet kunne ikke startes. Kontrollér testmiljøet, og prøv igen.",
        );
      },
    });
  };

  const startVerification = () => {
    if (!requiredAge) return;

    setLoading(true);
    setErrorMessage("");
    setOrderComplete(false);

    if (mode === "popup") {
      const popup = window.open("", "unqverify-popup", "width=500,height=650");

      if (!popup) {
        setLoading(false);
        setErrorMessage(
          "Popup-vinduet blev blokeret. Tillad popups, og prøv igen.",
        );
        return;
      }

      configureVerification();
      startVerificationWithPopup(popup);
      return;
    }

    configureVerification();
    startVerificationWithRedirect();
  };

  const clearVerification = () => {
    resetVerification();
    setVerifiedAge(null);
    setLoading(false);
    setErrorMessage("");
    setOrderComplete(false);
  };

  return (
    <main id="main-content">
      <section className="store-hero">
        <div className="store-shell store-hero__grid">
          <div className="store-hero__copy">
            <p className="store-eyebrow">NORDHANDEL / DEMOKOLLEKTIONEN</p>
            <h1>
              God smag.
              <br />
              <em>Tryg handel.</em>
            </h1>
            <p className="store-hero__intro">
              Gå på opdagelse i vores lille demobutik. Vælg dine varer, og oplev
              en enkel alderskontrol med MitID i checkout.
            </p>
            <div className="store-hero__actions">
              <a className="store-button store-button--primary" href="#varer">
                Se kollektionen <span aria-hidden="true">↗</span>
              </a>
              <a className="store-text-link" href="#flow-heading">
                Sådan virker det
              </a>
            </div>
            <p className="store-hero__disclaimer">
              <span aria-hidden="true">◌</span> Fiktive varer. Rigtigt testflow.
              Ingen betaling.
            </p>
          </div>
          <figure className="store-hero__visual">
            <img
              src="/demo-products-v1.webp"
              alt="Tre fiktive demovarer: aperitif, øl og nikotinposer"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <figcaption>
              <span>DEN LILLE KOLLEKTION</span>
              <strong>
                Nordiske nuancer.
                <br />
                En enkel oplevelse.
              </strong>
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="store-benefits store-shell" aria-label="Om demobutikken">
        <span>
          <b aria-hidden="true">01</b> Udvælg dine demovarer
        </span>
        <span>
          <b aria-hidden="true">02</b> Bekræft din alder med MitID
        </span>
        <span>
          <b aria-hidden="true">03</b> Prøv checkout uden betaling
        </span>
      </div>

      <section
        className="store-demo"
        id="varer"
        aria-labelledby="products-heading"
      >
        <div className="store-shell store-demo__heading">
          <div>
            <p className="store-eyebrow">ET LILLE, UDVALGT SORTIMENT</p>
            <h2 id="products-heading">Find dine favoritter.</h2>
          </div>
          <p>
            Tre demovarer. To alderskrav. Læg en 18+ vare i kurven, og se
            alderskravet tilpasse sig automatisk.
          </p>
        </div>

        <div className="store-shell store-demo__layout">
          <div className="store-products">
            {products.map((product, index) => (
              <article className="store-product" key={product.id}>
                <div
                  className="store-product__image"
                  style={{ backgroundPosition: product.imagePosition }}
                >
                  <span className="store-age-badge">{product.age}+</span>
                  <span className="store-product__number">
                    DEMOVARE / 0{index + 1}
                  </span>
                </div>
                <div className="store-product__body">
                  <p className="store-product__category">
                    {product.id === "lager"
                      ? "ALKOHOLFRI LAGER"
                      : product.id === "aperitif"
                        ? "APERITIF"
                        : "NIKOTINPOSER"}
                  </p>
                  <div className="store-product__title-row">
                    <h3>{product.name}</h3>
                    <p>{formatPrice(product.price)}</p>
                  </div>
                  <p className="store-product__description">
                    {product.description}
                  </p>
                  {cart[product.id] ? (
                    <div
                      className="store-quantity"
                      aria-label={`Antal ${product.name}`}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        aria-label={`Fjern en ${product.name}`}
                      >
                        −
                      </button>
                      <span>{cart[product.id]}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        aria-label={`Tilføj en ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="store-add-button"
                      type="button"
                      aria-label={`Læg ${product.name} i kurv`}
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      Læg i kurv <span aria-hidden="true">+</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <aside
            className="store-checkout"
            id="kurv"
            aria-labelledby="checkout-heading"
          >
            <div className="store-checkout__topline">
              <p>DIN INDKØBSPOSE</p>
              <span>
                {itemCount} {itemCount === 1 ? "vare" : "varer"}
              </span>
            </div>
            <h2 id="checkout-heading">Din kurv</h2>

            {cartProducts.length ? (
              <ul className="store-cart-list">
                {cartProducts.map((product) => (
                  <li key={product.id}>
                    <div className="store-cart-item">
                      <span
                        className="store-cart-thumb"
                        style={{ backgroundPosition: product.imagePosition }}
                        aria-hidden="true"
                      />
                      <div>
                        <b>{product.name}</b>
                        <small>
                          {cart[product.id]} stk.{" "}
                          <span aria-hidden="true">·</span> {product.age}+
                          demovare
                        </small>
                      </div>
                    </div>
                    <strong>
                      {formatPrice(product.price * cart[product.id])}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="store-empty-cart">
                Læg en vare i kurven for at prøve alderskontrollen.
              </p>
            )}

            <div className="store-checkout__total">
              <span>
                I alt <small>inkl. moms · demopriser</small>
              </span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {requiredAge ? (
              <div className="store-requirement" aria-live="polite">
                <div className="store-requirement__age">{requiredAge}+</div>
                <div>
                  <strong>Kurvens alderskrav</strong>
                  <p>Bestemmes af varen med det højeste krav.</p>
                </div>
              </div>
            ) : null}

            {isAgeApproved ? (
              <div className="store-approved">
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>Alderskontrol gennemført</strong>
                  <p>Verificeret til {verifiedAge}+ i denne browser.</p>
                </div>
              </div>
            ) : null}

            {orderComplete ? (
              <div className="store-order-complete" role="status">
                <span>Demoordre gennemført</span>
                <p>Der er ikke oprettet en ordre eller gennemført betaling.</p>
              </div>
            ) : (
              <>
                {!isAgeApproved && requiredAge ? (
                  <fieldset className="store-mode">
                    <legend>Åbn MitID med</legend>
                    <label>
                      <input
                        type="radio"
                        name="mode"
                        value="redirect"
                        checked={mode === "redirect"}
                        onChange={() => setMode("redirect")}
                      />
                      Redirect
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="mode"
                        value="popup"
                        checked={mode === "popup"}
                        onChange={() => setMode("popup")}
                      />
                      Popup
                    </label>
                  </fieldset>
                ) : null}

                {isAgeApproved ? (
                  <button
                    className="store-button store-button--primary store-button--full"
                    type="button"
                    onClick={() => setOrderComplete(true)}
                  >
                    Gennemfør demoordre
                  </button>
                ) : (
                  <button
                    className="mitid-cta store-button--full"
                    type="button"
                    onClick={startVerification}
                    disabled={!requiredAge || loading}
                    aria-busy={loading}
                  >
                    <img
                      className="mitid-cta__logo"
                      src="/mitid-logo-white.png"
                      alt=""
                      width="732"
                      height="198"
                      aria-hidden="true"
                    />
                    <span translate="no">
                      {loading
                        ? "Åbner…"
                        : requiredAge
                          ? `Bekræft ${requiredAge}+ med MitID`
                          : "Læg en vare i kurven"}
                    </span>
                  </button>
                )}
              </>
            )}

            {errorMessage ? (
              <p className="store-error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            {verifiedAge !== null ? (
              <button
                className="store-reset"
                type="button"
                onClick={clearVerification}
              >
                Nulstil testverifikation
              </button>
            ) : null}

            <p className="store-test-note">
              Testmiljø: Du skal bruge MitID-testlegitimationsoplysninger fra
              den officielle testportal. Ingen betaling gennemføres.
            </p>
          </aside>
        </div>
      </section>

      <section className="store-flow" aria-labelledby="flow-heading">
        <div className="store-shell">
          <p className="store-eyebrow">EN NATURLIG DEL AF CHECKOUT</p>
          <h2 id="flow-heading">
            Lidt mindre friktion.
            <br />
            Lidt mere tryghed.
          </h2>
          <ol>
            <li>
              <span>01</span>
              <h3>Kurven fastlægger kravet</h3>
              <p>Den strengeste produktregel bliver sendt som ageToVerify.</p>
            </li>
            <li>
              <span>02</span>
              <h3>SDK’et starter MitID</h3>
              <p>
                Npm-pakken håndterer redirect eller popup og validerer svaret.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>Checkout får et resultat</h3>
              <p>Butikken fortsætter først, når alderskravet er opfyldt.</p>
            </li>
          </ol>
          <div className="store-code-line">
            <code>{`init({ ageToVerify: ${requiredAge || 18}, redirectUri })`}</code>
            <a href="/developer">Åbn den tekniske demo</a>
          </div>
        </div>
      </section>
    </main>
  );
}
