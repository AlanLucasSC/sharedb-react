var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var richText = require('rich-text');
var WebSocketJSONStream = require('websocket-json-stream');
var io = require('socket.io');

var PORT = process.env.PORT || 8080;

var options = {
  disableDocAction: true,
  disableSpaceDelimitedActions: true
}

const colors = []

function getColor(){
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  colors.push(color);
  return color;
}

ShareDB.types.register(richText.type);

var backend = new ShareDB(options);
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('examples', 'richtext');
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([{insert: ''}], 'rich-text', callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  //app.use(express.static('static'));
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({
    port: PORT + 1,
    server: server,

    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    //autoAcceptConnections: false 
  });

  io = io(server)
  
  io.on('connection', function(client){
    
    client.on('user connect', function(newConnection){
        var name = newConnection.user
        var room = newConnection.docId
        var clientId = client.id

        var color = getColor();

        client.join(room);

        io.to(room).emit('new user', {name, room, clientId,color});

        client.on('disconnect', function () {
            io.to(room).emit('user disconnected', {name, room, clientId});
        });
        client.on('document change', function(document){
            client.to(room).emit('update document', document);            
        });
    });
    
    client.on('others users on room', function(received){
        var users = received.users
        var toUser = received.toUser
        io.to(toUser).emit('users on room', users)
    });

    client.on('msg', function(msg, id){
      client.to(id).emit('user Message', msg);
    });

    client.on('selection change', function(change){
      var room = change.docId
      client.to(room).emit('selection change', change);
    })
    
  });

  wss.on('connection', function(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  app.get('/', function(req, res){
    res.send(`
      <h1>Testando o backend do realtime editor</h1>
      <p>A aplicação está rodando na porta ${PORT}</p>
    `);
  });

  server.listen(PORT);
  console.log(`
    Listening on http://localhost:${PORT} -> socket.io
    Listening on http://localhost:${PORT + 1} -> webSocket
  `);
}