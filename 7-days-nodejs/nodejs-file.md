##文件操作

####拷贝文件

#####小文件拷贝

使用NodeJS内置的fs模块简单实现拷贝

	var fs = require('fs');
	
	function copy(src, dst) {
		fs.writeFileSync(dst, fs.readFileSync(src));
	}
	
	function main(argv) {
		copy(argv[0], argv[1]);
	}
	
	main(process.argv.slice(2));
	
以上程序使用 fs.readFileSync 从源路径读取文件内容，并使用 fs.writeFileSync 将文件内容写入目标路。

process 是一个全局变量，可通过process.argv获得命令行参数。
由于argv[0]固定等于NodeJS执行程序的绝对路径，argv[1]固定等于主模块的绝对路径，因此第一个命令行参数从argv[2]这个位置开始。

#####大文件拷贝

一次性把所有文件内容都读取到内存中后再一次写入磁盘的方式，不适合拷贝大文件，内存会爆仓。对于大文件，我们只能读一点写一点，知道完成拷贝。

	var fs = require('fs');
	
	function copy(src, dst) {
		fs.createReadStream(src).pipe(fs.createWriteStream(dst));
	}
	
	function main(argv) {
		copy(argv[0], argv[1]);
	}
	
	main(process.argv.slice(2));
	
以上程序使用fs.createReadStream创建了一个源文件的只读数据流，并使用fs.createWriteStream创建了一个目标文件的只写数据流，并且用pipe方法把两个数据流连接了起来。

####API

#####Buffer 数据块

JS语言本身只有字符串数据类型，没有二进制数据类型，因此NodeJS提供了一个与String对等的全局构造函数Buffer来提供对二进制数据的操作。除了可以读取得到Buffer的实例外，也可以直接构造：

	var bin = new Buffer([ 0x68, 0x65, 0x6c, 0x6c, 0x6f]);
	
Buffer 与 字符串类似，除了可以用.length属性得到字节长度外，还可以用[index]方式读取指定位置的字节

	bin[0]; // 0x68;
	
Buffer与字符串能够互相转化

	vat str = bin.toString('utf-8'); // "hello"
	
或者，将字符串转换为指定编码下得二进制数据：

	var bin = new Buffer('hello', 'utf-8'); // <Buffer 68 65 6c 6c 6f>
	
Buffer 与 字符串有一个重要的区别。 字符串是只读的， 并且对字符串的任何修改得到的都是一个全新的字符串，元字符串保持不变。

对于 Buffer，可以用[index]方式直接修改某个位置的字节。

