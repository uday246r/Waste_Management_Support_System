import { GATE_KEYS } from "./gateKeys";

/**
 * Checks if user can access /login based on gate conditions.
 * @returns {boolean}
 */
export const canAccessLogin = () => {
  const pwd = localStorage.getItem(GATE_KEYS.PWD);
  const expiry = localStorage.getItem(GATE_KEYS.EXPIRY);
  const access = localStorage.getItem(GATE_KEYS.ACCESS);

  if (!pwd || !expiry || !access) return false;
  if (Date.now() > Number(expiry)) return false;

  return true;
};
