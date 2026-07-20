import { rooms, type Room, type RoomStatus } from "./mock-data";

const STORAGE_KEY = "navana_rooms";

export function getRooms(): Room[] {
  const savedRooms = localStorage.getItem(STORAGE_KEY);

  if (savedRooms) {
    return JSON.parse(savedRooms);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));

  return [...rooms];
}

export function saveRooms(updatedRooms: Room[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRooms));
}

export function occupyRoom(roomNumber: string) {
  updateRoomStatus(roomNumber, "Occupied");
}

export function updateRoomStatus(
  roomNumber: string,
  status: RoomStatus
)
 {
  const allRooms = getRooms();

  const updatedRooms = allRooms.map((room: Room) => {
    if (room.number === roomNumber) {
      return {
        ...room,
        status,
      };
    }

    return room;
  });

  saveRooms(updatedRooms);
  refreshRooms();
}

export function refreshRooms() {
  window.dispatchEvent(new Event("roomsUpdated"));
}