import { useState } from "react";
import { InfoPointData } from "../utils/types";
import { DEFAULT_INFOPOINTS } from "../utils/constants";

export function useInfoPoints() {
  const getStoredInfoPoints = (): InfoPointData[] => {
    try {
      const data = localStorage.getItem("infopoints_v2");
      const parsed = data ? JSON.parse(data) : null;
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_INFOPOINTS;
    } catch {
      return DEFAULT_INFOPOINTS;
    }
  };

  const [infoPoints, setInfoPoints] = useState<InfoPointData[]>(
    getStoredInfoPoints()
  );

  const saveInfoPoints = (points: InfoPointData[]) => {
    setInfoPoints(points);
    localStorage.setItem("infopoints_v2", JSON.stringify(points));
  };

  const addInfoPoint = (point: InfoPointData) => {
    const updated = [...infoPoints, point];
    saveInfoPoints(updated);
  };

  const editInfoPoint = (updated: InfoPointData) => {
    const updatedPoints = infoPoints.map((p) =>
      p.id === updated.id ? { ...p, ...updated } : p
    );
    saveInfoPoints(updatedPoints);
  };

  const deleteInfoPoint = (id: string) => {
    const updated = infoPoints.filter((p) => p.id !== id);
    saveInfoPoints(updated);
  };

  return {
    infoPoints,
    addInfoPoint,
    editInfoPoint,
    deleteInfoPoint,
    setInfoPoints,
  };
}
