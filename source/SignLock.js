(function(){
/*
 *构造函数，为解锁的n * n的点阵的n赋值
 */
window.SignLock = function(obj){
    this.n = obj.number;
};
/**
 * [initDOM 初始化DOM]
 */
SignLock.prototype.initDOM = function(){
    var container = document.createElement('div');
    var wWidth = window.innerWidth;
    var wHeight = window.innerHeight;
    container.setAttribute('style','text-align: center;margin: 0; padding: 0; font-size: 30px; height:' + wHeight + 'px');
    var str = '<h1 style="padding-bottom: 20px; margin: 0 auto; border-bottom: 4px solid gray" >手势密码</h1>' +
            '<div style="background: #f0f0f2; background-image: radial-gradient(#bbbbbb 2px, transparent 0); background-size: 40px 40px;height:'+ (wHeight - 103) + 'px;">' +
                '<canvas width="'+ wWidth * 2 / 3 +'" height="'+ wWidth * 2 / 3 +'" id="signPassword"></canvas>' +
                '<p style="height: 44px; margin: 0 auto;" id="message">请输入手势密码</p>'+
                '<div style="margin: '+ (wHeight - 103 - wWidth * 2 / 3) / 5  +'px auto 0 '+ wWidth / 4 +'px; text-align: left;" id="controller"><input type="radio" name="event" value="set" checked />设置密码<p></><input type="radio" name="event" value="check"/>验证密码</div>'+
            '</div>';
    container.innerHTML = str;
    document.body.style.margin = '0px';
    document.body.appendChild(container);
}
/**
 * [init 初始化页面及参数]
 */
SignLock.prototype.init = function(){
    this.initDOM();
    this.model = 'set';
    this.btn = document.getElementById("controller");
    this.c = document.getElementById("signPassword");
    this.ctx = this.c.getContext("2d");
    this.cWidth = this.c.width / (this.n + 1);
    this.r = this.cWidth / 4;
    var circleCenterArr = [];

    for (var i = 0; i < this.n; i++){
        for(var j = 0; j < this.n; j++){
            circleCenterArr.push([this.cWidth * (j + 1),this.cWidth * (i + 1)]);
        }
    }
    this.circleCenterArr = circleCenterArr.slice();

    this.touchedCircleArr = [];
    this.newPassword = [];
    this.oldPassword = [];
    this.bindEvent();
    this.drawCircle();
};
/**
 * [drawCircle 绘制默认的初始n * n个圆，圆的序号为1至n^2]
 */
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
/**
 * [drawTouchedCircle 绘制触碰到的圆]
 * @param  {[int]} i [触碰到的圆序号]
 */
SignLock.prototype.drawTouchedCircle = function(i){
    //获取canvas上下文
    var ctx = this.ctx;
    var circleCenterArr = this.circleCenterArr;

    ctx.fillStyle = "orange";
    ctx.beginPath();

    //绘制圆与边框
    ctx.arc(circleCenterArr[i - 1][0], circleCenterArr[i - 1][1], this.r, 0, Math.PI * 2, true);

    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff7000";
    ctx.stroke();
    ctx.fill();
};
/**
 * [lineToTouchedCircle 连线至最新触碰到圆的圆心]
 * @param  {[int]} i [前一个触碰的圆序号]
 * @param  {[int]} j [当前触碰的圆序号]
 */
SignLock.prototype.lineToTouchedCircle = function(i, j){
    //获取canvas上下文
    var ctx = this.ctx;
    var circleCenterArr = this.circleCenterArr;
    //连线
    ctx.beginPath();
    ctx.moveTo(circleCenterArr[i - 1][0], circleCenterArr[i - 1][1]);
    ctx.lineTo(circleCenterArr[j - 1][0], circleCenterArr[j - 1][1]);
    ctx.strokeStyle = "red";
    ctx.stroke();
};
/**
 * [lineToTouchedPlace 连线最新的圆至手触碰的点]
 * @param  {[int]} x [落点横坐标]
 * @param  {[int]} y [落点纵坐标]
 * @notice [如果需要实现该功能的话，需要不断的刷新dom,
 * 否则无法实现预期效果。暂时未找到合适的不刷新dom的解决方案]
 */
SignLock.prototype.lineToTouchedPlace = function(x, y){
    //获取canvas上下文
    var ctx = this.ctx;
    var circleCenterArr = this.circleCenterArr;
    var len = circleCenterArr.length;

    ctx.beginPath();
    ctx.moveTo(circleCenterArr[len - 1][0], circleCenterArr[len - 1][1]);
    ctx.lineTo(x, y);

    ctx.strokeStyle = "red";
    ctx.stroke();
};
/**
 * [isInCircle 判断坐标是否在几号圆内]
 * @param  {[int]}  x [落点横坐标]
 * @param  {[int]}  y [落点纵坐标]
 * @return {Boolean}   [0:未落入圆内     i: 落入了序号为i的圆]
 */
SignLock.prototype.isInCircle = function(x, y){
    //获取圆心参数
    var circleCenterArr = this.circleCenterArr;
    var len = circleCenterArr.length;
    for (var i = 0; i < len; i++) {
        //判断落点坐标到圆心距离与圆半径的大小
        if((Math.sqrt(Math.pow(x - circleCenterArr[i][0],2) + Math.pow(y - circleCenterArr[i][1], 2)) <= this.r)){
            return i + 1;
        }
    }
    return 0;
};
/**
 * [checkPassword 判断密码是否正确]
 * @param  {[array]} pwd [需要验证的密码]
 * @return {[object]}     [形如{status: 4, message: ""}
 * status:0表示密码正确, status: 4表示密码不正确]
 */
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
/**
 * [validPassword 判断密码设置是否符合规范]
 * @param  {[array]} pwd    [新绘制的密码]
 * @param  {[array]} oldPwd [前一次绘制的有效密码]
 * @return {[object]}        [形如{status: 4, message: ""}
 * status:0表示密码设置成功; status: 1表示密码太短;
 * status: 2表示输完第一次密码; status: 3表示两次输入不一致]
 */
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
/**
 * [bindEvent 绑定事件处理程序，主要有手势事件，以及radio的点击事件]
 */
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
/**
 * [drawMessage 展示提示信息]
 * @param  {[object]} result [形如{status: 4, message: ""}
 * status:0表示密码设置成功/密码正确; status: 1表示密码太短;
 * status: 2表示输完第一次密码; status: 3表示两次输入不一致
 * message 为相应提示信息]
 */
SignLock.prototype.drawMessage = function(result){
    self = this;
    //根据返回码显示提示信息并处理数据
    switch (result.status){
        case 0://密码设置成功或者验证成功
            this.resetData();
            break;
        case 1://密码太短
            break;
        case 2://请再次输入手势密码
            this.oldPassword = this.touchedCircleArr;
            break;
        case 3://两次密码不一致
        case 4://密码不正确
            //重置界面和数据
            this.resetData();
            setTimeout(function(){
                self.resetPic();
                var p = document.getElementById("message");
                p.innerHTML = "请输入手势密码";
            },500);
            break;
    }
    var p = document.getElementById("message");
    p.innerHTML = result.message;
}
/**
 * [resetData 重置绘制的数据信息]
 */
SignLock.prototype.resetData = function(){
    this.oldPassword = [];
}
/**
 * [resetPic 重置画面]
 */
SignLock.prototype.resetPic = function(){
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    this.drawCircle();
    this.touchedCircleArr = [];
}
})();