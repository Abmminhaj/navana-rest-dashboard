import { rooms } from "./mock-data";

const STORAGE_KEY = "navana_rooms";

export function getRooms() {
  const savedRooms = localStorage.getItem(STORAGE_KEY);

  if (savedRooms) {
    return JSON.parse(savedRooms);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));

  return [...rooms];
}

export function saveRooms(updatedRooms: any[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedRooms)
  );
}

export function occupyRoom(roomNumber: string) {
  const allRooms = getRooms();

  const updatedRooms = allRooms.map((room: any) => {
    if (room.number === roomNumber) {
      return {
        ...room,
        status: "Occupied",
      };
    }

    return room;
  });

  saveRooms(updatedRooms);
}
export function refreshRooms() {
  window.dispatchEvent(new Event("roomsUpdated"));
}
