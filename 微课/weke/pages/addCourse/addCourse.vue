<template>
	<view class="add-course-container" v-for="org in orgs" :key="org._id">
		<AddCourseCard :org="org" />
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onLoad } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { AddCourseCard } from './components/AddCourseCard'

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const global = getApp().globalData!

onLoad(async () => {
	if (usersStore.isLogin) {
		// 加载所有相关机构
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		if (usersStore.owner.roles?.includes(2)) {
			await useOrgs.fetchAnonymousOrg()
		}
		uni.hideLoading()
		if (usersStore.owner.roles?.includes(1) && useOrgs.orgs.length === 0) {
			// 如果是机构管理员且没有创建过机构,则提示创建机构
			uni.showToast({
				title: "请先创建机构",
				duration: global.duration_toast,
				icon: "error"
			})
		}
	}
})

// @ts-ignore
const orgs = computed({
	get() {
		const userId = usersStore.owner._id
		let normalOrgs = useOrgs.orgs.filter(org => org.creatorId === userId || 
											org.teacherIds?.includes(userId))
		if (usersStore.owner.roles?.includes(2) &&
			useOrgs.anonymousOrg._id.length > 0) {
			normalOrgs.push(useOrgs.anonymousOrg)
		}
		return normalOrgs
	}
})

</script>

<style lang="scss" scoped>
.add-course-container {
	display: flex;
	flex-direction: column;
	border-radius: $uni-border-radius-lg;
	background-color: white;
	margin: $uni-spacing-col-sm $uni-spacing-col-base;
}
</style>
