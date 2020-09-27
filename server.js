// server.js
// where your node app starts

// init project
const http = require('http');
const express = require('express');
const app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) 
{
  console.log(Date.now() + " ping received");
  response.send("hello world");
  //response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
app.listen(process.env.PORT);
setInterval(() =>
{
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

//console.log(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);

/*const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});*/
