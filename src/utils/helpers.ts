export const isMobile = () => window.innerWidth < 768;

export const getInfoPanelStyle = (isMobile: boolean): React.CSSProperties =>
  isMobile
    ? {
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        height: "36vh",
        background: "rgba(255,255,255,0.95)",
        zIndex: 99,
        overflowY: "auto",
        borderTop: "1px solid #e2e8f0",
      }
    : {};
export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
