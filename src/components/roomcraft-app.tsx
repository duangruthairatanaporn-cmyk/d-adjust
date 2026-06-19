"use client";

import { useMemo, useState } from "react";
import { furnitureCatalog, roomPresets, type FurnitureItem } from "@/lib/room-data";
import { useRoomStore } from "@/store/room-store";

const cell = 54;

function formatSavedAt(value: string | null) {
  if (!value) return "Unsaved";
  return `Saved ${new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value))}`;
}

function itemSize(item: FurnitureItem) {
  const sideways = item.rotation === 90 || item.rotation === 270;
  return {
    width: sideways ? item.depth : item.width,
    depth: sideways ? item.width : item.depth
  };
}

export function RoomCraftApp() {
  const {
    room,
    items,
    selectedId,
    savedAt,
    setRoom,
    addFurniture,
    moveFurniture,
    rotateFurniture,
    deleteFurniture,
    selectFurniture,
    saveProject
  } = useRoomStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const boardWidth = room.width * cell;
  const boardDepth = room.depth * cell;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5 sm:max-w-5xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sage">
            RoomCraft
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
            Bedroom Studio
          </h1>
        </div>
        <button
          type="button"
          onClick={saveProject}
          className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-soft transition active:scale-95"
        >
          Save
        </button>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-[1fr_280px] sm:items-start">
        <div className="overflow-hidden rounded-[28px] border border-line bg-white/74 shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">{room.label} Bedroom</p>
              <p className="text-xs text-ink/55">{formatSavedAt(savedAt)}</p>
            </div>
            <p className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/65">
              {items.length} items
            </p>
          </div>

          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden px-4 py-10">
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#e3ded5] to-transparent" />
            <div
              className="iso-stage relative rounded-md border border-[#cfc6b8] bg-[#efe7da]"
              style={{
                width: boardWidth,
                height: boardDepth,
                backgroundImage:
                  "linear-gradient(#d8d0c4 1px, transparent 1px), linear-gradient(90deg, #d8d0c4 1px, transparent 1px)",
                backgroundSize: `${cell}px ${cell}px`
              }}
              onPointerDown={() => selectFurniture(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggingId) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const x = Math.round((event.clientX - rect.left) / cell) - 1;
                const y = Math.round((event.clientY - rect.top) / cell) - 1;
                moveFurniture(draggingId, x, y);
                selectFurniture(draggingId);
                setDraggingId(null);
              }}
            >
              {items.map((item) => {
                const size = itemSize(item);
                const isSelected = selectedId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      setDraggingId(item.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectFurniture(item.id);
                    }}
                    className={`iso-piece absolute rounded-lg border-2 text-[10px] font-bold uppercase text-ink transition ${
                      isSelected ? "border-ink" : "border-white/70"
                    }`}
                    style={{
                      left: item.x * cell + 6,
                      top: item.y * cell + 6,
                      width: size.width * cell - 12,
                      height: size.depth * cell - 12,
                      background: item.color,
                      boxShadow: `inset 0 -12px 0 ${item.accent}`
                    }}
                  >
                    <span className="relative z-10 block rotate-[-45deg] text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="grid gap-3">
          <section className="rounded-3xl border border-line bg-white/80 p-4 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Room size</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {roomPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setRoom(preset)}
                  className={`h-11 rounded-2xl border text-sm font-semibold transition active:scale-95 ${
                    preset.id === room.id
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-paper text-ink"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-white/80 p-4 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Furniture</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {furnitureCatalog.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => addFurniture(item.kind)}
                  className="flex h-16 items-center gap-2 rounded-2xl border border-line bg-paper px-3 text-left text-sm font-semibold text-ink transition active:scale-95"
                >
                  <span
                    className="h-8 w-8 rounded-xl border border-white"
                    style={{ background: item.color, boxShadow: `inset 0 -8px 0 ${item.accent}` }}
                  />
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-white/80 p-4 shadow-soft">
            <h2 className="text-sm font-semibold text-ink">Selected</h2>
            {selectedItem ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => rotateFurniture(selectedItem.id)}
                  className="h-11 rounded-2xl bg-sage text-sm font-semibold text-white transition active:scale-95"
                >
                  Rotate
                </button>
                <button
                  type="button"
                  onClick={() => deleteFurniture(selectedItem.id)}
                  className="h-11 rounded-2xl bg-clay text-sm font-semibold text-white transition active:scale-95"
                >
                  Delete
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/58">
                Tap a furniture block to edit it.
              </p>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
