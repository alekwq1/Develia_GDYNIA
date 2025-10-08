import { Suspense, useRef, useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, CameraControls } from "@react-three/drei";
import { Splat } from "./splat-object";
import IFCModel, { IFCElementProperties } from "./components/IFCModel";
import HowToUseModal from "./components/HowToUseModal";
import LoadingOverlay from "./components/LoadingOverlay";
import CameraControlsButtons from "./components/CameraControlsButtons";
import AddInfoPointModal from "./components/AddInfoPointModal";

import BottomLeftPanel from "./components/BottomLeftPanel";
import InfoPointCanvasGroup from "./components/InfoPointCanvasGroup";
import InfoPointDetailsPanel from "./components/InfoPointDetailsPanel";
import IFCPropertiesPanel from "./components/IFCPropertiesPanel";
import { useInfoPoints } from "./hooks/useInfoPoints";
import { useCameraControls } from "./hooks/useCameraControls";
import { useCameraWASD } from "./hooks/useCameraWASD";
import { useSplatLoader } from "./hooks/useSplatLoader";

import { InfoPointData } from "./utils/types";
import { isMobile, getInfoPanelStyle } from "./utils/helpers";
import PlaneClickCatcher from "./components/PlaneClickCatcher";

// --- USTAWIENIA SPLAT ---
const splatOption = {
  name: "06.2025",
  url: "https://huggingface.co/Alekso/Gdynia_2025_06_08/resolve/main/08_06_2025.splat",
  position: [0, -1, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
};

function App() {
  // ---- Obsługa "Wskaż na scenie"
  const [waitingForPosition, setWaitingForPosition] = useState<
    null | ((pos: [number, number, number]) => void)
  >(null);

  const [showSplatLoadedOverlay, setShowSplatLoadedOverlay] = useState(false);

  // POBIERZ AKTUALNY, NAJNOWSZY infoPoints!
  const {
    infoPoints,
    addInfoPoint,
    editInfoPoint,
    deleteInfoPoint,
    setInfoPoints,
  } = useInfoPoints();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showIFC, setShowIFC] = useState(false);
  const [ifcProperties, setIfcProperties] =
    useState<IFCElementProperties | null>(null);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoPoints, setShowInfoPoints] = useState(true);
  const [hideUI, setHideUI] = useState(false);

  // Tryb edycji i hasło
  const [editMode, setEditMode] = useState(false);
  const [askPassword, setAskPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const EDIT_PASSWORD = "2222";

  // InfoPoint do podglądu (dymek)
  const [previewInfoPointId, setPreviewInfoPointId] = useState<string | null>(
    null
  );

  // InfoPoint do edycji (panel po prawej)
  const [editingInfoPointId, setEditingInfoPointId] = useState<string | null>(
    null
  );
  const editingPoint = infoPoints.find((p) => p.id === editingInfoPointId);

  // CameraControls ref
  const cameraControls = useRef<
    import("@react-three/drei").CameraControls | null
  >(null);

  // --- Poprawiona funkcja resetowania kamery ---
  const resetCamera = () => {
    cameraControls.current?.setLookAt(
      isMobile() ? 90 : 20,
      isMobile() ? 110 : 110,
      isMobile() ? 30 : 7.4,
      0,
      0,
      0,
      true
    );
  };

  const { objectUrl, progress, showLoading } = useSplatLoader(splatOption.url);
  useEffect(() => {
    if (!showLoading && objectUrl) {
      setShowSplatLoadedOverlay(true);
      // Po 2 sekundach schowaj overlay
      const timeout = setTimeout(() => {
        setShowSplatLoadedOverlay(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showLoading, objectUrl]);

  const cameraHooks = useCameraControls(setEditingInfoPointId);

  useCameraWASD(
    cameraControls,
    isFullscreen,
    cameraHooks.resetCamera,
    () => cameraHooks.toggleFullscreen(setIsFullscreen),
    setEditingInfoPointId
  );

  // Kliknięcie w marker/listę
  const handleInfoPointClick = (id: string) => {
    if (editMode) {
      setEditingInfoPointId(id);
    } else {
      setPreviewInfoPointId(id);
      const point = infoPoints.find((p) => p.id === id);
      if (!point || !cameraControls.current) return;
      if (point.cameraPosition) {
        cameraControls.current.setLookAt(
          point.cameraPosition[0],
          point.cameraPosition[1],
          point.cameraPosition[2],
          point.position[0],
          point.position[1],
          point.position[2],
          true
        );
      } else {
        cameraControls.current.setLookAt(
          point.position[0] + 6,
          point.position[1] + 7,
          point.position[2] + 6,
          point.position[0],
          point.position[1],
          point.position[2],
          true
        );
      }
    }
  };

  // Ustaw kamerę (do panelu edycji)
  const getCurrentCameraPosition = (): [number, number, number] => {
    if (cameraControls.current && cameraControls.current.camera) {
      const { x, y, z } = cameraControls.current.camera.position;
      return [x, y, z];
    }
    return [0, 0, 0];
  };

  // --- WSKAZYWANIE NA SCENIE ---
  const handleRequestSetPosition = useCallback(
    (cb: (pos: [number, number, number]) => void) => {
      setWaitingForPosition(() => cb);
    },
    []
  );

  // --- IMPORT / EKSPORT INFOPOINTÓW ---
  const handleExportInfoPoints = () => {
    const dataToExport = { infoPoints: [...infoPoints] };
    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "infoPoints.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportInfoPoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (!ev.target) return;
      try {
        const data = JSON.parse(ev.target.result as string);
        if (Array.isArray(data)) {
          setInfoPoints(data);
          alert("Zaimportowano punkty (z tablicy)!");
        } else if (data.infoPoints && Array.isArray(data.infoPoints)) {
          setInfoPoints(data.infoPoints);
          alert("Zaimportowano punkty!");
        } else {
          alert("Nieprawidłowy plik JSON!");
        }
      } catch {
        alert("Błąd podczas wczytywania pliku JSON!");
      }
    };
    reader.readAsText(file);
  };

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
      {(showLoading || showSplatLoadedOverlay) && (
        <LoadingOverlay progress={progress >= 100 ? 100 : progress} />
      )}

      {/* Overlay jeśli w trybie wskazywania */}
      {waitingForPosition && (
        <div
          style={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1971c2",
            color: "#fff",
            fontWeight: 600,
            fontSize: 17,
            borderRadius: 8,
            padding: "8px 32px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          Kliknij na scenę, aby ustawić pozycję punktu!
        </div>
      )}

      {/* PRZYCISK UKRYWANIA UI (USUNIĘTO link Progress Compare) */}
      <div
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: 10001,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setHideUI((v) => !v)}
          style={{
            background: hideUI ? "#e9ecef" : "#2190e3",
            color: hideUI ? "#2190e3" : "white",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            fontSize: 23,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 8px #2190e322",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={
            hideUI ? "Pokaż wszystkie przyciski" : "Ukryj wszystkie przyciski"
          }
        >
          {hideUI ? "🙉" : "🙈"}
        </button>
      </div>

      {/* --- RESZTA UI TYLKO JEŚLI !hideUI --- */}
      {!hideUI && (
        <>
          {/* Tryb edycji – przycisk po lewej */}
          <div>
            {!editMode && (
              <button
                onClick={() => setAskPassword(true)}
                style={{
                  position: "fixed",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#1971c2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "60px",
                  boxShadow: "0 4px 16px #1971c223",
                  padding: "14px 28px",
                  fontWeight: 700,
                  fontSize: 17,
                  zIndex: 2222,
                  cursor: "pointer",
                  letterSpacing: 1,
                  outline: "none",
                }}
              >
                Edit mode
              </button>
            )}
            {editMode && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setEditingInfoPointId(null);
                  setPreviewInfoPointId(null);
                }}
                style={{
                  position: "fixed",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#dee2e6",
                  color: "#1971c2",
                  border: "none",
                  borderRadius: "60px",
                  boxShadow: "0 4px 16px #1971c210",
                  padding: "14px 28px",
                  fontWeight: 700,
                  fontSize: 17,
                  zIndex: 2222,
                  cursor: "pointer",
                  letterSpacing: 1,
                  outline: "none",
                }}
              >
                Wyłącz edycję
              </button>
            )}

            {/* PANEL IMPORT/EKSPORT PUNKTÓW - tuż pod edycją */}
            {editMode && (
              <div
                style={{
                  position: "fixed",
                  left: 14,
                  top: "calc(50% + 90px)",
                  zIndex: 2222,
                  background: "#fff",
                  borderRadius: 11,
                  boxShadow: "0 3px 16px #0001",
                  padding: "12px 19px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <button
                  onClick={handleExportInfoPoints}
                  style={{
                    background: "#228be6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "7px 17px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Eksportuj punkty
                </button>
                <label style={{ cursor: "pointer" }}>
                  <span
                    style={{
                      color: "#228be6",
                      textDecoration: "underline",
                      marginRight: 6,
                    }}
                  >
                    Importuj punkty
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={handleImportInfoPoints}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Mini panel w LEWYM GÓRNYM rogu (zamiast TopLeftButtons): IFC ON/OFF */}
          <div
            style={{
              position: "fixed",
              left: 14,
              top: 16,
              zIndex: 2222,
              display: "flex",
              gap: 8,
            }}
          >
            <button
              onClick={() => setShowIFC((v) => !v)}
              style={{
                background: showIFC ? "#2f9e44" : "#adb5bd",
                color: "white",
                border: "none",
                borderRadius: 9,
                padding: "8px 14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 3px 8px #0001",
              }}
            >
              IFC: {showIFC ? "ON" : "OFF"}
            </button>
          </div>

          {/* Modal hasła do trybu edycji */}
          {askPassword && (
            <div
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.19)",
                zIndex: 2022,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setAskPassword(false)}
            >
              <form
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 4px 24px #0003",
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 15,
                  alignItems: "stretch",
                  minWidth: 240,
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordInput === EDIT_PASSWORD) {
                    setEditMode(true);
                    setAskPassword(false);
                    setPasswordInput("");
                  }
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 19, color: "#185c92" }}
                >
                  Edit mode - enter password
                </span>
                <input
                  type="password"
                  placeholder="Hasło"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    fontSize: 16,
                    padding: "8px 13px",
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
                    borderRadius: 8,
                    border: "none",
                    padding: "9px 20px",
                    cursor: "pointer",
                    marginTop: 3,
                  }}
                >
                  Dalej
                </button>
                <button
                  type="button"
                  onClick={() => setAskPassword(false)}
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
              </form>
            </div>
          )}

          {/* Dolny lewy panel */}
          <BottomLeftPanel
            setShowHowToUse={setShowHowToUse}
            showInfoPoints={showInfoPoints}
            setShowInfoPoints={setShowInfoPoints}
            setShowAddModal={setShowAddModal}
            isMobile={isMobile()}
          />
          {showHowToUse && (
            <HowToUseModal onClose={() => setShowHowToUse(false)} />
          )}
          {showAddModal && (
            <AddInfoPointModal
              onAdd={(point: InfoPointData) => {
                addInfoPoint(point);
                setShowAddModal(false);
              }}
              onClose={() => setShowAddModal(false)}
            />
          )}

          {/* Kamera/fullscreen */}
          <CameraControlsButtons
            resetCamera={resetCamera}
            isFullscreen={isFullscreen}
            toggleFullscreen={() =>
              cameraHooks.toggleFullscreen(setIsFullscreen)
            }
          />

          {/* IFC PROPERTIES */}
          {showIFC && ifcProperties && (
            <IFCPropertiesPanel
              properties={ifcProperties}
              onClose={() => setIfcProperties(null)}
            />
          )}

          {/* Panel szczegółów InfoPointa po prawej (tylko w trybie edycji!) */}
          {editMode && editingPoint && (
            <InfoPointDetailsPanel
              infoPoint={editingPoint}
              editMode={editMode}
              onRequestEditMode={() => setAskPassword(true)}
              onSave={(updated) => {
                editInfoPoint(updated);
              }}
              onDelete={(id) => {
                deleteInfoPoint(id);
                setEditingInfoPointId(null);
              }}
              onClose={() => setEditingInfoPointId(null)}
              getCurrentCameraPosition={getCurrentCameraPosition}
              focusCameraOn={() => {}}
              // TO NAJWAŻNIEJSZE: przekazujesz callback!
              onRequestSetPosition={handleRequestSetPosition}
            />
          )}
        </>
      )}

      {/* CANVAS */}
      {objectUrl && (
        <Canvas
          className="h-full w-full touch-action-none"
          gl={{ antialias: false }}
          dpr={isMobile() ? 2 : Math.min(window.devicePixelRatio, 2)}
          camera={{
            position: isMobile() ? [90, 110, 30] : [20, 110, 7.4],
            fov: isMobile() ? 36 : 60,
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
            touchAction: "none",
          }}
        >
          <ambientLight intensity={0.8} />

          {/* KLUCZ: tylko gdy czekasz na klik */}
          <PlaneClickCatcher
            enabled={!!waitingForPosition}
            onPick={(pos: [number, number, number]) => {
              if (waitingForPosition) {
                waitingForPosition(pos);
                setWaitingForPosition(null);
              }
            }}
          />

          <CameraControls
            ref={cameraControls}
            makeDefault
            azimuthRotateSpeed={isMobile() ? 0.45 : 1}
            polarRotateSpeed={isMobile() ? 0.5 : 1}
            truckSpeed={isMobile() ? 0.4 : 1}
            minDistance={8}
            maxDistance={900}
            verticalDragToForward={false}
          />

          <Suspense fallback={null}>
            {/* Gaussian Splatting + InfoPointy */}
            <group
              position={splatOption.position}
              rotation={splatOption.rotation}
              scale={splatOption.scale}
            >
              <Splat
                url={objectUrl}
                maxSplats={isMobile() ? 5000000 : 10000000}
              />
              <InfoPointCanvasGroup
                infoPoints={infoPoints}
                activeInfoPoint={editMode ? null : previewInfoPointId}
                setActiveInfoPoint={handleInfoPointClick}
                showInfoPoints={showInfoPoints}
                infoPanelStyle={getInfoPanelStyle(isMobile())}
                editMode={editMode}
                onClosePreview={() => setPreviewInfoPointId(null)}
              />
            </group>

            {/* IFC */}
            {showIFC && (
              <IFCModel
                onPropertiesSelected={setIfcProperties}
                rotationY={95}
                visible={showIFC}
              />
            )}

            <Environment preset="city" />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;
