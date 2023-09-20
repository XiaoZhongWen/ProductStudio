<template>
  <view class="circular-container" :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }">
    <canvas class="circular-bg" :canvas-id="bgCanvasId" :id="bgCanvasId"
      :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }" v-if="isBgShow"></canvas>
    <canvas class="circular-progress" :canvas-id="canvasId" :id="canvasId"
      :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }"></canvas>
    <slot></slot>
  </view>
</template>
<script>
  export default {
    name: 'LCircularProgress',
    props: {
      // 宽度
      boxWidth: {
       	type: Number,
        default: 200
      },
      //高度
      boxHeight: {
        type: Number,
        default: 200
      },
      //进度条线条宽度
      lineWidth: {
        type: Number,
        default: 4
      },
      //是否显示背景进度条
      isBgShow: {
        type: Boolean,
        default: true
      },
      //背景进度条颜色
      bgColor: {
      	type: String,
      	default: '#CCCCCC'
      },
      // 进度条类型 circular圆形 halfCircular 半圆
      type:{
        type:String,
        default:'circular'
      },
      //进度百分比 
      percent: {
      	type: Number,
      	default: 0
      },
      //进度条颜色
      progressColor: {
      	type: String,
      	default: '#5677fc'
      },
      //进度条渐变颜色
      gradualColor: {
      	type: String,
      	default: ''
      },
      //是否显示进度文字
      fontShow: {
      	type: Boolean,
      	default: true
      },
      //进度字体大小
      fontSize: {
      	type: Number,
      	default: 12
      },
      //进度字体颜色
      fontColor: {
      	type: String,
      	default: '#5677fc'
      },
    },
    watch: {
    	percent(val) {
    		this.draw();
    	}
    },
    mounted() {
      this.draw(true)
    },
    data() {
      return {
        canvasId: 'canvasId',
        bgCanvasId: 'bgCanvasId',
        startPercent: 0,
        progressContext: null,
        linearGradient: null,
      }
    },
    methods:{
      draw(init) {
      	let start = this.startPercent;
      	start = start > this.percent ? 0 : start;
      	if (this.isBgShow && init) { //初始化需判断 防止后续手动增加再次绘制背景
      		this.drawBgCircular();
      	}
      	this.drawCircular(start);
      },
      //背景
      drawBgCircular() {
      	let ctx = uni.createCanvasContext(this.bgCanvasId, this);
      	let lineWidth = Number(this.lineWidth)
      	ctx.setLineWidth(lineWidth);
      	ctx.setStrokeStyle(this.bgColor);
      	//终止弧度
        let end = null,start = null
        if(this.type == 'circular'){
          start = -Math.PI / 2
          end = Math.PI - start;
        }else{
          start = -Math.PI
          end = 0;
        }
      	
      	this.drawArc(ctx,start,end);
      },
      //创建弧线
      drawArc(ctx,start,end) {
      	ctx.setLineCap('round');
      	ctx.beginPath();
      	let radius = this.boxWidth / 2;
      	let lineWidth = Number(this.lineWidth)
      	ctx.arc(radius, radius, radius - lineWidth, start, end, false);
      	ctx.stroke();
      	ctx.draw();
      },
      //进度圆环
      drawCircular(startPercent) {
      	let ctx = this.progressContext;
      	let gradient = this.linearGradient;
      	if (!ctx) {
      		ctx = uni.createCanvasContext(this.canvasId, this);
      		let boxWidth = Number(this.boxWidth)
      		gradient = ctx.createLinearGradient(0, 0, boxWidth, 0);
      		gradient.addColorStop('0', this.progressColor);
      		if (this.gradualColor) {
      			gradient.addColorStop('1', this.gradualColor);
      		}
      		this.progressContext = ctx;
      		this.linearGradient = gradient;
      	}
      	let lineWidth = Number(this.lineWidth)
      	ctx.setLineWidth(lineWidth);
      	ctx.setStrokeStyle(gradient);
      	let time = this.percent == 0 || this.duration < 50 ? 0 : this.duration / this.percent;
      	if (this.percent > 0) {
      		startPercent = this.duration < 50 ? this.percent - 1 : startPercent;
      		startPercent++;
      	}
      	if (this.fontShow) {
      		let fontSize = Number(this.fontSize)
      		ctx.setFontSize(fontSize);
      		ctx.setFillStyle(this.fontColor);
      		ctx.setTextAlign('center');
      		ctx.setTextBaseline('middle');
      		let percent = startPercent + '%';
      		let radius = this.boxWidth / 2;
      		ctx.fillText(percent, radius, radius);
      	}
      	if (this.percent == 0 ) {
      		ctx.draw();
      	} else {
          //终止弧度
          let end = null,start = null
          if(this.type == 'circular'){
            start = -Math.PI / 2
            end = ((2 * Math.PI) / 100) * startPercent + start;
          }else{
            start = -Math.PI
            end = (Math.PI / 100) * startPercent + start;
          }
      		let eAngle = ((2 * Math.PI) / 100) * startPercent + this.sAngle;
      		this.drawArc(ctx,start,end);
      	}
      	setTimeout(() => {
      		this.startPercent = startPercent;
      		if (startPercent >= this.percent) {
      			this.$emit('end', {
      				percent: startPercent + '%'
      			});
      		} else {
      			this.drawCircular(startPercent);
      		}
      	}, time);
      },
    }
  }
</script>
<style lang="scss" scoped>
  .circular-container {
    position: relative;

    .circular-progress {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 999;
    }
  }
</style>