bin[0 = 0x48;

.slice 方法也不是返回一个新的Buffer 而是返回了指向员Buffer中间的某个位置的指针。 .slice 方法返回的Buffer的修改也会作用于原Buffer。

	var bin = new Buffer([ 0x68, 0x65, 0x6c, 0x6c, 0x6f ]);
	var sub = bin.slice(2);
	
	sub[0] = 0x65;
	
	console.log(bin); // <Buffer 68 65 65 6c 6f>

如果需要拷贝一份Buffer，首先得创建一个新的Buffer，并通过.copy方法把原Buffer中的数据复制过去。这个类似于申请一个新的内存，并把已有内存中的数据复制过去。

	var bin = new Buffer([ 0x68, 0x65, 0x6c, 0x6c, 0x6f ]);
	var dup = new Buffer(bin.length);
	
	bin.copy(dup);
	dup[0] = 0x48;
	console.log(bin); // <Buffer 68 65 6c 6c 6f>
	console.log(dup); // <Buffer 48 65 6c 6c 6f>


#####Stream 数据流

当内存中无法一次装下需要处理的数据时，或者一边读取一边处理更加高效时，我们就需要用到数据流。NodeJS中通过各种Stream来提供对数据流的操作。

以上面的大文件拷贝程序为例，我们为数据来源创建一个只读数据流。



	var rs = fs.createReadStream(pathname);
	
	rs.on('data', function(chunk) {
		rs.pause();
		
		doSomething(chunk, function(){
			rs.resume();
		});
	});
	
	rs.on('end', function(chunk) {
	    clearUp();
	});
	
	
以上代码给doSomething函数加上了回调，因此可以在处理数据前暂停数据读取，并在处理数据后继续读取数据。

为数据目标创建一个只写数据流：

	var rs = fs.createReadStream(src);
	var ws = fs.createWriteStream(dst);
	
	rs.on('data', function(chunk) {
		ws.write(chunk);
	});
	
	rs.on('end', funciton() {
		ws.end();
	});
	
	
实现数据从只读数据流到只写数据流的搬运，并包括了防爆仓的控制。因为重者使用场景很多，例如上面的大文件拷贝程序，NodeJS直接提供了.pipe方法来处理这种事情，其内部实现方式与上边的代码类似。

	var rs = fs.createReadStram(src);
	var ws = fs.createWriteStream(dst);
	
	rs.on('data', funciton(chunk) {
		if (ws.write(chunk) === false) {
			rs.pause();
		}
	});	
	
	rs.on('end', function() {
		ws.end();
	});
	
	ws.on('drain', function() {
		rs.resume();
	});
	
	
#####File Systeam 文件系统

NodeJS通过 fs 内置模块提供对文件的操作。fs模块提供的API基本上可以分为三类：

- 文件属性读写
		
	其中常用的有 fs.stat / fs.chmod / fs.chown 等等
	
- 文件内容的读写
	
	其中常用的有 fs.readFile / fs.readdir / fs.writeFile / fs.mkdir 等等
	
- 底层文件的操作

	其中常用的有 fs.open / fs.read / fs.write / fs.close 等等
	
	
NodeJS最精华的异步IO模型 在fs 模块里充分体现

	fs.readFile(pathname, function(err, data){
		if (err) {
			// Deal with error
		} else {
			// Deal with data
		}
	});
	
如以上代码所示，基本上所有fs模块API的回调参数都有两个，第一个参数在有错误发生时等于异常对象，第二个参数始终用于返回API方法执行结果。

此外，fs模块的所有异步API都有对应的同步版本，用于无法使用异步操作时，或者同步操作更方便时的情况。同步API除了方法名的末尾多了一个Sync之外，异常对象与执行结果的传递方式也相应变化。

	try {
		var data = fs.readFileSync(pathname);
		// Deal with data
	} catch (err) {
		// Deal with error
	}
	
#####Path 路径

操作文件时难免不与文件路径打交道，NodeJS提供了path内置模块来简化路径相关操作，并提供代码可读性。

常用API

- path.normalize

	将传入的路径转化为标准路径
		
		var cache = {};
		
		function store(key, value) {
			cache[path.normalize(key)] = value;
		}
		
		store('foo/bar', 1);
		store('foo//baz//../bar', 2);
		console.log(cache); // {"foo/bar": 2}
		
	防坑：标准化之后的路径里的斜杠在Windows系统下是 \ 在Liunx系统下 是 / 。如果想保证任何系统下都使用 / 作为路径分隔符的话，需要用 .replace(/\\/g, '/') 再替换一下标准路径。
	
- path.join

	将传入的多个路径拼接为标准路径。该方法可避免手工拼接路径字符串的繁琐，并且能在不同系统下正确使用相应的路径分隔符
	
		path.join('foo/', 'baz/', '../bar'); // "foo/bar"
		
- path.extname

	当我们需要根据不同文件扩展名做不同操作时，该方法就显得很好用。
	
		path.extname('foo/bar.js'); // ".js"
		
		
####遍历目录

遍历目录是操作文件时的一个常见需求。比如写一个程序，需要找到并处理指定目录下得所有JS文件时，就需要遍历整个目录。

#####递归算法

遍历目录时一般使用递归算法。递归算法与数学归纳法类似，通过不断缩小问题的规模来解决问题。

	function factorial(n) {
		if (n === 1) {
			return 1;
		} else {
			return n * factorial(n - 1);
		}
	}
	
以上函数用于计算N的阶乘(N!)

#####遍历算法

目录是一个树状结构，在遍历时，一般使用深度优先+先序遍历算法。深度优先，意味着到达一个节点后，首先接着遍历子节点而不是邻居节点。先序遍历，意味着首次到达了某节点就算遍历完成，而不是最后一次返回某节点才算数。

以下这颗树的遍历顺序是 A > B > D > E > C > F

		A
	   / \
	  B   C
	 / \   \
	D   E   F
	
#####同步遍历

了解了必要的算法后，可以简单实现以下目录遍历函数

	function travel(dir, callback) {
		fs.readdirSync(dir).forEach(function(file) {
			var pathname = path.join(dir, file);
			
			if (fs.statSync(pathname).isDirectory()) {
				travel(pathname, callback);
			} else {
				callback(pathname);
			}
		});
	}
	
该函数以某个目录作为遍历的起点。遇到一个子目录时，就先接着遍历子目录。遇到一个文件时，就把文件的绝对路径传给回调函数。回调函数拿到文件路径后，就可以做各种判断和处理。

假设目录：

	- /home/user/
		- foo/
			x.js
		- bar/
			y.js
		z.css
		
使用以下代码遍历该目录时，得到的输入如下：

	travel('/home/user', function(pathname) {
		console.log(pathname);
	});
	
	---
	
	/home/user/foo/x.js
	/home/user/bar/y.js
	/home/user/z.css
	
#####异步遍历

如果读取目录或读取文件状态时，使用的是异步API，目录遍历函数实现起来会有些复杂，但原理完全相同。travel函数的异步版本如下。

	function travel(dir, callback, finish) {
		fs.readdir(dir, function(err, files) {
			(function next(i) {
				if (i < files.length) {
					var pathname = path.join(dir, files[i]);
					
					fs.stat(pathname, function (err, stats) {
						if (stats.isDirectory()) {
							travel(pathname, callback, function(){
								next(i + 1);
							});
						} else {
							callback(pathname, function(){
								next(i + 1);
							});
						}
					});
				} else {
					finish && finish();
				}
			}(0));
		});
	}
	
#####文件编码

在使用NodeJS编写前端工具时，操作的最多的是文本文件，因此也就涉及到了文件编码的处理问题。我们常用的文本编码有UTF8和GBK两种，并且UTF8文件还可能带有BOM。在读取不同编码的文本文件时，需要将文件内容转换为JS使用的UTF8编码字符后才能正常处理。

**BOM的移除**

BOM用于标记一个文本文件使用Unicode编码，其本身是一个Unicode字符("\uFEFF")，位于文本文件头部。
在不同Unicode编码下，BOM字符对应的二进制字节如下

	Bytes          Encoding
	-------------------------
	FE FF          UTF16BE
	FF FE          UTF16LE
	EF BB BF       UTF8
	
因此，我们可以根据文本文件头几个字节来判断文件是否包含BOM，以及使用哪种Unicode编码。

	function readText(pathname) {
		var bin = fs.readFileSync(pathname);
		
		if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
			bin = bin.slice(3);
		}
		
		return bin.toString('utf-8');
	}
	
以上代码实现了识别和去除UTF8 BOM的功能。

**GBK转UTF8**

NodeJS支持在读取文本文件时，或者在Buffer转换为字符串时指定文本编码，但是GBK编码不在自身支持范围内。因此，需要借助 iconv-lite 这个三方包来转换编码。使用NPM下载该包后，可以按一下方式编写一个读取GBK文本文件的函数。

	var iconv = require('iconv-lite');
	
	function readGBKText(pathname) {
		
		var bin = fs.readFileSync(pathname);
		
		return iconv.decode(bin, 'gbk');
	}
	
**单字节编码**

NodeJS中自带了一种binary编码可以实现这种方法

	function replace(pathname){
		var str = fs.readFileSync(pathname, 'binary');
		str = str.replace('foo', 'bar');
		fs.writeFileSync(pathname, str, 'binary');
	}
	
