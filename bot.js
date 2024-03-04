const TelegramBot = require("node-telegram-bot-api");
const schedule = require("node-schedule");

const Database = require("./database/Database");
const users = require("./database/users");

let bot = null;
const db = new Database(users);
const rule = new schedule.RecurrenceRule();

rule.dayOfMonth = 26;
rule.hour = 9;
rule.minute = 0;
rule.tz = "Europe/Kiev";

if (process.env.NODE_ENV === 'production') {
  bot = new TelegramBot(process.env.BOT_TOKEN);
  bot.setWebHook(`${process.env.HEROKU_URL}${process.env.BOT_TOKEN}`);
} else {
  bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
}

console.log('bot server started...');

const getPaymentNotification = (id) => {
  return `Привіт @${db.users[id].id}! Чекаю на 149 грн, номер карти ${process.env.NUMBER_CART}`;
}

const getPaymentStatusOfUsers = (id) => {
  return `Список платників:\n${db.users.map((user, index) =>
    id > index || (id === 0 && index === db.users.length - 1)
    ? `✅${user.name}`
    : `❌${user.name}`
  ).join('\n')}`;
}

const sendReminder = async (chatId) => async () => {
  db.setNextUser();

  await bot.sendMessage(chatId, getPaymentNotification(db.database.user));
  await bot.sendMessage(chatId, getPaymentStatusOfUsers(db.database.user));
}

const start = async (msg) => {
  if(!msg.text || !msg.chat) return;

  const chatId = String(msg.chat.id);
  const text = msg.text.toLowerCase();

  if (text === "/start" && chatId === process.env.CHAT_ID) {
    if (db.isChatIdHasBeenAdded(chatId)) return;

    db.addChatIdInDatabase(chatId);
    await schedule.scheduleJob(rule, await sendReminder(chatId));
  } else if (text === "/info" && chatId === process.env.CHAT_ID) {
    await bot.sendMessage(chatId, getPaymentStatusOfUsers(db.database.user));
  } else if (text === "/start" || text === "/info") {
    await bot.sendMessage(chatId, "Я створений не для вас!");
  }
}

bot.on("message", start);

module.exports = bot;
