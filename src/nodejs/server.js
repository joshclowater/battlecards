const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const logger = require('morgan');

const battlekards = require('./battlekards/battlekards');

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('port', process.env.PORT || 3000);
app.set('views', 'public/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Create home route
app.get('/', (req, res) =>
  res.render('index')
);

const server = require('http').createServer(app);
const io = require('socket.io')(server);

battlekards.initialiseBattlekardsSocketIo(io);

server.listen(app.get('port'), () => {
  console.log('Express server listening on port:', app.get('port'));
});
