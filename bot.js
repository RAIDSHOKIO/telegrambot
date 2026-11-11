import Dotenv from "dotenv";
Dotenv.config();

import { Bot, InlineKeyboard } from "grammy";

const bot = new Bot(process.env.BOT_API_KEY);

bot.on("message:text", async (ctx) => {
	const keyboard = new InlineKeyboard().webApp(
        	"приложение",
        	"https://apptelegrambotv2.vercel.app/"
    	);

    	await ctx.reply("Апка", {reply_markup: keyboard });
	}); 


await bot.start({
	onStart: (me) => {
		console.log(`бот @${me.username} запущен`);
	}
});
