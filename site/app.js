const timeTypeObject = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000
};

let time = null;
let deadline = null;
let timeBoolean = false;
let saveText = "";

const form = document.querySelector("#reminder-form");
const textInput = document.querySelector("#reminder-text");
const intervalInput = document.querySelector("#interval");
const unitInput = document.querySelector("#unit");
const status = document.querySelector("#status");

textInput.addEventListener("input", () => {
    saveText = textInput.value;
    timeBoolean = true;
    document.querySelector("#char-count").textContent = saveText.length;
});

const presetButtons = document.querySelectorAll("[data-value]");

presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
        intervalInput.value = button.dataset.value;
        unitInput.value = button.dataset.unit;
    });
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (timeBoolean === false) {
        saveText = textInput.value;

        timeBoolean = true;
    }

    if (saveText === "") {
        status.textContent = "Напишите текст напоминания.";
        return;
    }

    if (intervalInput.value === "") {
        status.textContent = `Текст сохранен - "${saveText}" через сколько напомнить? (пример - 5s, 5m, 2h)`;
        return;
    }

    const userText = intervalInput.value + unitInput.value;

    const timeType = userText.slice(-1);

    console.log("Время - " + userText);

    const amount = parseInt(userText);

    if (timeType === "s") time = amount * timeTypeObject.s;

    else if (timeType === "m") time = amount * timeTypeObject.m;

    else if (timeType === "h") time = amount * timeTypeObject.h;

    deadline = Date.now() + time;

    const reminderText = saveText;

    setTimeout(() => {
        status.textContent = `Напоминаю: ${reminderText}`;
        alert(`Напоминаю: ${reminderText}`);
        time = null;
        deadline = null;
    }, time);

    status.textContent = "Таймер установлен";

    timeBoolean = false;
});

if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}
