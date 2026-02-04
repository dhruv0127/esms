/**
 * Detect if the current device is mobile
 * @returns {boolean} true if device is mobile, false otherwise
 */
export const isMobileDevice = () => {
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for mobile patterns in user agent
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  const isMobileUA = mobileRegex.test(userAgent.toLowerCase());

  // Check screen width (mobile typically < 768px)
  const isMobileScreen = window.innerWidth < 768;

  // Check for touch support
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Return true if any mobile indicator is present
  return isMobileUA || (isMobileScreen && hasTouchSupport);
};

/**
 * Check if maintenance mode is enabled from environment
 * @returns {boolean} true if maintenance mode is enabled
 */
export const isMaintenanceModeEnabled = () => {
  return import.meta.env.VITE_MAINTENANCE_MODE === 'true';
};
