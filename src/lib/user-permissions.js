import CryptoJS from "crypto-js";

/**
 * Logs out the user by clearing the localStorage and reloading the page.
 */
export const logoutUser = () => {
  localStorage.clear();
  window.location.reload();
};

/**
 * Decrypts an AES encrypted string using the permissions AES secret.
 * @param {string} encryptedString - The string to decrypt.
 * @returns {object} - The decrypted object.
 */
const decryptAESEncryption = (encryptedString) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedString, process.env.REACT_APP_PERMISSIONS_AES_SECRET);
    const string = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(string);
  } catch (e) {
    //logoutUser();
  }
};

/**
 * Gets the active app modules from the localStorage and decrypts them.
 * @returns {object} - The decrypted active app modules.
 */
export const appModules = () => {
  const modules = JSON.parse(localStorage.getItem(process.env.REACT_APP_PERMISSIONS_AMLS_KEY));
  const token = localStorage.getItem("jwt_token");
  if (token && !modules) {
    logoutUser();
  }
  return decryptAESEncryption(modules);
};

/**
 * Gets the active session keys from the localStorage and decrypts them.
 * @returns {object} - The decrypted active session keys.
 */
export const activeSessionKeys = () => {
  const activeKeys = JSON.parse(localStorage.getItem(process.env.REACT_APP_PERMISSIONS_UPLS_KEY));
  const token = localStorage.getItem("jwt_token");
  if (token && !activeKeys) {
    logoutUser();
  }
  return decryptAESEncryption(activeKeys);
};

/**
 * The decrypted active app modules.
 * @type {object}
 */
export const activeModules = appModules();

/**
 * The decrypted active session keys.
 * @type {object}
 */
export const permissionKeys = activeSessionKeys();

/**
 * Checks if a given permission key is included in the active session keys.
 * @param {string} key - The permission key to check.
 * @returns {boolean} - Whether the permission key is included in the active session keys.
 */
const hasPermission = (key = null) => {
  if (!key) {
    return false;
  }
  return permissionKeys.includes(key);
};

/**
 * The permission object containing all the permissions for the app.
 * @type {object}
 */
export const permission = {
  // Account Module
  ACCOUNT_MODULE: {
    ACTIVE: hasPermission(activeModules?.ACCOUNT_MODULE),
    CREATE: hasPermission(activeModules?.ACCOUNT_CREATE),
    UPDATE: hasPermission(activeModules?.ACCOUNT_UPDATE),
    DELETE: hasPermission(activeModules?.ACCOUNT_DELETE),
    DEPOSIT: hasPermission(activeModules?.ACCOUNT_DEPOSIT),
    WITHDRAW: hasPermission(activeModules?.ACCOUNT_WITHDRAW),
  },

  // User Module
  USER_MODULE: {
    ACTIVE: hasPermission(activeModules?.USER_MODULE),
    CREATE: hasPermission(activeModules?.USER_CREATE),
    UPDATE: hasPermission(activeModules?.USER_UPDATE),
    DELETE: hasPermission(activeModules?.USER_DELETE),
    USER_STATUS_UPDATE: hasPermission(activeModules?.USER_STATUS_UPDATE),
    USER_BET_UPDATE: hasPermission(activeModules?.USER_BET_UPDATE),
  },

  // Theme User Module
  THEME_USER_MODULE: {
    ACTIVE: hasPermission(activeModules?.THEME_USER_MODULE),
    CREATE: hasPermission(activeModules?.THEME_USER_CREATE),
    UPDATE: hasPermission(activeModules?.THEME_USER_UPDATE),
    DELETE: hasPermission(activeModules?.THEME_USER_DELETE),
  },

  // Transaction Panel User Module
  TRANSACTION_PANEL_USER_MODULE: {
    ACTIVE: hasPermission(activeModules?.TRANSACTION_PANEL_USER_MODULE),
    CREATE: hasPermission(activeModules?.TRANSACTION_PANEL_USER_CREATE),
    UPDATE: hasPermission(activeModules?.TRANSACTION_PANEL_USER_UPDATE),
    DELETE: hasPermission(activeModules?.TRANSACTION_PANEL_USER_DELETE),
  },

  // Bank Permission
  BANK_MODULE: {
    ACTIVE: hasPermission(activeModules?.BANK_MODULE),
    DEPOSIT: hasPermission(activeModules?.BANK_DEPOSIT),
    WITHDRAW: hasPermission(activeModules?.BANK_WITHDRAW),
  },

  // Report Permissions
  REPORT_MODULE: {
    ACTIVE: hasPermission(activeModules?.REPORT_MODULE),
    ACCOUNT_STATEMENT: hasPermission(activeModules?.REPORT_ACCOUNT_STATEMENT),
    USER_HISTORY: hasPermission(activeModules?.REPORT_USER_HISTORY),
  },

  // Event Bet Permissions
  EVENT_BET: {
    ACTIVE: hasPermission(activeModules?.EVENT_BET_MODULE),
  },

  // Static Modules
  DASHBOARD: {
    ACTIVE: hasPermission(activeModules?.DASHBOARD),
  },
  MULTI_LOGIN: {
    ACTIVE: hasPermission(activeModules?.MULTI_LOGIN),
  },
  CURRENCIES: {
    ACTIVE: hasPermission(activeModules?.CURRENCIES),
  },
  SPORTS: {
    ACTIVE: hasPermission(activeModules?.SPORTS),
  },
  COMPETITIONS: {
    ACTIVE: hasPermission(activeModules?.COMPETITIONS),
  },
  CASINO: {
    ACTIVE: hasPermission(activeModules?.EVENTS),
  },
  CASINO_GAME: {
    ACTIVE: hasPermission(activeModules?.EVENTS),
  },
  EVENTS: {
    ACTIVE: hasPermission(activeModules?.EVENTS),
  },
  ADD_EVENT: {
    ACTIVE: hasPermission(activeModules?.ADD_EVENT),
  },
  SYNC_DATA: {
    ACTIVE: true,
  },
};
