'use strict';

// Единственная точка интеграции: замените реализацию после создания backend.
// Telegram initData, если он понадобится серверу, должен проверяться сервером;
// данные клиента и initDataUnsafe не являются доказательством подлинности.
async function sendReminder(reminder) {
  void reminder;
  return { ok: false, message: 'Backend не подключён. Напоминание не создано.' };
}

const THEME_KEY = 'reminder-theme';
const root = document.documentElement;
const webApp = window.Telegram && window.Telegram.WebApp;
const themeToggle = document.querySelector('#theme-toggle');
const themeLabel = themeToggle.querySelector('.theme-toggle__label');
const themeMeta = document.querySelector('meta[name="theme-color"]');

function readSavedTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch (error) {
    return null;
  }
}

function getPreferredTheme() {
  const saved = readSavedTheme();
  if (saved) return saved;
  if (webApp && (webApp.colorScheme === 'dark' || webApp.colorScheme === 'light')) {
    return webApp.colorScheme;
  }
  return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme, persist) {
  const dark = theme === 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  themeLabel.textContent = dark ? 'ТЁМНАЯ' : 'СВЕТЛАЯ';
  themeMeta.content = dark ? '#0d0d0d' : '#f4f4f1';
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch (error) {}
  }
  if (webApp && typeof webApp.setHeaderColor === 'function') {
    try {
      webApp.setHeaderColor(themeMeta.content);
    } catch (error) {}
  }
}

applyTheme(getPreferredTheme(), false);

themeToggle.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
});

if (webApp && typeof webApp.onEvent === 'function') {
  try {
    webApp.onEvent('themeChanged', () => {
      if (!readSavedTheme()) applyTheme(webApp.colorScheme === 'dark' ? 'dark' : 'light', false);
    });
  } catch (error) {}
}

const form = document.querySelector('#reminder-form');
const text = document.querySelector('#reminder-text');
const interval = document.querySelector('#interval');
const unit = document.querySelector('#unit');
const status = document.querySelector('#status');
const submit = form.querySelector('[type="submit"]');
const presets = [...document.querySelectorAll('[data-value][data-unit]')];

function setError(input, message) {
  document.querySelector(`#${input.id}-error`).textContent = message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function updatePresets() {
  presets.forEach(button => {
    button.setAttribute('aria-pressed', String(interval.value === button.dataset.value && unit.value === button.dataset.unit));
  });
}

text.addEventListener('input', () => {
  document.querySelector('#char-count').textContent = text.value.length;
  setError(text, '');
});
interval.addEventListener('input', () => { setError(interval, ''); updatePresets(); });
unit.addEventListener('change', updatePresets);
presets.forEach(button => button.addEventListener('click', () => {
  interval.value = button.dataset.value;
  unit.value = button.dataset.unit;
  setError(interval, '');
  updatePresets();
}));
updatePresets();

form.addEventListener('submit', async event => {
  event.preventDefault();
  const message = text.value.trim();
  const value = Number(interval.value);
  const textError = message ? '' : 'Введите текст напоминания.';
  const intervalError = interval.value && Number.isSafeInteger(value) && value > 0 ? '' : 'Введите целое число больше нуля.';
  setError(text, textError);
  setError(interval, intervalError);
  if (textError || intervalError) {
    status.textContent = 'Проверьте заполнение полей.';
    (textError ? text : interval).focus();
    return;
  }
  if (!['s', 'm', 'h'].includes(unit.value)) {
    status.textContent = 'Выберите единицу интервала.';
    unit.focus();
    return;
  }
  submit.disabled = true;
  status.textContent = 'Отправка…';
  try {
    const result = await sendReminder({ text: message, interval: value, unit: unit.value });
    status.textContent = result.message;
  } catch (error) {
    status.textContent = 'Не удалось отправить напоминание. Попробуйте позже.';
  } finally {
    submit.disabled = false;
  }
});

// Страница также работает в обычном браузере без Telegram SDK.
if (webApp) {
  try {
    if (typeof webApp.ready === 'function') webApp.ready();
    if (typeof webApp.expand === 'function') webApp.expand();
  } catch (error) {
    // Не блокируем форму, если клиент не поддерживает эти методы.
  }
}
