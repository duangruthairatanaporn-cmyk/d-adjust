"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  defaultRoom,
  furnitureCatalog,
  type FurnitureItem,
  type FurnitureKind,
  type RoomPreset
} from "@/lib/room-data";

type RoomState = {
  room: RoomPreset;
  items: FurnitureItem[];
  selectedId: string | null;
  savedAt: string | null;
  setRoom: (room: RoomPreset) => void;
  addFurniture: (kind: FurnitureKind) => void;
  moveFurniture: (id: string, x: number, y: number) => void;
  rotateFurniture: (id: string) => void;
  deleteFurniture: (id: string) => void;
  selectFurniture: (id: string | null) => void;
  saveProject: () => void;
};

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

const fitItemToRoom = (item: FurnitureItem, room: RoomPreset): FurnitureItem => {
  const isSideways = item.rotation === 90 || item.rotation === 270;
  const width = isSideways ? item.depth : item.width;
  const depth = isSideways ? item.width : item.depth;

  return {
    ...item,
    x: clamp(item.x, Math.max(0, room.width - width)),
    y: clamp(item.y, Math.max(0, room.depth - depth))
  };
};

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      room: defaultRoom,
      items: [],
      selectedId: null,
      savedAt: null,
      setRoom: (room) =>
        set((state) => ({
          room,
          items: state.items.map((item) => fitItemToRoom(item, room))
        })),
      addFurniture: (kind) => {
        const template = furnitureCatalog.find((item) => item.kind === kind);
        if (!template) return;

        const room = get().room;
        const item: FurnitureItem = {
          ...template,
          id: `${kind}-${Date.now()}`,
          x: Math.max(0, Math.floor((room.width - template.width) / 2)),
          y: Math.max(0, Math.floor((room.depth - template.depth) / 2)),
          rotation: 0
        };

        set((state) => ({
          items: [...state.items, fitItemToRoom(item, room)],
          selectedId: item.id
        }));
      },
      moveFurniture: (id, x, y) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? fitItemToRoom({ ...item, x, y }, state.room) : item
          )
        })),
      rotateFurniture: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? fitItemToRoom(
                  {
                    ...item,
                    rotation: ((item.rotation + 90) % 360) as FurnitureItem["rotation"]
                  },
                  state.room
                )
              : item
          )
        })),
      deleteFurniture: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId
        })),
      selectFurniture: (id) => set({ selectedId: id }),
      saveProject: () => set({ savedAt: new Date().toISOString() })
    }),
    {
      name: "roomcraft-project",
      partialize: (state) => ({
        room: state.room,
        items: state.items,
        selectedId: state.selectedId,
        savedAt: state.savedAt
      })
    }
  )
);
