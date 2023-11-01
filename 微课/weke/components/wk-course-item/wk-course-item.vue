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
			<template v-if="course.type === 2">
				<text>课程次数: {{course.duration}}次</text>
			</template>
			<template v-else>
				<text>课程时长: {{course.duration}}分钟</text>
			</template>
		</view>
		<view class="bottom" v-if="org">
			<text>{{org.type === 0?org.name:creator}}</text>
			<text>{{typeName}}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { Course } from '../../types/course';
import { Org } from '../../types/org';

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const course = ref<Course>()
const org = ref<Org>()
const props = defineProps(['courseId', 'orgId'])
const total = ref(0)
const consume = ref(0)
const typeName = ref('')
const creator = ref('')

onMounted(async () => {
	if (typeof(props.courseId) === 'undefined' || props.courseId.length === 0 ||
		typeof(props.orgId) === 'undefined' || props.orgId.length === 0) {
		return
	}
	const entries = usersStore.entries.filter(entry => entry.courseId === props.courseId && 
														entry.orgId === props.orgId)
	entries.forEach(entry => {
		total.value += entry.total
		consume.value += entry.consume
	})
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
	const orgs = useOrgs.orgs.filter(org => org._id === props.orgId)
	if (orgs.length > 0) {
		org.value = orgs[0]
		if (org.value.type === 1) {
			const users = await usersStore.fetchUsers([org.value.creatorId])
			if (users.length > 0) {
				creator.value = users[0].nickName
			}
		}
	}
})
	
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