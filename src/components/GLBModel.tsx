import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { degToRad } from "../utils/helpers.ts";
import React, { Suspense } from "react";

type GLBModelProps = {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible: boolean;
};

// Komponent ErrorBoundary dla czytelnego błędu
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "red" }}>
          Nie udało się załadować modelu GLB.
          <br />
          Sprawdź ścieżkę lub plik.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GLBModel({
  url,
  position = [14, 0.6, -23],
  rotation = [0, 160, 0],
  scale = [1, 1, 1],
  visible,
}: GLBModelProps) {
  const radianRotation = rotation.map(degToRad) as [number, number, number];

  // Obsługa braku URL lub widoczności
  if (!url || !visible) return null;

  // Loader rzuci błąd jeśli plik nie istnieje/HTML
  const gltf = useLoader(GLTFLoader, url);

  return (
    <ModelErrorBoundary>
      <primitive
        object={gltf.scene}
        dispose={null}
        position={position}
        rotation={radianRotation}
        scale={scale}
      />
    </ModelErrorBoundary>
  );
}
