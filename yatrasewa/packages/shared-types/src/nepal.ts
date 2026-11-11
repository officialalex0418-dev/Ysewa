import { z } from "zod";

/**
 * Nepal city and corridor seed data.
 * Coordinates are approximate real WGS84 lat/lng for major bus hubs.
 */

export const CitySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  nameNe: z.string(), // Devanagari
  district: z.string(),
  province: z.string(),
  lat: z.number(),
  lng: z.number(),
  isPickupHub: z.boolean().default(true),
});
export type City = z.infer<typeof CitySchema>;

export const NEPAL_CITIES: City[] = [
  { name: "Kathmandu", nameNe: "काठमाडौं", district: "Kathmandu", province: "Bagmati", lat: 27.7008, lng: 85.3203, isPickupHub: true },
  { name: "Pokhara", nameNe: "पोखरा", district: "Kaski", province: "Gandaki", lat: 28.2096, lng: 83.9856, isPickupHub: true },
  { name: "Chitwan (Sauraha)", nameNe: "चितवन (सौराहा)", district: "Chitwan", province: "Bagmati", lat: 27.5833, lng: 84.4914, isPickupHub: true },
  { name: "Lumbini", nameNe: "लुम्बिनी", district: "Rupandehi", province: "Lumbini", lat: 27.4695, lng: 83.2750, isPickupHub: true },
  { name: "Janakpur", nameNe: "जनकपुर", district: "Dhanusha", province: "Madhesh", lat: 26.7271, lng: 85.9427, isPickupHub: true },
  { name: "Birgunj", nameNe: "वीरगञ्ज", district: "Parsa", province: "Madhesh", lat: 27.0402, lng: 84.8759, isPickupHub: true },
  { name: "Kakarbhitta", nameNe: "काँकडभिट्टा", district: "Jhapa", province: "Koshi", lat: 26.6425, lng: 88.1187, isPickupHub: true },
  { name: "Bhairahawa (Siddharthanagar)", nameNe: "भैरहवा", district: "Rupandehi", province: "Lumbini", lat: 27.5015, lng: 83.4521, isPickupHub: false },
  { name: "Butwal", nameNe: "बुटवल", district: "Rupandehi", province: "Lumbini", lat: 27.7017, lng: 83.4489, isPickupHub: false },
  { name: "Narayanghat", nameNe: "नारायणघाट", district: "Chitwan", province: "Bagmati", lat: 27.7178, lng: 84.4222, isPickupHub: false },
  { name: "Mugling", nameNe: "मुग्लिङ", district: "Chitwan", province: "Bagmati", lat: 27.8547, lng: 84.5628, isPickupHub: false },
  { name: "Damauli", nameNe: "दमौली", district: "Tanahun", province: "Gandaki", lat: 27.9686, lng: 84.2664, isPickupHub: false },
  { name: "Bardibas", nameNe: "बर्दिबास", district: "Mahottari", province: "Madhesh", lat: 26.9714, lng: 85.8878, isPickupHub: false },
  { name: "Ithari", nameNe: "इटहरी", district: "Sunsari", province: "Koshi", lat: 26.6657, lng: 87.2728, isPickupHub: false },
];

export const CorridorSchema = z.object({
  key: z.string(),
  origin: z.string(),
  destination: z.string(),
  highwayName: z.string(),
  distanceKm: z.number(),
  typicalDurationHours: z.number(),
  baseFareNpr: z.number(),
  /** Ordered intermediate stop names that must exist in NEPAL_CITIES */
  via: z.array(z.string()),
});
export type Corridor = z.infer<typeof CorridorSchema>;

export const NEPAL_CORRIDORS: Corridor[] = [
  {
    key: "KTM-PKR",
    origin: "Kathmandu",
    destination: "Pokhara",
    highwayName: "Prithvi Highway",
    distanceKm: 200,
    typicalDurationHours: 6.5,
    baseFareNpr: 1200,
    via: ["Mugling", "Damauli"],
  },
  {
    key: "KTM-CTW",
    origin: "Kathmandu",
    destination: "Chitwan (Sauraha)",
    highwayName: "Prithvi Highway / Narayanghat",
    distanceKm: 150,
    typicalDurationHours: 5,
    baseFareNpr: 1000,
    via: ["Mugling", "Narayanghat"],
  },
  {
    key: "PKR-LMB",
    origin: "Pokhara",
    destination: "Lumbini",
    highwayName: "Siddhartha Highway",
    distanceKm: 180,
    typicalDurationHours: 6,
    baseFareNpr: 1100,
    via: ["Butwal", "Bhairahawa (Siddharthanagar)"],
  },
  {
    key: "KTM-JKR",
    origin: "Kathmandu",
    destination: "Janakpur",
    highwayName: "BP Highway / Mahendra Highway",
    distanceKm: 225,
    typicalDurationHours: 7,
    baseFareNpr: 1300,
    via: ["Bardibas"],
  },
  {
    key: "KTM-BIR",
    origin: "Kathmandu",
    destination: "Birgunj",
    highwayName: "Tribhuvan Highway",
    distanceKm: 290,
    typicalDurationHours: 9,
    baseFareNpr: 1600,
    via: ["Mugling", "Narayanghat"],
  },
  {
    key: "KTM-KKT",
    origin: "Kathmandu",
    destination: "Kakarbhitta",
    highwayName: "BP Highway / Mahendra Highway East",
    distanceKm: 460,
    typicalDurationHours: 14,
    baseFareNpr: 2200,
    via: ["Bardibas", "Ithari"],
  },
];

/** Format NPR: Rs. 1,200.00 */
export function formatNpr(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Generate a YS PNR code: YS-XXXX-XXXXXX */
export function generatePnr(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let block = "";
  for (let i = 0; i < 4; i++) block += chars[Math.floor(Math.random() * chars.length)]!;
  let tail = "";
  for (let i = 0; i < 6; i++) tail += chars[Math.floor(Math.random() * chars.length)]!;
  return `YS-${block}-${tail}`;
}
