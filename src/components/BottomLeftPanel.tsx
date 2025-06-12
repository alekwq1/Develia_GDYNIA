import React from "react";

type Props = {
  showHowToUse: boolean;
  setShowHowToUse: React.Dispatch<React.SetStateAction<boolean>>;
  showInfoPoints: boolean;
  setShowInfoPoints: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
};

const BottomLeftPanel: React.FC<Props> = ({
  showHowToUse,
  setShowHowToUse,
  showInfoPoints,
  setShowInfoPoints,
  setShowAddModal,
  isMobile,
}) => (
  <div
    style={{
      position: "fixed",
      left: 16,
      bottom: 16,
      zIndex: 90,
      display: "flex",
      gap: 8,
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
    }}
  >
    <button
      style={{
        background: "#2190e3",
        borderRadius: 10,
        color: "white",
        fontWeight: 600,
        fontSize: 13,
        padding: "8px 22px",
        border: "none",
        cursor: "pointer",
        letterSpacing: 0.2,
      }}
      onClick={() => setShowHowToUse(true)}
    >
      ℹ️ How to use?
    </button>
    <button
      style={{
        background: showInfoPoints ? "#2190e3" : "#bbb",
        borderRadius: 10,
        color: "white",
        fontWeight: 600,
        fontSize: 13,
        padding: "8px 18px",
        border: "none",
        cursor: "pointer",
        letterSpacing: 0.2,
      }}
      onClick={() => setShowInfoPoints((v) => !v)}
    >
      {showInfoPoints ? "❌Hide info points" : "👁️‍🗨️Show info points"}
    </button>
    <button
      style={{
        background: "#1d8af2",
        borderRadius: 10,
        color: "white",
        fontWeight: 600,
        fontSize: 13,
        padding: "8px 22px",
        border: "none",
        cursor: "pointer",
        letterSpacing: 0.2,
      }}
      onClick={() => setShowAddModal(true)}
    >
      ➕ Dodaj infopunkt
    </button>
  </div>
);

export default BottomLeftPanel;
