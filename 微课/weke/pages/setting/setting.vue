<template>
	<view class="setting-container">
		<uni-list>
			<uni-list-item v-if="isShowChangePwdMenu" clickable @tap="onTapChangePwd">
				<template v-slot:header>
					<view class="slot-box">
						<uni-icons class="icon" type="locked-filled" color="#007aff" size=22></uni-icons>
						<text class="slot-text">修改密码</text>
					</view>
				</template>
			</uni-list-item>
			<uni-list-item 
				v-if="usersStore.owner.mobile" 
				title="已绑定手机号" 
				:note="usersStore.owner.mobile" 
				rightText="解除绑定" 
				@tap="unbind" />
		</uni-list>
		<button class="btn" type="default" @tap="onLogout">
			<text class="text">退出登录</text>
		</button>
		<uni-popup ref="popup" type="center">
			<ChangePassword @onComplete="onComplete"></ChangePassword>
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import ChangePassword from './change-password/ChangePassword'
import { computed, ref } from "vue"

const popup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

type ListItem = {
	type: string,
	name: string
	to?: string
}

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()

const global = getApp().globalData!

const isShowChangePwdMenu = ref(usersStore.owner.from === 'stuNo' && 
		usersStore.owner.studentNo.length > 0)

const onLogout = () => {
	usersStore.$reset()
	useOrgs.$reset()
	uni.navigateBack()
}
 
 const onTapChangePwd = () => {
	 popup.value?.open()
 }
 
 const unbind = () => {
	 uni.showModal({
	 	title: global.appName,
	 	content: "解除绑定后，嗒嗒课吧用户将不能通过手机号直接添加您，确定要解除绑定吗?",
		success: async (res) => {
			if (res.confirm) {
				const result = await usersStore.unbindPhoneNumber()
				uni.showToast({
					title: result? "已解绑": "解绑失败",
					duration: global.duration_toast,
					icon: result? "success": "none"
				})
			}
		}
	 })
 }
 
 const onComplete = (data: {status: boolean}) => {
	 const { status } = data
	 if (status) {
		 popup.value?.close()
	 }
 }
	
</script>

<style lang="scss">
.setting-container {
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
	.btn {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: white;
		font-size: $uni-font-size-base;
		color: $uni-color-error;
		width: 300px;
		height: 40px;
		bottom: 50px;
		left: 50%;
		margin-left: -150px;
	}
	.btn::after {
		border-width: 0;
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

</style>
