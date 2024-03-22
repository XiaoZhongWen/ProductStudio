<template>
	<view class="member-course-container">
		<view class="profile" v-if="teacher">
			<view class="top">
				<member-info
					:url="teacher.avatarUrl"
					:nickname="teacher.nickName"
					:mobile="teacher.mobile"
					:signature="teacher.signature">
				</member-info>
				<wk-circle-progress
					v-if="totalCourses > 0" 
					class="circle-progress" 
					:total="totalCourses" 
					:consume="totalConsumeCourses">
				</wk-circle-progress>
			</view>
			<view class="bottom">
				<text>{{orgNames}}</text>
			</view>
		</view>
		<uni-section title="课程" type="line">
		</uni-section>
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
				<view class="duration" v-if="item.type !== 2">
					<text>课程时长: {{item.duration}}分钟</text>
				</view>
				<view class="teacher" v-if="teacher">
					<text>授课老师: {{teacher.nickName}}</text>
				</view>
				<view class="students">
					<text>学员: </text>
					<view class="cell-container">
						<template v-for="student in item.students" :key="student._id">
							<wk-portrait
								@tap="onStudentTap(student._id, item.orgId)"
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
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { Student, User } from '../../types/user';
import { computed, ref } from 'vue';

type MemberCourseInfo = {
	id: string,
	orgId: string,
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

let teacherId = ''
const ds = ref<MemberCourseInfo[]>([])
const teacher = ref<User>()

onLoad((option) => {
	const { id } = option as { id: string }
	teacherId = id
})

onShow(() => {
	loaddata()
})

const loaddata = (async () => {
	const entries = usersStore.entries.filter(entry => entry.teacherId === teacherId)
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
	const users = await usersStore.fetchUsers([teacherId]) as User[]
	if (users.length === 1) {
		teacher.value = users[0]
	}
	uni.hideLoading()
	
	if (teacher.value) {
		uni.setNavigationBarTitle({
			title: teacher.value.nickName
		})
	}
	ds.value.length = 0
	courses.forEach(async c => {
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
		
		const students = await usersStore.fetchStudentsByNos(studentNos)
		const info: MemberCourseInfo = {
			id: c._id,
			orgId,
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

const totalCourses = computed(() => {
	return ds.value.reduce((accumulator, current) => {
		return accumulator + current.total
	}, 0)
})

const totalConsumeCourses = computed(() => {
	return ds.value.reduce((accumulator, current) => {
		return accumulator + current.consume
	}, 0)
})

const orgNames = computed(() => {
	const names:string[] = []
	ds.value.forEach(item => {
		if (!names.includes(item.orgName)) {
			names.push(item.orgName)
		}
	})
	return names.join(" ")
})

const onStudentTap = (studentId: string, orgId:string) => {
	const students = usersStore.students.filter(student => student._id === studentId)
	if (students.length === 1) {
		const student = students[0]
		uni.navigateTo({
			url: "/pages/course-bind/course-bind?studentNo="+student.studentNo+"&orgIds="+orgId
		})
	}
}

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

<style lang="scss">
.member-course-container {
	display: flex;
	flex-direction: column;
	.profile {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.top {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			height: 60px;
			.circle-progress {
				width: 37px;
				height: 54px;
			}
		}
		.bottom {
			margin-top: $uni-spacing-col-base;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
	}
	.uni-section {
		background-color: transparent !important;
	}
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
