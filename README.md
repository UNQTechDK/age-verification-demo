# UNQVerify Demo – Age Verification via MitID

Live demo of the [@unqtech/age-verification-mitid](https://www.npmjs.com/package/@unqtech/age-verification-mitid) SDK.

This app demonstrates how to use the UNQVerify SDK to perform secure, cookie-based age verification using MitID – Denmark's national digital identity.

> 🔐 Want to verify user age in your own app or webshop?  
> 👉 [Buy a subscription at aldersverificering.dk](https://www.aldersverificering.dk/)

---

## 🌐 Live Demo

[Try the demo on Vercel ↗](https://age-verification-demo.vercel.app)

---

## 🧠 Features

- ✅ React + Vite + Tailwind CSS
- ✅ Dark/light mode toggle
- ✅ Dynamic `ageToVerify` and `redirectUri`
- ✅ Full integration with the public `@unqtech/age-verification-mitid` SDK
- ✅ Granular SDK outcome handling (`onDenied`, `onCancelled`, `onError`)
- ✅ Cookie persistence & token decoding
- ✅ Environment-variable-powered configuration

---

## 🧪 Getting Started Locally

### 1. Clone this repo

```bash
git clone https://github.com/UNQTechDK/age-verification-demo.git
cd age-verification-demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set your public key

Create a `.env` file:

```bash
echo "VITE_PUBLIC_KEY=pk_test_abc123" > .env
```

(Replace with your actual public key)

### 4. Run the app

```bash
npm run dev
```

---

## 🧪 Testing with MitID

This demo uses **test mode** credentials only. Production MitID credentials will not work in this demo environment.

### Getting Test Credentials

To complete the verification flow, you need MitID test credentials from the official test tool:

**👉 [pp.mitid.dk](https://pp.mitid.dk/)**

### How to Test

1. **Get test credentials** from [pp.mitid.dk](https://pp.mitid.dk/)
2. **Configure the demo**: Choose your verification mode (Redirect or Popup) and set the age to verify
3. **Start verification**: Click "▶ Start Verification"
4. **Use test credentials**: When redirected to MitID, use the test credentials from step 1
5. **Complete verification**: After successful authentication, you'll be redirected back to the demo

### Expected Outcomes

- **Verified**: User meets the required age and verification succeeds
- **Denied**: User is authenticated but does not meet the required age
- **Cancelled**: Popup closed / verification cancelled / popup timeout
- **Error**: Technical issues (for example token/network issues)

### Test vs Production Keys

- **Test keys** start with `pk_test_` and route to the test API (`test.api.aldersverificering.dk`)
- **Production keys** start with `pk_live_` and require a paid subscription from [aldersverificering.dk](https://www.aldersverificering.dk/)
- Test credentials from pp.mitid.dk **only work with test keys**
- Real MitID accounts **only work with production keys**

### Verification Modes

This demo showcases two integration modes:

- **Redirect Mode**: Full page redirect to MitID (recommended for mobile)
- **Popup Mode**: Opens MitID in a popup window (desktop only)

Choose the mode that best fits your application's user experience.

---

## 📦 SDK

This demo uses the official UNQTech SDK:

**👉 [`@unqtech/age-verification-mitid`](https://www.npmjs.com/package/@unqtech/age-verification-mitid)**

```bash
npm install @unqtech/age-verification-mitid
```

---

## 📄 License

MIT © UNQTech ApS
