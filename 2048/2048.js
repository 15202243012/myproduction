var game={
	data:[],//二维数组
	RN:4,//保持总行数
	CN:4,//保持总列数
	score:0,//保存游戏的分数
	top1:0,//保存游戏的历史最高分
	state:1,//保存游戏当前状态，值为1时表示游戏正在运行，为0时表示游戏结束
	//动画
	totalTime:100,//总时间
	totalStep:10,//总步数
	interval:0,//移动一步所需时间
	oneStep:0,//移动过的步数
	distance:116,//移动一格所需距离
	timer:null,//保存计时器编码
	mygrids:[],//保存所有要移动的格子
	start:function(){//开始游戏
		var _this=this;
		_this.state=1;//初始化游戏状态为运行
		_this.top1=_this.getTopScore();//保存历史最高分
		_this.createGrid();//创建格子
		document.getElementById("gameOver").style.display="none";//隐藏结束提示
		//初始化二维数组
		for(var r=0;r<this.RN;r++){//创建每列
			this.data[r]=[];
			for(var c=0;c<this.CN;c++){//创建每行
				this.data[r][c]=0;
			}
		}
		this.score=0;//重置分数
		_this.randomNum();//在2048框架中生成两个初始数字
		_this.randomNum();
		_this.updateView();
		document.onkeydown=function(){
			if(_this.state==1){
				var e=window.event||arguments[0];
				switch(e.keyCode){
					case 37:_this.moveLeft();_this.animationStart();break;//绑定左方向键
					case 38:_this.moveTop();_this.animationStart();break;//绑定上方向键
					case 39:_this.moveRight();_this.animationStart();break;//绑定右方向键
					case 40:_this.moveBottom();_this.animationStart();break;//绑定下方向键
				}
			}
		}
	},
	moveLeft:function(){//左移
		var now=String(this.data);//保存移动前的二位数组
		for(var r=0;r<this.RN;r++){//左移所有行
			this.moveLeftInRow(r);//左移一行
		}
		var end=String(this.data);//保存移动后的二位数组
		if(now!=end){
			this.randomNum();//生成随机数
			if(this.isGameOver()){this.state=0}//判断游戏是否结束
			//this.updateView();//更新页面
		}
	},
	moveRight:function(){//右移
		var now=this.data.join('');
		for(var r=0;r<this.RN;r++){//右移所有行
			this.moveRightInRow(r);
		}
		var end=this.data.join('');
		if(now!=end){
			this.randomNum();
			if(this.isGameOver()){this.state=0}
			//this.updateView();
		}
	},
	moveTop:function(){//上移
		var now=this.data.join('');
		for(var c=0;c<this.CN;c++){//上移所有行
			this.moveTopInRow(c);
		}
		var end=this.data.join('');
		if(now!=end){
			this.randomNum();
			if(this.isGameOver()){this.state=0}
			//this.updateView();
		}
	},
	moveBottom:function(){//下移
		var now=this.data.join('');
		for(var c=0;c<this.CN;c++){//下移所有行
			this.moveBottomInRow(c);
		}
		var end=this.data.join('');
		if(now!=end){
			this.randomNum();
			if(this.isGameOver()){this.state=0}
			//this.updateView();
		}
	},
	moveLeftInRow:function(r){//左移所有行的方法
		var nextc=0;//
		for(var c=0;c<this.CN;c++){
			if(this.data[r][c]!=0&&this.data[r][nextc]==0){//遍历到该行一个数为零，且搜到其后第一个不为零的数
				this.data[r][nextc]=this.data[r][c];//领零等于第一个不为零的数
				this.mySetInterval(document.getElementById('t'+r+c),r-r,nextc-c);
				this.data[r][c]=0;//不为零的数初始化为零
			}else if(this.data[r][c]!=0&&this.data[r][nextc]!=0){//遍历到一个不为零的数，且其后有一个不为零的数
				if(this.data[r][c]==this.data[r][nextc]&&c!=nextc){//如果这两个数相等
					this.data[r][nextc]*=2;//靠前的数乘以二
					this.score+=this.data[r][nextc];
					this.mySetInterval(document.getElementById('t'+r+c),r-r,nextc-c);
					this.data[r][c]=0;//靠后的数归零
					nextc++;//坐标后移一位
				}else if(this.data[r][c]!=this.data[r][nextc]){//如果这两个数不相等
					c--;
					nextc++;//坐标后移一位
				}
			}
		}
	},
	moveRightInRow:function(r){//右移所有行的方法
		var nextc=this.CN-1;
		for(var c=this.CN-1;c>=0;c--){
			if(this.data[r][c]!=0&&this.data[r][nextc]==0){//遍历到该行一个数为零，且搜到其前第一个不为零的数
				this.data[r][nextc]=this.data[r][c];//领零等于第一个不为零的数
				this.mySetInterval(document.getElementById('t'+r+c),r-r,nextc-c);
				this.data[r][c]=0;//领不为零的数初始化为零
			}else if(this.data[r][c]!=0&&this.data[r][nextc]!=0){//遍历到一个不为零的数，且其前有一个不为零的数
				if(this.data[r][c]==this.data[r][nextc]&&c!=nextc){//如果这两个数相等
					this.data[r][nextc]*=2;//靠后的数乘以二
					this.score+=this.data[r][nextc];
					this.mySetInterval(document.getElementById('t'+r+c),r-r,nextc-c);
					this.data[r][c]=0;//靠后的数归零
					nextc--;//坐标前移一位
				}else if(this.data[r][c]!=this.data[r][nextc]){//如果这两个数不相等
					c++;
					nextc--;//坐标前移一位
				}
			}
		}
	},
	moveTopInRow:function(c){//上移所有行的方法
		var nextr=0;
		for(var r=0;r<this.RN;r++){
			if(this.data[r][c]!=0&&this.data[nextr][c]==0){//遍历到该行一个数为零，且搜到其后第一个不为零的数
				this.data[nextr][c]=this.data[r][c];//领零等于第一个不为零的数
				this.mySetInterval(document.getElementById('t'+r+c),nextr-r,c-c);
				this.data[r][c]=0;//领不为零的数初始化为零
			}else if(this.data[r][c]!=0&&this.data[nextr][c]!=0){//遍历到一个不为零的数，且其后有一个不为零的数
				if(this.data[r][c]==this.data[nextr][c]&&r!=nextr){//如果这两个数相等
					this.data[nextr][c]*=2;//靠前的数乘以二
					this.score+=this.data[nextr][c];
					this.mySetInterval(document.getElementById('t'+r+c),nextr-r,c-c);
					this.data[r][c]=0;//靠后的数归零
					nextr++;//坐标后移一位
				}else if(this.data[r][c]!=this.data[nextr][c]){//如果这两个数不相等
					r--;
					nextr++;//坐标后移一位
				}
			}
		}
	},
	moveBottomInRow:function(c){//下移所有行的方法
		var nextr=this.RN-1;
		for(var r=this.RN-1;r>=0;r--){
			if(this.data[r][c]!=0&&this.data[nextr][c]==0){//遍历到该行一个数为零，且搜到其后第一个不为零的数
				this.data[nextr][c]=this.data[r][c];//领零等于第一个不为零的数
				this.mySetInterval(document.getElementById('t'+r+c),nextr-r,c-c);
				this.data[r][c]=0;//领不为零的数初始化为零
			}else if(this.data[r][c]!=0&&this.data[nextr][c]!=0){//遍历到一个不为零的数，且其后有一个不为零的数
				if(this.data[r][c]==this.data[nextr][c]&&r!=nextr){//如果这两个数相等
					this.data[nextr][c]*=2;//靠前的数乘以二
					this.score+=this.data[nextr][c];
					this.mySetInterval(document.getElementById('t'+r+c),nextr-r,c-c);
					this.data[r][c]=0;//靠后的数归零
					nextr--;//坐标后移一位
				}else if(this.data[r][c]!=this.data[nextr][c]){//如果这两个数不相等
					r++;
					nextr--;//坐标后移一位
				}
			}
		}
	},
	randomNum:function(){//在随机的空白位置生成2或者4
		for(;;){
			var r=Math.round(Math.random()*(this.RN-1));//随机列
			var c=Math.round(Math.random()*(this.CN-1));//随机行
			if(this.data[r][c]==0){
				this.data[r][c]=(Math.random()<0.5)?2:4;//在格子里放一个初始数字
				break;
			}
		}
	},
	isGameOver:function(){//游戏结束
		for(var r=0;r<this.RN;r++){//二位数组
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0){//判断是否还有空位
					return false;
				}else if(c<this.CN-1&&this.data[r][c]==this.data[r][c+1]){//判断每行相邻的数是否重复
					return false;
				}else if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]){//判断每列相邻的数是否重复
					return false;
				}
			}
		}
		if(this.top1<this.score){this.saveTopScore();}//如果cookie中保存的值小于最终得分，就将最终得分设置
		return true;
	},
	createGrid:function(){//创建所有格
		var blis=[],tlis=[];
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				blis.push("<li id='b"+r+c+"' class='bottomGrid'></li>");//创建所有背景格
				tlis.push("<li id='t"+r+c+"' class='opGrid'></li>")//创建前景格
			}
		}
		var gridBox=document.getElementById("gridBox");
		gridBox.innerHTML=blis.join("")+tlis.join("");//将格子放入页面
		gridBox.style.width=(116*this.CN+16)+"px";//设置盒子的款
		gridBox.style.height=(116*this.RN+16)+"px";//设置盒子的高
	},
	saveTopScore:function(){//保存最高分
		var myDate=new Date();//获取当前时间
		myDate.setFullYear(myDate.getFullYear()+1);//设置时间延后一年
		document.cookie="topScore="+this.score+";expires="+myDate.toGMTString();//将最终得分存入cookie
	},
	getTopScore:function(){//取出最高分
		var cookies=document.cookie.split("; ");//将cookie中保存的值取出并按照分号空格分割
		for(var i=0;i<cookies.length;i++){
			var kv=cookies[i].split("=");//将cookies中的值按照等号分割
			cookies[kv[0]]=kv[1];//按照哈希数组的格式保存值
		}
		return cookies["topScore"]||0;
	},
	animationStart:function(){//移动动画
		this.interval=this.totalTime/this.totalStep;//移动一步所需要的时间
		this.timer=setInterval(this.animationMove.bind(this),this.interval);//开始动画
	},
	mySetInterval:function(grid,r,c){//获取移动一步的距离
		var rstep=r*this.distance/this.totalStep;//纵向每步移动的距离
		var cstep=c*this.distance/this.totalStep;//横向每步移动的距离
		this.mygrids.push({grid:grid,rstep:rstep,cstep:cstep});//存入数组
	},
	animationMove:function(){//移动所有格的动画
		this.oneStep++;//移动步数加一
		for(var i=0;i<this.mygrids.length;i++){
			var mygrid=this.mygrids[i].grid;//获取当前格
			var style=getComputedStyle(mygrid);//获取当前格样式
			var top=parseFloat(style.top);//获取当前格的top
			var left=parseFloat(style.left);//获取当前格的left
			mygrid.style.top=top+this.mygrids[i].rstep+"px";//使当前格纵向移动一步
			mygrid.style.left=left+this.mygrids[i].cstep+"px";//使当前格横向移动一步
		}
		if(this.oneStep==this.totalStep){//判断步数
			clearInterval(this.timer);//停止定时器
			for(var i=0;i<this.mygrids.length;i++){
				var mygrid=this.mygrids[i].grid;//获取移动过的格子
				mygrid.style.top="";//使格子纵向归位
				mygrid.style.left="";//使格子横向归位
			}
			this.timer=null;//初始化定时器编码
			this.oneStep=0;//初始化移动步数
			this.mygrids=[];//初始化移动格子
			this.updateView();//动画结束后更新页面
		}
	},
	updateView:function(){//将data中的值同步到页面
		for(var r=0;r<this.RN;r++){//遍历二位数组，把数组里随机生成的数字同步到页面对应位置
			for(var c=0;c<this.CN;c++){
				var grid=document.getElementById("t"+r+c);//找到对应的格子
				if(this.data[r][c]){//判断是否是随机生成的数字，是的话则开始同步
					grid.innerHTML=this.data[r][c];//在格子中放入随机生成的数字
					grid.className="topGrid n"+this.data[r][c];//给格子添加改数字对应的样式
				}else{
					grid.innerHTML="";//初始化格子
					grid.className="topGrid";//初始化格子样式
				}
			}
		}
		document.getElementById("score").innerHTML=this.score;//将当前分数显示在页面
		document.getElementById('top').innerHTML=this.top1;//将最高分显示到页面
		if(this.state==0){
			document.getElementById("gameOver").style.display="block";
			document.getElementById("final").innerHTML=this.score;
		}
	}
}
window.onload=function(){
	game.start();
}