###异步编程

####回调

在代码中，异步编程的直接体现就是回调。异步编程依托于回调来实现。

	function heavyCompute(n, callback) {
		var count = 0;
		var i;
		var j;
		
		for (i =  n, i > 0; --i) {
			for (j = n; j > 0; --j) {
				count += 1;
			}
		}
		
		callback(count);
	}
	
	heavyCompute(10000, function(count){
		console.log(count);
	});
	
	console.log('hello');
	
	// 10000000
	// hello
	
可以看到，以上代码中的回调函数仍然先于后续代码执行。JS本身是单线程运行的，不可能在一段代码还未运行时区运行别的代码，因此也就不存在异步执行的概念。

但是，如果函数做的事情是创建一个别的进程或线程并与JS主线程并行地做一些事情，并在事情做完后通知JS主线程，情况则不一样。

	setTimeout(function(){
		console.log('world');
	}, 1000);
	
	console.log('hello');
	
	// hello
	// world
	
这次可以看到，回调函数于后续代码执行了。如上所说，JS本身是单线程的，无法异步执行，因此可以认为 setTimeout 这类JS规范之外的由运行环境提供的特殊函数做的事情是创建一个平行线后立即返回，让JS主进程可以接着执行后续代码，并在收到平行进程的通知后再执行回调函数。除了 setTimeout / setInterval 这些常见的，这类函数还包括NodeJS提供的诸如 fs.readFile 之类的异步API。

####代码设计模式

异步编程有很多特有的代码设计模式，为了实现同样地功能，使用同步方式和异步方式编写的代码会有很大差异。

#####函数返回值

使用一个函数的输出作为另一个函数的输入是很常见的需求，在同步方式下编写代码：

	var output = fn1(fn2('input'));
	// ...
	
而在异步方式下，由于函数执行结果不是通过返回值，而是通过回调函数传递，因此一般按一下方式编写代码：

	fn2('input', function(output2){
		fn1(output2, function(output1){
			// ...
		});
	});
	
#####遍历数组

在遍历数组时，使用某个函数依次对数据成员做一些处理也是常见的需求。

函数同步执行：

	var len = arr.length;
	var   i = 0;
	
	for (; i < len; ++i) {
		arr[i] = sync(arr[i]);
	}
	
如果函数是异步执行的，以上代码就无法保证循环结束后所有数组成员都处理完毕了。如果数组成员必须一个接一个串行处理，则一般按照以下方式编写异步代码：

	(function next(i, len, callback){
		if (i < len) {
			async(arr[i], function (value) {
				arr[i] = value;
				next(i + 1, len, callback);
			});
		} else {
			callback();
		}
	}(0, arr.length, function(){
		// All array items have processed.
	}));
	
可以看到，以上代码在异步函数执行一次病返回执行结果后才传入下一个数组成员并开始下一轮执行，直到所有数组成员处理完毕后，通过回调的方式触发后续代码的执行。

如果数组成员可以并行处理，但后续代码仍然需要所有数组成员处理完毕后才能执行的话，则异步代码会调整以下形式：

	(function(i, len, count, callback){
		for (; i < len; ++i) {
			(function(i){
				async(arr[i], function(value){
					arr[i] = value;
					if (++count === len) {
						callback();
					}
				});
			}(i));
		}
	}(0, arr.length, 0, function(){
		// All array items have processed.
	}));
	
可以看到，与异步串行遍历的版本相比，以上代码并行处理所有数组成员，并通过计数器变量来判断什么时候所有数组成员都处理完毕了。

####异常处理

JS自身提供的异常捕获和处理机制 —— try...catch...，只能用于同步执行的代码。

	function sync(fn){
		return fn();
	}
	
	try {
		sync(null);
		// Do something
	} catch (err) {
		console.log('Error: %s', err.message);
	}
	
	// Error: object is not a function
	
可以看到，异常会沿着代码执行路径一直冒泡，直到遇到第一个try语句时被捕获住。但由于异步函数会打断代码执行路径，异步函数执行过程中以及执行之后产生的异常冒泡到执行路径被打断位置，如果一直没有遇到 try 语句，就作为一个全局异常抛出。

	function async(fn, callback){
	
		// Code execution path breaks here.
		
		setTimeout(function(){
			callback(fn());
		}, 0);
	}
	
	try {
		async(null, function(data){
			// ...
		});
	} catch (err) {
		console.log('Error: $s', err.message);
	}
	
因为代码执行路径打断了，我们就需要在异常冒泡到断点之前用 try 语句把异常捕获住， 并通过回调函数传递被捕获的异常。

	function async(fn, callback){
		
		// Code execution path breaks here.
		
		setTimeout(function(){
			try {
				callback(null, fn());
			} catch (err) {
				callback(err);
			}
		}, 0);
	}
	
	async(null, function (err, data) {
		if (err) {
			console.log('Error: %s', err.message);
		} else {
			// ...
		}
	});
	
####域(Domain)

NodeJS 提供了 domain 模块，可以简化异步代码的异常处理。简单来说，一个域就是一个JS运行环境，在一个运行环境中，如果一个异常没有被捕获，将作为一个全局异常抛出。NodeJS通过 process 对象提供了捕获全局异常的方法，示例代码如下：

	process.on('uncaughtException', function(err){
		console.log('Error: %s', err.message);
	});
	
	setTimeout(function(fn){
		fn();
	});
	
	// Error: undefined is not a function
	

---

not end...
