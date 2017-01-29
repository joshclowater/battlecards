var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Socket.io stuff.
 */
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;
var gameStarted = false;

io.sockets.on('connection', function(socket) {
  onlineUsers++;
  console.log(onlineUsers + ' user(s) connected');

  if (onlineUsers == 1) {
    console.log('one player joined');
    io.sockets.emit('waitingForAnotherUser', {});
  } else if (onlineUsers == 2) {
    console.log('second player joined');
    gameStarted = true;
    io.sockets.emit('gameStarted', {'TODO': 'more things'});
  }

  socket.on('disconnect', function() {
    console.log('User disconnected');
    onlineUsers--;
  });
});

app.get('/test', function(req, res, next) {
  res.send({ message: 'were in' });
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
