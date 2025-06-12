import { useRef } from "react";

export function useCameraControls(
  setActiveInfoPoint: (id: string | null) => void
) {
  const cameraControls = useRef<any>(null);

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

  const toggleFullscreen = (setIsFullscreen: (v: boolean) => void) => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return {
    cameraControls,
    focusCameraOn,
    resetCamera,
    toggleFullscreen,
  };
}
