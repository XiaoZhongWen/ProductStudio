<template>
	<view class="grade-card-container">
		<view class="top" v-if="grade">
			<view :class="grade.icon"></view>
			<text class="class-name">{{grade.name}}</text>
		</view>
		<view class="section" v-if="course">
			<text>课程: {{course.name}}</text>
		</view>
		<view class="section" v-if="teacher">
			<text>老师: {{teacher.nickName}}</text>
		</view>
		<view class="section" v-if="students.length > 0">
			<text>学员: </text>
			<view class="cell-container">
				<template v-for="student in students" :key="student._id">
					<wk-portrait
						@tap.prevent="onTap(student._id)"
						:url="student.avatarUrl" 
						:name="student.nickName">
					</wk-portrait>
				</template>
			</view>
		</view>
		<view class="bottom">
			<text>{{orgName}}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useGradesStore } from "@/store/grades"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { onMounted, ref } from "vue";
import { Course } from "../../../types/course";
import { Grade } from "../../../types/grade";
import { Student, User } from "../../../types/user";

const global = getApp().globalData!
const props = defineProps(['gradeId', 'orgId'])
const gradesStore = useGradesStore()
const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const courseStore = useCourseStore()

const grade = ref<Grade>()
const orgName = ref('')
const course = ref<Course>()
const teacher = ref<User>()
const students = ref<Student[]>([])

onMounted(async () => {
	const gradeId = props.gradeId
	const orgId = props.orgId
	if (typeof(gradeId) === 'undefined' || gradeId.length === 0 ||
		typeof(orgId) === 'undefined' || orgId.length === 0) {
		return
	}
	uni.showLoading({
		title: "加载中"
	})
	
	await loadGradeData()
	
	const orgs = useOrgs.orgs.filter(o => o._id === orgId)
	if (orgs.length === 1) {
		const org = orgs[0]
		orgName.value = org.name
		if (org.type === 1) {
			const users = await usersStore.fetchUsers([org.creatorId])
			if (users.length === 1) {
				const user = users[0]
				orgName.value = user.nickName
			}
		}
	}
	
	uni.hideLoading()
})

const loadGradeData = async () => {
	const grades = await gradesStore.fetchGrades([props.gradeId])
	if (grades.length === 1) {
		grade.value = grades[0]
	}
	const courses = courseStore.course.filter(c => c._id === grade.value?.courseId)
	if (courses.length === 1) {
		course.value = courses[0]
	}
	const teacherId = grade.value?.teacherId ?? ''
	if (teacherId.length > 0) {
		const users = await usersStore.fetchUsers([teacherId]) as User[]
		if (users.length === 1) {
			teacher.value = users[0]
		}
	}
	students.value = usersStore.students.filter(s => grade.value?.studentIds?.includes(s._id))
}

const onTap = (studentId:string) => {
	console.info(studentId)
}

uni.$on(global.event_name.didUpdatedGradeData, async (data:{gradeId:string}) => {
	const { gradeId } = data
	if (typeof(gradeId) === 'undefined' || gradeId.length === 0) {
		return
	}
	if (gradeId === props.gradeId) {
		await loadGradeData()
	}
})

</script>

<style lang="scss" scoped>
.grade-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-sm $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-base;
	box-sizing: border-box;
	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		.class-name {
			margin-left: $uni-spacing-row-sm;
			font-size: $uni-font-size-base;
		}
	}
	.section {
		display: flex;
		flex-direction: row;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
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
		justify-content: flex-start;
	}
}
</style>