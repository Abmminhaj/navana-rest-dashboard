const STORAGE_KEY = "navana_customer_history";

export function getCustomerHistory() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data);
}

export function saveCustomerHistory(customer: any) {
  const history = getCustomerHistory();

  history.push(customer);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );
}