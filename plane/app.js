/**游戏的全局配置**/
var WIDTH = 480;    //手机中应该是屏幕的宽
var HEIGHT = 650;   //手机中应该是屏幕的高

var bulletSpeed = 10;  //我方子弹的移动速度
var bulletRate = 5; //每62*5ms发射一次子弹，此参数最极限值为1
var enemy1Speed = 6;  //第一种敌机每62ms移动的距离
var enemy2Speed = 4;  //第二种敌机每62ms移动的距离
var enemy3Speed = 2;  //第三种敌机每62ms移动的距离
var difficulty = 150; //游戏难度，取值范围10~500之间，数值越大，生成的敌机数量就越少
var heroLife = 3;     //英雄的默认命数

var canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
var ctx = canvas.getContext('2d');

//游戏进行的五个阶段
const PHASE_READY = 1;    //就绪阶段
const PHASE_LOADING = 2;  //加载游戏阶段
const PHASE_PLAY = 3;     //游戏运行阶段
const PHASE_PAUSE = 4;    //暂停阶段
const PHASE_GAMEOVER = 5; //游戏结束阶段
var curPhase = 0;   //当前所处的阶段


/**begin: 游戏的第一个阶段——就绪阶段**/
var bgImg = new Image();
bgImg.src = "img/background.png";
var logo = new Image();
logo.src = "img/start.png";

var sky = null;
bgImg.onload = function(){
  curPhase = PHASE_READY;  //图片加载完成，进入就绪阶段
  sky = new Sky(this);
}
function Sky(bgImg){  //包含两张背景图片的天空
  this.x1 = 0;  //第一张背景图的X
  this.y1 = 0;  //第一张背景图的Y
  this.x2 = 0;  //第二张背景图的X
  this.y2 = -bgImg.height;  //第二张背景图的Y
  
  this.draw = function(){ //绘制天空对象一次
    ctx.drawImage(bgImg, this.x1, this.y1);//画第一张背景图
    ctx.drawImage(bgImg, this.x2, this.y2);//画第二张背景图
  }
  this.move = function(){  //天空对象移动一次
    this.y1++;  //this.y1+=3;
    this.y2++;  //this.y2+=3;
    if(this.y1 >= HEIGHT){ //若移动到画布底部，则绘制到顶部
      this.y1 = this.y2 - bgImg.height;
    }
    if(this.y2 >= HEIGHT){ //若移动到画布底部，则绘制到顶部
      this.y2 = this.y1 - bgImg.height;
    }
  }
}
/**end: 游戏的第一个阶段——就绪阶段**/


/**begin: 游戏的第二个阶段——加载阶段**/
var loadingImgs = [];
loadingImgs[0] = new Image();
loadingImgs[0].src = 'img/game_loading1.png';
loadingImgs[1] = new Image();
loadingImgs[1].src = 'img/game_loading2.png';
loadingImgs[2] = new Image();
loadingImgs[2].src = 'img/game_loading3.png';
loadingImgs[3] = new Image();
loadingImgs[3].src = 'img/game_loading4.png';
function Loading(imgs){
  this.index = 0; //当前需要绘制的图片的下标
  this.moveCount = 0; //move函数被调用的次数
  this.draw = function(){ //绘制一次
    ctx.drawImage(imgs[this.index], 0, HEIGHT-imgs[this.index].height);
  }
  this.move = function(){ //移动一次
    this.moveCount++;
    if(this.moveCount%3==0){
      this.index++;
      if(this.index>=imgs.length){
        curPhase = PHASE_PLAY; //所有的图片播放完成，进入游戏状态
      }
    }
  }
}
var loading = new Loading(loadingImgs);
canvas.onclick = function(){ //画布被单击，则进入loading状态
  if(curPhase === PHASE_READY){
    curPhase = PHASE_LOADING;  //1->2
  }
}
/**end: 游戏的第二个阶段——加载阶段**/



