<template>
	<view class="about-container">
		<view class="header">
			<view class="container">
				<image
					src="../../static/icon/app_icon.png" 
					mode="aspectFill" 
					style="width: 60px; height: 60px;">
				</image>
				<text style="margin-top: 10px;">版本信息：1.0</text>
			</view>
		</view>
		<view class="body">
			<uni-list>
				<uni-list-item link v-for="item in other" :key="item.name" @click="onClick(item.type)">
					<template v-slot:body>
						<view class="slot-box">
							<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
							<text class="slot-text">{{item.name}}</text>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</view>
	</view>
</template>

<script setup lang="ts">
const global = getApp().globalData!

const other:ListItem[] = [
	{
		type: "weixin",
		name: "微信公众号"
	},
	 {
	 	type: "person-filled",
	 	name: "服务协议"
	 },
	 {
	 	type: "locked-filled",
	 	name: "隐私政策"
	 }
]	

const onClick = (type:string) => {
	if (type === 'weixin') {
		
	} else if (type === 'person-filled') {
		uni.navigateTo({
			url: "/pages/webPage/webPage?targetUrl=" + global.domain + "agreement/user/index.html"
		})
	} else if (type === 'locked-filled') {
		uni.navigateTo({
			url: "/pages/webPage/webPage?targetUrl=" + global.domain + "agreement/privacy/index.html"
		})
	}
}

</script>

<style lang="scss">
.about-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		width: 100%;
		height: 200px;
		justify-content: center;
		align-items: center;
		.container {
			display: flex;
			flex-direction: column;
			align-items: center;
			font-size: $uni-font-size-sm;
			color: $uni-text-color-placeholder;
		}
	}
	.body {
		.uni-list {
			margin: 0 $uni-spacing-row-base;
			border-radius: $uni-border-radius-lg;
			background-color: white;
			.uni-list--border-top, .uni-list--border-bottom {
				height: 0px;
			}
			.uni-list-item {
				border-radius: $uni-border-radius-lg;
			}
		}
		.slot-box {
			flex-direction: row;
			align-items: center;
			.slot-text {
				margin-left: $uni-padding-normal;
				font-size: $uni-font-size-base;
				color: $wk-text-color;
				font-weight: 400;
			}
			.icon {
				width: 30px;
				height: 30px;
				border-radius: $uni-border-radius-circle;
				position: relative;
				top: 3px;
			}
		}
	}
}
</style>
