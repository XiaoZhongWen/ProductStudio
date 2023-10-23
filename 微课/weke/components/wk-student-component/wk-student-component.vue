<template>
	<view class="student-component-container">
		<template v-for="info in datasource" :key="info.id">
			<wk-student-card 
			:id="info.id"
			:orgIds="info.orgIds"
			:url="info.iconUrl"
			:name="info.name"
			:studentNo="info.studentNo"
			:signature="info.signature"
			:orgNames="info.orgNames"></wk-student-card>
		</template>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { Student } from '../../types/user';
import { Org } from '../../types/org';

type StudentInfo = {
	id: string,
	orgIds: string[],
	name: string,
	signature: string,
	orgNames: string,
	studentNo: string,
	iconUrl: string
}

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const students = ref<Student[]>([])
const orgs = ref<Org[]>([])

onMounted(async() => {
	uni.showLoading({
		title:"加载中"
	})
	await useOrgs.loadOrgData()
	if (usersStore.owner.roles?.includes(2)) {
		await useOrgs.fetchAnonymousOrg()
	}
	await usersStore.loadAllEntries()
	uni.hideLoading()
	
	if (usersStore.owner.from === 'wx') {
		if (usersStore.owner.roles?.includes(1)) {
			loadOrgStudent()
		}
		if (usersStore.owner.roles?.includes(2)) {
			// 老师 - 获取教授的所有学员
			loadTeacherStudent()
		}
		if (usersStore.owner.roles?.includes(3)) {
			// 家长 - 获取与孩子学习相同课程的学员
		}
	} if (usersStore.owner.from === 'stuNo') {
		// 学员 - 获取学习相同课程的学员
	}
})

const loadOrgStudent = () => {
	const userId = usersStore.owner._id
	// 机构负责人 - 获取机构所有学员
	const orgs = useOrgs.orgs.filter(org => org.creatorId === userId)
	orgs.forEach(org => {
		const studentIds = org.studentIds ?? []
		studentIds.forEach(sId => {
			let index = usersStore.students.findIndex(student => student._id === sId)
			if (index !== -1) {
				const student = usersStore.students[index]
				index = students.value.findIndex(s => s._id === student._id)
				if (index === -1) {
					students.value.push(student)
				}
				if (typeof(student.orgIds) === 'undefined') {
					student.orgIds = []
				}
				if (!student.orgIds?.includes(org._id)) {
					student.orgIds?.push(org._id)
				}
			}
		})
	})
}

const loadTeacherStudent = () => {
	
}

watchEffect(async () => {
	if (usersStore.isLogin) {
		const userId = usersStore.owner._id
		
		// 加载所有相关机构
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		if (usersStore.owner.roles?.includes(2)) {
			await useOrgs.fetchAnonymousOrg()
		}
		uni.hideLoading()
		
		if (usersStore.owner.from === 'wx') {
			let result = []
			// 机构负责人
			if (usersStore.owner.roles?.includes(1)) {
				const forCreator = useOrgs.orgs.filter(org => org.creatorId === userId)
				result.push(...forCreator)
			}
			// 老师
			if (usersStore.owner.roles?.includes(2) &&
				useOrgs.anonymousOrg._id.length > 0) {
				const forTeacher = useOrgs.orgs.filter(org => org.teacherIds?.includes(userId))
				result.push(...forTeacher)
				orgs.value.push(useOrgs.anonymousOrg)
			}
			// 家长
			if (usersStore.owner.roles?.includes(3)) {
				const children = usersStore.students.filter(student => student.associateIds?.includes(userId))
				let forParents:Org[] = []
				children.forEach(child => {
					const result = useOrgs.orgs.filter(org => org.studentIds?.includes(child._id))
					forParents.push(...result)
				})
				result.push(...forParents)
			}
			result.forEach(org => {
				const index = orgs.value.findIndex(item => item._id === org._id)
				if (index === -1) {
					orgs.value.push(org)
				}
			})
		} else if (usersStore.owner.from === 'stuNo') {
			// 学员
			orgs.value = useOrgs.orgs.filter(org => org.studentIds?.includes(userId))
		}
		const ids:string[] = []
		orgs.value.forEach(org => {
			org.studentIds?.forEach(id => {
				const isMyself = usersStore.owner.from === 'stuNo' && id === userId
				if (!ids.includes(id) && !isMyself) {
					ids.push(id)
				}
			})
		})
		const result = await usersStore.fetchUsers(ids, 'student') as Student[]
		students.value = result
	}
})

const datasource = computed<StudentInfo[]>(() => {
	const res:StudentInfo[] = []
	students.value.forEach(stu => {
		const orgIds:string[] = []
		const orgNames:string[] = []
		orgs.value.forEach(org => {
			if (org.studentIds?.includes(stu._id)) {
				orgIds.push(org._id)
				orgNames.push(org.name)
			}
		})
		let str = ''
		let index = 0
		for (let orgName of orgNames) {
			str += orgName + " "
			index++
			if (index > 2) {
				str += "等"
				break
			}
		}
		const info:StudentInfo = {
			id: stu._id,
			name: stu.nickName,
			studentNo: stu.studentNo,
			iconUrl: stu.avatarUrl ?? '',
			orgIds: orgIds,
			orgNames: str,
			signature: stu.signature ?? ''
		}
		res.push(info)
	})
	return res
})

</script>

<style lang="scss" scoped>
</style>