export function formatDateWithSlash(date: string): string {
  const convDate: Date = new Date(date);
  const year = convDate.getFullYear();
  const month = String(convDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = String(convDate.getDate()).padStart(2, "0"); // Ensure two digits for day

  return `${year}/${month}/${day}`;
}
export function formatDateWithHyphen(date: string): string {
  const convDate: Date = new Date(date);
  const year = convDate.getFullYear();
  const month = String(convDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = String(convDate.getDate()).padStart(2, "0"); // Ensure two digits for day

  return `${year}-${month}-${day}`;
}

export function toDateTimeLocal(dateStr: string): string {
  const date = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDateWithTime(date?: Date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
