<template>
	<view class="portraitContainer">
		<view class="content portrait">
			<text class="text">用微信头像</text>
			<image class="img" :src="usersStore.owner.avatarUrl" mode="aspectFill"></image>
		</view>
		<view class="content">
			<text>从相册选择</text>
		</view>
		<view class="content">
			<text>拍照</text>
		</view>
		<view class="space"></view>
		<view class="content">
			<text>取消</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
const usersStore = useUsersStore()
</script>

<style lang="scss" scoped>
.portraitContainer {
	$item-height: 50px;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: $wk-bg-color-grey;
	.portrait {
		$item-height: 60px
	}
	.content {
		width: 100%;
		height: $item-height;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: white;
		margin-bottom: 0.5px;
		font-size: $uni-font-size-base;
		color: $wk-text-color;
		.text {
			display: block;
		}
		.img {
			width: 20px;
			height: 20px;
			margin-top: $uni-spacing-col-sm;
			border-radius: $uni-border-radius-sm;
		}
	}
	.space {
		height: 10px;
		width: 100%;
		background-color: $wk-bg-color-grey;
	}
	:last-child {
		margin-bottom: 0px;
	}
}
</style>