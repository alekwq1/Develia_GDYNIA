import React from "react";

type Props = {
  showIFC: boolean;
  setShowIFC: React.Dispatch<React.SetStateAction<boolean>>;
  showPublicGlb: boolean;
  setShowPublicGlb: React.Dispatch<React.SetStateAction<boolean>>;
  setUserGlbParamsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
};

export default function TopLeftButtons({
  showIFC,
  setShowIFC,
  showPublicGlb,
  setShowPublicGlb,
  setUserGlbParamsOpen,
  isMobile,
}: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: isMobile ? 8 : 24,
        top: isMobile ? 8 : 24,
        zIndex: 91,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* IFC toggle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          title={showIFC ? "Hide IFC model" : "Show IFC model"}
          style={{
            background: showIFC ? "#0ea5e9" : "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 45,
            height: 45,
            fontSize: 27,
            boxShadow: "0 2px 8px rgba(33,140,227,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => setShowIFC((v) => !v)}
        >
          🏗️
        </button>
        <span
          style={{
            fontSize: 13,
            color: "#1d3a55",
            marginTop: 4,
            fontWeight: 500,
            letterSpacing: 0.3,
            userSelect: "none",
          }}
        >
          IFC
        </span>
      </div>

      {/* Building GLB toggle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          title={showPublicGlb ? "Hide building model" : "Show building model"}
          style={{
            background: showPublicGlb ? "#16a34a" : "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 45,
            height: 45,
            fontSize: 27,
            boxShadow: "0 2px 8px rgba(33,140,227,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => setShowPublicGlb((v) => !v)}
        >
          🏢
        </button>
        <span
          style={{
            fontSize: 13,
            color: "#1d3a55",
            marginTop: 4,
            fontWeight: 500,
            letterSpacing: 0.3,
            userSelect: "none",
          }}
        >
          GLB
        </span>
      </div>

      {/* User GLB upload */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          title="Upload GLB"
          style={{
            background: "#2190e3",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 45,
            height: 45,
            fontSize: 27,
            boxShadow: "0 2px 8px rgba(33,140,227,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => setUserGlbParamsOpen((o) => !o)}
        >
          📦
        </button>
        <span
          style={{
            fontSize: 13,
            color: "#1d3a55",
            marginTop: 4,
            fontWeight: 500,
            letterSpacing: 0.3,
            userSelect: "none",
          }}
        >
          Upload
        </span>
      </div>
    </div>
  );
}
