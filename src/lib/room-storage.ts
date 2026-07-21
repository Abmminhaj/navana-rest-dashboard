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

export function updateRoom(roomNumber: string, updates: Partial<Room>) {
  const allRooms = getRooms();

  const updatedRooms = allRooms.map((room: Room) => {
    if (room.number === roomNumber) {
      return {
        ...room,
        ...updates,
      };
    }

    return room;
  });

  saveRooms(updatedRooms);
  refreshRooms();
}

export function resetRoomsToDefault() {
  saveRooms(rooms);
  refreshRooms();
}

export function addRoom(newRoom: Room) {
  const allRooms = getRooms();

  if (allRooms.some((r) => r.number === newRoom.number)) {
    throw new Error("ROOM_EXISTS");
  }

  const updated = [...allRooms, newRoom].sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true })
  );

  saveRooms(updated);
  refreshRooms();
}

export function deleteRoom(roomNumber: string) {
  const allRooms = getRooms();
  const updated = allRooms.filter((r) => r.number !== roomNumber);

  saveRooms(updated);
  refreshRooms();
}

export function refreshRooms() {
  window.dispatchEvent(new Event("roomsUpdated"));
}