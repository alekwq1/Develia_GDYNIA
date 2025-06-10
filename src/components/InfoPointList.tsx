import { InfoPoint, InfoPointData } from "./InfoPoint";

type InfoPointListProps = {
  points: InfoPointData[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  style?: React.CSSProperties;
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
