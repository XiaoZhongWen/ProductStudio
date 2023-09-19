<template>
	<view>
		<scroll-view scroll-y="true" show-scrollbar=false enhanced=true>
			<!-- 个人信息 -->
			<Profile @login="onLogin"></Profile>
			
			<!-- 机构相关 -->
			<view class="org-container">
				<uni-list>
					<uni-list-item link v-for="item in org" :key="item.name" :to="item.to">
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
								<text class="slot-text">{{item.name}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 孩子相关 -->
			<view class="children-container" v-if="children.length > 0">
				<uni-list>
					<uni-list-item link v-for="child in children" :key="child._id">
						<template v-slot:header>
							<view class="slot-box">
								<image class="icon" :src="child.avatarUrl" mode="aspectFill"></image>
								<!-- <uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons> -->
								<text class="nickName">{{child.nickName}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 账号相关 -->
			<view class="account-container">
				<uni-list>
					<uni-list-item link v-for="item in account" :key="item.name" :to="item.to">
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
								<text class="slot-text">{{item.name}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<!-- 其他 -->
			<view class="other-container">
				<uni-list>
					<uni-list-item link v-for="item in other" :key="item.name" :to="item.to">
						<template v-slot:header>
							<view class="slot-box">
								<uni-icons class="icon" :type="item.type" color="#fcaf2c" size=22></uni-icons>
								<text class="slot-text">{{item.name}}</text>
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
import { ref, watch, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onLoad } from '@dcloudio/uni-app'
import Profile from "./components/Profile.vue"
import LoginAuth from './components/LoginAuth.vue'
import SelectRole from './components/SelectRole.vue'
import { useUsersStore } from "@/store/users"

const is_mask_click = ref(false)
const usersStore = useUsersStore()
const global = getApp().globalData!

let inviteOrgId = ''
let invitePhoneNumber = ''

onLoad((option) => {
	const { orgId, phoneNumber, timestamp } = option as {
		orgId:string|undefined,
		phoneNumber: string|undefined,
		timestamp: number|undefined
	}
	if (typeof(orgId) !== 'undefined' && orgId.length > 0 &&
		typeof(phoneNumber) !== 'undefined' && phoneNumber.length > 0 &&
		typeof(timestamp) !== 'undefined' && timestamp > Date.now()) {
		inviteOrgId = orgId
		invitePhoneNumber = phoneNumber
	}
})

const loginAuthPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const selectRolePopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

type ListItem = {
	type: string,
	name: string
	to: string
}

// @ts-ignore
const org:ListItem[] = computed({
	get() {
		let org = [
			{
				type: "shop-filled",
				name: "机构",
				to: "/pages/organization/organization",
			},
			{
				type: "person-filled",
				name: "老师",
				to: "/pages/teacher/teacher"
			},
			{
				type: "chatboxes-filled",
				name: "班级",
				to: "/pages/grade/grade"
			},
			{
				type: "gear-filled",
				name: "设置",
				to: "/pages/setting/setting"
			}
		]
		const roles = new Set(usersStore.owner.roles)
		if (roles.size === 0) {
			org = []
		} else {
			if (roles.has(4) && roles.size === 1) {
				// 家长
				org = []
			} else if (!roles.has(1)) {
				org.splice(1, 1)
			}
		}
		return org
	}
})

// @ts-ignore
const account:ListItem[] = computed({
	get() {
		let account = [
			{
				type: "phone-filled",
				name: "绑定手机号",
				to: "/pages/bindphone/bindphone"
			},
			{
				type: "upload-filled",
				name: "邀请",
				to: "/pages/share/share"
			},
			{
				type: "vip-filled",
				name: "会员中心",
				to: "/pages/memberCenter/memberCenter"
			}
		]
		const roles = new Set(usersStore.owner.roles)
		if (roles.size === 0) {
			account = []
		} else {
			if (!roles.has(3)) {
				account[1].name = "分享"
			}
		}
		return account
	}
})

 // @ts-ignore
 const children:User[] = computed({
	 get() {
		 const roles = usersStore.owner.roles ?? []
		 if (roles.length === 0 || !roles.includes(4)) {
			 console.info("onChildren: " + roles)
		 	return []
		 } else {
			 console.info("onChildren: " + usersStore.children)
			 return usersStore.children
		 }
	 }
 })
 
 const other:ListItem[] = [
	 {
	 	type: "navigate-filled",
	 	name: "新手指南",
		to: "/pages/guider/guider"
	 },
	 {
	 	type: "chatboxes-filled",
	 	name: "反馈意见",
		to: "/pages/feedback/feedback"
	 },
	 {
	 	type: "heart-filled",
	 	name: "关于我们",
		to: "/pages/about/about"
	 }
 ]

onMounted(() => {
	selectRole()
})

// @ts-ignore
const { isLogin } = storeToRefs(usersStore)
watch(isLogin, () => {
	selectRole()
})

const selectRole = () => {
	if (usersStore.isLogin) {
		const roles = usersStore.owner.roles ?? []
		is_mask_click.value = !(usersStore.isLogin && roles.length === 0)
		if (roles.length === 0) {
			showSelectRole()
			uni.hideTabBar()
		}
		if (inviteOrgId.length > 0 && invitePhoneNumber.length > 0) {
			const mobile = usersStore.owner.mobile
			if (typeof(mobile) === 'undefined' || mobile.length === 0) {
				uni.showToast({
					title:"请绑定手机号",
					duration:global.duration_toast,
					icon:"none"
				})
			} else if (mobile === invitePhoneNumber) {
				// 1. 添加到机构的老师集合中
				// 2. 提醒用户加入机构成功
			}
		}
	} else {
		if (inviteOrgId.length > 0 && invitePhoneNumber.length > 0) {
			uni.showToast({
				title:"请登录注册",
				duration:global.duration_toast,
				icon:"none"
			})
		}
	}
}

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

const showSelectRole = () => {
	// selectRole数据重置
	uni.$emit(global.event_name.showSelectRole)
	// open
	selectRolePopup.value?.open()
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

uni.$on(global.event_name.didSelectedRole, () => {
	selectRolePopup.value?.close()
})

uni.$on(global.event_name.selectRole, () => {
	showSelectRole()
	uni.hideTabBar()
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
		.slot-text, .nickName {
			margin-left: $uni-padding-normal;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			font-weight: 400;
		}
		.nickName {
			position: relative;
			top: -6px;
		}
		.icon {
			width: 30px;
			height: 30px;
			border-radius: $uni-border-radius-circle;
			position: relative;
			top: 3px;
		}
	}
}
</style>
