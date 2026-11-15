const THEME_KEY = 'reminder-theme';
const LIGHT = 'light';
const DARK = 'dark';

const THEME_COLORS = {
  [LIGHT]: '#f4f4f1',
  [DARK]: '#0d0d0d'
};

const THEME_LABELS = {
  [LIGHT]: 'СВЕТЛАЯ',
  [DARK]: 'ТЁМНАЯ'
};

const THEME_ARIA_LABELS = {
  [LIGHT]: 'Включить тёмную тему',
  [DARK]: 'Включить светлую тему'
};

function hasDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function normalizeTheme(value) {
  return value === DARK || value === LIGHT ? value : null;
}

function getWebApp() {
  if (!hasDom()) return null;
  return (window.Telegram && window.Telegram.WebApp) || null;
}

export function readSavedTheme() {
  if (!hasDom()) return null;
  try {
    return normalizeTheme(localStorage.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

export function getPreferredTheme() {
  const saved = readSavedTheme();
  if (saved) return saved;

  if (hasDom()) {
    const webApp = getWebApp();
    const scheme = webApp && normalizeTheme(webApp.colorScheme);
    if (scheme) return scheme;
    return document.documentElement.dataset.theme === DARK ? DARK : LIGHT;
  }

  return LIGHT;
}

export function applyTheme(theme, persist = false) {
  const next = normalizeTheme(theme) || LIGHT;
  if (!hasDom()) return next;

  const dark = next === DARK;
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const label = toggle && toggle.querySelector('.theme-toggle__label');
  const meta = document.querySelector('meta[name="theme-color"]');

  root.dataset.theme = next;

  if (toggle) {
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', THEME_ARIA_LABELS[next]);
  }

  if (label) label.textContent = THEME_LABELS[next];
  if (meta) meta.content = THEME_COLORS[next];

  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  const webApp = getWebApp();
  if (webApp && typeof webApp.setHeaderColor === 'function') {
    try {
      webApp.setHeaderColor(THEME_COLORS[next]);
    } catch {}
  }

  return next;
}

export function toggleTheme() {
  if (!hasDom()) return getPreferredTheme();
  return applyTheme(document.documentElement.dataset.theme === DARK ? LIGHT : DARK, true);
}

export function initTheme() {
  if (!hasDom()) return getPreferredTheme();

  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return getPreferredTheme();

  applyTheme(getPreferredTheme(), false);
  toggle.addEventListener('click', toggleTheme);

  const webApp = getWebApp();
  if (webApp && typeof webApp.onEvent === 'function') {
    try {
      webApp.onEvent('themeChanged', () => {
        if (!readSavedTheme()) {
          applyTheme(normalizeTheme(webApp.colorScheme) || LIGHT, false);
        }
      });
    } catch {}
  }

  return document.documentElement.dataset.theme;
}

if (hasDom()) initTheme();
