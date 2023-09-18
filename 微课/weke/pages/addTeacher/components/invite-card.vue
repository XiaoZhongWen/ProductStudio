<template>
	<view class="invite-card-container">
		<uni-icons class="icon-minus" type="minus-filled" color="#dd524d" size="24" @tap="onDeleteTap"></uni-icons>
		<wk-icon class="icon" :text="props.info.name.length > 0?props.info.name.substring(props.info.name.length - 2):props.info.name"></wk-icon>
		<view class="sub-container">
			<text class="name">{{props.info.name}}</text>
			<text class="status">等待验证(有效期2小时)</text>
		</view>
		<button class="btn" open-type="share">
			<text class="invite">邀请</text>
			<uni-icons class="weixin" type="weixin" color="white" size="16"></uni-icons>
		</button>
	</view>
</template>

<script setup lang="ts">
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"

const props = defineProps(['info'])
const emit = defineEmits(['onDeleteTap'])
const usersStore = useUsersStore()

onShareAppMessage(() => {
	const { orgId, phoneNumber, timestamp } = props.info
	const title = usersStore.owner.nickName + "向你发起老师邀请"
	const path = `/pages/mine/mine?orgId=${orgId}&phoneNumber=${phoneNumber}&timestamp=${timestamp}`
	return {
		title: title,
		path: path
	}
})

const onDeleteTap = () => {
	emit("onDeleteTap", {info:props.info})
}

</script>

<style lang="scss" scoped>
.invite-card-container {
	position: relative;
	display: flex;
	flex-direction: row;
	align-items: center;
	height: 50px;
	border-bottom: 0.5px solid $wk-bg-color-grey;
	padding: 0 0 0 $uni-spacing-col-lg;
	.icon {
		width: 30px;
		height: 30px;
		border-radius: $uni-border-radius-circle;
		margin-left: $uni-spacing-row-base;
	}
	.sub-container {
		margin-left: $uni-spacing-row-sm;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		.name {
			font-size: $uni-font-size-base;
			color: $wk-text-color;
		}
		.status {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
	}
	.btn {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 20px;
		padding-left: 0;
		padding-right: 0;
		background-color: $uni-color-success;
		right: $uni-spacing-row-lg;
		.invite {
			position: relative;
			font-size: $uni-font-size-sm;
			color: white
		}
		.weixin {
			position: relative;
			left: 2px;
		}
	}
	.btn::after {
		border-width: 0;
	}
}
</style>