const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

module.exports = class Database {
  constructor(users) {
    this.users = users;
    const data = this.#readDatabase();

    this.sessionID = uuidv4();
    this.database = JSON.parse(data);
    this.database.sessions = {};
    this.#saveDatabase();
    this.database.sessions[this.sessionID] = {};
    this.#saveDatabase();
  }

  #readDatabase() {
    return fs.readFileSync(path.join(__dirname, "data.json"), "utf8");
  }

  #saveDatabase() {
    fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(this.database), "utf8");
  }

  addChatIdInDatabase(chatId) {
    const sessionData = this.database.sessions[this.sessionID];

    if (!sessionData[chatId]) {
      sessionData[chatId] = chatId;

      this.#saveDatabase();
    }
  }

  setNextUser() {
    let user = Number(this.database.user);

    this.users.length - 1 === user ? user = 0 : user = user + 1;
    this.database.user = user;
    this.#saveDatabase();
  }

  isChatIdHasBeenAdded(chatId) {
    const sessionData = this.database.sessions[this.sessionID];

    return Boolean(sessionData[chatId]);
  }
};
