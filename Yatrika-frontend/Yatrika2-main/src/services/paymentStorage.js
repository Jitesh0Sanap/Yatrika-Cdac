const STORAGE_KEY = 'yatrikaPaymentMeta';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPaymentMeta(bookingId) {
  const storage = readStorage();
  return bookingId ? storage[String(bookingId)] || null : null;
}

export function savePaymentMeta(bookingId, meta) {
  const storage = readStorage();
  storage[String(bookingId)] = meta;
  writeStorage(storage);
}

export function clearPaymentMeta(bookingId) {
  const storage = readStorage();
  if (bookingId) {
    delete storage[String(bookingId)];
    writeStorage(storage);
  }
}
