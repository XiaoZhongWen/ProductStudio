<template>
	<view class="teacher-container">
		<button
			open-type="share"
			class="add-container" 
			v-if="usersStore.owner.roles?.includes(1)">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</button>
	</view>
</template>

<script setup lang="ts">
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"

const usersStore = useUsersStore()

onShareAppMessage(() => {
	const title = usersStore.owner.nickName + "向你发起老师邀请"
	const path = "/pages/mine/mine?id=" + usersStore.owner._id
	return {
		title: title,
		path: path
	}
})

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
		z-index: 1;
	}
}
</style>
