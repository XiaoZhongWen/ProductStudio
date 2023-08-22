<!-- 用户信息组件 -->
<template>
	<view class="profile-container">
		<view class="left-container">
			<!-- 会员头像 -->
			<!-- <image class="icon" src="@/static/icon/profile.png" mode="aspectFill"></image> -->
			<image 
				class="icon" 
				src="https://img1.baidu.com/it/u=506645129,3151761344&fm=253&fmt=auto&app=138&f=PNG?w=500&h=773" 
				mode="aspectFill">
			</image>
			<!-- 会员标识 -->
			<uni-icons class="member" type="vip-filled" color="#f4b240" size=26></uni-icons>
		</view>
		<view class="right-container">
			<view class="top">
				<!-- 昵称 -->
				<text class="nickname">Julien</text>
				<!-- 角色 -->
				<WkTag></WkTag>
				<!-- <uni-tag text="机构负责人" type="primary" size="mini" circle="true"></uni-tag> -->
			</view>
			<!-- 个性签名 -->
			<text class="sign">个性签名</text>
			<!-- 有效期 -->
			<text class="expired">有效期至2023年9月22日</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import WkTag from './WkTag.vue'
</script>

<style lang="scss" scoped>
.profile-container {
	$container-height: 80px;
	$icon-size: 60px;
	$member-left-offset: 75px;
	$member-top-offset: 6px;
	display: flex;
	width: 100%;
	height: $container-height;
	padding: 0 $uni-padding-normal 0 30px;
	box-sizing: border-box;
	.left-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: $icon-size;
		.icon {
			width: $icon-size;
			height: $icon-size;
			border-radius: $uni-border-radius-circle;
		}
		.member {
			position: absolute;
			left: $member-left-offset;
			top: $member-top-offset;
		}
	}
	.right-container {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		flex: 1;
		padding: $uni-padding-base $uni-padding-base $uni-padding-base 16px;
		.nickname {
			font-size: $uni-font-size-base;
			padding-right: $uni-spacing-row-base;
			font-weight: bold;
		}
		.sign, .expired {
			display: block;
			font-size: $uni-font-size-10;
			color: $uni-text-color-disable;
		}
	}
}
</style>