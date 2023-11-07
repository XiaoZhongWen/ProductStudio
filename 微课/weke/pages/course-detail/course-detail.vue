<template>
	<view class="course-detail-container">
		<view class="header">
			<view class="top" v-if="course">
				<view :class="course.icon"></view>
				<text class="text">{{course.name}}</text>
				<wk-circle-progress
					class="circle-progress"
					:total="entry.total"
					:consume="entry.consume">
				</wk-circle-progress>
			</view>
			<view class="duration" v-if="course">
				<text>课程时长: {{course.duration}}分钟</text>
			</view>
			<view class="student" v-if="student">
				<text>上课学员: </text>
				<view class="student-cell">
					<wk-icon
						class="icon" 
						:url="student.avatarUrl"
						:text="student.nickName">
					</wk-icon>
				</view>
			</view>
			<view class="teacher" v-if="teacher">
				<text>授课老师: </text>
				<view class="teacher-cell">
					<wk-icon
						class="icon" 
						:url="teacher.avatarUrl"
						:text="teacher.nickName">
					</wk-icon>
				</view>
			</view>
			<view class="bottom">
				<text>{{orgName}}</text>
				<text>{{typeName}}</text>
			</view>
		</view>
		<view class="body">
			<uni-segmented-control 
				:current="current" 
				:values="options" 
				class="segmented" 
				styleType="text" 
				activeColor="#5073D6" 
				@clickItem="onClickItem">
			</uni-segmented-control>
			<view class="content">
				<uni-list v-show="current === 0">
					<uni-list-item>
						<template v-slot:body>
							<wk-course-record class="course-record"></wk-course-record>
						</template>
					</uni-list-item>
					<uni-list-item>
						<template v-slot:body>
							<wk-course-record class="course-record"></wk-course-record>
						</template>
					</uni-list-item>
					<uni-list-item>
						<template v-slot:body>
							<wk-course-record class="course-record"></wk-course-record>
						</template>
					</uni-list-item>
				</uni-list>
				<view v-show="current === 1">
					Content of Tab 2
				</view>
				<view v-show="current === 2">
					Content of Tab 3
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { ref } from 'vue';
import { Course } from '../../types/course';
import { Student, User } from '../../types/user';
import { Org } from '../../types/org';
import { Entry } from '../../types/entry';

const entry = ref<Entry>()
const course = ref<Course>()
const student = ref<Student>()
const teacher = ref<User>()
const org = ref<Org>()
const typeName = ref('')
const orgName = ref('')
const current = ref(0)
const options = ["课程记录", "续课记录", "请假记录"]

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

onLoad(async (option) => {
	const { entryId } = option as { entryId:string }
	const entries = usersStore.entries.filter(entry => entry._id === entryId)
	if (entries.length <= 0) {
		return
	}
	entry.value = entries[0]
	const courseId = entry.value.courseId
	const courses =  await courseStore.fetchCourses([courseId])
	if (courses.length <= 0) {
		return
	}
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
	
	const studentId = entry.value.studentId
	const students = usersStore.students.filter(student => student.studentNo === studentId)
	if (students.length <= 0) {
		return
	}
	student.value = students[0]
	const teacherId = entry.value.teacherId
	const users = usersStore.users.filter(user => user._id === teacherId)
	if (users.length <= 0) {
		return
	}
	teacher.value = users[0]
	const orgId = entry.value.orgId
	const orgs = useOrgs.orgs.filter(org => org._id === orgId)
	if (orgs.length <= 0) {
		return
	}
	org.value = orgs[0]
	if (org.value.type === 0) {
		orgName.value = org.value.name
	} else {
		const users = await usersStore.fetchUsers([org.value.creatorId])
		if (users.length === 1) {
			const creator = users[0]
			orgName.value = creator.nickName
		}
	}
})

const onClickItem = (e: { currentIndex:number }) => {
	if (current.value !== e.currentIndex) {
		current.value = e.currentIndex
	}
}

</script>

<style lang="scss" scoped>
.course-detail-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		flex-direction: column;
		background-color: white;
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
		.teacher, .student {
			display: flex;
			flex-direction: row;
			align-items: center;
			height: 28px;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-row-sm;
			.teacher-cell, .student-cell {
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
	.body {
		display: flex;
		flex-direction: column;
		margin-top: $uni-spacing-col-sm;
		background-color: white;
		.segmented {
			font-size: $uni-font-size-base;
		}
		.course-record {
			width: 100%;
		}
	}
}

</style>
