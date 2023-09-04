<template>
	<view>
		<scroll-view scroll-y="true" show-scrollbar=false enhanced=true>
			<!-- 个人信息 -->
			<Profile @login="onLogin"></Profile>
			
			<!-- 机构相关 -->
			<view class="org-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="shop-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">机构</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="person-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">老师</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="staff-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">学员</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="chatboxes-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">班级</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="wallet-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">课程</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="gear-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">设置</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 孩子相关 -->
			<view class="children-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="contact-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">大宝</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="contact-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">二宝</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 账号相关 -->
			<view class="account-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="phone-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">绑定手机号</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="weixin" color="#007aff" size=22></uni-icons>
								<text class="slot-text">绑定微信</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="upload-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">分享</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="vip-filled" color="#007aff" size=22></uni-icons>
								<text class="slot-text">会员中心</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 其他 -->
			<view class="other-container">
				<uni-list>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="navigate-filled" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">新手指南</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="chatboxes-filled" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">反馈意见</text>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item link>
						<!-- 自定义 header -->
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons type="heart-filled" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">关于我们</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- popup 登录授权 -->
			<uni-popup 
				ref="loginAuthPopup" 
				type="bottom"
				background-color="white"
				@change="onChange">
				<LoginAuth @on-popup="onPopup"></LoginAuth>
			</uni-popup>
			
			<!-- popup 选择角色 -->
			<uni-popup
				ref="selectRolePopup"
				type="center"
				:is-mask-click="is_mask_click"
				@change="onSelectRoleChange"
				background-color="transparent">
				<SelectRole/>
			</uni-popup>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Profile from "./components/Profile.vue"
import LoginAuth from './components/LoginAuth.vue'
import SelectRole from './components/SelectRole.vue'
import { useUsersStore } from "@/store/users"

const is_mask_click = ref(false)
const usersStore = useUsersStore()
const global = getApp().globalData!

const loginAuthPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const selectRolePopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

// @ts-ignore
watch(usersStore.owner, (newValue) => {
	if (newValue.isLogin) {
		const roles = usersStore.owner.roles ?? []
		is_mask_click.value = !(usersStore.owner.isLogin && roles.length === 0)
		if (roles.length === 0) {
			selectRolePopup.value?.open()
			uni.hideTabBar()
		}
	}
}, {
	immediate: true
})

const onLogin = () => {
	loginAuthPopup.value?.open()
}

const onPopup = () => {
	loginAuthPopup.value?.close()
}

const onChange = (e: UniHelper.UniPopupOnChangeEvent) => {
	e.show? uni.hideTabBar(): uni.showTabBar()
}

const onSelectRoleChange = (e: UniHelper.UniPopupOnChangeEvent) => {
	e.show? uni.hideTabBar(): uni.showTabBar()
}

uni.$on(global.event_name.showWkProtocol, () => {
	console.info('showWkProtcol')
})

uni.$on(global.event_name.login, async (data) => {
	// 1. 验证头像
	let url = usersStore.owner.tempFileUrl?.trim() ?? ""
	if (url.length === 0) {
		url = usersStore.owner.avatarUrl?.trim() ?? ""
		usersStore.updateTempFileUrl(url)
	}
	if (url.length === 0) {
		uni.showToast({
			title:"请设置头像",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	console.info("验证头像通过")
	// 2. 验证昵称
	let nickname = data.inputValue ?? ""
	if (nickname.length === 0) {
		nickname = usersStore.owner.nickName ?? ""
	}
	if (nickname.length === 0) {
		uni.showToast({
			title:"请设置昵称",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	console.info("验证昵称通过")
	try {
		// 3. 登录
		await usersStore.login()
		// 4. 上传头像
		const isUpdatedPortrait = await usersStore.uploadPortrait()
		// 5. 更新昵称
		const isUpdatedNickname = usersStore.updateNickname(nickname)
		const unionid = usersStore.owner.unionid ?? ''
		const openid = usersStore.owner.openid ?? ''
		// 6. 更新云端用户信息
		if (isUpdatedPortrait || 
			isUpdatedNickname &&
			(unionid.length > 0 || openid.length > 0)) {
			const isUpdated = await usersStore.updateCloudUser()
			if (isUpdated) {
				// 7. 退出界面
				onPopup()
			} else {
				uni.showToast({
					title:"用户信息更新失败",
					duration:global.duration_toast,
					icon:"error"
				})
			}
		} else {
			onPopup()
			console.info("头像及昵称均未变更")
		}
	} catch(e) {
		console.error(e)
	}
})

uni.$on(global.event_name.didSelectedRole, (data) => {
	selectRolePopup.value?.close()
})

</script>

<style lang="scss">
.org-container, .children-container, .account-container, .other-container {
	margin-top: $uni-spacing-col-lg;
	.uni-list {
		margin: 0 $uni-spacing-row-base;
		border-radius: $uni-border-radius-lg;
		background-color: white;
		.uni-list--border-top, .uni-list--border-bottom {
			height: 0px;
		}
		.uni-list-item {
			border-radius: $uni-border-radius-lg;
		}
	}
	.slot-box {
		flex-direction: row;
		align-items: center;
		.slot-text {
			margin-left: $uni-padding-normal;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			font-weight: 400;
		}
		uni-icons {
			position: relative;
			top: 3px;
		}
	}
}
</style>
