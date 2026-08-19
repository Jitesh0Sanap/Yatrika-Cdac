export function getHotelPrice(hotel) {
  if (!hotel) return null;
  // Use only backend-declared fields. The backend exposes pricePerNight on Hotel/RoomCategory
  // and transient minRoomPrice. Recommendation responses expose startingPrice.
  const candidates = ['pricePerNight', 'minRoomPrice', 'startingPrice'];
  for (const key of candidates) {
    const val = hotel[key];
    if (val !== undefined && val !== null && val !== '') {
      const n = Number(val);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}
