// data-pipeline/utils/helpers.js

export function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "NA" ||
    value === "N/A"
  );
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(String(value).replace(/[^0-9.-]/g, ""));

  return Number.isNaN(number) ? null : number;
}

export function capitalize(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}