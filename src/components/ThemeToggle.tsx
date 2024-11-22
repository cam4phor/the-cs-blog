import { useState, useEffect } from "react";
const LIGHT = "light";
const DARK = "dark";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<typeof LIGHT | typeof DARK>(DARK);

  // Apply the theme to the HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === DARK) {
      root.classList.add(DARK);
    } else {
      root.classList.remove(DARK);
    }
  }, [theme]);

  // Toggle theme and persist it to localStorage
  const toggleTheme = () => {
    const newTheme = theme === LIGHT ? DARK : LIGHT;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // On mount, check localStorage for a persisted theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | typeof LIGHT
      | typeof DARK;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="relative top-[0.4rem] rounded-full"
    >
      <span className="block w-6 h-6 bg-yellow-400 dark:bg-gray-700 rounded-full duration-1000 ease-in-out"></span>
    </button>

    // <button
    //     onClick={toggleTheme}
    //     className="rounded"
    // >
    //     {theme === LIGHT ? '🌙' : '☀️'}
    // </button>
  );
};

export default ThemeToggle;
