<template>
	<view class="course-item-container">
		<view class="top" v-if="course">
			<view :class="course.icon"></view>
			<text class="text">{{course.name}}</text>
			<wk-circle-progress
				v-if="total > 0"
				class="circle-progress"
				:total="total"
				:consume="consume">
			</wk-circle-progress>
		</view>
		<view class="duration" v-if="course">
			<template v-if="course.type !== 2">
				<text>课程时长: {{course.duration}}分钟</text>
			</template>
			<template v-else>
				<view class="placeholder"></view>
			</template>
		</view>
		<view class="bottom" v-if="org">
			<text>{{org.name}}</text>
			<text>{{typeName}}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue';
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { Course } from '../../types/course';
import { Org } from '../../types/org';
import { Student } from '../../types/user';

const global = getApp().globalData!

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const course = ref<Course>()
const org = ref<Org>()
const props = defineProps(['courseId', 'orgId'])
const total = ref(0)
const consume = ref(0)
const typeName = ref('')

onLoad(() => {
	uni.$on(global.event_name.didUpdateCourseData, onDidUpdateCourseData)
})

onUnload(() => {
	uni.$off(global.event_name.didUpdateCourseData, onDidUpdateCourseData)
})

const onDidUpdateCourseData = (data: {courseId:string}) => {
	const { courseId } = data
	if (props.courseId === courseId) {
		loadProgress()
	}
}

onMounted(async () => {
	if (typeof(props.courseId) === 'undefined' || props.courseId.length === 0 ||
		typeof(props.orgId) === 'undefined' || props.orgId.length === 0) {
		return
	}
	const orgs = useOrgs.orgs.filter(org => org._id === props.orgId)
	if (orgs.length > 0) {
		org.value = orgs[0]
	}
	
	loadProgress()
	
	const courses = await courseStore.fetchCourses([props.courseId])
	if (courses.length > 0) {
		course.value = courses[0]
		if (course.value.type === 0) {
			typeName.value = "一对一"
		}
		if (course.value.type === 1) {
			typeName.value = "班课"
		}
		if (course.value.type === 2) {
			typeName.value = "次课"
		}
		if (course.value.type === 3) {
			typeName.value = "试听课"
		}
	}
})

const loadProgress = async () => {
	const roles = usersStore.owner.roles
	const userId = usersStore.owner._id
	const entries = usersStore.entries.filter(entry => entry.courseId === props.courseId &&
														entry.orgId === props.orgId)
	const children = await usersStore.fetchChildren(userId) as Student[]
	const childNos = children.map(child => child.studentNo)
	let totalValue = 0
	let consumeValue = 0
	entries.forEach(entry => {
		if (usersStore.owner.from === 'wx') {
			// 1. 有机构管理员角色并且课程属于自己创建的机构
			const forCreator = roles?.includes(1) && org.value?.creatorId === userId
			// 2. 有老师角色并且该授课记录的老师是自己
			const forTeacher = roles?.includes(2) && entry.teacherId === userId
			// 3. 有家长角色并且该授课记录中的学号属于自己的孩子
			const forParent = roles?.includes(3) && childNos.includes(entry.studentId)
			if (forCreator || forTeacher || forParent) {
				totalValue += entry.total
				consumeValue += entry.consume
			}
		} else if (usersStore.owner.from === 'stuNo') {
			// 角色是学生, 统计跟自己相关的课程进度
			if (entry.studentId === usersStore.owner.studentNo) {
				totalValue += entry.total
				consumeValue += entry.consume
			}
		}
	})
	total.value = totalValue
	consume.value = consumeValue
}
	
</script>

<style lang="scss" scoped>
.course-item-container {
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
		.placeholder {
			margin-top: $uni-spacing-col-lg;
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
}
</style>