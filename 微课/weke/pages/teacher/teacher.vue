<template>
	<view class="teacher-container">
		<template v-for="teacher in teachers" :key="teacher._id">
			<TeacherCard :teacherId="teacher._id" :orgId="teacher.orgId" />
		</template>
		<button
			@tap.capture="onAddTap"
			class="add-container" 
			v-if="usersStore.owner.roles?.includes(1)">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</button>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onMounted, ref } from "vue";
import { onLoad } from '@dcloudio/uni-app'
import TeacherCard from './components/TeacherCard.vue'
import { User } from '../../types/user'

type TeacherCardData = User & {orgId:string}

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const teachers = ref<TeacherCardData[]>([])
let studentId = '' 

onLoad((option) => {
	// 学生id, 如果用户包含家长角色且从孩子页面路由过来时会携带studentId参数
	const id = option!.studentId
	if (typeof(id) !== 'undefined') {
		studentId = id
	}
})

onMounted(async () => {
	if (usersStore.isLogin) {
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		uni.hideLoading()
		if (studentId.length === 0 && 
			(usersStore.owner.roles?.includes(1) || 
			usersStore.owner.roles?.includes(3))
		) {
			// 机构负责人或学生
			useOrgs.myOrgs.forEach(async org => {
				const users:TeacherCardData[] = await usersStore.fetchUsers(org.teacherIds ?? [])
				users.forEach(user => user.orgId = org._id)
				teachers.value.push(...users)
			})
		} else {
			// 加载相应学生相关的机构及老师数据
		}
	}
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addTeacher/addTeacher"
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
