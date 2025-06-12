import React, { useState } from "react";
import { InfoPointData } from "../utils/types";
import { ADD_INFOPOINT_PASSWORD } from "../utils/constants";

type Props = {
  onAdd: (point: InfoPointData) => void;
  onClose: () => void;
};

export default function AddInfoPointModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [content, setContent] = useState("");

  const [position, setPosition] = useState<[number, number, number]>([0, 3, 0]);
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number] | undefined
  >(undefined);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADD_INFOPOINT_PASSWORD) {
      setShowError(false);
      setStep(2);
    } else {
      setShowError(true);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !icon || !content) {
      setShowError(true);
      return;
    }
    const newPoint: InfoPointData = {
      id: crypto.randomUUID(), // pewny unikalny ID
      label,
      icon,
      content,
      position,
      cameraPosition:
        cameraPosition && cameraPosition.some((v) => v !== 0)
          ? cameraPosition
          : undefined,
    };
    onAdd(newPoint);
  };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1100,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={step === 1 ? handlePasswordSubmit : handleAdd}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 28px #0003",
          padding: 30,
          minWidth: 320,
          maxWidth: 370,
          display: "flex",
          flexDirection: "column",
          gap: 17,
          alignItems: "stretch",
        }}
      >
        {step === 1 ? (
          <>
            <span style={{ fontWeight: 700, fontSize: 22, color: "#185c92" }}>
              Dodaj nowy infopunkt
            </span>
            <input
              type="password"
              placeholder="Hasło"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                fontSize: 16,
                padding: "9px 13px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#1d8af2",
                color: "white",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 9,
                border: "none",
                padding: "9px 20px",
                cursor: "pointer",
                marginTop: 3,
              }}
            >
              Dalej
            </button>
            {showError && (
              <span style={{ color: "#d81818", fontWeight: 500 }}>
                Błędne hasło!
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 7,
                background: "#f2f4f7",
                border: "none",
                color: "#333",
                fontSize: 14,
                borderRadius: 7,
                padding: "7px 12px",
                cursor: "pointer",
              }}
            >
              Anuluj
            </button>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 700, fontSize: 20, color: "#185c92" }}>
              Nowy infopunkt
            </span>
            <input
              type="text"
              placeholder="Tytuł / label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{
                fontSize: 16,
                borderRadius: 7,
                padding: "8px 11px",
                border: "1px solid #ccc",
              }}
              required
            />
            <input
              type="text"
              placeholder="Emoji / Ikona (np. 🚧)"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={{
                fontSize: 16,
                borderRadius: 7,
                padding: "8px 11px",
                border: "1px solid #ccc",
              }}
              required
            />
            <textarea
              placeholder="Treść info (opis, wskazówki)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              style={{
                fontSize: 15,
                borderRadius: 7,
                padding: "8px 11px",
                border: "1px solid #ccc",
              }}
              required
            />
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 14, color: "#2261c5" }}>XYZ:</span>
              {[0, 1, 2].map((ax) => (
                <input
                  key={ax}
                  type="number"
                  step={0.01}
                  value={position[ax]}
                  style={{ width: 50 }}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPosition(
                      (pos) =>
                        pos.map((v, i) => (i === ax ? val : v)) as [
                          number,
                          number,
                          number
                        ]
                    );
                  }}
                  title={["X", "Y", "Z"][ax]}
                  required
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#2261c5" }}>
                Pozycja kamery (opcjonalnie):
              </span>
              {[0, 1, 2].map((ax) => (
                <input
                  key={ax}
                  type="number"
                  step={0.01}
                  value={cameraPosition ? cameraPosition[ax] : ""}
                  style={{ width: 50 }}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCameraPosition(
                      (cam) =>
                        (cam
                          ? cam.map((v, i) => (i === ax ? val : v))
                          : [0, 0, 0].map((v, i) => (i === ax ? val : v))) as [
                          number,
                          number,
                          number
                        ]
                    );
                  }}
                  title={["X", "Y", "Z"][ax]}
                />
              ))}
            </div>
            <button
              type="submit"
              style={{
                background: "#2190e3",
                color: "white",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                border: "none",
                padding: "10px 22px",
                marginTop: 7,
                cursor: "pointer",
              }}
            >
              Dodaj infopunkt
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 6,
                background: "#f2f4f7",
                border: "none",
                color: "#333",
                fontSize: 14,
                borderRadius: 7,
                padding: "7px 12px",
                cursor: "pointer",
              }}
            >
              Anuluj
            </button>
          </>
        )}
      </form>
    </div>
  );
}
