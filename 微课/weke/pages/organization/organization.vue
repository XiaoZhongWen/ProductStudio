<template>
	<view class="org-container">
		<view 
			class="card-container" 
			v-for="org in useOrgs.orgs" 
			:key="org._id" 
			@tap="onOrgCardTap(org._id)">
			<org-card :org="org"></org-card>
		</view>
		<view class="add-container" @tap="onAddTap">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()

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

onMounted(async () => {
	console.info("organization page...")
	if (usersStore.isLogin) {
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		uni.hideLoading()
	}
})

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
