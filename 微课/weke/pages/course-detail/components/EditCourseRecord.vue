<template>
	<view class="edit-course-record-container">
		<view class="header">
			<text>编辑</text>
		</view>
		<view class="body">
			<view class="section">
				<text class="title">开始时间:</text>
				<uni-datetime-picker 
					type="datetime" 
					return-type="timestamp" 
					v-model="start"
					:border="border" />
			</view>
			<view class="section">
				<text class="title">结束时间:</text>
				<uni-datetime-picker 
					type="datetime" 
					return-type="timestamp" 
					v-model="end"
					:border="border" />
			</view>
			<view class="section" v-if="courseType">
				<text class="title">{{courseType === 2?'消耗课次:':'消耗课时:'}}</text>
				<uni-number-box 
					background="#5073D6" 
					color="#fff" 
					v-model="count"
					:max="1000"
					:min="1" />
			</view>
			<view class="section-input">
				<text class="title">课程内容:</text>
				<textarea 
					class="textarea" 
					type="text" 
					v-model="content" 
					placeholder="课程内容" />
			</view>
			<view class="section-input">
				<text class="title">课后作业:</text>
				<textarea 
					class="textarea" 
					type="text" 
					v-model="assignment" 
					placeholder="课后作业"/>
			</view>
			<view class="section-input">
				<text class="title">课程反馈:</text>
				<textarea 
					class="textarea" 
					type="text" 
					v-model="feedback" 
					placeholder="课程反馈"/>
			</view>
			<button
				type="default" 
				class="btn"
				@tap="onTap">确定</button>
		</view>
		<view class="bottom">
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCourseStore } from "@/store/course"
import { CourseConsumeRecord } from '../../../types/course';

const global = getApp().globalData!

const emit = defineEmits(['change'])
const courseStore = useCourseStore()

const record = ref<CourseConsumeRecord>()
const border = false

const start = ref<number>(Date.now())
const end = ref<number>(Date.now())
const count = ref<number>(1)
const content = ref('')
const assignment = ref('')
const feedback = ref('')

const courseType = ref()

let rId = ''
const initial = async (id:string) => {
	if (typeof(id) === 'undefined' || id.length === 0) {
		return
	}
	rId = id
	const res = courseStore.courseConsumeRecords.filter(r => r._id === rId)
	if (res.length > 0) {
		record.value = res[0]
		start.value = record.value.startTime
		end.value = record.value.endTime
		count.value = record.value.count
		content.value = record.value.content ?? ''
		assignment.value = record.value.assignment ?? ''
		feedback.value = record.value.feedback ?? ''
	}
	
	const courseId = record.value?.courseId ?? ''
	if (courseId.length > 0) {
		const courses = await courseStore.fetchCourses([courseId])
		if (courses.length === 1) {
			const course = courses[0]
			courseType.value = course.type
		}
	}
}

defineExpose({
	initial
})

const onTap = () => {
	const record = {
		_id: rId,
		startTime: start.value,
		endTime: end.value,
		count: count.value,
		content: content.value,
		assignment: assignment.value,
		feedback: feedback.value
	}
	if (start.value.toString().length === 0) {
		uni.showToast({
			title: "请选择开始时间",
			duration: global.duration_toast,
			icon:'none'
		})
		return
	}
	if (end.value.toString().length === 0) {
		uni.showToast({
			title: "请选择结束时间",
			duration: global.duration_toast,
			icon:'none'
		})
		return
	}
	if (start.value >= end.value) {
		uni.showToast({
			title: "开始时间要小于结束时间",
			duration: global.duration_toast,
			icon:'none'
		})
		return
	}
	emit('change', { ...record })
}

</script>

<style lang="scss">
.edit-course-record-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 44px;
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0px 0px;
		font-size: $uni-font-size-lg;
		color: $wk-text-color;
	}
	.body {
		display: flex;
		flex-direction: column;
		width: 100%;
		background-color: white;
		.section, .section-input {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 40px;
			background-color: white;
			padding-left: $uni-padding-normal;
			padding-right: $uni-padding-normal;
			.title {
				color: $wk-text-color;
				font-size: $uni-font-size-base;
			}
			.textarea {
				flex: 1;
				margin-left: $uni-spacing-row-base;
				background-color: $wk-bg-color-grey;
				border-radius: $uni-border-radius-base;
				padding: $uni-padding-base;
				font-size: $uni-font-size-base;
				caret-color: $wk-theme-color;
				height: 80px;
				box-sizing: border-box;
			}
		}
		.section-input {
			height: 80px;
			align-items: flex-start;
			margin: $uni-spacing-col-sm 0;
		}
		.btn {
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
			margin-top: $uni-spacing-col-lg;
			margin-bottom: $uni-spacing-col-lg;
		}
	}
	.bottom {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 35px;
		background-color: white;
	}
}
</style>