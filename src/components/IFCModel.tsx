import React, { useEffect, useRef, useState, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { IFCLoader } from "web-ifc-three";
import * as THREE from "three";

export interface IFCProps {
  onPropertiesSelected?: (props: IFCElementProperties | null) => void;
  visible: boolean;
  rotationY?: number;
}

export type IFCElementProperties = {
  GlobalId?: { value: string };
  Name?: { value: string };
  Description?: { value: string };
  [key: string]: { value: unknown } | undefined;
};

// Zaktualizowany typ PropertySet
interface PropertySet {
  Name?: { value: string }; // Dodaj właściwość Name
  HasProperties?: Array<{ name: string; value: unknown }>;
}

interface Material {
  expressID: number;
  type: number;
  Name: { value: string };
}

const IFCModel: React.FC<IFCProps> = ({
  onPropertiesSelected,
  visible,
  rotationY = 95,
}) => {
  const { scene, camera, gl } = useThree();
  const ifcLoaderRef = useRef<IFCLoader | null>(null);
  const [selectedProps, setSelectedProps] =
    useState<IFCElementProperties | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  // Inicjalizacja ładowania modelu
  useEffect(() => {
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath("/");

    const loadModel = async () => {
      try {
        const model = await ifcLoader.loadAsync("/model.ifc");
        console.log("Model loaded successfully:", model);

        if (model instanceof THREE.Object3D) {
          model.scale.set(1, 1, 1);
          model.position.set(1.2, 0.8, 33.8);
          model.rotation.y = THREE.MathUtils.degToRad(69.9);
          scene.add(model);
          modelRef.current = model;
        } else {
          console.error("Loaded model is not a valid Object3D");
        }
      } catch (error) {
        console.error("Błąd ładowania modelu:", error);
      }
    };

    loadModel();
    ifcLoaderRef.current = ifcLoader;

    return () => {
      if (modelRef.current) scene.remove(modelRef.current);
      ifcLoaderRef.current?.ifcManager.dispose();
    };
  }, [scene, rotationY]);

  // Obsługa widoczności modelu
  useEffect(() => {
    if (modelRef.current) modelRef.current.visible = visible;
  }, [visible]);

  // Główna funkcja obsługi kliknięcia
  const handlePointerDown = useCallback(
    async (event: PointerEvent) => {
      if (!visible || !ifcLoaderRef.current || !modelRef.current) return;

      // Funkcja do wyciągania wartości z obiektów IFC
      const extractValue = (obj: unknown): unknown => {
        if (obj && typeof obj === "object") {
          // Sprawdź, czy wartość jest w polu NominalValue (typowe dla IFC)
          if ("NominalValue" in obj) {
            return (obj as { NominalValue: { value: unknown } }).NominalValue
              .value;
          }
          // Domyślnie sprawdź pole "value"
          if ("value" in obj) {
            return (obj as { value: unknown }).value;
          }
        }
        return obj;
      };

      try {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([modelRef.current], true);
        console.log("Intersections:", intersects);
        if (intersects.length === 0) return;

        const firstIntersection = intersects[0];
        if (
          !(firstIntersection.object instanceof THREE.Mesh) ||
          !firstIntersection.face
        )
          return;

        const expressID = ifcLoaderRef.current.ifcManager.getExpressId(
          firstIntersection.object.geometry,
          firstIntersection.faceIndex ?? 0
        );
        console.log("ExpressID:", expressID);
        if (!expressID) return;

        const [itemProps, propertySets, typeProperties, materialsProperties] =
          await Promise.all([
            ifcLoaderRef.current.ifcManager.getItemProperties(0, expressID),
            ifcLoaderRef.current.ifcManager.getPropertySets(0, expressID),
            ifcLoaderRef.current.ifcManager.getTypeProperties(0, expressID),
            ifcLoaderRef.current.ifcManager.getMaterialsProperties(
              0,
              expressID
            ),
          ]);

        console.log("Item Properties:", itemProps);
        console.log("Property Sets:", propertySets); // Dodatkowy log
        console.log("Type Properties:", typeProperties);
        console.log("Materials Properties:", materialsProperties);

        // Łączenie wszystkich właściwości w jeden obiekt
        const allProperties: IFCElementProperties = {};

        // Dodanie właściwości z itemProps
        if (itemProps && typeof itemProps === "object") {
          Object.entries(itemProps).forEach(([key, value]) => {
            allProperties[key] = { value: extractValue(value) };
          });
        }

        // Dodanie właściwości z propertySets
        if (Array.isArray(propertySets)) {
          propertySets.forEach((set: PropertySet) => {
            if (
              set.Name &&
              set.HasProperties &&
              Array.isArray(set.HasProperties)
            ) {
              const setName = set.Name.value;
              const properties: Record<string, { value: unknown }> = {};

              set.HasProperties.forEach((prop) => {
                if (prop.name && prop.value !== undefined) {
                  // Użyj extractValue dla prop.value
                  properties[prop.name] = { value: extractValue(prop.value) };
                }
              });

              allProperties[setName] = { value: properties };
            }
          });
        }

        // Dodanie właściwości z typeProperties
        if (typeProperties && typeof typeProperties === "object") {
          Object.entries(typeProperties).forEach(([key, value]) => {
            allProperties[`TYPE_${key}`] = { value: extractValue(value) };
          });
        }

        // Dodanie właściwości z materialsProperties
        if (Array.isArray(materialsProperties)) {
          materialsProperties.forEach((material: Material) => {
            if (material && typeof material === "object") {
              Object.entries(material).forEach(([key, value]) => {
                allProperties[`MATERIAL_${key}`] = {
                  value: extractValue(value),
                };
              });
            }
          });
        }

        console.log("Zebrane właściwości:", allProperties);

        // Iterowanie po właściwościach ERB_General
        if (
          allProperties.ERB_General &&
          typeof allProperties.ERB_General.value === "object" &&
          allProperties.ERB_General.value !== null
        ) {
          console.log("ERB_General:");
          Object.entries(allProperties.ERB_General.value).forEach(
            ([key, value]) => {
              const propertyValue = (value as { value: unknown }).value; // Rzutowanie typu
              console.log(`${key}: ${propertyValue}`);
            }
          );
        }

        // Iterowanie po właściwościach ERB_Data
        if (
          allProperties.ERB_Data &&
          typeof allProperties.ERB_Data.value === "object" &&
          allProperties.ERB_Data.value !== null
        ) {
          console.log("ERB_Data:");
          Object.entries(allProperties.ERB_Data.value).forEach(
            ([key, value]) => {
              const propertyValue = (value as { value: unknown }).value; // Rzutowanie typu
              console.log(`${key}: ${propertyValue}`);
            }
          );
        }

        // Konwersja właściwości do formatu JSON
        const jsonProperties = JSON.stringify(allProperties, null, 2);
        console.log("JSON Properties:", jsonProperties);

        setSelectedProps(allProperties);
      } catch (error) {
        console.error("Błąd przetwarzania:", error);
        setSelectedProps(null);
      }
    },
    [camera, gl.domElement, visible]
  );
  // Rejestracja event listenerów
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    return () => canvas.removeEventListener("pointerdown", handlePointerDown);
  }, [gl.domElement, handlePointerDown]);

  // Propagacja właściwości do komponentu nadrzędnego
  useEffect(() => {
    onPropertiesSelected?.(visible ? selectedProps : null);
  }, [selectedProps, onPropertiesSelected, visible]);

  return null;
};

export default IFCModel;
