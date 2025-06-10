// File: Splat.tsx
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import SplatSortWorker from "./splat-sort-worker?worker";
import { fragmentShaderSource, vertexShaderSource } from "./splat-shaders";
import { useFrame, useThree } from "@react-three/fiber";

// Maksymalna liczba splatów
const MAX_SPLATS = 10000000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export type RotationDeg = {
  x?: number;
  y?: number;
  z?: number;
};

export function Splat({
  url = "https://huggingface.co/Alekso/Equinor_02_06_2025/resolve/main/Equinor_02_06_2025.splat",
  maxSplats = MAX_SPLATS,
  rotationDeg = { x: 180, y: 0, z: 0 }, // domyślna orientacja w stopniach
}: {
  url?: string;
  maxSplats?: number;
  rotationDeg?: RotationDeg;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.InstancedBufferGeometry>(null);
  const [worker] = useState(() => new SplatSortWorker());
  const {
    size: { width, height },
    camera: { fov, aspect },
    viewport: { dpr },
  } = useThree() as any;

  // Uniformy do shaderów
  const [uniforms] = useState({
    viewport: { value: new THREE.Vector2(width * dpr, height * dpr) },
    focal: { value: new THREE.Vector2(1, 1) },
  });

  useEffect(() => {
    // Ustaw macierze focal i viewport
    uniforms.focal.value.set(
      (dpr * height) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2)),
      (dpr * height) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2))
    );
    uniforms.viewport.value.set(width * dpr, height * dpr);
  }, [width, height, fov, aspect, dpr]);

  // Bufory zaalokowane raz
  const [buffers] = useState(() => ({
    index: new Uint16Array([0, 1, 2, 2, 3, 0]),
    position: new Float32Array([1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]),
    color: new Float32Array(4 * MAX_SPLATS),
    quat: new Float32Array(4 * MAX_SPLATS),
    scale: new Float32Array(3 * MAX_SPLATS),
    center: new Float32Array(3 * MAX_SPLATS),
  }));

  // Wyłącz frustum culling i ustaw rotację z propsów
  useEffect(() => {
    const m = meshRef.current!;
    m.frustumCulled = false;
    const { x = 0, y = 0, z = 0 } = rotationDeg;
    m.rotation.set(toRad(x), toRad(y), toRad(z));
  }, [rotationDeg]);

  // Odbiór i aktualizacja buforów
  useEffect(() => {
    worker.onmessage = (e) => {
      const { quat, center, color, scale } = e.data;
      const count = quat.length / 4;
      buffers.quat.set(quat, 0);
      buffers.center.set(center, 0);
      buffers.color.set(color, 0);
      buffers.scale.set(scale, 0);
      const geo = geoRef.current!;
      (geo.getAttribute("quat") as THREE.InstancedBufferAttribute).needsUpdate =
        true;
      (
        geo.getAttribute("center") as THREE.InstancedBufferAttribute
      ).needsUpdate = true;
      (
        geo.getAttribute("color") as THREE.InstancedBufferAttribute
      ).needsUpdate = true;
      (
        geo.getAttribute("scale") as THREE.InstancedBufferAttribute
      ).needsUpdate = true;
      geo.instanceCount = count;
    };
    return () => {
      worker.onmessage = null;
    };
  }, [worker]);

  // Ładowanie .splat
  useEffect(() => {
    let stop = false;
    const load = async () => {
      const resp = await fetch(url);
      const len = parseInt(resp.headers.get("content-length") || "0", 10);
      const reader = resp.body!.getReader();
      let data = new Uint8Array(len),
        received = 0,
        last = -1;
      const rowLen = 3 * 4 + 3 * 4 + 4 + 4;
      while (!stop) {
        const { done, value } = await reader.read();
        if (done) break;
        data.set(value!, received);
        received += value!.length;
        const cnt = Math.floor(received / rowLen);
        if (cnt > last) {
          worker.postMessage({ buffer: data.buffer, vertexCount: cnt });
          last = cnt;
        }
      }
      worker.postMessage({ buffer: data.buffer, vertexCount: last });
    };
    load();
    return () => {
      stop = true;
    };
  }, [url, worker]);

  // Wysyłanie macierzy do workera w useFrame
  useFrame((state) => {
    const m = meshRef.current!;
    const cam = state.camera;
    const vp = new THREE.Matrix4()
      .multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
      .multiply(m.matrixWorld).elements;
    worker.postMessage({ view: vp, maxSplats });
  });

  return (
    <mesh ref={meshRef}>
      <instancedBufferGeometry ref={geoRef} instanceCount={MAX_SPLATS}>
        <bufferAttribute
          attach="index"
          array={buffers.index}
          itemSize={1}
          count={6}
        />
        <bufferAttribute
          attach="attributes-position"
          array={buffers.position}
          itemSize={3}
          count={4}
        />
        <instancedBufferAttribute
          attach="attributes-color"
          array={buffers.color}
          itemSize={4}
          count={MAX_SPLATS}
        />
        <instancedBufferAttribute
          attach="attributes-quat"
          array={buffers.quat}
          itemSize={4}
          count={MAX_SPLATS}
        />
        <instancedBufferAttribute
          attach="attributes-scale"
          array={buffers.scale}
          itemSize={3}
          count={MAX_SPLATS}
        />
        <instancedBufferAttribute
          attach="attributes-center"
          array={buffers.center}
          itemSize={3}
          count={MAX_SPLATS}
        />
      </instancedBufferGeometry>
      <rawShaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShaderSource}
        fragmentShader={fragmentShaderSource}
        depthTest
        depthWrite={false}
        transparent
      />
    </mesh>
  );
}
