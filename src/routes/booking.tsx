import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, User, BedDouble, CreditCard, Search, Upload, X } from "lucide-react";
import { Card, Field, PageHeader, SectionTitle, buttonGhost, buttonPrimary, inputClass, selectClass, textareaClass } from "@/components/ui-kit";
import { type Room } from "@/lib/mock-data";
import { getCustomerHistory, type CustomerHistoryRecord } from "@/lib/customer-history-storage";
import { divisions, getDistrictsByDivision, getUpazilasByDistrict } from "@/lib/bd-locations";
import { saveBooking, getBookings } from "@/lib/booking-storage";
import { getRooms, occupyRoom, refreshRooms } from "@/lib/room-storage";
import { saveActiveStay } from "@/lib/stay-storage";

const MIN_PHOTO_SIZE_BYTES = 10 * 1024; // 10KB minimum

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO() {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function compressImage(file: File, maxDimension = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File could not be read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}


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
  const [checkInDate, setCheckInDate] = useState(todayISO());
  const [checkInTime, setCheckInTime] = useState(nowHHMM());
  const [checkOutDate, setCheckOutDate] = useState(tomorrowISO());
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [customerName, setCustomerName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [nid, setNid] = useState("");
  const [profession, setProfession] = useState("");
  const [nationality, setNationality] = useState("Bangladeshi");
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [village, setVillage] = useState("");
  const [houseRoad, setHouseRoad] = useState("");
  const [nidPhoto, setNidPhoto] = useState<string | null>(null);
  const [nidPhotoName, setNidPhotoName] = useState("");
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(null);
  const [customerPhotoName, setCustomerPhotoName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [previousDue, setPreviousDue] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customerHistory, setCustomerHistory] = useState<CustomerHistoryRecord[]>([]);
  const [bookingId, setBookingId] = useState("");

  function generateBookingId() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const todaysCount = getBookings().filter(
      (b: any) => typeof b.bookingId === "string" && b.bookingId.startsWith(`NRH-${todayStr}-`)
    ).length;
    const nextSeq = String(todaysCount + 1).padStart(4, "0");
    return `NRH-${todayStr}-${nextSeq}`;
  }

  const availableDistricts = useMemo(
    () => (divisionId ? getDistrictsByDivision(divisionId) : []),
    [divisionId]
  );
  const availableUpazilas = useMemo(
    () => (districtId ? getUpazilasByDistrict(districtId) : []),
    [districtId]
  );

  async function handlePhotoSelect(
    file: File | undefined,
    setPhoto: (value: string | null) => void,
    setName: (value: string) => void
  ) {
    setPhotoError("");
    if (!file) return;

    if (file.size < MIN_PHOTO_SIZE_BYTES) {
      setPhotoError("ছবির সাইজ অনেক ছোট (কমপক্ষে 10KB হতে হবে)। স্পষ্ট একটা ছবি আপলোড করো।");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setName(file.name);
    } catch {
      setPhotoError("ছবিটি আপলোড করা যায়নি, অন্য একটি ছবি চেষ্টা করো।");
    }
  }

  useEffect(() => {
    setRooms(getRooms());
    setCustomerHistory(getCustomerHistory());
    setBookingId(generateBookingId());

    function handleRoomsUpdated() {
      setRooms(getRooms());
    }

    window.addEventListener("roomsUpdated", handleRoomsUpdated);
    return () => window.removeEventListener("roomsUpdated", handleRoomsUpdated);
  }, []);

  const suggestion = useMemo(() => {
    if (phone.replace(/\D/g, "").length < 4) return null;

    const digits = phone.replace(/\D/g, "");
    const matches = customerHistory
      .filter((c) => c.phone.replace(/\D/g, "").includes(digits))
      .sort((a, b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime());

    return matches[0] || null;
  }, [phone, customerHistory]);

  const availableRooms = rooms.filter((r) => r.status === "Available");
  const roomInfo = availableRooms.find(
  (r) => r.number === selectedRoom
);
  const divisionName = divisions.find((d) => d.id === divisionId)?.name || "";
  const districtName = availableDistricts.find((d) => d.id === districtId)?.name || "";
  const upazilaName = availableUpazilas.find((u) => u.id === upazilaId)?.name || "";
  const fullAddress = [houseRoad, village, upazilaName, districtName, divisionName]
    .filter(Boolean)
    .join(", ");
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
  totalRent - (Number(advancePayment) || 0) + (Number(previousDue) || 0);

  function handleSaveBooking() {
  const bookingData = {
    bookingId,
    guestType,
    customerName,
    fatherName,
    phone,
    nid,
    profession,
    nationality,
    division: divisionName,
    district: districtName,
    upazila: upazilaName,
    village,
    houseRoad,
    address: fullAddress,
    nidPhoto,
    customerPhoto,
    room: selectedRoom,
    roomType: roomInfo?.type,
    roomRent: Number(roomRent) || 0,
    checkInDate,
    checkOutDate,
    nights,
    discount: Number(discount) || 0,
    advancePayment: Number(advancePayment) || 0,
    totalRent,
    due,
    paymentMethod,
    notes,
  };

  const activeStay = {
    id: Date.now().toString(),
    room: selectedRoom,
    customer: customerName,
    fatherName,
    phone,
    nid,
    profession,
    nationality,
    address: fullAddress,
    divisionId,
    districtId,
    upazilaId,
    village,
    houseRoad,
    checkIn: checkInDate,
    expectedCheckOut: checkOutDate,
    rent: Number(roomRent) || 0,
    advance: Number(advancePayment || 0),
    remaining: due,
    previousDue,
    nidPhoto,
    customerPhoto,
    notes,
  };

  saveBooking(bookingData);
  saveActiveStay(activeStay);
  occupyRoom(selectedRoom);
  refreshRooms();

  console.log("Booking Saved:", bookingData);

  alert(`Booking ${bookingId} saved successfully! Form cleared for the next guest.`);

  resetForm();
}

function resetForm() {
  setPhone("");
  setSelectedRoom("");
  setGuestType("Walk-in Guest");
  setAdvancePayment(0);
  setNotes("");
  setRoomRent("");
  setDiscount("");
  setCheckInDate(todayISO());
  setCheckInTime(nowHHMM());
  setCheckOutDate(tomorrowISO());
  setCheckOutTime("12:00");
  setCustomerName("");
  setFatherName("");
  setNid("");
  setProfession("");
  setNationality("Bangladeshi");
  setDivisionId("");
  setDistrictId("");
  setUpazilaId("");
  setVillage("");
  setHouseRoad("");
  setNidPhoto(null);
  setNidPhotoName("");
  setCustomerPhoto(null);
  setCustomerPhotoName("");
  setPhotoError("");
  setPaymentMethod("Cash");
  setShowSuggestion(true);
  setPreviousDue(0);
  setBookingId(generateBookingId());
}

  return (
    <div>
      <PageHeader
        title="New Booking"
        description="Register a new guest and assign a room in under a minute."
        actions={
          <>
            <button
  className={buttonPrimary}
  onClick={handleSaveBooking}
>
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
    value={guestType}
    onChange={(e) => setGuestType(e.target.value)}
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
    <span>{suggestion.customer}</span>

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

    <span className="font-medium">Checked Out</span>
    <span>{suggestion.checkoutDate}</span>

    <span className="font-medium">Room Rent</span>
    <span>৳{suggestion.rent}</span>

  </div>

  {(suggestion.due || 0) > 0 && (
    <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
      ⚠️ আগের বকেয়া আছে: ৳{(suggestion.due || 0).toLocaleString()}
    </div>
  )}

  <button
    className={buttonPrimary + " mt-5 w-full"}
    onClick={() => {
      if (!suggestion) return;

      setCustomerName(suggestion.customer);
      setPhone(suggestion.phone);
      setNid(suggestion.nid);
      setFatherName(suggestion.fatherName || "");
      setProfession(suggestion.profession || "");
      setNationality(suggestion.nationality || "Bangladeshi");
      setDivisionId(suggestion.divisionId || "");
      setDistrictId(suggestion.districtId || "");
      setUpazilaId(suggestion.upazilaId || "");
      setVillage(suggestion.village || suggestion.address || "");
      setHouseRoad(suggestion.houseRoad || "");
      setPreviousDue(suggestion.due || 0);
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
              <Field label="Father's Name">
                <input
                className={inputClass}
                placeholder="e.g. Md. Rahim Uddin"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
                </Field>
              <Field label="Nationality">
                <input
                className={inputClass}
                placeholder="e.g. Bangladeshi"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
                </Field>
              <div className="md:col-span-2">
                <SectionTitle title="Address" />
              </div>
              <Field label="Division">
                <select
                  className={selectClass}
                  value={divisionId}
                  onChange={(e) => {
                    setDivisionId(e.target.value);
                    setDistrictId("");
                    setUpazilaId("");
                  }}
                >
                  <option value="">Select Division</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="District">
                <select
                  className={selectClass}
                  value={districtId}
                  disabled={!divisionId}
                  onChange={(e) => {
                    setDistrictId(e.target.value);
                    setUpazilaId("");
                  }}
                >
                  <option value="">
                    {divisionId ? "Select District" : "Select Division first"}
                  </option>
                  {availableDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Thana / Upazila">
                <select
                  className={selectClass}
                  value={upazilaId}
                  disabled={!districtId}
                  onChange={(e) => setUpazilaId(e.target.value)}
                >
                  <option value="">
                    {districtId ? "Select Thana / Upazila" : "Select District first"}
                  </option>
                  {availableUpazilas.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Village">
                <input
                  className={inputClass}
                  placeholder="Village name"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="House / Road (Optional)">
                  <input
                    className={inputClass}
                    placeholder="House no, Road no"
                    value={houseRoad}
                    onChange={(e) => setHouseRoad(e.target.value)}
                  />
                </Field>
              </div>

              <div className="md:col-span-2 border-t border-border pt-4">
                <SectionTitle title="Uploads (Optional)" />
              </div>

              <Field label="NID Photo">
                <label className={buttonGhost + " w-full cursor-pointer justify-center"}>
                  <Upload className="h-4 w-4" />
                  {nidPhotoName ? "Change Photo" : "Upload NID Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handlePhotoSelect(e.target.files?.[0], setNidPhoto, setNidPhotoName)
                    }
                  />
                </label>
                {nidPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={nidPhoto}
                      alt="NID preview"
                      className="h-12 w-12 rounded object-cover"
                    />
                    <span className="truncate text-xs text-muted-foreground">
                      {nidPhotoName}
                    </span>
                    <button
                      type="button"
                      className="ml-auto text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setNidPhoto(null);
                        setNidPhotoName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </Field>

              <Field label="Customer Photo">
                <label className={buttonGhost + " w-full cursor-pointer justify-center"}>
                  <Upload className="h-4 w-4" />
                  {customerPhotoName ? "Change Photo" : "Upload Customer Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handlePhotoSelect(e.target.files?.[0], setCustomerPhoto, setCustomerPhotoName)
                    }
                  />
                </label>
                {customerPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={customerPhoto}
                      alt="Customer preview"
                      className="h-12 w-12 rounded object-cover"
                    />
                    <span className="truncate text-xs text-muted-foreground">
                      {customerPhotoName}
                    </span>
                    <button
                      type="button"
                      className="ml-auto text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setCustomerPhoto(null);
                        setCustomerPhotoName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </Field>

              {photoError && (
                <div className="md:col-span-2 text-xs text-red-600">{photoError}</div>
              )}
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
                <input
                  type="time"
                  className={inputClass}
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
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
                <input
                  type="time"
                  className={inputClass}
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
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
                <select
                  className={selectClass}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
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

<Row label="Advance" value={`৳${advancePayment || 0}`} />

{previousDue > 0 && (
  <Row label="আগের বকেয়া (Carried)" value={`৳${previousDue.toLocaleString()}`} />
)}

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
