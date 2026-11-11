import * as React from "react";
import { cn } from "../lib/cn.js";

interface Seat {
  label: string;
  row: number;
  col: number;
  type: "regular" | "lady" | "vip" | "sleeper" | "driver" | "door" | "crew";
  deck?: number;
}
type SeatStatus = "available" | "selected" | "locked" | "booked" | "held_crew" | "ladies_blocked";
type SeatType = Seat["type"];

export interface SeatMapProps {
  seats: Seat[];
  seatStates: Record<string, SeatStatus>;
  /** Labels of seats locked by current actor */
  myLocks?: string[];
  /** Labels of seats selected by current actor */
  selected: string[];
  onSeatClick?: (label: string) => void;
  /** Max selectable seats */
  maxSeats?: number;
  /** Hide driver / door seats (non-interactive) */
  readOnly?: boolean;
  className?: string;
}

function seatFill(type: SeatType, status: SeatStatus, selected: boolean, myLock: boolean): { fill: string; stroke: string; text: string; cursor: string; opacity: number } {
  if (type === "driver" || type === "door" || type === "crew") {
    return { fill: "#F1F3F6", stroke: "#D5DAE2", text: "#8B93A3", cursor: "not-allowed", opacity: 1 };
  }
  if (status === "booked" || status === "held_crew") {
    return { fill: "#F1F3F6", stroke: "#C92D30", text: "#C92D30", cursor: "not-allowed", opacity: 1 };
  }
  if (status === "locked" && !myLock) {
    return { fill: "#FCE8E8", stroke: "#E8A8AA", text: "#C92D30", cursor: "not-allowed", opacity: 1 };
  }
  if (selected || myLock) {
    return { fill: "#E8FFEE", stroke: "#08976B", text: "#08976B", cursor: "pointer", opacity: 1 };
  }
  if (type === "lady") {
    return { fill: "#FFF", stroke: "#D93F82", text: "#D93F82", cursor: "pointer", opacity: 1 };
  }
  return { fill: "#FFFFFF", stroke: "#E2E7ED", text: "#4A505C", cursor: "pointer", opacity: 1 };
}

export function SeatMap({ seats, seatStates, myLocks = [], selected, onSeatClick, maxSeats = 6, readOnly, className }: SeatMapProps) {
  // Compute bounding grid
  const rows = Math.max(...seats.map((s) => s.row)) + 1;
  const cols = Math.max(...seats.map((s) => s.col)) + 1;
  const cell = 36;
  const gap = 6;
  const aisleGap = 20;

  // Figure out which col index is the aisle (where seats are missing)
  const colHasSeat = (c: number) => seats.some((s) => s.col === c && s.type !== "door");

  const colPositions = React.useMemo(() => {
    const map = new Map<number, number>();
    let x = 0;
    for (let c = 0; c < cols; c++) {
      map.set(c, x);
      if (!colHasSeat(c)) {
        // aisle
        x += aisleGap;
      } else {
        x += cell + gap;
      }
    }
    return map;
  }, [cols]);

  const width = (colPositions.get(cols - 1) ?? 0) + cell;
  const height = rows * (cell + gap) + 36;

  function handleClick(seat: Seat) {
    if (readOnly) return;
    if (seat.type === "driver" || seat.type === "door" || seat.type === "crew") return;
    const status = seatStates[seat.label] ?? "available";
    const isMine = myLocks.includes(seat.label);
    const isSelected = selected.includes(seat.label);
    if (status === "booked" || (status === "locked" && !isMine)) return;
    if (!isSelected && selected.length >= maxSeats) return;
    onSeatClick?.(seat.label);
  }

  return (
    <div className={cn("rounded-xl border border-[var(--color-ys-border)] bg-white p-4", className)}>
      <div className="mb-3 flex items-center justify-between text-xs text-[var(--color-ys-ink-muted)]">
        <span className="font-semibold text-[var(--color-ys-ink)]">Select your seats</span>
        <div className="flex gap-3 text-[11px]">
          <Legend color="#FFFFFF" stroke="#E2E7ED" label="Available" />
          <Legend color="#E8FFEE" stroke="#08976B" label="Selected" />
          <Legend color="#F1F3F6" stroke="#C92D30" label="Booked" />
        </div>
      </div>
      {/* Driver at top right */}
      <div className="mb-2 flex justify-end pr-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F1F3F6] text-[10px] text-[var(--color-ys-ink-subtle)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 0-7 17l2-2a7 7 0 0 1 10 0l2 2a10 10 0 0 0-7-17z" />
          </svg>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height - 36}`} className="select-none">
        {seats.map((seat) => {
          const status = seatStates[seat.label] ?? "available";
          const isMine = myLocks.includes(seat.label);
          const isSelected = selected.includes(seat.label);
          const { fill, stroke, text, cursor } = seatFill(seat.type, status, isSelected, isMine);
          const x = colPositions.get(seat.col) ?? 0;
          const y = seat.row * (cell + gap);
          const isSleeper = seat.type === "sleeper";
          const w = isSleeper ? cell * 1.8 : cell;
          const h = cell;
          return (
            <g key={seat.label} onClick={() => handleClick(seat)} style={{ cursor }}>
              <rect x={x} y={y} width={w} height={h} rx={isSleeper ? 8 : 6} fill={fill} stroke={stroke} strokeWidth={isSelected || isMine ? 2 : 1} />
              {seat.type === "driver" ? (
                <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="9" fill={text}>
                  DRV
                </text>
              ) : status === "booked" ? (
                <g>
                  <line x1={x + 8} y1={y + 8} x2={x + w - 8} y2={y + h - 8} stroke={stroke} strokeWidth={1.5} />
                  <line x1={x + w - 8} y1={y + 8} x2={x + 8} y2={y + h - 8} stroke={stroke} strokeWidth={1.5} />
                </g>
              ) : (
                <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill={text} className="tabular-npr">
                  {seat.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legend({ color, stroke, label }: { color: string; stroke: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-3 w-3 rounded-[3px] border" style={{ background: color, borderColor: stroke }} />
      {label}
    </span>
  );
}