/**begin: 游戏的第三个阶段——游戏运行阶段**/
//3.1 绘制英雄
var heroImgs = [];
heroImgs[0] = new Image();
heroImgs[0].src = 'img/hero1.png';
heroImgs[1] = new Image();
heroImgs[1].src = 'img/hero2.png';
heroImgs[2] = new Image();
heroImgs[2].src = 'img/hero_blowup_n1.png';
heroImgs[3] = new Image();
heroImgs[3].src = 'img/hero_blowup_n2.png';
heroImgs[4] = new Image();
heroImgs[4].src = 'img/hero_blowup_n3.png';
heroImgs[5] = new Image();
heroImgs[5].src = 'img/hero_blowup_n4.png';
function Hero(imgs){
  this.crashed = false;   //标识是否开始进入坠毁程序
  this.canDelete = false; //标识当前英雄是否可以从画布上删除
  this.index = 0; //待绘制的图片的下标
  this.width = 99;
  this.height = 124;
  this.x = (WIDTH-this.width)/2;  //为大家所不齿
  this.y = HEIGHT-this.height;    //为大家所不齿

  this.draw = function(){
    if(!this.canDelete){  //英雄不能被移除，才需要继续绘制
      ctx.drawImage(imgs[this.index],this.x,this.y);
    }
  }
  this.moveCount = 0;
  this.move = function(){
    //this.index++;
    if(this.index===0){
      this.index = 1;
    }else if(this.index===1){
      this.index = 0;
    }
    //发射子弹
    this.moveCount++;
    if(this.moveCount>=bulletRate){
      this.fire();
      this.moveCount=0; //0/1/2/3/4/5/0/1/2/..
    }
    //判断是否已被撞击
    if(this.crashed){
      if(this.index===0 || this.index===1){
        this.index = 2; //刚开始撞毁程序
      }else if(this.index>=imgs.length-1){
        this.canDelete = true; //撞毁程序结束，可以删除英雄了
        
        heroLife--; //英雄剩余命数-1
        if(heroLife<=0){ //已经没命了，则游戏结束
          curPhase = PHASE_GAMEOVER;
        }else {  //剩余还有命数
          hero = new Hero(heroImgs);
        }
      }else {
        this.index++;
      }
    }
  }
  this.fire = function(){
    bulletList.list.push(
      new Bullet(bulletImg)
    );
  }
}
var hero = new Hero(heroImgs);
canvas.onmousemove = function(event){
  if(curPhase === PHASE_PLAY){
    var x = event.offsetX; //以画布的左上角为参考点
    var y = event.offsetY;
    hero.x = x-heroImgs[hero.index].width/2;
    hero.y = y-heroImgs[hero.index].height/2;
  }
}
//3.2绘制子弹
var bulletImg = new Image();
bulletImg.src = 'img/bullet.png';
function Bullet(img){
  this.crashed = false;  //是否处于坠毁状态 若为true，则canDelete可以置为true
  this.width = 9;
  this.height = 21;
  this.x = hero.x + (hero.width-this.width)/2;
  this.y = hero.y - this.height;
  this.canDelete = false; //子弹是否可以被移除了
  this.draw = function(){
    ctx.drawImage(img, this.x, this.y);
  }
  this.move = function(){
    this.y -= bulletSpeed;
    if(this.y < -this.height || this.crashed){
      this.canDelete = true; //子弹飞出画布或者撞毁了，可以被移除了
    }
  }
}
function BulletList(){
  this.list = [];  //保存屏幕路中所有的子弹
  this.draw = function(){ //绘制每一个子弹
    for(var i=0; i<this.list.length; i++){
      this.list[i].draw();
    }
  }
  this.move = function(){
    for(var i=0; i<this.list.length; i++){
      this.list[i].move();
      if(this.list[i].canDelete){ //判定子弹是否可以移除了
        this.list.splice(i, 1); 
        i--;  //删除当前子弹后，下一个子弹的下标为当前i
      }
    }
  }
}
var bulletList = new BulletList();

