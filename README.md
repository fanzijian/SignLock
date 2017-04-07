# 360前端星计划作业

标签（空格分隔）： 前端 练习题

---

## 任务要求
在移动设备上，“手势密码”是一个很常见的UI。实现一个移动网页，允许用户设置手势密码和验证手势密码。已设置的密码记录在本地 <code>localStorage</code> 中。
原型界面如下：
![](http://ww1.sinaimg.cn/large/96787026ly1fe4xum9n0ij208w0fs74u.jpg)

操作流程如下图所示：
![](http://ww1.sinaimg.cn/large/96787026ly1fe4xt3kj6cj211a104q5i.jpg)

## 思路
**实现原理：**利用HTML5的canvas，绘制未解锁的圆，并利用touch事件来绘制解锁的圆与路径。
### 思考流程
首先第一步，分析界面上的元素，主要有标题区域，解锁区域，信息提示区域，模式选择区域四个区域。因此，整体布局呈现由上至下排布的，但是需要注意在不同尺寸上设备的兼容性情况。因此考虑到利用js查询当前设备window的大小（即<code>window.innerWidth</code>与<code>window.innerHeight;</code>）。从而根据相应大小动态计算参数进行布局。
```js
//DOM的初始化
SignLock.prototype.initDOM = function(){};
```

然后第二步，分析整个解锁过程中，需要处理的动画情况。
> * 初始状态下，需要绘制所有的初始圆
> * 解锁或者设置密码状态下，需要实时更新绘制选中的圆
> * 解锁或者设置密码过程中，需要实时绘制相应选择的路径
> * 根据相应的结果更新提示栏信息

整理出基本的操作函数如下：
```js
//绘制初始的所有圆
SignLock.prototype.drawCircle = function(){};

//绘制触碰到的圆
SignLock.prototype.drawTouchedCircle = function(i){};

//连接当前触碰到的圆与前一个触碰到的圆圆心（绘制手势路径）
SignLock.prototype.lineToTouchedCircle = function(i, j){};

//连接最新碰到的圆与手势落点（并未实现该功能）
SignLock.prototype.lineToTouchedPlace = function(x, y){};

//更新提示栏信息
SignLock.prototype.drawMessage = function(message){};

//判断当前手的落点是否在圆内
SignLock.prototype.isInCircle = function(x, y){};
```

第三步，分析整个过程中的事件情况，主要有两类事件：模式选择事件（<code>click</code>）、手势事件（<code>touchEvent</code>）。
> * 模式选择事件（<code>click</code>）用于选择当前模式
> * 手势事件分成三种：<code>touchstart</code>、<code>touchmove</code>、<code>touchend</code>。其中<code>touchstart</code>表示开始触碰，需要初始化到stat1待输入状态；<code>touchmove</code>则需要实时的绘制手势路径与圆，并记录当前经过路径；<code>touchend</code>表示绘制结束，验证密码是否符合要求。

事件绑定函数<code>SignLock.prototype.bindEvent()</code>代码大致如下所示：
```js
//添加触摸开始事件
c.addEventListener("touchstart", function(e){
//初始化代码
}, false);

//添加触碰移动事件
c.addEventListener("touchmove", function(e){
//绘制圆、路径等
//记录相应信息
}, false);

//添加手离开屏幕事件
c.addEventListener("touchend", function(e){
//密码验证
//提示信息更新
}, false);

//添加模式切换事件
btn.addEventListener("click",function(){
//模式选择，获取选择的模式
},false);
```

第四步，分析密码验证的过程，主要有密码设置验证与密码验证两个，函数如下：
```js
SignLock.prototype.checkPassword = function(pwd){};
SignLock.prototype.validPassword = function(pwd, oldPwd){};
```
其中返回消息的编码如下
| status | message | 含义
| --------   | :----:   | :----:|
| 0|  密码正确/密码设置成功| success|
| 1|  密码太短，至少需要5个点| failed |
| 2|  请再次输入手势密码|falied |
| 3| 两次输入的不一致 | falied |
| 4| 输入的密码不正确 | failed |
第五步，由于密码设置错误后，需要回归最初状态，因此还需要<code>reset</code>进行重置。

### 关键函数
#### 1. 绘制初始圆
```js
SignLock.prototype.drawCircle = function(){
    //获取canvas上下文
    var ctx = this.ctx;
    var circleCenterArr = this.circleCenterArr;

    var len = circleCenterArr.length;

    //设置颜色
    ctx.fillStyle = "#f8f8f8";
    ctx.beginPath();
    //根据圆的坐标绘制圆
    for(var i = 0; i < len; i++){
        ctx.moveTo(circleCenterArr[i][0], circleCenterArr[i][1]);
        ctx.arc( circleCenterArr[i][0], circleCenterArr[i][1], this.r, 0,Math.PI*2,true);
    }

    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#bbbbbb";
    
    //填充圆圈以及边界
    ctx.stroke();
    ctx.fill();  
};
```

#### 2. 设置密码与密码验证

```js
//判断密码是否正确
SignLock.prototype.checkPassword = function(pwd){
    //初始化消息
    var result = {
        status: 4,
        message: "输入的密码不正确"
    }
    //获取实际密码
    var password = localStorage.getItem("password");
    //判断密码是否正确
    if(password == pwd.join("")){
        result.status = 0;
        result.message = "密码正确";
    }
    //this.touchedCircleArr = [];
    return result;
};
//判断密码设置是否符合规范
SignLock.prototype.validPassword = function(pwd, oldPwd){
    var result = {
        status: 0,
        message: "密码设置成功"
    };
    if(pwd.length < 5){
        result.status = 1;
        result.message = "密码太短，至少需要5个点";
    }else if(oldPwd.length == 0){
        result.status = 2;
        result.message = "请再次输入手势密码";
    }else if(pwd.join("") != oldPwd.join("")){
        result.status = 3;
        result.message = "两次输入的不一致";
    }else {
        //密码正确则更新本地存储
        localStorage.setItem("password",pwd.join(""));
    }
    return result;
}
```

#### 3. 事件绑定函数
```js
//绑定事件处理程序，主要有手势事件，以及radio的点击事件
SignLock.prototype.bindEvent = function(){
    self = this;
    var c = this.c;
    var btn = this.btn;

    //添加触屏事件
    c.addEventListener("touchstart", function(e){
        //清空数据并初始化
        self.resetPic();
        //self.resetData();
    }, false);
    //添加触碰移动事件
    c.addEventListener("touchmove", function(e){
        //获取触点坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
        var i = self.isInCircle(po.x, po.y);
        //划过圆圈是否记录
        if(i != 0 ){
            //如果未记录过，则画圆并记录
            if(self.touchedCircleArr.indexOf(i) == -1){
                self.drawTouchedCircle(i);
                var len = self.touchedCircleArr.length;
                if(len >= 1){
                    self.lineToTouchedCircle(self.touchedCircleArr[len - 1],i);
                }
                self.touchedCircleArr.push(i);
            }
        }
    }, false);
    //添加手离开屏幕事件
    c.addEventListener("touchend", function(e){
        if(self.touchedCircleArr.length != 0){//防止意外触碰
            //判断密码是否符合
            var result = '';
            switch(self.model){
                case 'set' :
                    result = self.validPassword(self.touchedCircleArr, self.oldPassword);
                break;
                case 'check':
                    result = self.checkPassword(self.touchedCircleArr);
                break;
            }
            self.drawMessage(result);
        }
    }, false);
    //添加模式切换事件
    btn.addEventListener("click",function(){
        //重置界面和数据
        self.resetData();
        self.resetPic();
        var radio = document.getElementsByName("event");
        for(var i = 0; i < radio.length; i++){
            if(radio[i].checked){
                self.model = radio[i].value;
            }
        }
    },false);
}
```

### 现存问题与改进计划

1. 当手势过快的时候，会出现丢失点的情况。即快速划过1,2,3三个点，却只记录下来1,3两个点
2. 在Chrome上测试通过，在Chrome Developer Tools测试兼容各种不同移动设备尺寸。但是样式在UC浏览器上会失效。由于时间有限，未能及时找到更改原因。但是可以参考[自适应设计与响应式网页设计](http://www.alloyteam.com/2015/04/zi-shi-ying-she-ji-yu-xiang-ying-shi-wang-ye-she-ji-qian-tan/)利用<code>viewport</code>来解实现
3. 网页初次加载时，页面高度会高一些，页面刷新后即正常。原因暂时未知。
4. 时间仓促，很多地方都没有优化好，先提交一个版本，等有时间了，再继续进行优化。


## 参考文档
1. [MDN-Web技术文档 触摸事件](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch_events)
2. [CSS秘密花园：复杂背景图案](https://www.w3cplus.com/css3/css-secrets/complex-background-pattern.html)
3. [使用canvas来绘制图形](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
4. [自适应设计与响应式网页设计](http://www.alloyteam.com/2015/04/zi-shi-ying-she-ji-yu-xiang-ying-shi-wang-ye-she-ji-qian-tan/)
5. [H5手势解锁](https://github.com/lvming6816077/H5lock)



