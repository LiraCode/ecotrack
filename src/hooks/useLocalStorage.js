'use client';
import { useState, useEffect } from "react";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") { // Certifica que está no cliente
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error("Erro ao acessar localStorage", error);
      }
    }
  }, [key]);

  const setValue = (value) => {
    if (typeof window !== "undefined") {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Erro ao salvar no localStorage", error);
      }
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;