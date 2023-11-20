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

onLoad(async (option) => {
	const { gradeId } = option as {gradeId:string}
	if (typeof(gradeId) !== 'undefined' && gradeId.length > 0) {
		gId.value = gradeId
		uni.setNavigationBarTitle({
			title: "更新班级"
		})
	}
})

onMounted(() => {
	const id = usersStore.owner._id
	let result = useOrgs.orgs.filter(org => org.creatorId === id)
	if (gId.value.length > 0) {
		result = useOrgs.orgs.filter(org => org.classIds?.includes(gId.value))
	}
	if (result.length === 0) {
		uni.showToast({
			title: "请先创建机构",
			duration: global.duration_toast,
			icon: "error"
		})
	} else {
		orgs.value = result
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
