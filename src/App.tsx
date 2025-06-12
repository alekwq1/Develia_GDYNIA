import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, CameraControls } from "@react-three/drei";
import { Splat } from "./splat-object";
import IFCModel, { IFCElementProperties } from "./components/IFCModel";
import HowToUseModal from "./components/HowToUseModal";
import LoadingOverlay from "./components/LoadingOverlay";
import CameraControlsButtons from "./components/CameraControlsButtons";
import AddInfoPointModal from "./components/AddInfoPointModal";
import GLBModel from "./components/GLBModel";
import TopLeftButtons from "./components/TopLeftButtons";
import UserGlbUploadPanel from "./components/UserGlbUploadPanel";
import PasswordScreen from "./components/PasswordScreen";
import BottomLeftPanel from "./components/BottomLeftPanel";
import InfoPointCanvasGroup from "./components/InfoPointCanvasGroup";
import InfoPointDetailsPanel from "./components/InfoPointDetailsPanel";
import IFCPropertiesPanel from "./components/IFCPropertiesPanel";
import { useInfoPoints } from "./hooks/useInfoPoints";
import { useCameraControls } from "./hooks/useCameraControls";
import { useCameraWASD } from "./hooks/useCameraWASD";
import { useSplatLoader } from "./hooks/useSplatLoader";
import { useAuth } from "./hooks/useAuth";
import { InfoPointData } from "./utils/types";
import { isMobile, getInfoPanelStyle } from "./utils/helpers";

const splatOption = {
  name: "04.06.2024",
  url: "https://huggingface.co/Alekso/Gdynia_2025_06_08/resolve/main/08_06_2025.splat",
  position: [0, -1, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
};

function App() {
  const { infoPoints, addInfoPoint, editInfoPoint, deleteInfoPoint } =
    useInfoPoints();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIFC, setShowIFC] = useState(false);
  const [ifcProperties, setIfcProperties] =
    useState<IFCElementProperties | null>(null);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoPoints, setShowInfoPoints] = useState(true);
  const [showPublicGlb, setShowPublicGlb] = useState(false);
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
      isMobile() ? 70 : 110,
      isMobile() ? 30 : 7.4,
      0,
      0,
      0,
      true
    );
  };

  // Autoryzacja
  const {
    password,
    setPassword,
    isAuthenticated,
    showPasswordError,
    handlePasswordSubmit,
  } = useAuth();

  const { objectUrl, progress, showLoading } = useSplatLoader(splatOption.url);
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

  // Logowanie
  if (!isAuthenticated) {
    return (
      <PasswordScreen
        password={password}
        setPassword={setPassword}
        showPasswordError={showPasswordError}
        onSubmit={handlePasswordSubmit}
      />
    );
  }

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
      {showLoading && <LoadingOverlay progress={progress} />}

      {/* Tryb edycji – przycisk po lewej */}
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
          Tryb edycji
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
            <span style={{ fontWeight: 700, fontSize: 19, color: "#185c92" }}>
              Tryb edycji – podaj hasło
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
      {showHowToUse && <HowToUseModal onClose={() => setShowHowToUse(false)} />}
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
        toggleFullscreen={() => cameraHooks.toggleFullscreen(setIsFullscreen)}
      />

      {/* Link do porównania */}
      <div
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: 90,
        }}
      >
        <a
          href="https://develiakopernika69.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#2190e3",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 9,
            padding: "7px 18px",
            textDecoration: "none",
          }}
        >
          ↔️ Progress Compare
        </a>
      </div>

      {/* Przyciski lewy górny róg */}
      <TopLeftButtons
        showIFC={showIFC}
        setShowIFC={setShowIFC}
        showPublicGlb={showPublicGlb}
        setShowPublicGlb={setShowPublicGlb}
        setUserGlbParamsOpen={setUserGlbParamsOpen}
        isMobile={isMobile()}
      />

      {/* Panel uploadu GLB */}
      {userGlbParamsOpen && (
        <UserGlbUploadPanel
          userGlbUrl={userGlbUrl}
          showUserGlb={showUserGlb}
          setShowUserGlb={setShowUserGlb}
          setUserGlbUrl={setUserGlbUrl}
          userGlbPos={userGlbPos}
          setUserGlbPos={setUserGlbPos}
          userGlbRot={userGlbRot}
          setUserGlbRot={setUserGlbRot}
          userGlbScale={userGlbScale}
          setUserGlbScale={setUserGlbScale}
          isMobile={isMobile()}
        />
      )}

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
        />
      )}

      {/* CANVAS */}
      {objectUrl && (
        <Canvas
          className="h-full w-full touch-action-none"
          gl={{ antialias: false }}
          dpr={isMobile() ? 2 : Math.min(window.devicePixelRatio, 2)}
          camera={{
            position: isMobile() ? [90, 70, 30] : [20, 110, 7.4],
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
            {showIFC && (
              <IFCModel
                onPropertiesSelected={setIfcProperties}
                rotationY={95}
                visible={showIFC}
              />
            )}
            {showPublicGlb && (
              <Suspense fallback={null}>
                <GLBModel
                  url={userGlbUrl ?? "/models/building.glb"}
                  position={userGlbPos}
                  rotation={userGlbRot}
                  scale={userGlbScale}
                  visible={showPublicGlb}
                />
              </Suspense>
            )}
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
