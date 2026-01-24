//bouncing ball
let canvas = document.querySelector(".myCanvas");
let ctx = canvas.getContext("2d");
canvas.height = 500;
canvas.width = window.innerWidth;
let height = canvas.height;
let width = canvas.width;

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function randomColor() {
  return (
    "rgb(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")"
  );
  // return("rgb(0,"+random(0,255)+","+random(0,255)+")");
  // return("rgb(0,0,"+random(0,255)+")");
  // return("rgb(0,"+random(230,255)+",0)");
}

//#class
function Ball(x, y, r, vx, vy, color) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vx = vx;
  this.vy = vy;
  this.c = color;
  this.s = false; //size changeing flag
  this.collision = true;
}
Ball.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = this.c;
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
  ctx.fill();
};
//move选择一、遇到边框自动反弹
Ball.prototype.moveToRebound = function () {
  let overlap = 0;
  overlap = this.r - this.x;
  if (overlap > 0) {
    this.x += overlap; //救球，超出屏幕后退回
    this.vx = -this.vx; //反弹
  }
  overlap = this.x + this.r - width;
  if (overlap > 0) {
    this.x -= overlap;
    this.vx = -this.vx;
  }
  overlap = this.r - this.y;
  if (overlap > 0) {
    this.y += overlap;
    this.vy = -this.vy;
  }
  overlap = this.y + this.r - height;
  if (overlap > 0) {
    this.y -= overlap;
    this.vy = -this.vy;
  }

  this.x += this.vx;
  this.y += this.vy;
  // //改变球的大小
  // if (this.s) {
  //   this.r += 0.2;
  // } else {
  //   this.r = Math.max(this.r - 0.2, 0.01); //最小半径是0.01
  // }
  // if (this.r >= 40) this.s = false;
  // if (this.r <= 30) this.s = true;
};
//move选择二、穿越边框循环
Ball.prototype.moveToTraverse = function () {
  this.x += this.vx;
  this.y += this.vy;
  if (this.x < 0 - this.r) {
    this.x = width + this.r;
    this.y = height - this.y;
  }
  if (this.x - width > this.r) {
    this.x = 0 - this.r;
    this.y = height - this.y;
  }
  if (this.y < 0 - this.r) {
    this.y = height + this.r;
    this.x = width - this.x;
  }
  if (this.y > height + this.r) {
    this.y = 0 - this.r;
    this.x = width - this.x;
  }
};
Ball.prototype.collide = function () {
  if (this.collision) {
    //鼠标控制球mouseBall碰撞检测
    if (
      (this.x - mouseBall.x) ** 2 + (this.y - mouseBall.y) ** 2 <
      (this.r + mouseBall.r) ** 2
    ) {
      // this.c = randomColor();
      this.reboundFixed(mouseBall);
    }
    balls.forEach((v) => {
      //数组球检测
      if (this != v) {
        if ((this.x - v.x) ** 2 + (this.y - v.y) ** 2 < (this.r + v.r) ** 2) {
          // this.c = randomColor();
          // this.vx = -this.vx;
          // this.vy = -this.vy;
          this.reboundMoving(v);
        }
      }
    });
  }
};
//模拟撞击固定球，运动球只改变速度方向，法向量方向速度相反，切向量速度不变
Ball.prototype.reboundFixed = function (fixed) {
  // 法线向量
  let nx = this.x - fixed.x;
  let ny = this.y - fixed.y;

  // 归一化，计算法线单位一向量
  let len = Math.sqrt(nx * nx + ny * ny);
  nx /= len;
  ny /= len;

  // 点积，计算速度在法线方向的分量
  let dot = this.vx * nx + this.vy * ny;
  //计算重合距离，如果重合将球向外移动一个重合距离，nx是法线单位向量在x的分量
  let overlap = this.r + fixed.r - len;
  if (overlap > 0) {
    this.x += nx * overlap;
    this.y += ny * overlap;
  }
  if (dot >= 0) return; //法线从固定球开始，dot大说明同方向，说明运动球远离固定球

  // 减去速度在法线方向的分量在xy方向上的分量
  this.vx = this.vx - 2 * dot * nx;
  this.vy = this.vy - 2 * dot * ny;

  if (balls.indexOf(this) == 0) {
    this.r = Math.max(this.r - 1, 0);
  } else {
    this.r += 5;
  }
};
//模拟两个运动球的完全弹性碰撞，法向量方向根据质量分配速度，切向量方向不变
Ball.prototype.reboundMoving = function (moving) {
  // 1计算两球中心距离向量
  let dx = this.x - moving.x; // x方向距离
  let dy = this.y - moving.y; // y方向距离
  let dist = Math.hypot(dx, dy); // 两球中心距离
  if (dist === 0) return; // 防止重合导致除零

  // 2计算单位法向向量（指向 this -> moving）
  let nx = dx / dist; // 法向 x 分量
  let ny = dy / dist; // 法向 y 分量

  // 3计算切向单位向量（垂直于法向）
  let tx = -ny; // 切向 x 分量
  let ty = nx; // 切向 y 分量

  // 4将速度分解到法向和切向
  let v1n = this.vx * nx + this.vy * ny; // 当前球法向速度
  let v1t = this.vx * tx + this.vy * ty; // 当前球切向速度
  let v2n = moving.vx * nx + moving.vy * ny; // 另一球法向速度
  let v2t = moving.vx * tx + moving.vy * ty; // 另一球切向速度

  // 5定义质量（用半径平方近似面积作为质量）
  let m1 = this.r ** 2;
  let m2 = moving.r ** 2;

  // 6计算碰撞后的法向速度（一维完全弹性碰撞公式，考虑质量比）
  let v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
  let v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

  //除第一个以外的球变小
  if (balls.indexOf(moving) == 0) {
    // this.vx = 0;
    // this.vy = 0;
    this.r = Math.max(this.r - 5, 0);
    // this.r -= 5;
  }
  if (balls.indexOf(this) == 0) {
    // moving.vx = 0;
    // moving.vy = 0;
    moving.r = Math.max(moving.r - 5, 0);
    // moving.r -= 5;
  }

  // 7合成新的速度（切向速度保持不变）
  this.vx = v1nAfter * nx + v1t * tx;
  this.vy = v1nAfter * ny + v1t * ty;
  moving.vx = v2nAfter * nx + v2t * tx;
  moving.vy = v2nAfter * ny + v2t * ty;

  // 8修正重叠位置
  let overlap = this.r + moving.r - dist; // 重叠距离
  if (overlap > 0) {
    // 按质量比例移动两球
    this.x += nx * ((overlap * m2) / (m1 + m2));
    this.y += ny * ((overlap * m2) / (m1 + m2));
    moving.x -= nx * ((overlap * m1) / (m1 + m2));
    moving.y -= ny * ((overlap * m1) / (m1 + m2));
  }
};

