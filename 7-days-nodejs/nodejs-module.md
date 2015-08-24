## Node.js 模块

在编写每个模块时，都有```require```、```exports```、```module```三个预先定义好的变量可以使用。

####require

```reqiure``` 函数用于在当前模块中加载和使用别的模块，传入一个模块名，返回一个模块导出对象。模块名可使用相对路径(以```./```开头)，或者是绝对路径(以```C:/```之类的盘符开头)。同时，模块名中的 ```.js``` 扩展名可以省略

	var foo1 = require('./foo');
	var foo2 = require('./foo.js);
	var foo3 = require('./home/user/foo');
	var foo4 = require('/home/user/foo.js');

	// foo1-foo4 中保存的时同一个模块的导出对象
	
另外，可以使用以下方式加载和使用一个JSON文件

	var data = require('./data.json');
	
####exports

```exports``` 对象是当前模块的导出对象，用于导出模块共有方法和属性。别的模块通过 ```require``` 函数使用当前模块时，得到的就是当前 ```exports``` 对象。

	exports.hello = function() {
	  console.log('Hello World');
	}
	
####module

通过 ```module``` 对象可以访问到当前模块的一些相关信息，但最多的用途是替换当前模块的导出对象。

	module.exports = function() {
	  console.log('Hello World');
	}
	
以上代码中，模块默认导出对象替换为一个函数。


####模块化初始化

一个模块中的JS代码仅在模块第一次被使用时被执行一次，并在执行过程中初始化模块的导出对象。之后，缓存起来的导出对象被重复利用。

####主模块

用过命令行参数传递给NodeJS以七佛那个程序的模块被称为主模块。主模块负责跳读组成整个程序的其他模块完成工作。

通过以下命令启动程序时，main.js就是主模块

	$ node main.js
	
	

