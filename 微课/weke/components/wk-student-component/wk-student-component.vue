<template>
	<view class="student-component-container" v-if="usersStore.isLogin && useOrgs.orgs.length > 0">
		<wk-student-card v-for="(student, index) in students" :key="student._id"
		ref="refs"
		:id="student._id"
		:url="student.avatarUrl"
		:name="student.nickName"
		:studentNo="student.studentNo"
		:signature="student.signature">
		</wk-student-card>
	</view>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from 'vue'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { Student } from '../../types/user'
import wkStudentCardVue from '../wk-student-card/wk-student-card.vue';

const global = getApp().globalData!

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()

const refs = ref([])
const students = ref<Student[]>()
let refresh = false

onMounted(() => {
	loadStudents()
	uni.$on(global.event_name.didUpdateCourseData, (data: {studentNo:string}) => {
		const { studentNo } = data
		if (typeof(studentNo) !== 'undefined' && studentNo.length > 0) {
			const index = students.value?.findIndex(student => student.studentNo === studentNo)
			if (typeof(index) !== 'undefined' && index !== -1) {
				const card: InstanceType<typeof wkStudentCardVue> = refs.value[index]
				if (card) {
					card.loaddata()
				}
			}
		}
	})
	uni.$on(global.event_name.didUpdateOrgData, () => {
		loadStudents()
		refresh = true
	})
})

onUpdated(() => {
	if (refresh) {
		refs.value.forEach(item => {
			const card: InstanceType<typeof wkStudentCardVue> = item
			if (card) {
				card.loaddata()
			}
		})
		refresh = false
	}
})

watch(usersStore.owner, () => {
	loadStudents()
	refresh = true
})

const loadStudents = () => {
	const stus:Student[] = []
	if (usersStore.owner.from === 'wx') {
		if (usersStore.owner.roles?.includes(1)) {
			const res = loadOrgStudent()
			res.forEach(s => {
				const index = stus.findIndex(item => item._id === s._id)
				if (index === -1) {
					stus.push(s)
				}
			})
		}
		if (usersStore.owner.roles?.includes(2)) {
			const res = loadTeacherStudent()
			res.forEach(s => {
				const index = stus.findIndex(item => item._id === s._id)
				if (index === -1) {
					stus.push(s)
				}
			})
		}
		if (usersStore.owner.roles?.includes(3) && 
			usersStore.owner.roles.length === 1) {
			// 家长 - 获取与孩子学习相同课程的学员
			const userId = usersStore.owner._id
			const children = usersStore.students.filter(student => student.associateIds?.includes(userId))
			children.forEach(child => {
				const res = loadClassmate(child.studentNo)
				res.forEach(s => {
					const index = stus.findIndex(item => item._id === s._id)
					if (index === -1) {
						stus.push(s)
					}
				})
			})
		}
	} if (usersStore.owner.from === 'stuNo') {
		// 学员 - 获取学习相同课程的学员
		const res = loadClassmate(usersStore.owner.studentNo)
		stus.push(...res)
	}
	students.value = stus
}

const loadOrgStudent = () => {
	const students:Student[] = []
	const userId = usersStore.owner._id
	// 机构负责人 - 获取机构所有学员
	const orgs = useOrgs.orgs.filter(org => org.creatorId === userId)
	orgs.forEach(org => {
		const studentIds = org.studentIds ?? []
		studentIds.forEach(sId => {
			let index = usersStore.students.findIndex(student => student._id === sId)
			if (index !== -1) {
				const student = usersStore.students[index]
				index = students.findIndex(s => s._id === student._id)
				if (index === -1) {
					students.push(student)
				}
			}
		})
	})
	return students
}

const loadTeacherStudent = () => {
	const students:Student[] = []
	const userId = usersStore.owner._id
	// 老师 - 获取教授的所有学员
	const entries = usersStore.entries.filter(entry => entry.teacherId === userId)
	const studentIds = entries.map(entry => entry.studentId)
	// 匿名机构的学员
	if (useOrgs.anonymousOrg._id.length > 0) {
		const o = useOrgs.anonymousOrg.studentIds ?? []
		if (o.length > 0) {
			studentIds.push(...o)
		}
	}
	
	studentIds.forEach(sId => {
		let index = usersStore.students.findIndex(student => student.studentNo === sId || student._id === sId)
		if (index !== -1) {
			const student = usersStore.students[index]
			index = students.findIndex(s => s._id === student._id)
			if (index === -1) {
				students.push(student)
			}
		}
	})
	return students
}

const loadClassmate = (studentNo: string) => {
	const students:Student[] = []
	const courses:string[] = []
	// 获取学习相同课程的学员
	usersStore.entries.forEach(entry => {
		if (entry.studentId === studentNo) {
			const index = courses.findIndex(courseId => courseId === entry.courseId)
			if (index === -1) {
				courses.push(entry.courseId)
			}
		}
	})
	const entries = usersStore.entries.filter(entry => courses.includes(entry.courseId))
	const studentIds:string[] = [studentNo]
	entries.forEach(entry => {
		if (!studentIds.includes(entry.studentId)) {
			studentIds.push(entry.studentId)
		}
	})
	studentIds.forEach(sId => {
		let index = usersStore.students.findIndex(student => student.studentNo === sId)
		if (index !== -1) {
			const student = usersStore.students[index]
			index = students.findIndex(s => s._id === student._id)
			if (index === -1) {
				students.push(student)
			}
		}
	})
	return students
}

</script>

<style lang="scss" scoped>
</style>