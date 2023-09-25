<template>
	<view class="login-container">
		<view class="top">
			<text>登录</text>
		</view>
		<view class="body">
			<view class="stuNo">
				<uni-icons class="icon" type="person-filled" color="#5073D6"></uni-icons>
				<input class="input" type="number" v-model="stuNo" placeholder="学号" />
			</view>
			<view class="pwd">
				<uni-icons class="icon" type="locked-filled" color="#5073D6"></uni-icons>
				<input class="input" password v-model="pwd" placeholder="密码" />
			</view>
		</view>
		<view class="bottom">
			<button class="btn" type="default" @tap="onLogin">
				<text class="text">登录</text>
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const stuNo = ref('')
const pwd = ref('')
const emit = defineEmits(['onStuNoLogin'])

const onLogin = () => {
	emit('onStuNoLogin', {
		"stuNo": stuNo.value,
		"pwd": pwd.value
	})
}	

</script>

<style lang="scss" scoped>
.login-container {
	.top {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 300px;
		height: 40px;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0px 0px;
		background-color: $wk-bg-color-grey;
		font-size: $uni-font-size-base;
		color: $wk-text-color;
	}
	.body {
		display: flex;
		flex-direction: column;
		align-items: center;
		.stuNo, .pwd {
			display: flex;
			flex-direction: row;
			align-items: center;
			background-color: white;
			width: 100%;
			height: 40px;
			border-bottom: 1px solid $uni-bg-color-grey;
			.icon {
				margin: 0 $uni-spacing-row-base 0 $uni-spacing-row-base;
			}
			.input {
				height: 36px;
				flex: 1;
				font-size: $uni-font-size-base;
				caret-color: $wk-theme-color;
				margin-right: $uni-spacing-row-base;
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: white;
		width: 100%;
		height: 60px;
		border-radius:  0px 0px $uni-border-radius-lg $uni-border-radius-lg;
		.btn {
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
			height: 40px;
		}
	}
}
</style>