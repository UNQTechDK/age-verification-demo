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

## 📦 SDK

This demo uses the official UNQTech SDK:

**👉 [`@unqtech/age-verification-mitid`](https://www.npmjs.com/package/@unqtech/age-verification-mitid)**

```bash
npm install @unqtech/age-verification-mitid
```

---

## 📄 License

MIT © UNQTech ApS
