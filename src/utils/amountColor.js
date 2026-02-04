/**
 * Utility function to get color for amount/balance display
 * Returns green (#52c41a) for positive values and red (#ff4d4f) for negative values
 *
 * @param {number} value - The numeric value to check
 * @returns {string} - The color code for the value
 */
export const getAmountColor = (value) => {
  if (value > 0) return '#52c41a'; // Green for positive
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#000000'; // Black for zero
};

/**
 * Utility function to render colored amount with prefix
 *
 * @param {number} value - The numeric value to display
 * @param {boolean} showPrefix - Whether to show +/- prefix
 * @returns {object} - Style object with color
 */
export const getAmountStyle = (value, showPrefix = false) => {
  return {
    color: getAmountColor(value),
    fontWeight: value !== 0 ? '500' : 'normal',
  };
};

/**
 * Get prefix for amount display based on value
 *
 * @param {number} value - The numeric value
 * @returns {string} - '+' for positive, '-' for negative, '' for zero
 */
export const getAmountPrefix = (value) => {
  if (value > 0) return '+';
  if (value < 0) return '-';
  return '';
};
