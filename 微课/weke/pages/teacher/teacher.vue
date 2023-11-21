<template>
	<view class="teacher-container">
		<template v-for="teacher in teachers" :key="teacher._id">
			<TeacherCard 
				:teacherId="teacher._id"
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
			title: "加载老师数据"
		})
		if (organizationId.length > 0) {
			// 从机构详情进入
			await loaddata(useOrgs.myOrgs.filter(org => org._id === organizationId))
		} else if (studentId.length > 0) {
			// 家长从孩子页面进入
			await loadEntries(studentId)
		} else {
			// 从我的页面进入
			if (usersStore.owner.roles?.includes(1)) {
				// 管理员
				await loaddata(useOrgs.myOrgs)
			}
			if (usersStore.owner.from === 'stuNo') {
				// 学生
				await loadEntries(usersStore.owner.studentNo)
			}
		}
		uni.hideLoading()
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

const loaddata = async (orgs:Org[]) => {
	const teacherIds:string[] = []
	orgs.forEach(org => {
		org.teacherIds?.forEach(id => {
			const index = teacherIds.findIndex(tId => tId === id)
			if (index === -1) {
				teacherIds.push(id)
			}
		})
	})
	teachers.value = await usersStore.fetchUsers(teacherIds) as User[]
}

const loadEntries = async (studentId:string) => {
	// 1. 获取孩子所有授课老师id
	const res = usersStore.fetchEntriesWithStudentNo(studentId)
	const teacherIds:string[] = []
	res.forEach(entry => {
		if (!teacherIds.includes(entry.teacherId)) {
			teacherIds.push(entry.teacherId)
		}
	})
	// 2. 获取相应老师信息
	teachers.value = await usersStore.fetchUsers(teacherIds) as User[]
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
