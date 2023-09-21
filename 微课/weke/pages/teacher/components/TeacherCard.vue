<template>
	<view class="teacher-card-container" @tap="onCardTap">
		<view class="top">
			<member-info 
				:url="user.avatarUrl"
				:nickname="user.nickName"
				:mobile="user.mobile"
				:signature="user.signature">
			</member-info>
			<wk-circle-progress class="circle-progress"></wk-circle-progress>
		</view>
		<view class="bottom">
			<text class="text">{{org.name}}</text>
			<view class="icon-container" @tap.stop="onIconTap">
				<uni-icons id="course" class="icon" type="wallet-filled" color="#5073D6" size="24"></uni-icons>
				<uni-icons id="schedule" class="icon" type="calendar-filled" color="#5073D6" size="24"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const props = defineProps(['teacherId', 'orgId'])

const org = useOrgs.orgs.filter(org => org._id === props.orgId)[0]
const user = usersStore.users.filter(user => user._id === props.teacherId)[0]

const onCardTap = () => {
	uni.navigateTo({
		url: `/pages/member-teacher/member-teacher?orgId=${props.orgId}&teacherId=${props.teacherId}`
	})
}

// @ts-ignore
const onIconTap = (e) => {
	const { id } = e.target
	if (id === "course") {
		uni.navigateTo({
			url: "/pages/member-course/member-course"
		})
	}
	if (id === "schedule") {
		uni.navigateTo({
			url: "/pages/member-calendar/member-calendar"
		})
	}
}

</script>

<style lang="scss" scoped>
.teacher-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.top {
		position: relative;
		height: 60px;
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: 0;
			right: 0;
		}
	}
	.bottom {
		position: relative;
		height: 30px;
		.text {
			position: absolute;
			left: 0;
			bottom: 0;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
		.icon-container {
			position: absolute;
			right: 0;
			bottom: 0;
			.icon {
				margin-left: $uni-spacing-row-base;
			}
		}
	}
}
</style>