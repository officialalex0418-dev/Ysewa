import React from "react";

export interface SeatMapProps {
  layout?: any;
  selectedSeats?: string[];
  onSeatClick?: (seatNumber: string) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  selectedSeats = [],
  onSeatClick,
}) => {
  const seats = [
    ["A1", "A2", "", "A3", "A4"],
    ["B1", "B2", "", "B3", "B4"],
    ["C1", "C2", "", "C3", "C4"],
    ["D1", "D2", "", "D3", "D4"],
    ["E1", "E2", "", "E3", "E4"],
    ["F1", "F2", "", "F3", "F4"],
    ["G1", "G2", "", "G3", "G4"],
    ["H1", "H2", "", "H3", "H4"],
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl max-w-xs mx-auto shadow-inner">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-300">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Driver Cabin</span>
        <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-400 flex items-center justify-center text-xs font-bold text-gray-700">
          ☸
        </div>
      </div>

      <div className="space-y-3">
        {seats.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-between gap-2">
            {row.map((seat, cIdx) => {
              if (!seat) return <div key={cIdx} className="w-10 h-10" />;
              const isSelected = selectedSeats.includes(seat);
              return (
                <button
                  key={seat}
                  type="button"
                  onClick={() => onSeatClick && onSeatClick(seat)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-105"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  {seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
