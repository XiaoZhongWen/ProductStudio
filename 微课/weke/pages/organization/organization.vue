<template>
	<view class="org-container">
		<view 
			class="card-container" 
			v-for="org in orgs" 
			:key="org._id" 
			@tap="onOrgCardTap(org._id)">
			<org-card :org="org"></org-card>
		</view>
		<view 
			class="add-container" 
			@tap="onAddTap" 
			v-if="isShowAddBtn">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { onLoad } from '@dcloudio/uni-app'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"
import { Org } from "../../types/org";

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const userId = ref(usersStore.owner._id)

onLoad(async (option) => {
	const { id } = option as {id:string}
	if (typeof(id) !== 'undefined' && id.length > 0) {
		userId.value = id
	}
})

// @ts-ignore
const orgs = computed({
	get() {
		if (userId.value === usersStore.owner._id) {
			// 机构负责人 | 老师
			let res:Org[] = []
			if (usersStore.owner.from === 'wx') {
				const forCreator = useOrgs.orgs.filter(org => {
					return org.creatorId === userId.value
				})
				const forTeacher = useOrgs.orgs.filter(org => {
					return org.teacherIds?.includes(userId.value)
				})
				if (usersStore.owner.roles?.includes(1)) {
					res.push(...forCreator)
				}
				if (usersStore.owner.roles?.includes(2)) {
					let orgIds:string[] = []
					if (res.length > 0) {
						orgIds = res.map(item => item._id)
					}
					forTeacher.forEach(item => {
						if (!orgIds.includes(item._id)) {
							res.push(item)
						}
					})
				}
			} else {
				// 学生
				const forStudent = useOrgs.orgs.filter(org => {
					return org.studentIds?.includes(userId.value)
				})
				res.push(...forStudent)
			}
			return res
		} else {
			// 家长, 这里的userId指的是被关联学员的userId
			return useOrgs.orgs.filter(org => org.studentIds?.includes(userId.value))
		}
	}
})

const isShowAddBtn = computed(() => {
	const id = usersStore.owner._id
	return usersStore.owner.roles?.includes(1) && id === userId.value
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addOrganization/addOrganization"
	})
}

const onOrgCardTap = (orgId:string) => {
	uni.navigateTo({
		url: "/pages/addOrganization/addOrganization?orgId="+orgId
	})
}

</script>

<style lang="scss" scoped>
.org-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.card-container {
		width: 90%;
		height: 180px;
		margin: $uni-spacing-col-sm 0;
	}
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
		z-index: 1;
	}
}
</style>
