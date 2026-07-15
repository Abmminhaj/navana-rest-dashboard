import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Save, User, BedDouble, CreditCard, Search } from "lucide-react";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass, selectClass, textareaClass } from "@/components/ui-kit";
import { customerHistory, rooms } from "@/lib/mock-data";

export const Route = createFileRoute("/booking")({
  head: () => ({ meta: [{ title: "New Booking — Navana Rest House" }] }),
  component: BookingPage,
});

function BookingPage() {
  const [phone, setPhone] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [guestType, setGuestType] = useState("Walk-in Guest");
  const [advancePayment, setAdvancePayment] = useState(0);
  const [notes, setNotes] = useState("");
  const [roomRent, setRoomRent] = useState("");
  const [discount, setDiscount] = useState("");
  const [advance, setAdvance] = useState("");
  const [checkInDate, setCheckInDate] = useState("2026-06-29");
  const [checkOutDate, setCheckOutDate] = useState("2026-06-30");
  const [customerName, setCustomerName] = useState("");
  const [nid, setNid] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddress] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(true);
  const suggestion = useMemo(() => {
    if (phone.length < 4) return null;
    return customerHistory.find((c) => c.phone.replace(/\D/g, "").includes(phone.replace(/\D/g, "")));
  }, [phone]);

  const availableRooms = rooms.filter((r) => r.status === "Available");
  const roomInfo = availableRooms.find(
  (r) => r.number === selectedRoom
);
  const nights = Math.max(
  1,
  Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )
);
  const totalRent =
  (Number(roomRent) || 0) * nights - (Number(discount) || 0);

  const due =
  totalRent - (Number(advance) || 0);
  
  const bookingId = "NRH-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-0001";
  
  function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  function handleSaveBooking() {
  const bookingData = {
    bookingId,
    guestType,
    customerName,
    phone,
    nid,
    address,
    room: selectedRoom,
    roomType: roomInfo?.type,
    roomRent: roomInfo?.rent,
    advancePayment,
    notes,
  };

  console.log("Booking Saved:", bookingData);

  alert("Booking data captured successfully!");
}

  return (
    <div>
      <PageHeader
        title="New Booking"
        description="Register a new guest and assign a room in under a minute."
        actions={
          <>
            <button className={buttonGhost}>Cancel</button>
            <button className={buttonPrimary}>
              <Save className="h-4 w-4" />
              Save Booking
            </button>
          </>
        }
      />
    <div className="border-b border-border p-6">
      <Field label="Guest Type">
  <select
  className={selectClass}
  value={selectedRoom}
  onChange={(e) => {
    const roomNumber = e.target.value;
    setSelectedRoom(roomNumber);

    const room = availableRooms.find((r) => r.number === roomNumber);

    setRoomRent(room ? room.rent.toString() : "");
  }}
>
    <option>Walk-in Guest</option>
    <option>Online Booking</option>
    <option>Corporate Guest</option>
    <option>Regular Guest</option>
    <option>VIP Guest</option>
  </select>
</Field>
      <Field label="Booking ID">
  <input
    className={inputClass}
    value={bookingId}
    readOnly
  />
</Field>
    </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle title="Customer Information" action={<User className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <Field label="Customer Name">
                <input
                className={inputClass}
                placeholder="e.g. Md. Tanvir Ahmed"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                 />
              </Field>
              <Field label="Phone Number">
                <div className="relative">
                  <input
  className={inputClass + " pl-9"}
  placeholder="017XX-XXXXXX"
  value={phone}
  onChange={(e) => {
    setPhone(e.target.value);
    setShowSuggestion(true);
  }}
/>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  
                </div>
              </Field>
              {suggestion && showSuggestion && (
                    <div className="rounded-lg bg-white p-4 shadow-sm md:col-start-2">

  <h3 className="mb-3 text-base font-bold text-blue-700">
    👤 Existing Customer
  </h3>

  <div className="grid grid-cols-2 gap-y-2 text-sm">

    <span className="font-medium">Name</span>
    <span>{suggestion.name}</span>

    <span className="font-medium">Phone</span>
    <span>{suggestion.phone}</span>

    <span className="font-medium">NID</span>
    <span>{suggestion.nid}</span>

    <span className="font-medium">Address</span>
    <span>{suggestion.address}</span>

  </div>

  <hr className="my-4" />

  <div className="mb-3 flex items-center gap-2">
  <BedDouble className="h-5 w-5 text-blue-600" />
  <h4 className="font-semibold text-gray-800">
    Last Stay
  </h4>
  </div>

  <div className="grid grid-cols-2 gap-y-2 text-sm">

    <span className="font-medium">Room</span>
    <span>{suggestion.room}</span>

    <span className="font-medium">Check In</span>
    <span>{suggestion.checkIn}</span>

    <span className="font-medium">Check Out</span>
    <span>{suggestion.checkOut}</span>

    <span className="font-medium">Stayed</span>
    <span>{suggestion.stay}</span>

    <span className="font-medium">Rent</span>
    <span>৳{suggestion.rent}</span>

  </div>

  <button
    className={buttonPrimary + " mt-5 w-full"}
    onClick={() => {
      if (!suggestion) return;

      setCustomerName(suggestion.name);
      setPhone(suggestion.phone);
      setNid(suggestion.nid);
      setAddress(suggestion.address);
      setShowSuggestion(false);
    }}
  >
    Use Details
  </button>

</div>      
                  )}
              <Field label="National ID">
                <input
                className={inputClass}
                placeholder="13 or 17 digit NID"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                />
              </Field>
              <Field label="Profession">
                <input
                className={inputClass}
                placeholder="e.g. Banker, Doctor"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
                </Field>
              <div className="md:col-span-2">
                <Field label="Address">
                  <input
                  className={inputClass}
                  placeholder="Full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Room Information" action={<BedDouble className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <Field label="Room Number">
  <select
    className={selectClass}
    value={selectedRoom}
    onChange={(e) => {
      const roomNumber = e.target.value;
      setSelectedRoom(roomNumber);

      const room = availableRooms.find(
        (r) => r.number === roomNumber
      );

      setRoomRent(room ? room.rent.toString() : "");
    }}
  >
    <option value="">Select Room</option>

    {availableRooms.map((r) => (
      <option key={r.number} value={r.number}>
        {r.number}
      </option>
    ))}
  </select>
</Field>
              <Field label="Room Type">
  <input
    className={inputClass}
    value={roomInfo?.type || ""}
    readOnly
    placeholder="Select a room first"
  />
</Field>
              <Field label="Check-in Date">
                <input
  type="date"
  className={inputClass}
  value={checkInDate}
  onChange={(e) => setCheckInDate(e.target.value)}
/>
              </Field>
              <Field label="Check-in Time">
                <input type="time" className={inputClass} defaultValue="14:00" />
              </Field>
              <Field label="Expected Check-out Date">
                <input
  type="date"
  className={inputClass}
  value={checkOutDate}
  onChange={(e) => setCheckOutDate(e.target.value)}
/>
              </Field>
              <Field label="Expected Check-out Time">
                <input type="time" className={inputClass} defaultValue="12:00" />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle title="Payment Information" action={<CreditCard className="h-4 w-4 text-muted-foreground" />} />
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <Field label="Room Rent (per night)">
  <input
    className={inputClass}
    value={roomRent}
    onChange={(e) => setRoomRent(e.target.value)}
    placeholder="Select a room first"
  />
</Field>
              <Field label="Discount">
  <input
    className={inputClass}
    value={discount}
    onChange={(e) => setDiscount(e.target.value)}
    placeholder="0"
  />
</Field>

<Field label="Advance Payment">
  <input
    className={inputClass}
    type="number"
    placeholder="0"
    value={advancePayment}
    onChange={(e) => setAdvancePayment(Number(e.target.value))}
  />
</Field>
              <Field label="Payment Method">
                <select className={selectClass}>
                  <option>Cash</option>
                  <option>bKash</option>
                  <option>Nagad</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </Field>
              <div className="md:col-span-3">
                <Field label="Notes">
  <textarea
    className={textareaClass}
    placeholder="Special requests, ID verification notes, etc."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
</Field>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button
  className={buttonPrimary + " h-12 px-8 text-base"}
  onClick={handleSaveBooking}
>
              <Save className="h-5 w-5" />
              Save Booking
            </button>
          </div>
        </div>

        <Card className="h-fit p-6">
          <h3 className="text-sm font-semibold text-foreground">Booking Summary</h3>
          <p className="text-xs text-muted-foreground">Live preview of charges</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row
  label="Room"
  value={
    selectedRoom
      ? `${selectedRoom} · ${roomInfo?.type ?? ""}`
      : "-"
  }
/>
<Row label="Nights" value={String(nights)} />
<Row label="Room Rent" value={`৳${roomRent || 0}`} />

<Row label="Discount" value={`৳${discount || 0}`} />

<div className="my-2 border-t border-border" />

<Row label="Estimated Total" value={`৳${totalRent}`} bold />

<Row label="Advance" value={`৳${advance || 0}`} />

<Row label="Estimated Due" value={`৳${due}`} bold />
          </dl>
        </Card>
      </div>
    </div>
  );
}

  function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "font-bold text-foreground" : "font-medium text-foreground"}>{value}</dd>
    </div>
  );
}
