<template>
	<view class="add-grade-container" v-for="org in orgs" :key="org._id">
		<AddGradeCard :org="org" :gradeId="gId"></AddGradeCard>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onMounted, ref } from 'vue';
import { Org } from "../../types/org";
import { onLoad } from '@dcloudio/uni-app'
import AddGradeCard from './components/AddGradeCard.vue'

const global = getApp().globalData!
const usersStore = useUsersStore()
const useOrgs = useOrgsStore()

const orgs = ref<Org[]>([])
const gId = ref('')

const organizationId = ref('')
onLoad(async (option) => {
	const { gradeId, orgId } = option as {
		gradeId:string, 
		orgId?:string
	}
	if (typeof(gradeId) !== 'undefined' && gradeId.length > 0) {
		gId.value = gradeId
		uni.setNavigationBarTitle({
			title: "更新班级"
		})
	}
	if (typeof(orgId) !== 'undefined' && orgId.length > 0) {
		organizationId.value = orgId
	}
})

onMounted(() => {
	if (organizationId.value.length === 0) {
		const id = usersStore.owner._id
		let result = useOrgs.orgs.filter(org => org.creatorId === id && org.type === 0)
		if (gId.value.length > 0) {
			result = useOrgs.orgs.filter(org => org.classIds?.includes(gId.value))
			if (result.length === 1) {
				const org = result[0]
				if (org.creatorId !== id) {
					uni.setNavigationBarTitle({
						title: "班级详情"
					})
				}
			}
		}
		if (result.length === 0) {
			uni.showToast({
				title: "请先创建机构",
				duration: global.duration_toast,
				icon: "none"
			})
		} else {
			orgs.value = result
		}
	} else {
		orgs.value = useOrgs.orgs.filter(org => org._id === organizationId.value)
	}
})

</script>

<style lang="scss">
.add-grade-container {
	display: flex;
	flex-direction: column;
	border-radius: $uni-border-radius-lg;
	background-color: white;
	margin: $uni-spacing-col-sm $uni-spacing-col-base;
}
</style>