//#初始化球数组
var v = 10;
// var ball=new Ball(300,300,40,random(-v,v),random(-v,v),"lightblue");
// var ball = new Ball(300, 300, 40, random(-v, v), random(-v, v), "lightblue");
var balls = Array(1)
  .fill()
  .map(
    () =>
      new Ball(
        random(40, 400),
        random(40, 400),
        random(60, 80),
        random(-v, v),
        random(-v, v),
        randomColor(),
      ),
  );

balls[0].r = 100;

//#鼠标控制球
var mouseBall = new Ball(40, 40, 30, 10, 10, "white");
canvas.addEventListener("mouseover", (e) => {
  mouseBall.r = 30;
});
canvas.addEventListener("mouseout", (e) => {
  mouseBall.r = 0;
});
canvas.addEventListener("mousemove", (e) => {
  mouseBall.x = e.clientX;
  mouseBall.y = e.clientY;
});

//#动画部分
function loop(timestamp) {
  // ctx.clearRect(0,0,width,height);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(0, 0, width, height); //直接覆盖原来的画布，并通过半透明产生重影效果
  mouseBall.draw();
  balls.forEach((v, i) => {
    balls[i].moveToTraverse();
    balls[i].collide();
    balls[i].draw();
  });

  //数组首球触碰会减小球，固定球触碰会增加球，减小首球
  //首球消失，游戏结束，输出剩余球的数量
  //只剩首球，游戏失败

  window.requestAnimationFrame(loop);

  let threshhold = 5;
  let count = balls.filter((v, i) => v.r > threshhold).length;

  // if (balls[0].r > threshhold) {
  //   if (count == 1) {
  //     alert("all available balls lost!");
  //     window.location.reload();
  //   } else {
  //     //当半径没有到最小，继续运行
  //     window.requestAnimationFrame(loop);
  //     console.log("Balls bouncing. Count: ", count);
  //   }
  // } else {
  //   alert("congratulations! remaining balls: " + count);
  //   window.location.reload();
  // }

  // if (Math.max(...balls.map((v) => v.r)) > 0.01) {
  //   //当半径没有到最小，继续运行
  //   window.requestAnimationFrame(loop);
  //   console.log("Balls bouncing");
  // }
  //  //cancelAnimationFrame 主要用于 取消已排队但还没执行的帧，而这里的动画是动态循环的，每次新帧都是在前一帧执行时才请求的，所以不需要取消。
  // else {
  //   window.cancelAnimationFrame(id);
  // }
}
window.requestAnimationFrame(loop);
