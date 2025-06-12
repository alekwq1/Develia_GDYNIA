import React from "react";

type Props = {
  password: string;
  setPassword: (val: string) => void;
  showPasswordError: boolean;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) => void;
};

const PasswordScreen: React.FC<Props> = ({
  password,
  setPassword,
  showPasswordError,
  onSubmit,
}) => (
  <div
    style={{
      minHeight: "100vh",
      minWidth: "100vw",
      background: "#dce2e8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      inset: 0,
      zIndex: 10000,
    }}
  >
    <form
      onSubmit={onSubmit}
      style={{
        background: "#fff",
        padding: "40px 28px",
        borderRadius: 20,
        boxShadow: "0 4px 32px #0002",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minWidth: 320,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 24, fontWeight: 700, color: "#1d3a55" }}>
        🔒 Enter password
      </span>
      <input
        type="password"
        value={password}
        autoFocus
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{
          fontSize: 18,
          padding: "10px 16px",
          borderRadius: 9,
          border: "1px solid #ccd",
          outline: showPasswordError ? "2px solid #e11d48" : "none",
          width: "100%",
          minWidth: 170,
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(e);
        }}
      />
      <button
        type="submit"
        style={{
          background: "#2190e3",
          color: "white",
          fontWeight: 600,
          fontSize: 17,
          borderRadius: 10,
          border: "none",
          padding: "10px 28px",
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        Log in
      </button>
      {showPasswordError && (
        <span style={{ color: "#e11d48", fontWeight: 500 }}>
          Wrong password. Try again.
        </span>
      )}
    </form>
  </div>
);

export default PasswordScreen;
