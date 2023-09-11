<template>
	<view class="org-container">
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

onMounted(async () => {
	console.info("organization page...")
	if (usersStore.isLogin) {
		useOrgs.loadOrgData()
	}
})

</script>

<style lang="scss" scoped>
.org-container {
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
