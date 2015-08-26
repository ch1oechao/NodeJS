###网络操作

使用 ```NodeJS``` 内置的 ```http``` 模块简单实现一个HTTP服务器。

	var http = require('http');
	
	http.createServer(function(request, response) {
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.end("Hello World \n");
	}).listen(8800);
	
以上代码创建了一个HTTP服务器并监听 ```8800``` 端口，打开浏览器可访问 ```http://127.0.0.1:8800/ ```


####API

#####HTTP

```http``` 模块提供两种使用方式

- 作为**服务端**使用时，创建一个HTTP服务器，监听HTTP客户端请求并返回响应。
- 作为**客户端**使用时，发起一个HTTP客户端请求，获取服务器端响应。

```HTTP请求``` 本质上是一个数据流，由请求头(headers) 和 请求体(body) 组成。
一个完整的HTTP请求数据内容如下。

	POST / HTTP/1.1
	User-Agent: curl/7.26.0
	Host: localhost
	Accept: */*
	Content-Length: 11
	Content-Type: application/x-www-form-urlencoded
	
	Hello World
	
```http``` 模块创建的HTTP服务器在接收到完整的请求头后，就会调用回调函数。在回调函数中，除了可以使用 ```request``` 对象访问请求头数据外，还能把 ```request``` 对象当做一个只读数据流来访问请求体数据。

	http.createServer(function(request, response) {
		var body = [];
		
		console.log(request.method);
		console.log(request.headers);
		
		request.on('data', function(chunk) {
			body.push(chunk);
		});
		
		request.on('end', function() {
			body = Buffer.concat(body);
			console.log(body.toString());
		});
	}).listen(80);
	
	---
	
	POST
	{
		'user-agent': 'curl/7.26.0',
		'host': 'localhost',
		'accept': '*/*',
		'content-length': '11',
		'content-type': 'application/x-www-form-urlencoded'
	}
	Hello World
	
HTTP响应本质上也是一个数据流，同样由响应头(headers) 和 响应体(body)组成。
一个完整的HTTP响应数据内容如下。

	HTTP/1.1 200 OK
	Content-Type: text/plain
	Content-Length: 11
	Date: Wed, 26 Aug 2015 15:17:33 GMT
	Connection: keep-alive
	
	Hello World
	
在回调函数中，除了可以使用 ```response``` 对象来写入响应头数据外，还能把 response 对象当做一个只写数据流来写入响应体数据。

	http.createServer(function(request, response) {
		response.writeHead(200, {"Content-Type": "text/plain"});
		request.on('data', function(chunk) {
			response.write(chunk);
		});
		request.on('end', function(){
			response.end();
		});
	}).listen(80);
	
为发起一个客户端HTTP请求，需要制定目标服务器的位置并发送请求头和请求体。

	var options = {
		hostname: 'hehe.com',
		post: 80,
		path: '/upload',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};
	
	var request = http.request(options, function(response){});
	
	request.write("Hello World");
	request.end();
	
```.request``` 方法创建了一个客户端，并制定请求目标和请求头数据。之后，可以把 ```request``` 对象当做一个只写数据流来写入请求体数据和结束请求。

由于HTTP请求中，```GET``` 请求是最常见的一种，并且不需要请求体，因此 ```http``` 模块也提供了一下便捷API。

	http.get("http://hehe.com/", function(response){});
	
当客户端发送请求并接收到完整的服务端响应头时，就会调用回调函数。在回调函数中，除了可以使用 ```response``` 对象访问响应数据外，还能把 ```response``` 当一个只读数据流来访问响应体数据。

	http.get("http://hehe.com", function(response){
		var body = [];
		
		console.log(response.statusCode);
		console.log(response.headers);
		
		response.on('data', function(chunk) {
			body.push(chunk);
		});
		
		response.on('end', function() {
			body = Buffer.concat(body);
			console.log(body.toString());
		});
	});
	
	---
	
	200
	{
		'content-type': 'text/html',
		'server': 'Apache',
		'content-length': '233',
		'date': 'Wed, 26 Aug 2015 15:17:33 GMT',
		'connection': 'keep-alive'
	}
	<!DOCTYPE html>
	...
	
