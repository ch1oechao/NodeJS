var http = require("http");
var url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response, request);
  }
  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

// function start(route, handle) {
//   function onRequest(request, response) {
//     var postData = "";
//     var pathname = url.parse(request.url).pathname;
//     console.log("Requset for " + pathname +" received.");
//
//     // 接收数据的编码格式为UTF-8
//     request.setEncoding("utf8");
//
//     // 注册"data"事件的监听器，用于手机每次接收到的新数据块
//     request.addListener("data", function(postDataChunk) {
//       postData += postDataChunk;
//       console.log("Received POST data chunk '"
//                   + postDataChunk
//                   + "'.");
//     });
//
//     request.addListener("end", function() {
//       route(handle, pathname, response, postData);
//     });
//
//   }
//   http.createServer(onRequest).listen(8888);
//   console.log("Server has started.");
// }

exports.start = start;
