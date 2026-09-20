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
  imageZoom: number;
};

const products: Product[] = [
  {
    id: "lager",
    name: "Kyst Lager",
    description: "Lys, alkoholfri demovare med et konfigureret 16-årskrav.",
    price: 42,
    age: 16,
    imagePosition: "82% 48%",
    imageZoom: 2.35,
  },
  {
    id: "aperitif",
    name: "Fjord Aperitif",
    description: "Fiktiv spiritusvare, der løfter kurvens alderskrav til 18 år.",
    price: 249,
    age: 18,
    imagePosition: "58% 48%",
    imageZoom: 2,
  },
  {
    id: "mint",
    name: "Nord Mint",
    description: "Fiktiv nikotinpose til demonstration af et fast 18-årskrav.",
    price: 49,
    age: 18,
    imagePosition: "94% 78%",
    imageZoom: 2.7,
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
      const popup = window.open(
        "",
        "unqverify-popup",
        "width=500,height=650",
      );

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
            <p className="store-eyebrow">Interaktiv referencebutik</p>
            <h1>Alderskontrol, hvor den faktisk skal virke.</h1>
            <p className="store-hero__intro">
              Læg en demovare i kurven, og se hvordan UNQVerify beregner
              alderskravet og starter MitID direkte fra checkout.
            </p>
            <div className="store-hero__actions">
              <a className="store-button store-button--primary" href="#varer">
                Prøv checkout-flowet
              </a>
              <a className="store-text-link" href="/developer">
                Se SDK-konsollen <span aria-hidden="true">↗</span>
              </a>
            </div>
            <dl className="store-proof">
              <div>
                <dt>SDK</dt>
                <dd>@unqtech/age-verification-mitid</dd>
              </div>
              <div>
                <dt>Miljø</dt>
                <dd>MitID test</dd>
              </div>
              <div>
                <dt>Data til butikken</dt>
                <dd>Verificeret alderskrav</dd>
              </div>
            </dl>
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
              Fiktive varer · ingen betaling · kun testdata
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="store-demo" id="varer" aria-labelledby="products-heading">
        <div className="store-shell store-demo__heading">
          <div>
            <p className="store-eyebrow">Vælg et scenarie</p>
            <h2 id="products-heading">Byg en kurv med et rigtigt alderskrav</h2>
          </div>
          <p>
            Checkout anvender altid det højeste krav i kurven. Bland eksempelvis
            en 16+ vare med en 18+ vare og se reglen ændre sig.
          </p>
        </div>

        <div className="store-shell store-demo__layout">
          <div className="store-products">
            {products.map((product, index) => (
              <article className="store-product" key={product.id}>
                <div className="store-product__image">
                  <img
                    src="/demo-products-v1.webp"
                    alt=""
                    width="1536"
                    height="1024"
                    loading="lazy"
                    style={{
                      objectPosition: product.imagePosition,
                      transformOrigin: product.imagePosition,
                      transform: `scale(${product.imageZoom})`,
                    }}
                  />
                  <span className="store-age-badge">{product.age}+</span>
                  <span className="store-product__number">
                    0{index + 1}
                  </span>
                </div>
                <div className="store-product__body">
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
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      Læg i kurv <span aria-hidden="true">+</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <aside className="store-checkout" aria-labelledby="checkout-heading">
            <div className="store-checkout__topline">
              <p>Demo-checkout</p>
              <span>{itemCount} varer</span>
            </div>
            <h2 id="checkout-heading">Din kurv</h2>

            {cartProducts.length ? (
              <ul className="store-cart-list">
                {cartProducts.map((product) => (
                  <li key={product.id}>
                    <div>
                      <span>{cart[product.id]} ×</span> {product.name}
                    </div>
                    <strong>{formatPrice(product.price * cart[product.id])}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="store-empty-cart">
                Læg en vare i kurven for at prøve alderskontrollen.
              </p>
            )}

            <div className="store-checkout__total">
              <span>Subtotal</span>
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
                      {loading ? "Åbner…" : `Bekræft ${requiredAge || ""}+ med MitID`}
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
          <p className="store-eyebrow">Det originale eksempel</p>
          <h2 id="flow-heading">Fra produktregel til verificeret checkout</h2>
          <ol>
            <li>
              <span>01</span>
              <h3>Kurven fastlægger kravet</h3>
              <p>Den strengeste produktregel bliver sendt som ageToVerify.</p>
            </li>
            <li>
              <span>02</span>
              <h3>SDK’et starter MitID</h3>
              <p>Npm-pakken håndterer redirect eller popup og validerer svaret.</p>
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
