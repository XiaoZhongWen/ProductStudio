<template>
	<view class="teacher-container">
		<template v-for="teacher in teachers" :key="teacher._id">
			<TeacherCard 
				:teacherId="teacher._id" 
				:orgIds="teacher.orgIds" 
				:forStudent="forStudent"/>
		</template>
		<button
			@tap.capture="onAddTap"
			class="add-container" 
			v-if="usersStore.owner.roles?.includes(1) && isShowAddBtn">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</button>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onLoad } from '@dcloudio/uni-app'
import TeacherCard from './components/TeacherCard.vue'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { User } from '../../types/user'
import { Org } from "../../types/org";

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const teachers = ref<User[]>([])
const isShowAddBtn = ref(false)
let studentId = ''
let organizationId = ''

onLoad((option) => {
	// 学生id, 如果用户包含家长角色且从孩子页面路由过来时会携带studentId参数
	const { id, orgId } = option as {id?:string, orgId?:string}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		studentId = id
	} else {
		isShowAddBtn.value = true
	}
	if (typeof(orgId) !== 'undefined' && orgId.length > 0) {
		organizationId = orgId
	}
})

onMounted(async () => {
	if (usersStore.isLogin) {
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		uni.hideLoading()
		if (organizationId.length > 0) {
			// 从机构详情进入
			loaddata(useOrgs.myOrgs.filter(org => org._id === organizationId))
		} else if (studentId.length > 0) {
			// 家长从孩子页面进入
			loadEntries(studentId)
		} else {
			// 从我的页面进入
			if (usersStore.owner.roles?.includes(1)) {
				// 机构负责人
				loaddata(useOrgs.myOrgs)
			}
			if (usersStore.owner.from === 'stuNo') {
				// 学生
				loadEntries(usersStore.owner.studentNo)
			}
		}
	}
})

const forStudent = computed(() => {
	if (organizationId.length > 0 ||
		studentId.length > 0 ||
		usersStore.owner.from === 'stuNo') {
		return true
	} else {
		return !usersStore.owner.roles?.includes(1)
	}
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addTeacher/addTeacher"
	})
}

uni.$on("modify-teacher-success", () => {
	loaddata(useOrgs.myOrgs)
})

const loaddata = (orgs:Org[]) => {
	teachers.value.splice(0, teachers.value.length)
	orgs.forEach(async org => {
		const teacherIds:string[] = Array.from(org.teacherIds?.values() ?? [])
		const users = await usersStore.fetchUsers(teacherIds) as User[]
		if (users.length > 0) {
			users.forEach(user => {
				if (typeof(user.orgIds) === 'undefined' || user.orgIds.length === 0) {
					user.orgIds = [org._id]
				} else if (!user.orgIds.includes(org._id)) {
					user.orgIds.push(org._id)
				}
			})
			users.forEach(user => {
				const index = teachers.value.findIndex(t => t._id === user._id)
				if (index === -1) {
					teachers.value.push(user)
				}
			})
		}
	})
}

const loadEntries = async (studentId:string) => {
	// 1. 获取孩子所有授课老师id
	const res = await usersStore.fetchEntriesWithStudentNo(studentId)
	const teacherIds:string[] = res.map(entry => entry.teacherId)
	// 2. 获取相应老师信息
	const users = await usersStore.fetchUsers(teacherIds) as User[]
	if (users.length > 0) {
		users.forEach(user => {
			const orgIds:string[] = []
			res.forEach(entry => {
				if (entry.teacherId === user._id && !orgIds.includes(entry.orgId)) {
					orgIds.push(entry.orgId)
				}
			})
			user.orgIds = orgIds
		})
		users.forEach(user => {
			const index = teachers.value.findIndex(t => t._id === user._id)
			if (index === -1) {
				teachers.value.push(user)
			}
		})
	}
}

</script>

<style lang="scss" scoped>
.teacher-container {
	.add-container {
		display: flex;
		position: fixed;
		justify-content: center;
		align-items: center;
		background-color: $wk-theme-color;
		width: 60px;
		height: 60px;
		border-radius: $uni-border-radius-circle;
		bottom: 60px;
		right: $uni-spacing-row-lg;
		z-index: 9999;
	}
}
</style>
