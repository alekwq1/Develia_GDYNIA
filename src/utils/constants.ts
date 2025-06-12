import { InfoPointData } from "./types";

export const ADD_INFOPOINT_PASSWORD = "1111";
export const APP_PASSWORD = "12345678";

export const DEFAULT_INFOPOINTS: InfoPointData[] = [
  {
    id: "AED on Site & Eye Wash Station",
    position: [-62, 3, 40],
    label: "AED on Site & Eye Wash Station",
    icon: "💓",
    content: `• AED: 🏥⚡
• Eye wash: 👁️🚿
`,
    cameraPosition: [-15, 65, 80],
  },
  {
    id: "H&S Board (Health & Safety)2",
    position: [-7, 3, -35],
    label: "H&S Board (Health & Safety)",
    icon: "⛑️",
    content: "🧯⛑️ (fire extinguisher + first aid kit)",
    cameraPosition: [50, 50, -50],
  },
  {
    id: "Pedestrian Communication Route",
    position: [-38, 3, 20],
    label: "Pedestrian Communication Route",
    icon: "🚸",
    content: "Pedestrian Communication Route",
    cameraPosition: [0, 100, 35],
  },
  {
    id: "No Entry – Seagull Nesting Area",
    position: [-30, 3, 55],
    label: "No Entry – Seagull Nesting Area",
    icon: "🐦",
    content: "⛔🐦 No Entry – Seagull Nesting Area",
    cameraPosition: [-15, 65, 80],
  },
  {
    id: "Emergency Board – Nearest Hospital Phone Number",
    position: [-57, 3, 22],
    label: "NEmergency Board – Nearest Hospital Phone Number",
    icon: "📞",
    content: "📞🏥 Emergency Board – Nearest Hospital Phone Number",
  },
  {
    id: "No Entry – Fuel Storage Area",
    position: [-50, 3, 0],
    label: "No Entry – Fuel Storage Area",
    icon: "⛽",
    content: "⛔⛽ No Entry – Fuel Storage Area",
    cameraPosition: [0, 100, 35],
  },
  {
    id: "H&S Board (Health & Safety)",
    position: [45, 3, -15],
    label: "H&S Board (Health & Safety)",
    icon: "⛑️",
    content: `• Lifebuoy with rope: 🛟
       • First aid kit + assigned personnel list: 💊📜`,
    cameraPosition: [60, 150, 80],
  },
  {
    id: "Safety Board",
    position: [-50, 3, 65],
    label: "Safety Board",
    icon: "🟢",
    content: `• Evacuation assembly point 🚨
• First aid kit 💊🩹
• Fire extinguisher 🔥🧯
• Fire blanket 🧯🛡️
`,
    cameraPosition: [-50, 80, 150],
  },
  {
    id: "Construction Safety Mirror",
    position: [-62, 10, 22],
    label: "Construction Safety Mirror",
    icon: "🔍",
    content: `Construction Safety Mirror🔍👷‍♂️
`,
    cameraPosition: [0, 120, 35],
  },
];
export const PUBLIC_GLB = { label: "Building", url: "/models/building.glb" };
