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
				selected-text-color="#5073D6"
				@change="onValueChange"/>
			<uni-data-checkbox
				v-model="studentId" 
				wrap
				:localdata="student" 
				selected-color="#5073D6" 
				selected-text-color="#5073D6"
				@change="onStudentValueChange"/>
			<label class="annotation">注：机构负责人、老师、家长间的角色可以叠加，但学生角色不能叠加</label>
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
const roles = ref([
	{
		value: 1,
		text: '机构负责人',
	},
	{
		value: 2,
		text: '老师',
	},
	{
		value: 4,
		text: '家长',
	}
])

const studentId = ref(0)
const student = ref([
	{
		value: 3,
		text: '学生',
	}
])

const roleIds = usersStore.owner.roles ?? []
if (roleIds.length) {
	let set = new Set(roleIds)
	if (set.has(3)) {
		studentId.value = 3
	} else {
		selectedId.value.push(...roleIds)
	}
}

const global = getApp().globalData!
const onConfirm = () => {
	if (studentId.value === 3) {
		let set = new Set(roleIds)
		if (!set.has(studentId.value)) {
			// 更新角色数据
			usersStore.updateRoles([studentId.value])
			console.info("角色变更为: " + studentId.value)
		} else {
			console.info("角色未变更")
		}
		uni.$emit(global.event_name.didSelectedRole)
		return
	}
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
			console.info("角色变更为: " + selectedId.value)
		} else {
			console.info("角色未变更")
		}
		uni.$emit(global.event_name.didSelectedRole)
	} else {
		// 提示选择角色
		uni.showToast({
			title: '请选择角色',
			duration: global.duration_toast,
			icon: "error"
		})
	}
}

const onValueChange = () => {
	if (studentId.value === student.value[0].value) {
		studentId.value = 0
	}
}

const onStudentValueChange = () => {
	if (studentId.value === student.value[0].value) {
		selectedId.value = []
	}
}

</script>

<style lang="scss" scoped>
.roleContainer {
	width: 250px;
	height: 260px;
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