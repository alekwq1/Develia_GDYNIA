import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, CameraControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import IFCModel, { type IFCElementProperties } from "./components/IFCModel";
import { Splat } from "./splat-object";
import HowToUseModal from "./components/HowToUseModal";
import LoadingOverlay from "./components/LoadingOverlay";
import IFCPropertiesPanel from "./components/IFCPropertiesPanel";
import CameraControlsButtons from "./components/CameraControlsButtons";
import { InfoPointList } from "./components/InfoPointList";

// Typ do InfoPointów (żeby nie było konfliktów!)
type InfoPointData = {
  id: string;
  position: [number, number, number];
  label: string;
  icon: string;
  content: string;
  cameraPosition?: [number, number, number];
};

const isMobile = () => window.innerWidth < 768;
const APP_PASSWORD = "12345678";
const splatOption = {
  name: "04.06.2024",
  url: "https://huggingface.co/Alekso/Equinor_02_06_2025/resolve/main/Equinor_02_06_2025.splat",
  position: [0, -1, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
};

// Zamieniamy wszystkie position/cameraPosition na tuple [number, number, number]
const infoPoints: InfoPointData[] = [
  {
    id: "AED on Site & Eye Wash Station",
    position: [-62, 3, 40] as [number, number, number],
    label: "AED on Site & Eye Wash Station",
    icon: "💓",
    content: `•	AED: 🏥⚡
•	Eye wash: 👁️🚿
`,
    cameraPosition: [-15, 65, 80] as [number, number, number],
  },
  {
    id: "H&S Board (Health & Safety)2",
    position: [-7, 3, -35] as [number, number, number],
    label: "H&S Board (Health & Safety)",
    icon: "⛑️",
    content: "🧯⛑️ (fire extinguisher + first aid kit)",
    cameraPosition: [50, 50, -50] as [number, number, number],
  },
  {
    id: "Pedestrian Communication Route",
    position: [-38, 3, 20] as [number, number, number],
    label: "Pedestrian Communication Route",
    icon: "🚸",
    content: "Pedestrian Communication Route",
    cameraPosition: [0, 100, 35] as [number, number, number],
  },
  {
    id: "No Entry – Seagull Nesting Area",
    position: [-30, 3, 55] as [number, number, number],
    label: "No Entry – Seagull Nesting Area",
    icon: "🐦",
    content: "⛔🐦 No Entry – Seagull Nesting Area",
    cameraPosition: [-15, 65, 80] as [number, number, number],
  },
  {
    id: "Emergency Board – Nearest Hospital Phone Number",
    position: [-57, 3, 22] as [number, number, number],
    label: "NEmergency Board – Nearest Hospital Phone Number",
    icon: "📞",
    content: "📞🏥 Emergency Board – Nearest Hospital Phone Number",
    // cameraPosition pominięty – OK!
  },
  {
    id: "No Entry – Fuel Storage Area",
    position: [-50, 3, 0] as [number, number, number],
    label: "No Entry – Fuel Storage Area",
    icon: "⛽",
    content: "⛔⛽ No Entry – Fuel Storage Area",
    cameraPosition: [0, 100, 35] as [number, number, number],
  },
  {
    id: "H&S Board (Health & Safety)",
    position: [45, 3, -15] as [number, number, number],
    label: "H&S Board (Health & Safety)",
    icon: "⛑️",
    content: `•	Lifebuoy with rope: 🛟
       •	First aid kit + assigned personnel list: 💊📜`,
    cameraPosition: [60, 150, 80] as [number, number, number],
  },
  {
    id: "Safety Board",
    position: [-50, 3, 65] as [number, number, number],
    label: "Safety Board",
    icon: "🟢",
    content: `• Evacuation assembly point 🚨
• First aid kit 💊🩹
• Fire extinguisher 🔥🧯
• Fire blanket 🧯🛡️
`,
    cameraPosition: [0, 80, 150] as [number, number, number],
  },
  {
    id: "Construction Safety Mirror",
    position: [-62, 10, 22] as [number, number, number],
    label: "Construction Safety Mirror",
    icon: "🔍",
    content: `Construction Safety Mirror🔍👷‍♂️
`,
    cameraPosition: [0, 120, 35] as [number, number, number],
  },
];

const PUBLIC_GLB = { label: "Building", url: "/models/building.glb" };

const degToRad = (deg: number): number => (deg * Math.PI) / 180;

type GLBModelProps = {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible: boolean;
};

function GLBModel({
  url,
  position = [14, 1.6, -23],
  rotation = [0, 160, 0],
  scale = [1, 1, 1],
  visible,
}: GLBModelProps) {
  const radianRotation = rotation.map(degToRad) as [number, number, number];
  const gltf = useLoader(GLTFLoader, url);
  if (!visible) return null;
  return (
    <primitive
      object={gltf.scene}
      dispose={null}
      position={position}
      rotation={radianRotation}
      scale={scale}
    />
  );
}

function App() {
  // --- STANY ---
  const [showIFC, setShowIFC] = useState(false);
  const [ifcProperties, setIfcProperties] =
    useState<IFCElementProperties | null>(null);
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [loadedData, setLoadedData] = useState<Blob | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [activeInfoPoint, setActiveInfoPoint] = useState<string | null>(null);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoPoints, setShowInfoPoints] = useState(true);

  // --- PASSWORD MODAL ---
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  // --- STAŁY PUBLICZNY GLB ---
  const [showPublicGlb, setShowPublicGlb] = useState(false);
  const publicGlbPos: [number, number, number] = [14, 1.8, -23];
  const publicGlbRot: [number, number, number] = [0, 160, 0];
  const publicGlbScale: [number, number, number] = [1, 1, 1];

  // --- GLB upload użytkownika ---
  const [userGlbUrl, setUserGlbUrl] = useState<string | null>(null);
  const [showUserGlb, setShowUserGlb] = useState(true);
  const [userGlbParamsOpen, setUserGlbParamsOpen] = useState(false);
  const [userGlbPos, setUserGlbPos] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [userGlbRot, setUserGlbRot] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [userGlbScale, setUserGlbScale] = useState<[number, number, number]>([
    1, 1, 1,
  ]);

  // --- SPLATY ---
  const dpr = 2;
  const maxSplats = isMobile() ? 5000000 : 10000000;
  const [splats] = useState(maxSplats);
  const effectiveSplats = Math.min(maxSplats, splats);

  // --- KAMERA ---
  const cameraControls = useRef<any>(null);

  const handlePasswordSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault?.();
    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordError(false);
      setPassword("");
    } else {
      setShowPasswordError(true);
      setPassword("");
    }
  };

  useEffect(() => {
    setShowLoading(true);
    const downloadFile = async (url: string) => {
      try {
        const response = await fetch(url);
        const reader = response.body?.getReader();
        const contentLength = response.headers.get("content-length");
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        if (!contentLength) return;
        const totalLength = parseInt(contentLength, 10);
        while (receivedLength < totalLength) {
          const { done, value } = (await reader?.read()) ?? {};
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedLength += value.length;
            setProgress(Math.round((receivedLength / totalLength) * 100));
          }
        }
        const blob = new Blob(chunks);
        setLoadedData(blob);
        setProgress(100);
        setTimeout(() => setShowLoading(false), 1000);
      } catch (error) {
        setShowLoading(false);
        setProgress(100);
        console.error("Error loading splat:", error);
      }
    };
    downloadFile(splatOption.url);
  }, []);

  useEffect(() => {
    if (loadedData) {
      const url = URL.createObjectURL(loadedData);
      setObjectUrl(url);
      return () => {
        url && URL.revokeObjectURL(url);
      };
    }
  }, [loadedData]);

  const focusCameraOn = (
    cameraPos: [number, number, number],
    targetPos: [number, number, number]
  ) => {
    if (!cameraControls.current) return;
    cameraControls.current.setLookAt(
      cameraPos[0],
      cameraPos[1],
      cameraPos[2],
      targetPos[0],
      targetPos[1],
      targetPos[2],
      true
    );
  };

  const resetCamera = () => {
    if (!cameraControls.current) return;
    cameraControls.current.setLookAt(20, 110, 7.4, 0, 0, 0, true);
    setActiveInfoPoint(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const MOVE_STEP = 0.7;
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const st = moveState.current;
      switch (e.key.toLowerCase()) {
        case "w":
          st.forward = true;
          break;
        case "s":
          st.backward = true;
          break;
        case "a":
          st.left = true;
          break;
        case "d":
          st.right = true;
          break;
        case "q":
          st.up = true;
          break;
        case "e":
          st.down = true;
          break;
        case "r":
          resetCamera();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "escape":
          if (isFullscreen) toggleFullscreen();
          break;
        default:
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const st = moveState.current;
      switch (e.key.toLowerCase()) {
        case "w":
          st.forward = false;
          break;
        case "s":
          st.backward = false;
          break;
        case "a":
          st.left = false;
          break;
        case "d":
          st.right = false;
          break;
        case "q":
          st.up = false;
          break;
        case "e":
          st.down = false;
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFullscreen]);

  useEffect(() => {
    let animationFrameId: number;
    function animateMove() {
      const controls = cameraControls.current;
      if (controls) {
        const st = moveState.current;
        if (st.forward) controls.forward(MOVE_STEP, false);
        if (st.backward) controls.forward(-MOVE_STEP, false);
        if (st.left) controls.truck(-MOVE_STEP, 0, false);
        if (st.right) controls.truck(MOVE_STEP, 0, false);
        if (st.up) controls.truck(0, MOVE_STEP, false);
        if (st.down) controls.truck(0, -MOVE_STEP, false);
      }
      animationFrameId = requestAnimationFrame(animateMove);
    }
    animateMove();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!isAuthenticated) {
    return (
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
          onSubmit={handlePasswordSubmit}
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
              if (e.key === "Enter") handlePasswordSubmit(e);
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
  }

  // --- RENDER ---
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#dce2e8",
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      {/* LOADING OVERLAY */}
      {showLoading && <LoadingOverlay progress={progress} />}

      {/* How to use (lewy dolny róg) */}
      <div
        style={{
          position: "fixed",
          left: 32,
          bottom: 26,
          zIndex: 40,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          style={{
            background: "rgba(33,140,227,0.90)",
            borderRadius: "12px",
            color: "white",
            fontWeight: 600,
            fontSize: 12,
            padding: "10px 30px",
            border: "none",
            boxShadow: "0 2px 8px rgba(33,140,227,0.08)",
            cursor: "pointer",
            transition: "all 0.2s",
            letterSpacing: 0.3,
          }}
          onClick={() => setShowHowToUse(true)}
        >
          ℹ️ How to use?
        </button>
        <button
          style={{
            background: showInfoPoints
              ? "rgba(33,140,227,0.90)"
              : "rgba(150, 150, 150, 0.6)",
            borderRadius: "12px",
            color: "white",
            fontWeight: 600,
            fontSize: 12,
            padding: "10px 24px",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setShowInfoPoints((v) => !v)}
        >
          {showInfoPoints ? "❌Hide info points" : "👁️‍🗨️Show info points"}
        </button>
      </div>
      {showHowToUse && <HowToUseModal onClose={() => setShowHowToUse(false)} />}

      {/* Przyciski kamera/fullscreen (prawy dolny róg) */}
      <CameraControlsButtons
        resetCamera={resetCamera}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      {/* LINK COMPARISON – prawy górny róg */}
      <div
        style={{
          position: "fixed",
          right: 32,
          top: 22,
          zIndex: 50,
        }}
      >
        <a
          href="https://equinorleba.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#2190e3",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 11,
            boxShadow: "0 2px 8px rgba(33,140,227,0.08)",
            padding: "5px 28px",
            textDecoration: "none",
          }}
        >
          ↔️ Progress comparison slider
        </a>
      </div>

      {/* IFC + GLB icons/panels (lewy górny róg) */}
      {/* --- GÓRNY LEWY RÓG: przyciski w jednej linii --- */}
      <div
        style={{
          position: "fixed",
          left: isMobile() ? 8 : 24,
          top: isMobile() ? 8 : 24,
          zIndex: 51,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {/* Przycisk IFC */}
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

        {/* Przycisk GLB */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            title={
              showPublicGlb ? "Hide building model" : "Show building model"
            }
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

        {/* Przycisk UPLOAD GLB */}
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

      {/* --- PANEL UPLOADU GLB (poza górną linią przycisków!) --- */}
      {userGlbParamsOpen && (
        <div
          style={{
            position: "fixed",
            left: isMobile() ? 8 : 24,
            top: isMobile() ? 70 : 90, // pod paskiem z przyciskami
            zIndex: 55,
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
                    value={
                      Math.round(((userGlbRot[ax] * 180) / Math.PI) * 100) / 100
                    }
                    step={1}
                    min={-180}
                    max={180}
                    style={{ width: 36, marginLeft: 2 }}
                    onChange={(e) =>
                      setUserGlbRot(
                        userGlbRot.map((v, i) =>
                          i === ax
                            ? (parseFloat(e.target.value) * Math.PI) / 180
                            : v
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
      )}

      {/* IFC PROPERTIES */}
      {showIFC && ifcProperties && (
        <IFCPropertiesPanel
          properties={ifcProperties}
          onClose={() => setIfcProperties(null)}
        />
      )}

      {/* CANVAS */}
      {objectUrl && (
        <Canvas
          className="h-full w-full touch-action-none"
          gl={{ antialias: false }}
          dpr={dpr}
          camera={{
            position: isMobile() ? [180, 180, 40] : [100, 150, 36.5],
            fov: isMobile() ? 35 : 60,
            near: 0.01,
            far: 500000,
          }}
          style={{
            width: "100vw",
            height: "100vh",
            background: "transparent",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        >
          <ambientLight intensity={0.8} />
          <CameraControls ref={cameraControls} makeDefault />
          <Suspense fallback={null}>
            <group
              position={splatOption.position}
              rotation={splatOption.rotation}
              scale={splatOption.scale}
            >
              {/* SPLAT MODEL */}
              <Splat url={objectUrl} maxSplats={effectiveSplats} />
              {/* INFOPOINTY */}
              {showInfoPoints && (
                <InfoPointList
                  points={infoPoints}
                  activeId={activeInfoPoint}
                  onSelect={(id) => {
                    setActiveInfoPoint(id === activeInfoPoint ? null : id);
                    const point = infoPoints.find((p) => p.id === id);
                    if (point && point.cameraPosition)
                      focusCameraOn(point.cameraPosition, point.position);
                  }}
                  onClose={() => setActiveInfoPoint(null)}
                />
              )}
            </group>
            {/* IFC */}
            {showIFC && (
              <IFCModel
                onPropertiesSelected={setIfcProperties}
                rotationY={95}
                visible={showIFC}
              />
            )}
            {/* GLB z public/models */}
            {showPublicGlb && (
              <Suspense fallback={null}>
                <GLBModel
                  url={PUBLIC_GLB.url}
                  position={publicGlbPos}
                  rotation={publicGlbRot}
                  scale={publicGlbScale}
                  visible={showPublicGlb}
                />
              </Suspense>
            )}
            {/* GLB z uploadu */}
            {showUserGlb && userGlbUrl && (
              <Suspense fallback={null}>
                <GLBModel
                  url={userGlbUrl}
                  position={userGlbPos}
                  rotation={userGlbRot}
                  scale={userGlbScale}
                  visible={showUserGlb}
                />
              </Suspense>
            )}
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;
