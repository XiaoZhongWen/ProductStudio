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
			<input
				v-model="usersStore.owner.nickName"
				class="input" 
				type="nickname" 
				placeholder="输入昵称,不超过16个字" 
				placeholder-style="color:#c6c8cf; font-size:12px"
				maxlength="16"/>
			<view class="protocol" @tap="onTapProtocol">
				<text class="normal">同意</text>
				<text class="link-text">《微课用户服务协议》</text>
				<text class="normal">后再登录（可点击阅读）</text>
			</view>
			<button class="btn" type="default" @tap="onTapAgree">我已同意</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import UploadPortrait from './UploadPortrait.vue'
import { useUsersStore } from "@/store/users"
const usersStore = useUsersStore()

const emit = defineEmits(['onPopup'])
const onClose = () => {
	emit('onPopup')
}

const onTapProtocol = () => {
	uni.$emit('showWkProtcol')
}

const onTapAgree = () => {
	uni.$emit('login')
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
		position: relative;
		background-color: white;
		display:flex;
		flex-direction: column;
		align-items: center;
		.portrait {
			margin-top: 60rpx;
		}
		.input {
			background-color: $wk-bg-color-grey;
			height: 80rpx;
			padding: 0 40rpx;
			border-radius: $uni-border-radius-lg;
			margin-top: 60rpx;
			caret-color: $wk-theme-color;
			text-align: center;
			color: $wk-text-color;
		}
		.protocol {
			position: fixed;
			bottom: 180rpx;
			font-size: $uni-font-size-sm;
			.link-text {
				color: $wk-theme-color;
			}
			.normal {
				color: $uni-text-color-placeholder;
			}
		}
		.btn {
			position: fixed;
			bottom: 80rpx;
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
		}
	}
}
</style>