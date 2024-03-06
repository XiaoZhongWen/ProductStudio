<template>
	<view class="order-card-container">
		<view class="container">
			<view class="row">
				<view class="left">
					<image class="logo" src="../../../static/icon/logo.png" mode=""></image>
					<text class="name">嗒嗒课吧</text>
				</view>
				<view class="status">{{statusDesc()}}</view>
			</view>
			<view class="sub-text">
				<view class="time">{{format(new Date(props.order.create_date))}}</view>
				<view class="order-no">订单号: {{props.order.order_no}}</view>
			</view>
			<view class="row body">
				<text>{{props.order.description}}</text>
			</view>
			<view class="bottom" v-if="props.order.status === 1">
				计：¥{{feeDesc()}}元
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { format } from '@/utils/wk-date'
const props = defineProps(["order"])

const statusDesc = () => {
	let desc = ""
	if (props.order.status === 0) {
		desc = "未支付"
	} else if (props.order.status === 1) {
		desc = "已支付"
	}
	return desc
}

const feeDesc = () => {
	if (props.order.total_fee > 100) {
		return props.order.total_fee / 100 + ".00"
	} else {
		return props.order.total_fee / 100
	}
}

</script>

<style lang="scss" scoped>
.order-card-container {
	width: 100%;
	height: 160px;
	display: flex;
	justify-content: center;
	align-items: center;
	.container {
		width: 96%;
		height: 100%;
		background-color: white;
		border-radius: $uni-border-radius-lg;
		display: flex;
		flex-direction: column;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			.left {
				display: flex;
				flex-direction: row;
				align-items: center;
				.logo {
					width: 20px;
					height: 20px;
				}
				.name {
					font-size: $uni-font-size-sm;
					color: $wk-text-color;
					margin-left: $uni-spacing-row-sm;
				}
			}
			.status {
				font-size: $uni-font-size-base;
				color: $wk-text-color;
			}
		}
		.sub-text {
			font-size: $uni-font-size-sm;
			color: $uni-text-color-grey;
		}
		.body {
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			padding: 20px 0;
			border-top: solid 0.5px $wk-bg-color-grey;
			border-bottom: solid 0.5px $wk-bg-color-grey;
			margin: $uni-spacing-col-sm 0;
		}
		.bottom {
			display: flex;
			flex-direction: row;
			justify-content: flex-end;
			font-size: $uni-font-size-base;
			color: $wk-theme-color;
		}
	}
}
</style>