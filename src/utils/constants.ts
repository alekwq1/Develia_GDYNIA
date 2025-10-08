import { InfoPointData } from "./types";

export const ADD_INFOPOINT_PASSWORD = "1111";
export const APP_PASSWORD = "12345678";

export const DEFAULT_INFOPOINTS: InfoPointData[] = [
  {
    id: "Safety Board",
    position: [-40, 6, 130],
    label: "Safety Board",
    icon: "🟢",
    content: `• Evacuation assembly point 🚨
• First aid kit 💊🩹
• Fire extinguisher 🔥🧯
• Fire blanket 🧯🛡️
`,
    cameraPosition: [28, 107, 132],
  },
];
export const PUBLIC_GLB = { label: "Building", url: "/models/building.glb" };
