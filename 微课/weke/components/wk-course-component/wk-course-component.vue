<template>
	<view class="course-component-container" v-if="usersStore.isLogin">
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { onMounted } from "../../uni_modules/lime-shared/vue";
import { Org } from "../../types/org";
import { Entry } from "../../types/entry";

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

onMounted(() => {
	loadAllCourses()
})

const loadAllCourses = () => {
	if (usersStore.owner.from === 'wx') {
		const userId = usersStore.owner._id
		const roles = usersStore.owner.roles
		const courseIds:string[] = []
		if (roles?.includes(1)) {
			// 机构负责人 - 获取机构所有课程
			const orgs:Org[] = useOrgs.orgs.filter(org => org.creatorId === userId)
			orgs.forEach(org => {
				org.courseIds?.forEach(courseId => {
					const index = courseIds.findIndex(id => id === courseId)
					if (index === -1) {
						courseIds.push(courseId)
					}
				})
			})
		}
		if (roles?.includes(2)) {
			// 老师 - 获取所有教授的课程以及自己匿名机构的所有课程
			const orgs:Org[] = useOrgs.orgs.filter(org => org.type === 1 && org.creatorId === userId)
			orgs.forEach(org => {
				org.courseIds?.forEach(courseId => {
					const index = courseIds.findIndex(id => id === courseId)
					if (index === -1) {
						courseIds.push(courseId)
					}
				})
			})
			const entries:Entry[] = usersStore.entries.filter(entry => entry.teacherId === userId)
			entries.forEach(entry => {
				const index = courseIds.findIndex(id => id === entry.courseId)
				if (index === -1) {
					courseIds.push(entry.courseId)
				}
			})
		}
		if (roles?.length === 1 && roles.includes(3)) {
			// 家长 - 孩子上的所有课程
			const students = usersStore.students.filter(student => student.associateIds?.includes(userId))
			students.forEach(student => {
				const entries:Entry[] = usersStore.entries.filter(entry => entry.studentId === student.studentNo)
				entries.forEach(entry => {
					const index = courseIds.findIndex(id => id === entry.courseId)
					if (index === -1) {
						courseIds.push(entry.courseId)
					}
				})
			})
		}
	} else {
		// 获取学生上的所有课程
		const courseIds:string[] = []
		const studentNo = usersStore.owner.studentNo
		const entries:Entry[] = usersStore.entries.filter(entry => entry.studentId === studentNo)
		entries.forEach(entry => {
			const index = courseIds.findIndex(id => id === entry.courseId)
			if (index === -1) {
				courseIds.push(entry.courseId)
			}
		})
	}
}

</script>

<style lang="scss" scoped>

</style>