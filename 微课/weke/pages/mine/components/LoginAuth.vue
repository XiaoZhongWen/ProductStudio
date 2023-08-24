<template>
	<view class="container">
		<view class="top">
			<uni-icons 
				class="close" 
				type="closeempty" 
				size="22"
				color="#c6c8cf"
				@tap="onClose">
			</uni-icons>
			<text class="title">请登录授权头像昵称</text>
			<text class="subTitle">相关操作涉及用户信息</text>
		</view>
		<view class="body">
			<UploadPortrait class="portrait"></UploadPortrait>
		</view>
	</view>
</template>

<script setup lang="ts">
import UploadPortrait from './UploadPortrait.vue'
const emit = defineEmits(['onPopup'])
const onClose = () => {
	emit('onPopup')
}
	
</script>

<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 1000rpx;
	.top {
		position: relative;
		top: -8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 120rpx;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0px 0px;
		background-color: $wk-bg-color-grey;
		.title {
			font-size: $uni-font-size-lg;
			color: $wk-text-color;
			margin-top: $uni-spacing-col-base;
		}
		.subTitle {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
		.close {
			position: fixed;
			left: $uni-spacing-row-base;
			top: $uni-spacing-col-sm;
		}
	}
	.body {
		flex: 1;
		background-color: white;
		display:flex;
		flex-direction: column;
		align-items: center;
		.portrait {
			margin-top: 60rpx;
		}
	}
}
</style>