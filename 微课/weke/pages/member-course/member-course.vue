<template>
	<view class="member-course-container">
		<template v-for="item in ds" :key="item.id">
			<view class="member-course-card">
				<view class="top">
					<view :class="item.icon"></view>
					<text class="text">{{item.name}}</text>
					<wk-circle-progress
						class="circle-progress"
						:total="item.total"
						:consume="item.consume">
					</wk-circle-progress>
				</view>
				<view class="courseType">
					<text>课程类型: {{courseDesc(item.type)}}</text>
				</view>
				<view class="duration">
					<text>课程时长: {{item.duration}}分钟</text>
				</view>
				<view class="teacher">
					<text>授课老师: Julien</text>
				</view>
				<view class="students">
					<text>学员: </text>
					<view class="cell-container">
						<template v-for="student in item.students" :key="student._id">
							<wk-portrait
								:url="student.avatarUrl" 
								:name="student.nickName">
							</wk-portrait>
						</template>
					</view>
				</view>
				<view class="bottom">
					<text>{{item.orgName}}</text>
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
			if (org.type === 1) {
				const users = usersStore.users.filter(u => u._id === org.creatorId)
				if (users.length === 1) {
					const user = users[0]
					orgName = user.nickName
				}
			} else {
				orgName = org.name
			}
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

const courseDesc = (type: number) => {
	let desc = ""
	if (type === 0) {
		desc = "一对一"
	} else if (type === 1) {
		desc = "班课"
	} else if (type === 2) {
		desc = "次课"
	} else if (type === 3) {
		desc = "试听课"
	}
	return desc
}
	
</script>

<style lang="scss" scoped>
.member-course-container {
	display: flex;
	flex-direction: column;
	.member-course-card {
		display: flex;
		flex-direction: column;
		background-color: white;
		margin: $uni-spacing-col-sm $uni-spacing-row-base;
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
			.cell-container {
				flex: 1;
				display: flex;
				flex-direction: row;
				flex-flow: row wrap;
			}
		}
		.bottom {
			display: flex;
			flex-direction: row;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
	}
}

</style>
