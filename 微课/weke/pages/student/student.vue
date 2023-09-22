<template>
	<view class="student-container">
		<wk-student-component></wk-student-component>
		<view
			class="add-container" 
			@tap="onAddTap" 
			v-if="isShowAddBtn">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { computed } from "vue";

const usersStore = useUsersStore()

// @ts-ignore
const isShowAddBtn = computed({
	get() {
		return usersStore.owner.roles?.includes(1) ||
				usersStore.owner.roles?.includes(2)
	}
})

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addStudent/addStudent"
	})
}

</script>

<style lang="scss" scoped>
.student-container {
	.add-container {
		display: flex;
		position: fixed;
		justify-content: center;
		align-items: center;
		background-color: $wk-theme-color;
		width: 60px;
		height: 60px;
		border-radius: $uni-border-radius-circle;
		bottom: 30px;
		right: $uni-spacing-row-lg;
		z-index: 1;
	}
}

</style>
