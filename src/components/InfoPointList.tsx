import { InfoPoint, InfoPointData } from "./InfoPoint";

export type InfoPointListProps = {
  style: React.CSSProperties;
  points: InfoPointData[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  editMode?: boolean; // ← DODAJ TO!
};

export function InfoPointList({
  points,
  activeId,
  onSelect,
  onClose,
}: InfoPointListProps) {
  return (
    <>
      {points.map((point) => (
        <InfoPoint
          key={point.id}
          point={point}
          isActive={activeId === point.id}
          onClick={() => onSelect(point.id)}
          onClose={onClose}
        />
      ))}
    </>
  );
}
