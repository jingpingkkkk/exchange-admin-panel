const shortNumber = (number, decimals = 2) => {
  const multiplier = 10 ** decimals;

  if (number >= 10000000) {
    return `${Math.round((number / 10000000) * multiplier) / multiplier}C`;
  }
  if (number >= 100000) {
    return `${Math.round((number / 100000) * multiplier) / multiplier}L`;
  }
  if (number >= 1000) {
    return `${Math.round((number / 1000) * multiplier) / multiplier}K`;
  }
  return number;
};

export default shortNumber;
