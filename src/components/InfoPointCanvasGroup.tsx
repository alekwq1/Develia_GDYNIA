import React from "react";
import { InfoPointList } from "./InfoPointList";
import { InfoPointData } from "../utils/types";

type Props = {
  infoPoints: InfoPointData[];
  activeInfoPoint: string | null; // preview dymek
  setActiveInfoPoint: (id: string) => void;
  showInfoPoints: boolean;
  infoPanelStyle: React.CSSProperties;
  editMode?: boolean;
  onClosePreview?: () => void;
};

const InfoPointCanvasGroup: React.FC<Props> = ({
  infoPoints,
  activeInfoPoint,
  setActiveInfoPoint,
  showInfoPoints,
  infoPanelStyle,
  editMode = false,
  onClosePreview,
}) => {
  if (!showInfoPoints) return null;
  return (
    <InfoPointList
      style={infoPanelStyle}
      points={infoPoints}
      activeId={!editMode ? activeInfoPoint : null}
      onSelect={setActiveInfoPoint}
      onClose={onClosePreview ? onClosePreview : () => {}}
      editMode={editMode}
    />
  );
};

export default InfoPointCanvasGroup;
