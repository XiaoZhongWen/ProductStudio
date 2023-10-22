<template>
	<view class="course-card" v-if="display">
		<view class="top">
			<view :class="course.icon"></view>
			<text class="text">{{course.name}}</text>
			<wk-circle-progress v-if="props.forStudent" class="circle-progress"></wk-circle-progress>
		</view>
		<view class="duration">
			<text>课程时长: {{course.duration}}分钟</text>
		</view>
		<view class="teacher" v-if="isShowTeacher">
			<text>授课老师: </text>
			<view class="teacher-cell">
				<wk-icon
					class="icon" 
					:url="teacher.avatarUrl"
					:text="teacher.nickName">
				</wk-icon>
				<uni-icons type="loop" class="replace" color="#5073D6"></uni-icons>
			</view>
		</view>
		<view class="operation" v-if="props.forStudent">
			<view class="left">
				<text>兮子英语</text>
			</view>
			<view class="right">
				<text class="action">续课</text>
				<text class="action finish">结课</text>
				<text class="action revoke">退课</text>
			</view>
		</view>
		<view class="bottom" v-else>
			<text>{{org.name}}</text>
			<text>{{type}}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Course } from '../../types/course';
import { Org } from '../../types/org';
import { User } from '../../types/user';
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'

const course = ref<Course>()
const teacher = ref<User>()
const org = ref<Org>()
const type = ref('')
const display = ref(false)

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const props = defineProps(['forStudent', 'courseId', 'teacherId', 'orgId'])
onMounted(async () => {
	if (typeof(props.forStudent) !== 'undefined' && 
		props.forStudent &&
		typeof(props.teacherId) !== 'undefined' && 
		props.teacherId.length > 0) {
		const res = await usersStore.fetchUsers([props.teacherId]) as User[]
		if (res.length > 0) [
			teacher.value = res[0]
		]
	}
	if (typeof(props.courseId) !== 'undefined' && 
		props.courseId.length > 0) {
		const res = await courseStore.fetchCourses([props.courseId])
		if (res.length > 0) {
			course.value = res[0]
			if (course.value.type === 0) {
				type.value = "一对一"
			}
			if (course.value.type === 1) {
				type.value = "班课"
			}
			if (course.value.type === 2) {
				type.value = "次课"
			}
			if (course.value.type === 3) {
				type.value = "试听课"
			}
			display.value = true
		}
	}
	if (typeof(props.orgId) !== 'undefined' &&
		props.orgId.length > 0) {
		org.value = useOrgs.fetchOrgById(props.orgId)
	}
})

const isShowTeacher = computed(() => {
	return props.forStudent && typeof(teacher.value) !== 'undefined'
})

</script>

<style lang="scss" scoped>
.course-card {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.top {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 30px;
		.text {
			margin-left: $uni-spacing-row-sm;
			font-size: $uni-font-size-base;
		}
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: 0;
			right: 0;
		}
	}
	.duration {
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
	.teacher {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 28px;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		.teacher-cell {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			.icon {
				width: 28px;
				height: 28px;
				border-radius: $uni-border-radius-circle;
				margin: 0 $uni-spacing-row-sm;
			}
			.replace {
				margin-left: $uni-spacing-row-sm;
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
	.operation {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
		.right {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
			.action {
				margin-left: $uni-spacing-row-lg;
				background-color: $wk-theme-color;
				color: white;
				padding: $uni-padding-sm $uni-padding-base;
				border-radius: $uni-border-radius-base;
			}
			.revoke {
				background-color: $uni-color-error;
			}
		}
	}
}
</style>