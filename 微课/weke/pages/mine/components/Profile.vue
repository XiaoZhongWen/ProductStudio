<!-- 用户信息组件 -->
<template>
	<view class="profile-container">
		<view class="left-container">
			<!-- 会员头像 -->
			<image class="icon" src="@/static/icon/profile.png" mode="aspectFill"></image>
			<!-- 会员标识 -->
			<uni-icons type="vip-filled"></uni-icons>
		</view>
		<view class="right-container">
			<view class="top">
				<!-- 昵称 -->
				<text>Julien</text>
				<!-- 角色 -->
				<text>机构负责人</text>
			</view>
			<!-- 个性签名 -->
			<text>个性签名</text>
			<!-- 有效期 -->
			<text>有效期至2023年9月22日</text>
		</view>
	</view>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.profile-container {
	display: flex;
	width: 100%;
	height: 160rpx;
	.left-container {
		width: 120rpx;
		.icon {
			width: 80rpx;
			height: 80rpx;
		}
	}
	.right-container {
		flex: 1;
	}
}
</style>