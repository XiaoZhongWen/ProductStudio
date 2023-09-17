<template>
	<view class="teacher-container">
		<button
			@tap="onAddTap"
			class="add-container" 
			v-if="usersStore.owner.roles?.includes(1)">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</button>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"

const usersStore = useUsersStore()

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
		z-index: 1;
	}
}
</style>
