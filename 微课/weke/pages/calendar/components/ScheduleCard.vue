<template>
	<view class="schedule-card-container">
		<view class="top">今天</view>
		<view class="content">
			<view class="left">
				<label>
					<checkbox :value="false" />
				</label>
			</view>
			<view class="right">
				<view class="main">
					<template v-if="props.schedule.classId">
						<view v-if="grade" :class="grade.icon"></view>
						<text v-if="grade" class="class-name">{{grade.name}}</text>
						<uni-icons class="icon" type="flag-filled" :color="props.schedule.gradients[0]"></uni-icons>
						<wk-circle-progress
							v-if="total > 0"
							class="circle-progress" 
							:total="total" 
							:consume="consume">
						</wk-circle-progress>
					</template>
					<template v-else>
						<view class="wk-icon" v-if="student">
							<wk-icon
								:text="student.nickName"
								:url="student.avatarUrl">
							</wk-icon>
						</view>
						<text class="nickName" v-if="student">{{student.nickName}}</text>
						<uni-icons class="icon" type="flag-filled" :color="props.schedule.gradients[0]"></uni-icons>
						<wk-circle-progress
							v-if="total > 0"
							class="circle-progress" 
							:total="total" 
							:consume="consume">
						</wk-circle-progress>
					</template>
				</view>
				<view class="section course" v-if="course">
					<text>课程: {{course.name}}</text>
				</view>
				<view class="section teacher" v-if="teacher">
					<text>老师: {{teacher.nickName}}</text>
				</view>
				<view class="section duration">
					<text>上课时间: {{start}} - {{end}} {{props.schedule.remind?'⏰':''}} </text>
				</view>
				<view class="students" v-if="presents.length > 0">
					<text>学员: </text>
					<view class="cell-container">
						<template v-for="student in presents" :key="student._id">
							<wk-portrait
								:url="student.avatarUrl" 
								:name="student.nickName">
							</wk-portrait>
						</template>
					</view>
				</view>
			</view>
		</view>
		<view class="bottom">
			<text v-if="org">{{org.name}}</text>
			<view class="right">
				<text class="action leave">请假</text>
				<text class="action delete">删除</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Student, User } from '../../../types/user';
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { useGradesStore } from "@/store/grades"
import { Course } from '../../../types/course';
import { hhmm } from '@/utils/wk-date'
import { Org } from '../../../types/org';
import { Grade } from '../../../types/grade';

const props = defineProps(['schedule'])

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()
const gradesStore = useGradesStore()

const student = ref<Student>()
const total = ref(0)
const consume = ref(0)
const course = ref<Course>()
const teacher = ref<User>()
const start = ref(hhmm(new Date(props.schedule.startTime)))
const end = ref(hhmm(new Date(props.schedule.endTime)))
const presents = ref<Student[]>([])
const org = ref<Org>()
const grade = ref<Grade>()

onMounted(async () => {
	const courseId = props.schedule.courseId ?? ''
	const teacherId = props.schedule.teacherId ?? ''
	const orgId = props.schedule.orgId ?? ''
	
	if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
		typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
		typeof(orgId) === 'undefined' || orgId.length === 0) {
		return
	}
	const courses = await courseStore.fetchCourses([courseId])
	if (courses.length === 1) {
		course.value = courses[0]
	}
	
	const users = await usersStore.fetchUsers([teacherId]) as User[]
	if (users.length === 1) {
		teacher.value = users[0]
	}
	
	const orgs = useOrgs.orgs.filter(org => org._id === orgId)
	if (orgs.length === 1) {
		org.value = orgs[0]
	}
	
	const classId = props.schedule.classId ?? ''
	if (typeof(classId) !== 'undefined' && 
		classId.length > 0) {
		const grades = await gradesStore.fetchGrades([classId])
		if (grades.length === 1) {
			grade.value = grades[0]
			const studentIds = grade.value.studentIds ?? []
			presents.value = usersStore.students.filter(s => studentIds.includes(s._id))
			const studentNos = presents.value.map(s => s.studentNo)
			usersStore.entries.forEach(e => {
				if (studentNos.includes(e.studentId) && 
					e.courseId === courseId &&
					e.teacherId === teacherId &&
					e.orgId === orgId) {
					total.value += e.total
					consume.value += e.consume
				}
			})
		}
	} else {
		const studentId = props.schedule.studentId
		if (typeof(studentId) !== 'undefined' && 
			studentId.length > 0) {
			const res = usersStore.students.filter(s => s._id === studentId)
			if (res.length === 1) {
				student.value = res[0]
			}
			
			const entries = usersStore.entries.filter(e => e.studentId === student.value?.studentNo &&
											e.courseId === courseId &&
											e.teacherId === teacherId &&
											e.orgId === orgId)
			if (entries.length === 1) {
				const entry = entries[0]
				total.value = entry.total
				consume.value = entry.consume
			}
		}
	}
})

</script>

<style lang="scss" scoped>
.schedule-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	padding: $uni-padding-normal;
	border-radius: $uni-border-radius-lg;
	.top {
		color: $wk-text-color;
		font-size: $uni-font-size-sm;
		margin-bottom: $uni-spacing-row-base;;
	}
	.content {
		display: flex;
		flex-direction: row;
		.left {
			display: flex;
			width: 30px;
			height: 30px;
			justify-content: center;
			align-items: center;
		}
		.right {
			display: flex;
			flex-direction: column;
			flex: 1;
			margin-left: $uni-spacing-row-base;
			.main {
				position: relative;
				display: flex;
				flex-direction: row;
				align-items: center;
				.wk-icon {
					width: 30px;
					height: 30px;
				}
				.nickName {
					font-size: $uni-font-size-base;
					color: $wk-text-color;
					margin-left: $uni-spacing-row-base;
				}
				.circle-progress {
					position: absolute;
					top: 0px;
					right: 0px;
				}
				.icon {
					margin-left: $uni-spacing-row-sm;
				}
			}
			.section {
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
			}
			.course {
				margin-top: $uni-spacing-col-lg;
			}
			.teacher {
				margin-top: $uni-spacing-col-sm;
			}
			.duration {
				margin-top: $uni-spacing-col-sm;
			}
			.students {
				display: flex;
				flex-direction: row;
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
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-lg;
		.action {
			margin-left: $uni-spacing-row-lg;
			background-color: $wk-theme-color;
			color: white;
			padding: $uni-padding-sm $uni-padding-base;
			border-radius: $uni-border-radius-base;
		}
		.delete {
			background-color: $uni-color-error;
		}
	}
}
</style>