import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./global.css";
import Home from "./pages/home";
import ReactDOM from "react-dom/client";
import VerificationResult from "./pages/verificationResult";
import Layout from "./pages/Layout";
import VerifyPopup from "./pages/verficationPopup";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/verification-result" element={<VerificationResult />} />
        <Route path="/verify-popup" element={<VerifyPopup />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
