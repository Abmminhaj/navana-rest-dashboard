const HOTEL_PROFILE_KEY = "navana_hotel_profile";
const NOTIFICATION_PREFS_KEY = "navana_notification_prefs";
const STAFF_KEY = "navana_staff";

export interface HotelProfile {
  hotelName: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
}

const DEFAULT_PROFILE: HotelProfile = {
  hotelName: "Navana Rest House",
  contactPhone: "+880 1711-000000",
  address: "House 14, Road 7, Banani, Dhaka",
  currency: "BDT (৳)",
  timezone: "Asia/Dhaka (GMT+6)",
};

export function getHotelProfile(): HotelProfile {
  const saved = localStorage.getItem(HOTEL_PROFILE_KEY);
  if (saved) return JSON.parse(saved);

  localStorage.setItem(HOTEL_PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
  return { ...DEFAULT_PROFILE };
}

export function saveHotelProfile(profile: HotelProfile) {
  localStorage.setItem(HOTEL_PROFILE_KEY, JSON.stringify(profile));
  refreshSettings();
}

export interface NotificationPrefs {
  pendingCheckoutAlerts: boolean;
  lowOccupancyAlerts: boolean;
  paymentReceivedAlerts: boolean;
  maintenanceReminders: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  pendingCheckoutAlerts: true,
  lowOccupancyAlerts: true,
  paymentReceivedAlerts: true,
  maintenanceReminders: false,
};

export function getNotificationPrefs(): NotificationPrefs {
  const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (saved) return JSON.parse(saved);

  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
  return { ...DEFAULT_NOTIFICATIONS };
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  refreshSettings();
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  isAdmin?: boolean;
}

const DEFAULT_STAFF: StaffMember[] = [
  { id: "u1", name: "Arif Rahman", role: "Administrator", email: "arif@navana.com", isAdmin: true },
  { id: "u2", name: "Sumaiya Khan", role: "Manager", email: "sumaiya@navana.com" },
  { id: "u3", name: "Rakib Hossain", role: "Receptionist", email: "rakib@navana.com" },
];

export function getStaff(): StaffMember[] {
  const saved = localStorage.getItem(STAFF_KEY);
  if (saved) return JSON.parse(saved);

  localStorage.setItem(STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
  return [...DEFAULT_STAFF];
}

function saveStaff(staff: StaffMember[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  refreshSettings();
}

export function addStaffMember(member: Omit<StaffMember, "id">): StaffMember {
  const staff = getStaff();
  const newMember: StaffMember = { ...member, id: `u${Date.now()}` };
  saveStaff([...staff, newMember]);
  return newMember;
}

export function updateStaffMember(id: string, updates: Partial<StaffMember>) {
  const staff = getStaff().map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveStaff(staff);
}

export function deleteStaffMember(id: string) {
  const staff = getStaff().filter((s) => s.id !== id);
  saveStaff(staff);
}

// First name of the Administrator — used for the Dashboard's "Good morning, {name}" greeting
export function getAdminDisplayName(): string {
  const staff = getStaff();
  const admin = staff.find((s) => s.isAdmin) || staff[0];
  return admin ? admin.name.split(" ")[0] : "Admin";
}

// Full name + initials of the Administrator — used in TopNav's profile pill
export function getAdminFullName(): string {
  const staff = getStaff();
  const admin = staff.find((s) => s.isAdmin) || staff[0];
  return admin ? admin.name : "Admin";
}

export function refreshSettings() {
  window.dispatchEvent(new Event("settingsUpdated"));
}