#####HTTPS

```https``` 模块和 ```http``` 模块极为类似，区别在于 ```https``` 模块需要额外处理**SSL证书**。

在服务端模式下，创建一个HTTPS服务器的示例如下。

	var options = {
		key: fs.readFileSync('./ssl/default.key'),
		cert: fs.readFileSync('./ssl/default.cer')
	};
	
	var server = https.createServer(options, function(request, response){
		doSomething();
	});
	
与创建HTTP服务器相比，HTTPS多了一个 ```options``` 对象，通过 ```key``` 和 ```cert``` 字段指定了HTTPS服务器使用的私钥和公钥。

另外，```NodeJS``` 支持SNI技术，可以根据HTTPS客户端请求使用的域名动态使用不同的证书，因此同一个HTTPS服务器可以使用多个域名提供服务。

可以使用以下方法为HTTPS服务器添加多组证书。

	server.addContext('foo.com', {
		key: fs.readFileSync('./ssl/foo.com.key'),
		csrt: fs.readFileSync('./ssl/foo.com.cer')
	});
	
	server.addContext('bar.com', {
		key: fs.readFileSync('./ssl/bar.com.key'),
		cert: fs.readFileSync('./ssl/bar.com.cer')
	});
	
在客户端模式下，发起一个HTTPS客户端请求和 HTTP 模块几乎相同，示例吐下：

	var options = {
		hostname: 'haha.com',
		port: 2333,
		path: '/',
		method: 'GET'
	};
	
	var request = https.request(options, function(response){});
	resquest.end();
	
吐过目标服务器使用的SSL证书是自制的，不是从办法机构购买的，默认情况下 ```https``` 模块会拒绝链接，提示说有正事安全问题。在 ```options``` 里加入 ```rejectUnauthorized: false``` 字段可以禁用对证书有效性的检查，从而允许 ```https``` 模块请求开发环境下使用自制证书的HTTPS服务器。

####URL

处理HTTP请求时 ```url``` 模块使用率超高，因为该模块允许```解析URL```、```生成URL```、以及```拼接URL```。

URL的各组成部分

							href
	-----------------------------------------------------
							  host				     path
						---------------- ---------------------------

	http:// user:pass @ host.com : 8080 /p/a/t/h ?query=string #hash

	----    ---------   --------   ---- -------- ------------- -----
	protocol   auth     hostname   port pathname    search      hash
												   ------------
												      query
												      
可以使用 ```.parse``` 方法来将一个URL字符串转化为URL对象。

	url.parse('http://user:pass@host.com:8080/p/a/t/h/?query=string#hash');
	
	/*
		{
			protocol: 'https',
			auth: 'user:pass',
			host: 'host.com:8080',
			port: '8080',
			hostname: 'host.com',
			hash: '#hash',
			search: '?query=string',
			query: 'query=string',
			pathname: 'p/a/t/h',
			path: 'p/a/t/h?query=string',
			href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'
		}
	*/ 

传给 ```.parse``` 方法不一定要一个完整的URL，在HTTP服务器回调函数中，```request.url``` 不包含协议头和域名，但同样可以用 ```.parse``` 方法解析。

```.parse``` 方法还支持第二个和第三个布尔类型可选参数。第二个参等于 ```true``` 时，该方法返回的URL对象中，query字段不再是一个字符串，而是一个经过 ```querystring``` 模块转换后的参数对象。第三个参数等于 ```true``` 时，该方法可以正确解析不带协议头的URL，例如 ```//hehe.com/foo/bar```

