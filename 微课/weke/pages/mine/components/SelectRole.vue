<template>
	<view class="roleContainer">
		<view class="header">我是:</view>
		<view class="body">
			<uni-data-checkbox
				v-model="selectedId" 
				multiple
				wrap
				:localdata="roles" 
				selected-color="#5073D6" 
				selected-text-color="#5073D6"/>
		</view>
		<view class="bottom">
			<button class="btn" type="default" @tap="onConfirm">确定</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUsersStore } from "@/store/users"
import { RoleId } from '@/types/user'

const usersStore = useUsersStore()
const selectedId = ref<RoleId[]>([])
const global = getApp().globalData!
const roles = ref([
	{
		value: 1,
		text: '管理员',
	},
	{
		value: 2,
		text: '老师',
	},
	{
		value: 3,
		text: '家长',
	}
])

uni.$on(global.event_name.showSelectRole, () => {
	const roleIds =  usersStore.owner.roles ?? []
	selectedId.value = roleIds
})

const onConfirm = () => {
	const roleIds =  usersStore.owner.roles ?? []
	if (selectedId.value.length) {
		let flag = roleIds.length !== selectedId.value.length
		if (!flag) {
			const set = new Set(roleIds)
			const res = selectedId.value.filter(item => !set.has(item))
			flag = res.length !== 0
		}
		if (flag) {
			// 更新角色数据
			usersStore.updateRoles(selectedId.value)
		} else {
			console.info("角色未变更")
		}
		uni.$emit(global.event_name.didSelectedRole)
	} else {
		// 提示选择角色
		uni.showToast({
			title: '请选择角色',
			duration: global.duration_toast,
			icon: "none"
		})
	}
}

</script>

<style lang="scss" scoped>
.roleContainer {
	width: 250px;
	height: 190px;
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
		font-size: $uni-font-size-base;
	}
	.body {
		margin-top: $uni-spacing-col-base;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		background-color: white;
		.annotation {
			font-size: $uni-font-size-10;
			color: $wk-theme-color;
		}
	}
	.bottom {
		height: 45px;
		background-color: white;
		border-radius:  0 0 $uni-border-radius-lg $uni-border-radius-lg;
		.btn {
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
		}
	}
}
</style>