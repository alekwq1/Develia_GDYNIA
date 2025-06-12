import { useState } from "react";
import { APP_PASSWORD } from "../utils/constants";

export function useAuth() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  function handlePasswordSubmit(
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) {
    e.preventDefault?.();
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordError(false);
      setPassword("");
    } else {
      setShowPasswordError(true);
      setPassword("");
    }
  }

  return {
    password,
    setPassword,
    isAuthenticated,
    showPasswordError,
    handlePasswordSubmit,
  };
}