反过来，```format``` 方法允许将一个URL对象转换为URL字符串，示例如下：

	url.format({
		protocol: 'http',
		host: 'www.haha.com',
		pathname: 'p/a/t/h',
		search: 'query=string'
	});
	
	/*
		'http://www.haha.com/p/a/t/h?query=string'
	*/

另外，```.resolve``` 方法可以用于URl，示例如下

	url.solve('http://www.haha.com/foo/bar', '../baz');
	/*
		'http://haha.com/baz'
	*/

#####Query String

```querystring``` 模块用于实现URL参数字符串与参数对象的互相转换。

	querystring.parse('foo=bar&baz=qux&baz=quux&corge');
	/*
		{
			foo: 'bar',
			baz: ['qux', 'quux'],
			corge: ''
		}
	*/
	
	querystring.stringify({
		foo: 'bar',
		baz: ['qux', 'quux'],
		corge: ''
	});
	/*
		'foo=bar&baz=qux&baz=quux&corge'
	*/
	
	
#####Zlib

```zlib``` 模块提供了数据压缩和解压的功能。当我们处理HTTP请求和响应时，可能需要用到这个模块。

使用 ```zlib``` 模块压缩HTTP响应体数据的例子。这个例子中，判断了客户端是否支持 ```gzip```，并在支持的情况下使用 ```zlib``` 模块返回 ```gzip``` 之后的响应体数据。

	http.createServer(function(request, response){
		var i = 1024;
		var data = '';
		
		while(i--) {
			data += '.';
		}
		
		if ((request.headers['accept-encoding'] || '').indexOf('gzip') !== -1) {
			zlib.gizp(data, function(err, data) {
				response.writeHead(200, {
					'Content-Type': 'text/plain',
					'Content-Encoding': 'gzip'
				});
				response.end(data);
			});
		} else {
			response.writeHead(200, {
				'Content-Type': 'text/plain'
			});
			response.end(data);
		}
		
	}).listen(80);
	
使用 ```zlib ```模块解压HTTP响应数据的例子，在这个例子中，判断了服务器响应是否使用 ```gzip``` 压缩，并在压缩的情况下使用 ```zlib``` 模块解压响应体数据。

	var options = {
		hostname: 'www.haha.com',
		post: 80,
		path: '/',
		method: 'GET',
		headers: {
			'Accept-Encoding': 'gzip,deflate'
		}
	};
	
	http.request(options, function(response) {
		var body = [];
		
		response.on('data', function(chunk){
			body.push(chunk);
		});
		
		response.on('end', function(){
			body.Buffer.concat(body);
			
			if (response.headers['content-encoding'] === 'gzip') {
				zlib.gunzip(body, function(err, data) {
					console.log(data.toString());
				});
			} else {
				console.log(data.toString());
			}
		});
	}).end();
	
	
#####Net

```net``` 模块用于创建 ```Socket``` 服务器 或 ```Socket``` 客户端。

使用 ```Socket``` 搭建一个不严谨的HTTP服务器的例子。这个HTTP服务器不管收到什么请求，都固定返回相同的响应。

	net.createServer(function(conn) {
		conn.on('data', function(data) {
			conn.write([
				'HTTP/1.1 200 OK',
				'Content-Type: text/plain',
				'Content-Length: 11',
				'',
				'Hello World'
			].join('\n'));
		});
	}).listen(80);
	
使用 ```Socket``` 发起HTTP客户端请求的例子。这个例子中，Socket客户端在建立连接后发送了一个 ```HTTP GET``` 请求，并通过 ```data``` 事件监听函数来获取服务器响应。

	var options = {
		port: 80,
		host: 'www.hehe.com'
	};
	
	var client = net.connect(options, function(){
		client.write([
			'GET / HTTP/1.1',
			'User-Agent: curl/7.26.0',
			'Host: www.hehe.com',
			'Accept: */*',
			'',
			''
		].join('\n'));
	});
	
	client.on('data', function(data){
		console.log(data.toString());
		client.end();
	});


