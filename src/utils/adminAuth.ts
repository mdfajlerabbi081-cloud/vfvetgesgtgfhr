import { loadShopSettings } from './shopSettings';

const LEGACY_LOCAL_AUTH_KEY = 'trendverse_admin_auth';
export const STRICT_ADMIN_SESSION_KEY = 'trendverse_admin_session_auth';
const EXPORT_BEARER_SESSION_KEY = 'trendverse_admin_session';
const VALID_EXPORT_TOKEN = 'authenticated_admin_token';
export const DEFAULT_ADMIN_PASSWORD = '01759720739';

// In-memory strict session flag: resets automatically on every page refresh or new tab
let inMemoryStrictAuthed = false;

// Clear any leftover persistent auth or previous reload session on fresh page load
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(LEGACY_LOCAL_AUTH_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(STRICT_ADMIN_SESSION_KEY);
    sessionStorage.removeItem(EXPORT_BEARER_SESSION_KEY);
  } catch {}
  try {
    document.cookie = `${EXPORT_BEARER_SESSION_KEY}=; path=/; max-age=0; SameSite=None; Secure`;
  } catch {}
}

function normalizeBengaliDigits(str: string): string {
  const bnDigits = '০১২৩৪৫৬৭৮৯';
  return str.replace(/[০-৯]/g, (ch) => String(bnDigits.indexOf(ch)));
}

export function getActiveAdminPassword(): string {
  try {
    const savedSettings = localStorage.getItem('trendverse_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed && typeof parsed.adminPassword === 'string' && parsed.adminPassword.trim()) {
        return parsed.adminPassword.trim();
      }
    }
  } catch {}

  try {
    const settings = loadShopSettings();
    if (settings.adminPassword && settings.adminPassword.trim()) {
      return settings.adminPassword.trim();
    }
  } catch {}

  return DEFAULT_ADMIN_PASSWORD;
}

export function checkAdminAuth(): boolean {
  // Never allow legacy localStorage auth to persist
  try {
    localStorage.removeItem(LEGACY_LOCAL_AUTH_KEY);
  } catch {}

  if (!inMemoryStrictAuthed) {
    return false;
  }

  try {
    const sessionAuth = sessionStorage.getItem(STRICT_ADMIN_SESSION_KEY);
    if (sessionAuth === 'authenticated') {
      return true;
    }
  } catch {
    // Fallback to in-memory flag if iframe blocks sessionStorage
    return inMemoryStrictAuthed;
  }

  return inMemoryStrictAuthed;
}

export function grantAdminAuth(): void {
  inMemoryStrictAuthed = true;
  try {
    localStorage.removeItem(LEGACY_LOCAL_AUTH_KEY);
  } catch {}
  try {
    sessionStorage.setItem(STRICT_ADMIN_SESSION_KEY, 'authenticated');
    sessionStorage.setItem(EXPORT_BEARER_SESSION_KEY, VALID_EXPORT_TOKEN);
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('trendverse_admin_auth_updated'));
  }
}

export function revokeAdminAuth(): void {
  inMemoryStrictAuthed = false;
  try {
    localStorage.removeItem(LEGACY_LOCAL_AUTH_KEY);
  } catch {}
  try {
    sessionStorage.removeItem(STRICT_ADMIN_SESSION_KEY);
    sessionStorage.removeItem(EXPORT_BEARER_SESSION_KEY);
  } catch {}
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${EXPORT_BEARER_SESSION_KEY}=; path=/; max-age=0; SameSite=None; Secure`;
    }
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('trendverse_admin_auth_updated'));
  }
}

export function verifyAdminPasswordInput(rawInput: string): boolean {
  const trimmedInput = rawInput.trim();
  const cleaned = normalizeBengaliDigits(trimmedInput);
  if (!cleaned) return false;

  const targetPassword = getActiveAdminPassword();
  const normalizedTarget = normalizeBengaliDigits(targetPassword);

  return trimmedInput === targetPassword || cleaned === normalizedTarget;
}
