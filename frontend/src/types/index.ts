export const DEFAULT_CANCEL_POLICY = {
  noticeHours: 24,
  refundPercentage: 85,
  description: "Cancel 24h before departure for 85% refund.",
};

export const DEFAULT_PAYMENT_METHODS = [
  { id: "esewa", name: "eSewa Wallet", enabled: true },
  { id: "khalti", name: "Khalti Wallet", enabled: true },
  { id: "connectips", name: "ConnectIPS", enabled: true },
  { id: "fonepay", name: "Fonepay QR", enabled: true },
];

export const NEPAL_CORRIDORS = [
  { id: "KTM-PKR", name: "Kathmandu - Pokhara", distanceKm: 200 },
  { id: "KTM-BTL", name: "Kathmandu - Butwal", distanceKm: 260 },
  { id: "KTM-BRT", name: "Kathmandu - Biratnagar", distanceKm: 380 },
  { id: "PKR-BTL", name: "Pokhara - Butwal", distanceKm: 130 },
];

export function generate2x2Deluxe(layoutName: string) {
  return {
    name: layoutName,
    deckCount: 1,
    rows: 10,
    cols: 4,
  };
}

export type SeatStatus = "available" | "locked" | "booked" | "selected";