//3.3绘制敌机
var enemy1Imgs = [];
enemy1Imgs[0] = new Image();
enemy1Imgs[0].src = "img/enemy1.png";
enemy1Imgs[1] = new Image();
enemy1Imgs[1].src = "img/enemy1_down1.png";
enemy1Imgs[2] = new Image();
enemy1Imgs[2].src = "img/enemy1_down2.png";
enemy1Imgs[3] = new Image();
enemy1Imgs[3].src = "img/enemy1_down3.png";
enemy1Imgs[4] = new Image();
enemy1Imgs[4].src = "img/enemy1_down4.png";

var enemy2Imgs = [];
enemy2Imgs[0] = new Image();
enemy2Imgs[0].src = "img/enemy2.png";
enemy2Imgs[1] = new Image();
enemy2Imgs[1].src = "img/enemy2_down1.png";
enemy2Imgs[2] = new Image();
enemy2Imgs[2].src = "img/enemy2_down2.png";
enemy2Imgs[3] = new Image();
enemy2Imgs[3].src = "img/enemy2_down3.png";
enemy2Imgs[4] = new Image();
enemy2Imgs[4].src = "img/enemy2_down4.png";

var enemy3Imgs = [];
enemy3Imgs[0] = new Image();
enemy3Imgs[0].src = "img/enemy3_n1.png";
enemy3Imgs[1] = new Image();
enemy3Imgs[1].src = "img/enemy3_n2.png";
enemy3Imgs[2] = new Image();
enemy3Imgs[2].src = "img/enemy3_down1.png";
enemy3Imgs[3] = new Image();
enemy3Imgs[3].src = "img/enemy3_down2.png";
enemy3Imgs[4] = new Image();
enemy3Imgs[4].src = "img/enemy3_down3.png";
enemy3Imgs[5] = new Image();
enemy3Imgs[5].src = "img/enemy3_down4.png";
enemy3Imgs[6] = new Image();
enemy3Imgs[6].src = "img/enemy3_down5.png";
enemy3Imgs[7] = new Image();
enemy3Imgs[7].src = "img/enemy3_down6.png";

