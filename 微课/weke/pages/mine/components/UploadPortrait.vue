<template>
	<view class="circle">
		<uni-icons class="icon" type="plusempty" color="#c6c8cf"></uni-icons>
		<text>上传头像</text>
	</view>
</template>

<script setup lang="ts">
</script>

<style lang="scss">
.circle {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 160rpx;
	height: 160rpx;
	border-radius: $uni-border-radius-circle;
	background-color: $wk-bg-color-grey;
	font-size: $uni-font-size-base;
	color: $wk-text-color-grey;
	.icon {
		margin-top: 40rpx
	}
}
</style>