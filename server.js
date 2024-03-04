const express = require('express');
const packageInfo = require('./package.json');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

app.listen(process.env.PORT, function () {
  console.log('Web server started');
});

// module.exports = function (bot) {
//   app.post(`/${process.env.BOT_TOKEN}`, function (req, res) {
//     bot.processUpdate(req.body);
//     res.sendStatus(200);
//   });
// };