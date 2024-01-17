<!-- 用户信息组件 -->
<template>
	<view class="profile-container">
		<view class="left-container" @tap="onLoginTap">
			<!-- 会员头像 -->
			<template v-if="usersStore.isLogin">
				<wk-icon 
					class="icon" 
					:url="usersStore.owner.avatarUrl"
					:text="nicknameBrief"></wk-icon>
				<!-- 会员标识 -->
				<uni-icons class="member" type="vip-filled" color="white" size=20></uni-icons>
			</template>
			<template v-else>
				<image class="icon" src="@/static/icon/profile.png" mode="aspectFill"></image>
			</template>
		</view>
		<view class="right-container">
			<template v-if="usersStore.isLogin">
				<view class="top">
					<!-- 昵称 -->
					<text class="nickname">{{usersStore.owner.nickName}}</text>
					<!-- 角色 -->
					<view class="tags" @tap="onTagTap">
						<template v-for="roleName in usersStore.roleNames" :key="roleName">
							<WkTag class="tag" :content="roleName"></WkTag>
						</template>
					</view>
				</view>
				<!-- 个性签名 -->
				<view class="" @tap="onSignatureTap">
					<text class="sign">{{ usersStore.signature }}</text>
					<uni-icons type="compose" color="#c0c0c0" size=12></uni-icons>
				</view>
				<!-- 有效期 -->
				<template v-if="usersStore.owner.from === 'wx'">
					<template v-if="usersStore.isExpired">
						<text class="expired">{{"会员已于" + yyyyMMdd(new Date(usersStore.owner.expireDate)) + "过期"}}</text>
					</template>
					<template v-else>
						<view class="expired">
							<text>有效期至:</text>
							<uni-dateformat 
								style="display: inline;" 
								:date="usersStore.owner.expireDate"
								format="yyyy/MM/dd" />
						</view>
					</template>
				</template>
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
import { computed } from 'vue';
import { yyyyMMdd } from '@/utils/wk-date'

const global = getApp().globalData!
const usersStore = useUsersStore()
const emit = defineEmits(['login'])

const onLoginTap = () => {
	const tempFileUrl = usersStore.owner.tempFileUrl ?? ''
	if (tempFileUrl.length === 0) {
		usersStore.updateTempFileUrl(usersStore.owner.avatarUrl ?? '')
	}
	// 子组件向父组件传递事件
	emit(global.event_name.login)
}

const onTagTap = () => {
	uni.$emit(global.event_name.selectRole)
}

const onSignatureTap = () => {
	console.info("onSignatureTap...")
	uni.navigateTo({
		url: "/pages/signature/signature"
	})
}

const nicknameBrief = computed(() => {
	const nickname = usersStore.owner.nickName
	const length = nickname.length
	return length > 2? nickname.substring(length - 2):nickname
})

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
		flex: 1;
		padding: $uni-padding-base $uni-padding-base $uni-padding-base 16px;
		.top {
			margin-top: $uni-spacing-col-sm;
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
			margin-top: auto;
			margin-bottom: auto;
		}
	}
}
</style>