<template>
	<view class="invite-card-container">
		<wk-icon class="icon" :text="props.name"></wk-icon>
		<view class="sub-container">
			<text class="name">{{props.name}}</text>
			<button class="btn" open-type="share">
				<text class="invite">邀请</text>
				<uni-icons class="weixin" type="weixin" color="white" size="16"></uni-icons>
			</button>
		</view>
		<uni-icons class="icon-minus" type="minus-filled" color="#5073D6" size="24"></uni-icons>
	</view>
</template>

<script setup lang="ts">
import { onShareAppMessage } from '@dcloudio/uni-app'
const props = defineProps(['name'])

onShareAppMessage(() => {
	const title = "向你发起老师邀请"
	const path = "/pages/mine/mine"
	return {
		title: title,
		path: path
	}
})
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
	}
	.sub-container {
		display: flex;
		flex-direction: column;
		margin-left: 10px;
		color: $wk-text-color;
		.name {
			font-size: $uni-font-size-base;
		}
		.btn {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 50px;
			height: 20px;
			padding-left: 0;
			padding-right: 0;
			background-color: $wk-theme-color;
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
		button::after {
			border-width: 0;
		}
	}
	.icon-minus {
		position: absolute;
		right: $uni-spacing-row-base;
		bottom: 10px;
	}
}
</style>