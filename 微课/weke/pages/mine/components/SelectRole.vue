<template>
	<view class="roleContainer">
		<view class="header">我是:</view>
		<view class="body">
			<label class="item">
				<radio class="radio" value="" checked="true" /><text>机构负责人</text>
			</label>
			<label class="item">
				<radio class="radio" value="" /><text>老师</text>
			</label>
			<label class="item">
				<radio class="radio" value="" /><text>学生</text>
			</label>
			<label class="item">
				<radio class="radio" value="" /><text>家长</text>
			</label>
		</view>
		<view class="bottom">
			<button class="btn" type="default" @tap="onConfirm">确定</button>
		</view>
	</view>
</template>

<script setup lang="ts">
const global = getApp().globalData!
const onConfirm = () => {
	uni.$emit(global.event_name.didSelectedRole)
}
</script>

<style lang="scss" scoped>
.roleContainer {
	width: 250px;
	height: 270px;
	background-color: $wk-bg-color-grey;
	border-radius: $uni-border-radius-lg;
	.header {
		width: 100%;
		height: 40px;
		background-color: white;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		color: $wk-theme-color;
	}
	.body {
		margin-top: $uni-spacing-col-base;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		background-color: white;
		.item {
			display: block;
			height: 40px;
			.radio {
				color: red !important;
			}
		}
	}
	.bottom {
		.btn {
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
		}
	}
}
</style>