/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
function createDate (){

  var date = new Date();
  var min = date.getMinutes() * 60;
  var sec = date.getSeconds(); //January is 0!
  var hr = date.getHours()* 60 * 60; //January is 0!

  return date = hr + min + sec

}
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var output = {
  results: [{
    'username': 'Jono',
    'text': 'Do my bidding!',
    'objectId': Math.random() * 10000,
    'createdAt': createDate()
  }]
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  var headers = defaultCorsHeaders;
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var statusCode = 404;
  // The outgoing status
  if(request.url.split("?")[1] !== undefined){
    var orderType = request.url.split("?")[1].split("=")[1];
  }
  if (request.url.split("?")[0] === '/classes/messages') {
    if (request.method === 'GET') {
      statusCode = 200;

    } else if (request.method === 'POST') {
      statusCode = 201;
      request.on('data', function(datum) {
        var parser = function(string) {
          //input: username=Jin&text=hello&roomname=lobby
          //output: { username: 'Jono', text: 'Do my bidding!' }
          var prettyObj = {};
          if(string.indexOf("&") === -1){
            var stringArr = string.split(",");
          }else{
            var stringArr = string.split("&");
          }
          if(stringArr[1].indexOf("=") === -1){
            var username = stringArr[0].split(":")
            var text = stringArr[1].split(":")
          }else{
            var username = stringArr[0].split("=")
            var text = stringArr[1].split("=")
          }
          prettyObj[username[0]] = username[1].split("+").join(" ");
          prettyObj[text[0]] = text[1].split("+").join(" ");
          prettyObj['objectId'] = Math.random() * 10000;
          prettyObj['createdAt'] = createDate();

          return prettyObj;

        }
        var postData = '';
        postData += datum;
        postData = parser(postData);

        postData = JSON.stringify(postData);
        postData = JSON.parse(postData);
        output.results.push(postData);
      });

    } else if (request.method === 'OPTIONS'){
      statusCode = 200;

      headers["access-control-allow-origin"] = "*";
      headers["access-control-allow-methods"] = "POST, GET, OPTIONS";
      headers["access-control-allow-credentials"] = false;
      headers["access-control-max-age"] = '86400'; // 24 hours
      headers["access-control-allow-headers"] = "x-parse-application-id, x-parse-rest-api-key, Content-Type, Accept";
    } 
  }

  function compare(a,b) {
    if (a.createdAt < b.createdAt)
      return 1;
    if (a.createdAt > b.createdAt)
      return -1;
    return 0;
  }

  //sort by last created
  if(orderType === '-createdAt'){
    output.results = output.results.sort(compare);
  }

  //i surpisingly had to make my own parser function. i gota be missing something
  var parser = function(string) {
    //input: username=Jin&text=hello&roomname=lobby
    //output: { username: 'Jono', text: 'Do my bidding!' }
    var prettyObj = {};
    if(string.indexOf("&") === -1){
      var stringArr = string.split(",");
    }else{
      var stringArr = string.split("&");
    }
    if(stringArr[1].indexOf("=") === -1){
      var username = stringArr[0].split(":")
      var text = stringArr[1].split(":")
    }else{
      var username = stringArr[0].split("=")
      var text = stringArr[1].split("=")
    }
    prettyObj[username[0]] = username[1].split("+").join(" ");
    prettyObj[text[0]] = text[1].split("+").join(" ");
    prettyObj['objectId'] = Math.random() * 10000;
    prettyObj['createdAt'] = createDate();

    return prettyObj;

  }
  

  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';
  //headers['Location'] = '../client/index.html';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);
  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(JSON.stringify(output));
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

exports.requestHandler = requestHandler;