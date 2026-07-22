const STORAGE_KEY = "navana_active_stays";

export function getActiveStays() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  return JSON.parse(data);
}

export function saveActiveStay(stay: any) {
  const stays = getActiveStays();

  stays.push(stay);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stays)
  );
}

export function removeActiveStay(id: string) {
  const stays = getActiveStays().filter(
    (stay: any) => stay.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stays)
  );
}

export function addDeposit(id: string, amount: number) {
  const stays = getActiveStays().map((stay: any) => {
    if (stay.id !== id) return stay;

    const deposits = Array.isArray(stay.deposits) ? stay.deposits : [];

    return {
      ...stay,
      deposits: [
        ...deposits,
        { amount, date: new Date().toISOString().slice(0, 10) },
      ],
    };
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stays)
  );
}