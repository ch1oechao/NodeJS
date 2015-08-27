###进程管理

```NodeJS``` 可以感知和控制自身进程的运行环境和状态，也可以创建进程并与其协同合作，这使得 ```NodeJS``` 可以把很多程序组合在一起共同完成某项工作，并在其中充当胶水和调度器的作用。


终端 ```cp``` 命令 
	
	cp -r source/* target
	
使用 ```NodeJS``` 调用终端命令来简化目录拷贝

	var child_process = require('child_process');
	var util = require('util');
	
	function copy(source, target, callback) {
		child_process.exec(
			util.format('cp -r %s/* %s', source, target),
			callback
		);
	}
	
	copy('a', 'b', function(err){
		// ...
	});
	
####API

- **Process**

	任何一个进程都有启动进程时使用的命令行参数，有标准输入标准输出，有运行权限，有运行环境和运行状态。在 ```NodeJS``` 中，可以通过 ```process``` 对象感知和控制 ```NodeJS``` 自身进程的方方面面。 ```process``` 不是内置模块，而是一个全局对象，因此在任何地方都可以直接使用。
	
- **Child Process**

	使用 ```child_process``` 模块可以创建和控制子进程。该模块提供的核心API是 ```.spawn``` 
	
- **Cluster**

	```cluster``` 模块是对 ```child_process``` 模块的进一步封装，专用于解决单进程 NodeJS Web服务器无法充分利用多核CPU的问题。使用该模块可以简化多进程服务器程序的开发，让每个核上运行一个工作进程，并同意通过主进程监听端口和分发请求。
	
####实践

#####获取命令行参数

在 ```NodeJS``` 中可以通过 ```process.argv``` 获取命令行参数。Node执行程序路径和主模块文件路径固定占据了 ```argv[0]``` 和 ```argv[1]``` 两个位置，而第一个命令行参数从 ```argv[2]``` 开始。为了让 ```argv``` 使用起来更自然，可以使用以下方式处理

	function main(argv) {
		// ...
	}
	
	main(process.argv.slice(2));
	
#####如何退出程序

通常一个程序做完所有事情后就正常退出了，这时程序的退出状态码为 ```0``` 。或者一个程序运行时发生了异常后就挂掉了，这时程序的退出状态码不等于 ```0``` 。如果我们在代码中捕获了某个异常，但是觉得程序不应该继续运行下去，需要立即退出，并且需要把退出状态码设置为指定数字，比如 ```1``` ，就可以按照以下方式

	try {
		// ...
	} catch (err) {
		// ...
		process.exit(1);
	}
	
#####控制输入输出

NodeJS程序的标准输入流(stdin)、一个标准输出流(stdout)、一个标准错误流(stderr)分别对应 ```process.stdin``` / ```process.stdout``` / ```process.stderr``` ，第一个是只读数据流，后边两个是只写数据流，对它们的操作按照对数据流的操作方式即可。例如，```console.log``` 可以按照以下方式实现。

	function log(){
		process.stdout.write(
			util.format.apply(util, argument) + '\n'
		);
	}
	
#####如何降权

在Linux系统下，我们知道需要使用root权限才能监听1024以下端口。但是一旦完成端口监听后，继续让程序运行在root权限下存在安全隐患，因此最好能把权限降下来。

	http.serverCreate(callback).listen(80, function(){
		var env = process.env;
		var	uid = parseInt(env['SUDO_UID'] || process.getuid(), 10);
		var gid = parseInt(env['SUDO_GID'] || process.getgid(), 10);
		
		process.setgid(gid);
		process.setuid(uid); 
	});

需要注意的几点：

- 如果是通过 ```sudo``` 获取root权限，运行程序的用户UID和GID保存在环境变量 ```SUDO_UID``` 和 ```SODU_GID``` 里边。如果是通过 ```chmod + s``` 方式获取root权限的，运行程序的用户UID和GID可直接通过 ```process.getuid``` 和 ```process.getgid``` 方法获取。
- ```process.setuid``` 和 ```process.getgid``` 方法只接受  ```number``` 类型的参数。
- 降权时必须先降GID再降UID，否则顺序反过来的话就没有权限更改程序的GID。

#####创建子进程

	var child = child_process.spawn('node', ['xxx.js']);
	
	child.stdout.on('data', function(data){
		console.log('stdout: ' + data);
	});
	
	child.stderr.on('data', function(data){
		console.log('stderr: ' + data);
	});
	
	child.on('close', function(code){
		console.log('child process exited with code ' + code);
	});
	
以上代码使用了 ```.spawn(exec, args, options)``` 方法，该方法支持三个参数。第一个参数是执行文件路径，可以是执行文件的相对或绝对路径，也可以是根据PATH环境变量能找到的执行文件名。第二个参数中，数组中的每个成员都按顺序对应一个命令行参数。第三个参数可选，用于配置子进程的执行环境与行为。



	