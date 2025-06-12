import React from "react";

type Props = {
  userGlbUrl: string | null;
  showUserGlb: boolean;
  setShowUserGlb: React.Dispatch<React.SetStateAction<boolean>>;
  setUserGlbUrl: React.Dispatch<React.SetStateAction<string | null>>;
  userGlbPos: [number, number, number];
  setUserGlbPos: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  userGlbRot: [number, number, number];
  setUserGlbRot: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  userGlbScale: [number, number, number];
  setUserGlbScale: React.Dispatch<
    React.SetStateAction<[number, number, number]>
  >;
  isMobile: boolean;
};

const UserGlbUploadPanel: React.FC<Props> = ({
  userGlbUrl,
  showUserGlb,
  setShowUserGlb,
  setUserGlbUrl,
  userGlbPos,
  setUserGlbPos,
  userGlbRot,
  setUserGlbRot,
  userGlbScale,
  setUserGlbScale,
  isMobile,
}) => (
  <div
    style={{
      position: "fixed",
      left: isMobile ? 8 : 24,
      top: isMobile ? 70 : 90,
      zIndex: 92,
      background: "#f5faff",
      borderRadius: 10,
      padding: "14px 22px",
      boxShadow: "0 2px 12px #bbb7",
      display: "flex",
      flexDirection: "column",
      gap: 9,
      minWidth: 220,
    }}
  >
    <input
      type="file"
      accept=".glb"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUserGlbUrl(URL.createObjectURL(file));
        setShowUserGlb(true);
        setUserGlbPos([0, 0, 0]);
        setUserGlbRot([0, 0, 0]);
        setUserGlbScale([1, 1, 1]);
      }}
      style={{
        width: 180,
        background: "#fff",
        border: "1px solid #bbb",
        borderRadius: 8,
        fontSize: 15,
        marginBottom: 2,
      }}
    />
    {userGlbUrl && (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setShowUserGlb((v) => !v)}
            style={{
              background: showUserGlb ? "#16a34a" : "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "4px 14px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {showUserGlb ? "Hide" : "Show"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, color: "#2261c5" }}>XYZ:</span>
          {[0, 1, 2].map((ax) => (
            <input
              key={ax}
              type="number"
              value={userGlbPos[ax]}
              step={0.1}
              style={{ width: 36, marginLeft: 2 }}
              onChange={(e) =>
                setUserGlbPos(
                  userGlbPos.map((v, i) =>
                    i === ax ? parseFloat(e.target.value) : v
                  ) as [number, number, number]
                )
              }
              title={`Position ${["X", "Y", "Z"][ax]}`}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, color: "#2261c5" }}>Rot:</span>
          {[0, 1, 2].map((ax) => (
            <input
              key={ax}
              type="number"
              value={Math.round(((userGlbRot[ax] * 180) / Math.PI) * 100) / 100}
              step={100}
              min={-9999}
              max={9999}
              style={{ width: 36, marginLeft: 2 }}
              onChange={(e) =>
                setUserGlbRot(
                  userGlbRot.map((v, i) =>
                    i === ax ? (parseFloat(e.target.value) * Math.PI) / 180 : v
                  ) as [number, number, number]
                )
              }
              title={`Rotation ${["X", "Y", "Z"][ax]} (deg)`}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13, color: "#2261c5" }}>Scale:</span>
          {[0, 1, 2].map((ax) => (
            <input
              key={ax}
              type="number"
              value={userGlbScale[ax]}
              step={0.01}
              min={0.01}
              max={99}
              style={{ width: 36, marginLeft: 2 }}
              onChange={(e) =>
                setUserGlbScale(
                  userGlbScale.map((v, i) =>
                    i === ax ? parseFloat(e.target.value) : v
                  ) as [number, number, number]
                )
              }
              title={`Scale ${["X", "Y", "Z"][ax]}`}
            />
          ))}
        </div>
      </>
    )}
  </div>
);

export default UserGlbUploadPanel;
