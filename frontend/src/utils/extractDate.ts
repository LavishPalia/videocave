export function extractDate(isoString: Date) {
  // Create a Date object from the ISO 8601 string
  const dateObj = new Date(isoString);

  // Extract day, month, and year components
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear();

  // Format the date as DD/MM/YYYY
  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
}
