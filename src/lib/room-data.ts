export type RoomPreset = {
  id: string;
  label: string;
  width: number;
  depth: number;
};

export type FurnitureKind = "bed" | "wardrobe" | "desk" | "chair" | "side-table";

export type FurnitureTemplate = {
  kind: FurnitureKind;
  label: string;
  width: number;
  depth: number;
  color: string;
  accent: string;
};

export type FurnitureItem = FurnitureTemplate & {
  id: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
};

export const roomPresets: RoomPreset[] = [
  { id: "3x3", label: "3x3m", width: 3, depth: 3 },
  { id: "3x4", label: "3x4m", width: 3, depth: 4 },
  { id: "4x4", label: "4x4m", width: 4, depth: 4 },
  { id: "4x5", label: "4x5m", width: 4, depth: 5 }
];

export const furnitureCatalog: FurnitureTemplate[] = [
  {
    kind: "bed",
    label: "Bed",
    width: 2,
    depth: 2,
    color: "#d7bea8",
    accent: "#9f6b52"
  },
  {
    kind: "wardrobe",
    label: "Wardrobe",
    width: 1,
    depth: 2,
    color: "#8fa391",
    accent: "#52685b"
  },
  {
    kind: "desk",
    label: "Desk",
    width: 2,
    depth: 1,
    color: "#c9926c",
    accent: "#7d513b"
  },
  {
    kind: "chair",
    label: "Chair",
    width: 1,
    depth: 1,
    color: "#b8c3cf",
    accent: "#667789"
  },
  {
    kind: "side-table",
    label: "Side Table",
    width: 1,
    depth: 1,
    color: "#e2d4bc",
    accent: "#9a8461"
  }
];

export const defaultRoom = roomPresets[1];
