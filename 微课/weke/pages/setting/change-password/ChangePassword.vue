<template>
	<view class="ch-pwd-container">
		<view class="top">
			<text>修改密码</text>
		</view>
		<view class="body">
			<view class="stuNo">
				<uni-icons class="icon" type="person-filled" color="#5073D6"></uni-icons>
				<input class="input" type="number" disabled :value="usersStore.owner.studentNo" />
			</view>
			<view class="pwd">
				<uni-icons class="icon" type="locked-filled" color="#5073D6"></uni-icons>
				<input class="input" type="number" v-model="originalPwd" placeholder="原始密码" />
			</view>
			<view class="pwd">
				<uni-icons class="icon" type="locked-filled" color="#5073D6"></uni-icons>
				<input class="input" password v-model="newPwd" placeholder="新密码" />
			</view>
			<view class="pwd">
				<uni-icons class="icon" type="locked-filled" color="#5073D6"></uni-icons>
				<input class="input" password v-model="confirmPwd" placeholder="密码确认" />
			</view>
		</view>
		<view class="bottom">
			<button class="confirm" type="default" @tap="onConfirm">
				<text class="text">完成</text>
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUsersStore } from "@/store/users"

const originalPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')
const usersStore = useUsersStore()
const global = getApp().globalData!
const emit = defineEmits(['onComplete'])

const onConfirm = async () => {
	// 1. 原密码
	if (originalPwd.value.trim().length === 0) {
		uni.showToast({
			title:"请输入原密码",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	// 2. 新密码
	const pwd = newPwd.value.trim()
	if (pwd.length < 6) {
		uni.showToast({
			title:"新密码长度不能少于6位",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	// 3. 确认密码
	if (confirmPwd.value !== pwd) {
		uni.showToast({
			title:"密码确认输入有误",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	// 4. 新旧密码不能相同
	if (pwd === originalPwd.value) {
		uni.showToast({
			title:"新旧密码不能相同",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	uni.showLoading({
		title: "正在修改..."
	})
	// 4. 更改密码
	const result = await usersStore.changePassword(usersStore.owner.studentNo, originalPwd.value, pwd)
	emit('onComplete', {status: result})
	newPwd.value = ''
	confirmPwd.value = ''
	if (result) {
		originalPwd.value = ''
	}
	uni.hideLoading()
	uni.showToast({
		title: result?"密码修改成功":"密码修改失败",
		duration:global.duration_toast,
		icon:result?"success":"error"
	})
}

</script>

<style lang="scss" scoped>
.ch-pwd-container {
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
		.confirm {
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