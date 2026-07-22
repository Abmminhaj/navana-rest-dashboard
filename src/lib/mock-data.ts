// Mock data used across the prototype
export type RoomStatus =
  | "Occupied"
  | "Available"
  | "Reserved"
  | "Cleaning"
  | "Maintenance";

export interface Room {
  number: string;
  type: string;
  status: RoomStatus;
  floor: number;
  rent: number;
  amenities: string[];
  notes?: string;
}

export const rooms: Room[] = [
  { number: "101", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "102", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "103", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "104", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "105", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "106", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "107", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "108", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "109", type: "Standard", status: "Available", floor: 1, rent: 2500, amenities: [] },
  { number: "201", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "202", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "203", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "204", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "205", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "206", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "207", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "208", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "209", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "210", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "211", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "212", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "213", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "214", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "215", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
  { number: "216", type: "Standard", status: "Available", floor: 2, rent: 2500, amenities: [] },
];

export interface ActiveStay {
  id: string;
  room: string;
  customer: string;
  fatherName?: string;
  phone: string;
  nid: string;
  profession?: string;
  nationality?: string;
  address: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  village?: string;
  houseRoad?: string;
  checkIn: string;
  expectedCheckOut: string;
  rent: number;
  advance: number;
  remaining: number;
  deposits?: { amount: number; date: string }[];
  previousDue?: number;
  nidPhoto?: string | null;
  customerPhoto?: string | null;
  notes?: string;
}

export const activeStays: ActiveStay[] = [
  { id: "S-1042", room: "101", customer: "Md. Tanvir Ahmed", phone: "01711-456789", nid: "1990123456789", address: "Dhanmondi, Dhaka", checkIn: "2026-06-27 14:20", expectedCheckOut: "2026-06-29 12:00", rent: 3500, advance: 4000, remaining: 3000 },
  { id: "S-1043", room: "104", customer: "Farzana Akter", phone: "01612-998877", nid: "1985987654321", address: "Uttara, Dhaka", checkIn: "2026-06-28 18:05", expectedCheckOut: "2026-06-29 11:00", rent: 3500, advance: 2000, remaining: 1500 },
  { id: "S-1044", room: "202", customer: "Robiul Islam", phone: "01911-223344", nid: "1992345678912", address: "Sylhet Sadar", checkIn: "2026-06-26 09:40", expectedCheckOut: "2026-06-29 12:00", rent: 5500, advance: 8000, remaining: 8500 },
  { id: "S-1045", room: "203", customer: "Nusrat Jahan", phone: "01511-887766", nid: "1995112233445", address: "Mirpur 10, Dhaka", checkIn: "2026-06-28 22:10", expectedCheckOut: "2026-06-30 12:00", rent: 2500, advance: 1500, remaining: 3500 },
  { id: "S-1046", room: "206", customer: "Hasan Mahmud", phone: "01811-334455", nid: "1988556677889", address: "Chattogram", checkIn: "2026-06-27 11:00", expectedCheckOut: "2026-06-29 11:00", rent: 2500, advance: 3000, remaining: 2000 },
  { id: "S-1047", room: "301", customer: "Sadia Sultana", phone: "01711-009988", nid: "1993778899001", address: "Banani, Dhaka", checkIn: "2026-06-28 16:30", expectedCheckOut: "2026-06-29 12:00", rent: 5500, advance: 5000, remaining: 500 },
  { id: "S-1048", room: "303", customer: "Imran Hossain", phone: "01911-556677", nid: "1991334455667", address: "Rajshahi", checkIn: "2026-06-29 02:15", expectedCheckOut: "2026-07-01 12:00", rent: 3500, advance: 4000, remaining: 3000 },
  { id: "S-1049", room: "306", customer: "Mehedi Hasan", phone: "01612-112233", nid: "1989667788990", address: "Khulna", checkIn: "2026-06-27 19:45", expectedCheckOut: "2026-06-29 12:00", rent: 5500, advance: 6000, remaining: 5000 },
];

export interface CustomerRow {
  date: string;
  name: string;
  phone: string;
  nid: string;
  address: string;
  room: string;
  checkIn: string;
  checkOut: string;
  stay: string;
  rent: number;
  notes: string;
}

export const customerHistory: CustomerRow[] = [
  { date: "2026-06-25", name: "Anika Tabassum", phone: "01711-223344", nid: "1994556677001", address: "Gulshan, Dhaka", room: "302", checkIn: "2026-06-23 14:00", checkOut: "2026-06-25 11:00", stay: "2 nights", rent: 7000, notes: "Corporate guest" },
  { date: "2026-06-24", name: "Shahriar Kabir", phone: "01911-887766", nid: "1986112233456", address: "Bashundhara, Dhaka", room: "105", checkIn: "2026-06-22 16:30", checkOut: "2026-06-24 12:00", stay: "2 nights", rent: 11000, notes: "VIP" },
  { date: "2026-06-22", name: "Mahbuba Rahman", phone: "01612-554433", nid: "1990998877665", address: "Mohammadpur, Dhaka", room: "204", checkIn: "2026-06-20 13:15", checkOut: "2026-06-22 11:00", stay: "2 nights", rent: 7000, notes: "" },
  { date: "2026-06-20", name: "Kamrul Hasan", phone: "01511-334455", nid: "1987445566778", address: "Comilla", room: "106", checkIn: "2026-06-19 18:00", checkOut: "2026-06-20 11:00", stay: "1 night", rent: 2500, notes: "Walk-in" },
  { date: "2026-06-19", name: "Tanjila Hoque", phone: "01711-665544", nid: "1995223344556", address: "Bogura", room: "201", checkIn: "2026-06-17 20:10", checkOut: "2026-06-19 12:00", stay: "2 nights", rent: 7000, notes: "Repeat guest" },
  { date: "2026-06-18", name: "Rashedul Karim", phone: "01911-998877", nid: "1983778899112", address: "Narayanganj", room: "304", checkIn: "2026-06-16 09:00", checkOut: "2026-06-18 12:00", stay: "2 nights", rent: 5000, notes: "" },
  { date: "2026-06-15", name: "Sumaiya Akhter", phone: "01612-443322", nid: "1996334455778", address: "Jessore", room: "305", checkIn: "2026-06-14 22:30", checkOut: "2026-06-15 11:00", stay: "1 night", rent: 2500, notes: "" },
  { date: "2026-06-13", name: "Mahmudul Hasan", phone: "01811-665544", nid: "1989112233556", address: "Sylhet", room: "202", checkIn: "2026-06-10 14:45", checkOut: "2026-06-13 11:00", stay: "3 nights", rent: 16500, notes: "Family" },
];

// Expense type now includes `id` (used for real storage via expense-storage.ts)
// and optional `notes`. The old demo `expenses` array has been removed —
// the Expenses page now reads real, user-entered data from localStorage,
// same as Customer Information page.
export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  method: string;
  notes?: string;
}

export const monthly = [
  { month: "Jan", income: 412000, expense: 248000 },
  { month: "Feb", income: 388000, expense: 232000 },
  { month: "Mar", income: 451000, expense: 261000 },
  { month: "Apr", income: 498000, expense: 278000 },
  { month: "May", income: 524000, expense: 289000 },
  { month: "Jun", income: 562000, expense: 305000 },
].map((m) => ({ ...m, profit: m.income - m.expense }));

export const activities = [
  { time: "10:24 AM", text: "Sadia Sultana checked in to Room 301", tone: "info" as const },
  { time: "09:51 AM", text: "Room 105 marked for cleaning", tone: "warning" as const },
  { time: "09:12 AM", text: "Payment received ৳3,000 from Md. Tanvir Ahmed", tone: "success" as const },
  { time: "08:40 AM", text: "Expense added: AC servicing ৳6,500", tone: "neutral" as const },
  { time: "Yesterday", text: "Mahmudul Hasan checked out from Room 202", tone: "neutral" as const },
];
