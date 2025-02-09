export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Б";
  const k = 1000;
  const sizes = ["Б", "КБ", "МБ", "ГБ", "ТБ", "ПБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const fixedDecimals = i === 1 ? 0 : decimals;

  return `${parseFloat(
    (bytes / Math.pow(k, i)).toFixed(fixedDecimals),
  ).toLocaleString("ru-RU")} ${sizes[i]}`;
};
