import { useEffect, useRef } from "react";

export function useCameraWASD(
  cameraControls: any,
  isFullscreen: boolean,
  resetCamera: () => void,
  toggleFullscreen: () => void,
  setActiveInfoPoint: (v: any) => void
) {
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
      if (typeof e.key !== "string") return;
      switch (e.key.toLowerCase()) {
        case "w":
          moveState.current.forward = true;
          break;
        case "s":
          moveState.current.backward = true;
          break;
        case "a":
          moveState.current.left = true;
          break;
        case "d":
          moveState.current.right = true;
          break;
        case "q":
          moveState.current.up = true;
          break;
        case "e":
          moveState.current.down = true;
          break;
        case "r":
          resetCamera();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "escape":
          if (isFullscreen) toggleFullscreen();
          setActiveInfoPoint(null);
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (typeof e.key !== "string") return;
      switch (e.key.toLowerCase()) {
        case "w":
          moveState.current.forward = false;
          break;
        case "s":
          moveState.current.backward = false;
          break;
        case "a":
          moveState.current.left = false;
          break;
        case "d":
          moveState.current.right = false;
          break;
        case "q":
          moveState.current.up = false;
          break;
        case "e":
          moveState.current.down = false;
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFullscreen, resetCamera, toggleFullscreen, setActiveInfoPoint]);

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
  }, [cameraControls]);
}
