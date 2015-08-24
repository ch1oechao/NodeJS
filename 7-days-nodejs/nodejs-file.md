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