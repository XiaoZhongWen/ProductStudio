<template>
	<view class="login-option-container">
		<view class="wx" id="wx" @tap="onTap">
			<view class="container">
				<text style="color: #5073D6; font-size: 14px;">微信登录</text>
			</view>
			<view class="container">
				<text style="color: #c6c8cf; font-size: 12px;">如果您是管理员、老师、家长, 请通过微信授权登录</text>
			</view>
		</view>
		<view class="stu-num" id="stu-num" @tap="onTap">
			<view class="container">
				<text style="color: #5073D6; font-size: 14px;">学号登录</text>
			</view>
			<view class="container">
				<text style="color: #c6c8cf; font-size: 12px;">如果您是学生, 请通过学号登录</text>
			</view>
		</view>
		<view class="cancel" id="cancel" @tap="onTap">
			<view class="container">
				<text style="font-size: 14px;">取消</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	
const emit = defineEmits(['onLoginOption'])

const onTap = (e) => {
	const { id } = e.currentTarget
	emit('onLoginOption', {"from":id})
}	

</script>

<style lang="scss" scoped>
.login-option-container {
	position: relative;
	top: -5px;
	background-color: white;
	border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
	.wx, .stu-num, .cancel {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		height: 50px;
		border-bottom: 1px solid $uni-bg-color-grey;
		.container {
			display: flex;
			justify-content: center;
		}
	}
}
</style>