function Enemy1(imgs){
  this.life = 1;         //1条命，被撞击一次即坠毁
  this.crashed = false;  //是否开始坠毁
  this.index = 0
  this.width = 57;
  this.height = 51;
  this.x = Math.random()*(WIDTH-this.width);
  this.y = -this.height;
  this.canDelete = false; //是否可以从画布上删除了
  this.draw = function(){
    ctx.drawImage(imgs[this.index],this.x,this.y);
  }
  this.move = function(){
    this.y += enemy1Speed;
    if(this.y >= HEIGHT){
      this.canDelete = true;
    }
    if(this.crashed){  //进入坠毁程序
      if(this.index===0){ //开始坠毁
        this.index = 1;
      }else if(this.index>=imgs.length-1){ //坠毁结束，可以删除该对象
        this.canDelete = true;
      }else {  //坠毁程序进行当中
        this.index++;
      }
    }
  }
  //碰撞检验
  this.hit = function(target){ //target表撞击目标，如我方子弹、我方飞机
    if((this.x+this.width>=target.x)
      &&
      (target.x+target.width>=this.x)
      &&
      (this.y+this.height>=target.y)
      &&
      (target.y+target.height>=this.y)){ //碰撞成功
        target.crashed = true; //我方的子弹/飞机进入坠毁状态
        this.life--;
        if(this.life<=0){  //剩余命数为0
          this.crashed = true;  //开始坠毁
        }
    }  
  }
}
function Enemy2(imgs){
  this.life = 5;         //5条命，被撞击五次即坠毁
  this.crashed = false;  //是否开始坠毁
  this.index = 0
  this.width = 69;
  this.height = 95;
  this.x = Math.random()*(WIDTH-this.width);
  this.y = -this.height;
  this.canDelete = false; //是否可以从画布上删除了
  this.draw = function(){
    ctx.drawImage(imgs[this.index],this.x,this.y);
  }
  this.move = function(){
    this.y += enemy2Speed;
    if(this.y >= HEIGHT){
      this.canDelete = true;
    }
    if(this.crashed){  //进入坠毁程序
      if(this.index===0){ //开始坠毁
        this.index = 1;
      }else if(this.index>=imgs.length-1){ //坠毁结束，可以删除该对象
        this.canDelete = true;
      }else {  //坠毁程序进行当中
        this.index++;
      }
    }
  }
  //碰撞检验
  this.hit = function(target){ //target表撞击目标，如我方子弹、我方飞机
    if((this.x+this.width>=target.x)
      &&
      (target.x+target.width>=this.x)
      &&
      (this.y+this.height>=target.y)
      &&
      (target.y+target.height>=this.y)){ //碰撞成功
        target.crashed = true; //我方的子弹/飞机进入坠毁状态
        this.life--;
        if(this.life<=0){  //剩余命数为0
          this.crashed = true;  //开始坠毁
        }
    }  
  }
}
function Enemy3(imgs){
  this.life = 15;        //15条命，被撞击十五次即坠毁
  this.crashed = false;  //是否开始坠毁
  this.index = 0
  this.width = 169;
  this.height = 258;
  this.x = Math.random()*(WIDTH-this.width);
  this.y = -this.height;
  this.canDelete = false; //是否可以从画布上删除了
  this.draw = function(){
    ctx.drawImage(imgs[this.index],this.x,this.y);
  }
  this.move = function(){
    //this.index = this.index===0?1:0;
    if(this.index===0){
      this.index = 1;
    }else if(this.index===1){
      this.index = 0;
    }
    this.y += enemy3Speed;
    if(this.y >= HEIGHT){
      this.canDelete = true;
    }
    if(this.crashed){  //进入坠毁程序
      if(this.index===0 || this.index===1){ //开始坠毁
        this.index = 2;
      }else if(this.index>=imgs.length-1){ //坠毁结束，可以删除该对象
        this.canDelete = true;
      }else {  //坠毁程序进行当中
        this.index++;
      }
    }
  }
  //碰撞检验
  this.hit = function(target){ //target表撞击目标，如我方子弹、我方飞机
    if((this.x+this.width>=target.x)
      &&
      (target.x+target.width>=this.x)
      &&
      (this.y+this.height>=target.y)
      &&
      (target.y+target.height>=this.y)){ //碰撞成功
        target.crashed = true; //我方的子弹/飞机进入坠毁状态
        this.life--;
        if(this.life<=0){  //剩余命数为0
          this.crashed = true;  //开始坠毁
        }
    }  
  }
}
function EnemyList(){   //敌机列表
  this.list = []; //保存所有的敌机
  this.draw = function(){
    this.generate();//试着生成一个新的敌机
    for(var i=0; i<this.list.length; i++){
      this.list[i].draw();
    }
  }
  this.move = function(){
    for(var i=0; i<this.list.length; i++){
      this.list[i].move(); //敌机移动
      ///////////////////////////////
      //敌机与我方子弹列表的碰撞检验
      for(var j=0; j<bulletList.list.length; j++){
        var b = bulletList.list[j];//我方的子弹
        this.list[i].hit(b); //碰撞检验
      }
      //敌机与我方英雄碰撞检验
      this.list[i].hit(hero);
      ////////////////////////////////

      if(this.list[i].canDelete){ //当前敌机可被清除
        this.list.splice(i,1);
        i--;
      }
    }
  }
  this.generate = function(){ //生成一个新的敌机
    //敌机生成原则：随机生成，有时多些，有时少些
    //小号敌机最多，大号敌机最少
    //num:1  ->  大号敌机
    //num:2/3/4  ->  中号敌机
    //num:5/6/7/8/9/10  -> 小号敌机
    var num = Math.floor(Math.random()*difficulty); //100是敌机出现的频率/可能性
    if(num===1){
      enemyList.list.push(
        new Enemy3(enemy3Imgs)
      );
    }else if(num<=4){
      enemyList.list.push(
        new Enemy2(enemy2Imgs)
      );
    }else if(num<=10){
      enemyList.list.push(
        new Enemy1(enemy1Imgs)
      );
    }
  }
}
var enemyList = new EnemyList();

