const STORAGE_KEY = "navana_bookings";

export function getBookings() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  return JSON.parse(data);
}

export function saveBooking(booking: any) {
  const bookings = getBookings();

  bookings.push(booking);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bookings)
  );
}