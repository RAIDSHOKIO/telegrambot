import dotenv from "dotenv";
dotenv.config();

import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_API_KEY);

let timeBoolean = false;
let saveText = "";
let time = null;
let deadline = null;

const timeTypeObject = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
};

bot.command("start", async (ctx) => {
    timeBoolean = false;
    saveText = "";
    deadline = null;
    time = null;
    await ctx.reply("ready");
});

bot.command("time", async (ctx) => {
    if (time != null) {
        const seconds = Math.round((deadline - Date.now()) / 1000);
        await ctx.reply(`Осталось: ${seconds} сек.`);
    } else {
        ctx.reply("/time не работает - пожалуйста добавьте что-то");
    }
});

bot.command("help", async (ctx) => {
    ctx.reply("Команды - \n /time - узнать сколько время \n /start Начать \n");
});

bot.on("message:text", async (ctx) => {
    const userText = ctx.msg.text;
    const chatid = ctx.chat.id;
    const timeType = userText.slice(-1);

    if (timeBoolean === true) {
        console.log("Время - " + userText);

        const amount = parseInt(userText);

        if (timeType === "s") time = amount * timeTypeObject.s;
        else if (timeType === "m") time = amount * timeTypeObject.m;
        else if (timeType === "h") time = amount * timeTypeObject.h;

        deadline = Date.now() + time;

        setTimeout(() => {
            bot.api.sendMessage(chatid, `Напоминаю: ${saveText}`);
            // let result = timestampMs - amount;
            // console.log(result)
            time = null;
            deadline = null;
        }, time);

        await ctx.reply("Таймер установлен");

        timeBoolean = false;
    } else {
        saveText = userText;
        timeBoolean = true;

        await ctx.reply(
            `Текст сохранен - "${saveText}" через сколько напомнить? (пример - 5s, 5m, 2h)`
        );
    }
});

await bot.start({
    onStart: (me) => {
        console.log(`бот @${me.username} запущен`);
    },
});