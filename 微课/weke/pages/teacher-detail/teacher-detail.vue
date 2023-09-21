<template>
	<view class="teacher-detail-container">
		<view class="top" v-if="_teacherId.length > 0">
			<member-info
				:url="teacher.avatarUrl"
				:nickname="teacher.nickName"
				:mobile="teacher.mobile"
				:signature="teacher.signature">
			</member-info>
			<wk-circle-progress class="circle-progress"></wk-circle-progress>
			<text class="text" v-if="_orgId.length > 0">{{org.name}}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from "vue";
import { User } from '../../types/user';
import { Org } from '../../types/org';
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const _orgId = ref('')
const _teacherId = ref('')

onLoad((option) => {
	const { orgId, teacherId } = option as {orgId: string, teacherId:string}
	if (typeof(orgId) !== 'undefined' 
		&& typeof(teacherId) !== 'undefined') {
		const users = usersStore.users.filter(user => user._id === teacherId)
		if (users.length > 0) {
			const teacher = users[0]
			uni.setNavigationBarTitle({
				title: teacher.nickName ?? ''
			})
		}
		_orgId.value = orgId
		_teacherId.value = teacherId
	}
})

// @ts-ignore
const teacher = computed<User|undefined>({
	get() {
		if (_teacherId.value.length > 0) {
			const users = usersStore.users.filter(user => user._id === _teacherId.value)
			return users[0]
		} else {
			return undefined
		}
	}
})

// @ts-ignore
const org = computed<Org|undefined>({
	get() {
		if (_orgId.value.length) {
			const items = useOrgs.orgs.filter(item => item._id === _orgId.value)
			return items[0]
		} else {
			return undefined
		}
	}
})
	
</script>

<style lang="scss" scoped>
.teacher-detail-container {
	.top {
		position: relative;
		height: 100px;
		background-color: white;
		margin: $uni-spacing-row-base;
		border-radius: $uni-border-radius-base;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: $uni-padding-normal;
			right: $uni-padding-normal;
		}
		.text {
			position: absolute;
			left: $uni-padding-normal;
			bottom: $uni-padding-normal;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
	}
}
</style>
