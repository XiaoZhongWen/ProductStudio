<template>
	<view class="bind-student-container">
		<view class="top" v-if="students.length > 0">
			<view class="item" v-for="student in students" :key="student._id">
				<member-info
					class="info"
					:url="student.avatarUrl"
					:nickname="student.nickName"
					:mobile="`学号: ${student.studentNo}`"
					:signature="student.signature">
				</member-info>
				<text class="text" @tap="onUnBindTap(student.studentNo)">解除绑定</text>
			</view>
		</view>
		<view class="bottom">
			<input
				class="input" 
				type="text" 
				placeholder="绑定学号"
				v-model="studentNo"
			/>
			<view class="icon">
				<uni-icons 
					type="plus-filled" 
					color="#5073D6" 
					size="24"
					@tap="onAddTap">
				</uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsersStore } from "@/store/users"
import { Student } from '../../../types/user';

const global = getApp().globalData!
const studentNo = ref('')
const usersStore = useUsersStore()
const students = ref<Student[]>([])

onMounted(async () => {
	if (usersStore.owner.from === 'wx') {
		const roles = usersStore.owner.roles ?? []
		if (roles.includes(3)) {
			const id = usersStore.owner._id
			students.value = await usersStore.fetchChildren(id)
		}
	}
})

const onAddTap = async () => {
	if (studentNo.value.length === 0) {
		uni.showToast({
			title:"请输入学号",
			duration:global.duration_toast,
			icon:"none"
		})
		return
	}
	const pattern = /^\d+$/
	if (studentNo.value.length !== 9 || !pattern.test(studentNo.value)) {
		uni.showToast({
			title:"学号必须是九位数字",
			duration:global.duration_toast,
			icon:"none"
		})
		return
	}
	
	uni.showLoading({
		title: "添加中..."
	})
	const result = await usersStore.bindStudentNo(studentNo.value)
	uni.hideLoading()
	uni.showToast({
		title:result?"绑定成功":"绑定的学号不存在",
		duration:global.duration_toast,
		icon:result?"success":"none"
	})
	if (result) {
		const data = usersStore.students.filter(s => s.studentNo === studentNo.value)
		if (data.length === 1) {
			const student = data[0]
			const index = students.value.findIndex(s => s._id === student._id)
			if (index === -1) {
				students.value.push(student)
			}
		}
	}
	studentNo.value = ''
}
	
const onUnBindTap = async (studentNo:string) => {
	if (typeof(studentNo) === 'undefined' || studentNo.length !== 9) {
		return
	}
	const result = await usersStore.unbindStudentNo(studentNo)
	uni.showToast({
		title:result?"解绑成功":"解绑失败",
		duration:global.duration_toast,
		icon:result?"success":"none"
	})
	if (result) {
		const index = students.value.findIndex(s => s.studentNo === studentNo)
		if (index !== -1) {
			students.value.splice(index, 1)
		}
	}
}
	
</script>

<style lang="scss" scoped>
.bind-student-container {
	background-color: white;
	margin: 0 $uni-spacing-row-base;
	padding: $uni-padding-base;
	border-radius: $uni-border-radius-base;
	.top {
		display: flex;
		flex-direction: column;
		.item {
			display: flex;
			flex-direction: row;
			align-items: center;
			height: 70px;
			border-bottom: 1px dashed $wk-bg-color-grey;
			padding-left: $uni-spacing-row-sm;
			.info {
				flex: 1;
			}
			.text {
				width: 60px;
				color: white;
				text-align: center;
				font-size: $uni-font-size-sm;
				background-color: $wk-theme-color;
				border-radius: $uni-border-radius-lg;
				margin: 0 $uni-spacing-row-sm 0 $uni-spacing-row-base;
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: $uni-spacing-col-base;
		.icon {
			width: 60px;
			display: flex;
			justify-content: center;
		}
	}
	.input {
		flex: 1;
		height: 40px;
		caret-color: $wk-theme-color;
		background-color: $wk-bg-color-grey;
		font-size: $uni-font-size-base;
		color: $wk-text-color;
		border-radius: $uni-border-radius-base;
		padding-left: $uni-padding-normal;
	}
}
</style>