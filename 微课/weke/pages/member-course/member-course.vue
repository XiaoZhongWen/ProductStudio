<template>
	<view class="member-course-container">
		<template v-for="item in ds" :key="item.id">
			<view class="member-course-card">
				<view class="top">
					<view class=".t-icon .t-icon-yuwen1"></view>
					<text class="text">语文</text>
					<wk-circle-progress
						class="circle-progress"
						:total="100"
						:consume="20">
					</wk-circle-progress>
				</view>
				<view class="courseType">
					<text>课程类型: 班课</text>
				</view>
				<view class="duration">
					<text>课程时长: 40分钟</text>
				</view>
				<view class="teacher">
					<text>授课老师: Julien</text>
				</view>
				<view class="students">
					<text>学员: </text>
				</view>
				<view class="bottom">
					<text>兮子英语</text>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { Student } from '../../types/user';
import { ref } from 'vue';

type MemberCourseInfo = {
	id: string,
	name: string,
	icon: string,
	type: number,
	duration: number,
	total: number,
	consume: number,
	orgName: string,
	students: Student[]
}

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const ds = ref<MemberCourseInfo[]>([])

onLoad(async (option) => {
	const { id } = option as { id: string }
	const entries = usersStore.entries.filter(entry => entry.teacherId === id)
	let courseIds:string[] = []
	entries.forEach(entry => {
		if (!courseIds.includes(entry.courseId)) {
			courseIds.push(entry.courseId)
		}
	})
	uni.showLoading({
		title: "加载中"
	})
	const courses = await courseStore.fetchCourses(courseIds)
	uni.hideLoading()
	
	courses.forEach(c => {
		let orgId = ''
		let orgName = ''
		let studentNos:string[] = []
		let total = 0
		let consume = 0
		entries.forEach(e => {
			if (e.courseId === c._id) {
				if (orgId.length === 0) {
					orgId = e.orgId
				}
				if (!studentNos.includes(e.studentId)) {
					studentNos.push(e.studentId)
				}
				total += e.total
				consume += e.consume
			}
		})
		
		const orgs = useOrgs.orgs.filter(org => org._id === orgId)
		if (orgs.length === 1) {
			const org = orgs[0]
			orgName = org.name
		}
		
		const students = usersStore.students.filter(s => studentNos.includes(s.studentNo))
		const info: MemberCourseInfo = {
			id: c._id,
			name: c.name,
			icon: c.icon,
			type: c.type,
			duration: c.duration,
			orgName,
			students,
			total,
			consume
		}
		ds.value.push(info)
	})
})
	
</script>

<style lang="scss" scoped>
.member-course-container {
	display: flex;
	flex-direction: column;
	.member-course-card {
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
		.courseType, .duration, .teacher {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
		.students {
			display: flex;
			flex-direction: row;
			align-items: flex-start;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
		.bottom {
			display: flex;
			flex-direction: row;
			justify-content: flex-end;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
	}
}

</style>
