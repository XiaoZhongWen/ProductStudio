<template>
	<view class="edit-schedule-container">
		<view class="top">
			<uni-easyinput
				:disabled="isStudentOrParents"
				class="input"
				:styles="styles"
				type="textarea" 
				v-model="content" 
				:placeholder="placeholder"
				maxlength=300
				:inputBorder="false"
				autoHeight
				focus
				trim
				@confirm="onConfirm">
			</uni-easyinput>
			<text class="number" v-if="!isStudentOrParents">{{number}}</text>
		</view>
		<view class="bottom" v-if="!isStudentOrParents">
			<button class="btn" type="default" @tap="onConfirm">确定</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import { Schedule } from '../../types/schedule';
import { useUsersStore } from "@/store/users";
import { useScheduleStore } from "@/store/schedules"

const global = getApp().globalData!

const placeholder = ref('')
const content = ref('')
const schedule = ref<Schedule>()
const usersStore = useUsersStore()
const scheduleStore = useScheduleStore()
const editType = ref('')
const styles = {
	disableColor: '#ffffff'
}

onLoad((option) => {
	const { type, scheduleId } = option as {type:string, scheduleId:string}
	if (typeof(type) === 'undefined' || type.length === 0 ||
		typeof(scheduleId) === 'undefined' || scheduleId.length === 0) {
		return
	}
	editType.value = type
	if (scheduleId.length > 0) {
		const res = scheduleStore.schedules.filter(s => s._id === scheduleId)
		if (res.length === 1) {
			schedule.value = res[0]
		}
	}
	if (schedule.value) {
		// type, 0: 预习、1: 课程内容、2: 课后作业、3: 反馈
		let str = ''
		if (type === "0") {
			str = "课前预习"
			content.value = schedule.value.previewContent ?? ''
		} else if (type === "1") {
			str = "课程内容"
			content.value = schedule.value.courseContent ?? ''
		} else if (type === "2") {
			str = "课后作业"
			content.value = schedule.value.assignment ?? ''
		} else if (type === "3") {
			str = "课程反馈"
			content.value = schedule.value.feedback ?? ''
		}
		if (str.length > 0) {
			placeholder.value = "请编写" + str
		}
		uni.setNavigationBarTitle({
			title: str
		})
	}
})

const number = computed(() => {
	return 300 - content.value.length
})

const onConfirm = async () => {
	if (schedule.value) {
		if (content.value.length === 0) {
			uni.showToast({
				title: "内容不能为空",
				duration: global.duration_toast,
				icon: "none"
			})
			return
		}
		let str = ''
		if (editType.value === "0") {
			str = schedule.value.previewContent ?? ''
		} else if (editType.value === "1") {
			str = schedule.value.courseContent ?? ''
		} else if (editType.value === "2") {
			str = schedule.value.assignment ?? ''
		} else if (editType.value === "3") {
			str = schedule.value.feedback ?? ''
		}
		if (str === content.value) {
			uni.navigateBack()
			return
		}
		uni.showLoading({
			title: "正在更新"
		})
		const result = await scheduleStore.updateSchedule(schedule.value._id, content.value, editType.value)
		uni.hideLoading()
		if (result) {
			uni.showToast({
				title: "更新成功",
				duration: global.duration_toast,
				icon: "success",
				success: () => {
					uni.navigateBack()
				}
			})
		} else {
			uni.showToast({
				title: "更新失败",
				duration: global.duration_toast,
				icon: "none"
			})
		}
	}
}

const isStudentOrParents = computed(() => {
	const roles = usersStore.roles ?? []
	return usersStore.owner.from === 'stuNo' || 
		(roles.includes(3) && roles.length === 1)
})

</script>

<style lang="scss" scoped>
.edit-schedule-container {
	.top {
		padding: 0 $uni-padding-normal;
		background-color: white;
		position: relative;
		.input {
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-lg;
			caret-color: $wk-theme-color;
			color: $wk-text-color;
			font-size: $uni-font-size-base;
		}
		.number {
			position: absolute;
			right: $uni-spacing-row-base;
			bottom: $uni-spacing-col-base;
			font-size: $uni-font-size-base;
			color: $wk-text-color-grey;
		}
	}
	.bottom {
		margin-top: $uni-spacing-col-lg;
		.btn {
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
		}
	}
}
</style>