//3.4子弹碰撞敌机   
//3.4.1为每种敌机添加属性life，标明可以被击中几次
//3.4.2为每种敌机添加属性crashed，标明是否开始坠毁
//3.4.3为每种敌机添加碰撞方法hit，碰撞成功一次即减少一命；若剩余命数为零，则开始坠毁
//3.4.4修改每种敌机的move方法，若crashed为true，则开始轮换敌机坠毁图片
//3.4.5修改EnenyList中的move方法，每个敌机移动时，都要进行一次碰撞检验

//3.5英雄碰撞敌机
//3.5.1为英雄对象添加属性crashed(false)，标明英雄是否开始进入坠毁程序
//3.5.2为英雄添加坠毁程序需要的图片，修改move方法
//3.5.3修改英雄的draw方法，只有“不能移除”时才绘制
//3.5.4修改EnemyList.move方法，只要敌机移动，检验是否与英雄撞击
//3.5.5添加英雄剩余命数全局变量heroLife，指定每个英雄有几条命；每次撞击，命数-1，重新出现在画布下方...直到GAMEOVER
//3.5.6在画布右上角添加剩余命数的显示
function drawHeroLife(){
  var txt = 'LIFE: '+heroLife;
  ctx.font = 'bold 22px "微软雅黑"';
  var w = ctx.measureText(txt).width;
  ctx.fillText(txt, WIDTH-w-15, 22+6);
}
/**end: 游戏的第三个阶段——游戏运行阶段**/


/**begin: 游戏的第四个阶段——游戏暂停阶段**/
canvas.onmouseout = function(){
  if(curPhase===PHASE_PLAY){ //游戏进行中，若鼠标移出画图，则暂停游戏
    curPhase = PHASE_PAUSE;
  }
}
canvas.onmouseover = function(){
  if(curPhase===PHASE_PAUSE){ //游戏暂停时，若鼠标移入画图，则继续游戏
    curPhase = PHASE_PLAY;
  }
}
var pauseImg = new Image();
pauseImg.src = 'img/game_pause_nor.png';
function drawPause(){
  ctx.drawImage(pauseImg, (WIDTH-pauseImg.width)/2, (HEIGHT-pauseImg.height)/2);
}
/**end: 游戏的第四个阶段——游戏暂停阶段**/


/**begin: 游戏的第五个阶段——游戏结束阶段**/
function drawGameOver(){
  var txt = 'GAME OVER';
  ctx.font = 'bold 60px "微软雅黑"';
  var w = ctx.measureText(txt).width;
  ctx.fillText(txt, (WIDTH-w)/2, HEIGHT/2+60/2);
}
/**end: 游戏的第五个阶段——游戏结束阶段**/



/**游戏的主定时器**/
var timer = setInterval(function(){
  sky.draw();  //绘制背景图，同时清空画布上的当前所有内容
  sky.move();
  switch(curPhase){
    case PHASE_READY:
      ctx.drawImage(logo, (WIDTH-logo.width)/2, (HEIGHT-logo.height)/2);
      break;
    case PHASE_LOADING:
      loading.draw();
      loading.move();
      break;
    case PHASE_PLAY:
      hero.draw();
      hero.move();
      bulletList.draw();
      bulletList.move();
      enemyList.draw();
      enemyList.move();
      drawHeroLife();  //在画布的最上方绘制剩余命数
      break;
    case PHASE_PAUSE:
      hero.draw();
      bulletList.draw();
      enemyList.draw();
      drawPause();
      drawHeroLife();  //在画布的最上方绘制剩余命数
      break;
    case PHASE_GAMEOVER:
      drawGameOver();
      drawHeroLife();  //在画布的最上方绘制剩余命数
      break;
  }
}, 62);  //每秒钟大约16帧