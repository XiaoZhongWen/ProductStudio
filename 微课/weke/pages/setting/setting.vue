<template>
	<view class="setting-container">
		<button class="btn" type="default" @tap="onLogout">
			<text class="text">退出登录</text>
		</button>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()

const onLogout = () => {
	usersStore.$reset()
	useOrgs.$reset()
	uni.navigateBack()
}
	
</script>

<style lang="scss">

.setting-container {
	.btn {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: white;
		font-size: $uni-font-size-base;
		color: $uni-color-error;
		width: 300px;
		height: 40px;
		bottom: 50px;
		left: 50%;
		margin-left: -150px;
	}
	.btn::after {
		border-width: 0;
	}
}

</style>
