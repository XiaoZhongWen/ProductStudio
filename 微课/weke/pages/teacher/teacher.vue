<template>
	<view class="teacher-container">
		<template v-for="teacher in teachers" :key="teacher._id">
			<TeacherCard :teacherId="teacher._id" :orgId="teacher.orgId" />
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
import { onMounted, ref } from "vue";
import { onLoad } from '@dcloudio/uni-app'
import TeacherCard from './components/TeacherCard.vue'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { User } from '../../types/user'
import { Org } from "../../types/org";

type TeacherCardData = User & {orgId:string}

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const teachers = ref<TeacherCardData[]>([])
let studentId = ''
const isShowAddBtn = ref(false)

onLoad((option) => {
	// 学生id, 如果用户包含家长角色且从孩子页面路由过来时会携带studentId参数
	const id = option!.id
	if (typeof(id) !== 'undefined' && id.length > 0) {
		studentId = id
	} else {
		isShowAddBtn.value = true
	}
})

onMounted(async () => {
	console.info("teacher onMounted...")
	if (usersStore.isLogin) {
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		uni.hideLoading()
		if (studentId.length === 0 && 
			(usersStore.owner.roles?.includes(1) || 
			usersStore.owner.from === 'stuNo')
		) {
			// 机构负责人或学生
			loaddata(useOrgs.myOrgs)
		} else {
			// 加载学生相关的机构老师数据
			const orgs = useOrgs.orgs.filter(org => org.studentIds?.includes(studentId))
			loaddata(orgs)
		}
	}
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addTeacher/addTeacher"
	})
}

uni.$on("add-teacher-success", () => {
	loaddata(useOrgs.myOrgs)
})

const loaddata = (orgs:Org[]) => {
	teachers.value.splice(0, teachers.value.length)
	orgs.forEach(async org => {
		const teacherIds:string[] = Array.from(org.teacherIds?.values() ?? [])
		const users:TeacherCardData[] = await usersStore.fetchUsers(teacherIds)
		if (users.length > 0) {
			users.forEach(user => user.orgId = org._id)
			teachers.value.push(...users)
		}
	})
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
