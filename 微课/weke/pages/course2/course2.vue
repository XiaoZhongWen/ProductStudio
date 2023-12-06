<template>
	<view class="course-container">
		<wk-course-component :orgId="organizationId" />
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
import { computed, ref } from "vue"
import { onLoad } from '@dcloudio/uni-app'

const usersStore = useUsersStore()

const organizationId = ref('')
onLoad((option) => {
	const { orgId } = option as {
		orgId?: string
	}
	if (typeof(orgId) !== 'undefined' && orgId.length > 0) {
		organizationId.value = orgId
	}
})

// @ts-ignore
const isShowAddBtn = computed({
	get() {
		return usersStore.owner.roles?.includes(1) ||
				usersStore.owner.roles?.includes(2)
	}
})

const onAddTap = () => {
	let url = "/pages/addCourse/addCourse"
	if (organizationId.value.length > 0) {
		url = "/pages/addCourse/addCourse?orgId=" + organizationId.value
	}
	uni.navigateTo({
		url
	})
}
</script>

<style lang="scss">
.course-container {
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
