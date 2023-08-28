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
			<uni-icons class="member" type="vip-filled" color="white" size=20></uni-icons>
		</view>
		<view class="right-container">
			<template v-if="usersStore.owner.isLogin">
				<view class="top">
					<!-- 昵称 -->
					<text class="nickname">Julien</text>
					<!-- 角色 -->
					<view class="tags">
						<WkTag class="tag" content="机构负责人"></WkTag>
						<WkTag class="tag" content="老师"></WkTag>
						<WkTag class="tag" content="家长"></WkTag>
					</view>
				</view>
				<!-- 个性签名 -->
				<view class="">
					<text class="sign">个性签名</text>
					<uni-icons type="compose" color="#c0c0c0" size=12></uni-icons>
				</view>
				<!-- 有效期 -->
				<text class="expired">有效期至2023年9月22日</text>
			</template>
			<template v-else>
				<view class="login" @tap="onLoginTap">点击登录</view>
			</template>
		</view>
	</view>
</template>

<script setup lang="ts">
import WkTag from './WkTag.vue'
import { useUsersStore } from '@/store/users'

const usersStore = useUsersStore()
const emit = defineEmits(['login'])

const onLoginTap = () => {
	emit('login')
}

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
			background-color: $wk-text-color-orange;
			border-radius: $uni-border-radius-circle;
			padding: 0 $uni-padding-sm;
		}
	}
	.right-container {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		flex: 1;
		padding: $uni-padding-base $uni-padding-base $uni-padding-base 16px;
		.top {
			display: flex;
			.nickname {
				position: relative;
				font-size: $uni-font-size-base;
				font-weight: bold;
				color: $wk-text-color;
				top: 3px;
			}
			.tags {
				display: inline-block;
				flex: 1;
				padding: 0 $uni-padding-normal;
				.tag {
					margin: 0 $uni-spacing-row-mini;
				}
			}
		}
		.sign {
			font-size: $uni-font-size-10;
			color: $wk-text-color-grey;
		}
		.expired {
			display: block;
			font-size: $uni-font-size-10;
			color: $wk-text-color-grey;
		}
		.login {
			font-size: $uni-font-size-base;
			color: $wk-text-color;
		}
	}
}
</style>