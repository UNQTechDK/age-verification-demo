import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""} data-theme={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-green-400 font-mono transition-colors">
        <header className="p-4 text-xs flex justify-between items-center h-20">
          <span>UNQVerify SDK Demo</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xs px-3 py-1 border border-green-400 rounded hover:bg-green-700 hover:text-black dark:hover:bg-green-200 dark:hover:text-black transition-colors"
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>
        <main className="p-4 mx-4  flex-1 bg-white dark:bg-black flex flex-col justify-center">
          {" "}
          <Outlet />
        </main>
        <footer className="p-4 text-xs text-green-600 text-center space-y-2">
          <p>&copy; {new Date().getFullYear()} UNQTech ApS</p>
          <div className="space-x-4">
            <a
              href="https://www.aldersverificering.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300"
            >
              aldersverificering.dk
            </a>
            <a
              href="https://www.npmjs.com/package/@unqtech/age-verification-mitid"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300"
            >
              NPM Package
            </a>
            <a
              href="https://github.com/UNQTechDK/unqverify-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300"
            >
              SDK GitHub
            </a>
            <a
              href="https://github.com/UNQTechDK/age-verification-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300"
            >
              Demo Repo
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
