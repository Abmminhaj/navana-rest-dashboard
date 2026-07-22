import type { ActiveStay } from "./mock-data";
export interface CustomerHistoryRecord extends ActiveStay {
  checkoutDate: string;
  checkoutTime: string;
  paymentMethod?: string;
  checkoutNotes?: string;
  actualNights?: number;
  due?: number;
}

const STORAGE_KEY = "navana_customer_history";

export function getCustomerHistory(): CustomerHistoryRecord[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data);
}

export function saveCustomerHistory(customer: CustomerHistoryRecord) {
  const history = getCustomerHistory();

  history.push(customer);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );
}
