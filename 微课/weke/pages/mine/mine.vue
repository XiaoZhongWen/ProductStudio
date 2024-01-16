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
			
			<!-- 学生相关 -->
			<view class="student-container" v-if="students.length > 0">
				<uni-list>
					<uni-list-item link v-for="student in students" :key="student._id" @tap="onStudentTap(student._id)">
						<template v-slot:header>
							<view class="box">
								<view class="wk-icon">
									<wk-icon
										:text="nickNameBrief(student.nickName)"
										:url="student.avatarUrl">
									</wk-icon>
								</view>
								<text class="nickName">{{student.nickName}}</text>
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
			
			<!-- popup 登录选择 -->
			<uni-popup 
				ref="loginOptionPopup" 
				type="bottom" 
				background-color="white"
				@change="onChange">
				<LoginOption @onLoginOption="onLoginOption" />
			</uni-popup>
			
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
				@change="onChange"
				background-color="transparent">
				<SelectRole/>
			</uni-popup>
			
			<!-- popup 学号登录 -->
			<uni-popup 
				ref="loginStuNoPopup" 
				type="center"
				@onStuNoLogin="onStuNoLogin"
				background-color="transparent">
				<Login @onStuNoLogin="onStuNoLogin" />
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
import LoginOption from './components/LoginOption.vue'
import Login from './components/Login.vue'
import SelectRole from './components/SelectRole.vue'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from "@/store/orgs"
import { Student } from '../../types/user'
// @ts-ignore
import md5 from 'js-md5'

const is_mask_click = ref(false)
const usersStore = useUsersStore()
const orgsStore = useOrgsStore()
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

const loginOptionPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const loginAuthPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const selectRolePopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const loginStuNoPopup = ref<{
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
			}
		]
		if (usersStore.owner.from === 'wx') {
			const roles = new Set(usersStore.owner.roles)
			if (roles.size === 0) {
				org = []
			} else {
				if (roles.has(3) && roles.size === 1) {
					// 家长
					org = []
				} else if (!roles.has(1)) {
					org.splice(1, 1)
				}
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
				to: "/pages/bind/bind?type=mobile"
			},
			{
				type: "vip-filled",
				name: "会员中心",
				to: "/pages/memberCenter/memberCenter"
			}
		]
		if (usersStore.owner.from === 'wx') {
			const roles = new Set(usersStore.owner.roles)
			if (roles.size === 0) {
				account = []
			}
			if (usersStore.owner.roles?.includes(3)) {
				// 包含家长角色
				account.unshift({
					type: "auth-filled",
					name: "绑定学号",
					to: "/pages/bind/bind?type=studentNo"
				})
			}
		} else {
			account = []
		}
		return account
	}
})

 // @ts-ignore
 const students:Student[] = computed({
	 get() {
		 if (usersStore.owner.from === 'wx') {
			 const roles = usersStore.owner.roles ?? []
			 if (roles.includes(3)) {
				const id = usersStore.owner._id
				const result = usersStore.students.filter(student => student.associateIds?.includes(id))
			 	return result
			 } else {
				return []
			 }
		 } else {
			return [] 
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
	 },
	 {
	 	type: "gear-filled",
	 	name: "设置",
	 	to: "/pages/setting/setting"
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
	if (usersStore.owner.from === 'wx') {
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
	} else if (usersStore.owner.from === 'stuNo') {
		
	}
}

const onLogin = () => {
	if (usersStore.isLogin) {
		loginAuthPopup.value?.open()
	} else {
		loginOptionPopup.value?.open()
	}
}

const onPopup = () => {
	loginAuthPopup.value?.close()
}

const onChange = (e: UniHelper.UniPopupOnChangeEvent) => {
	e.show? uni.hideTabBar(): uni.showTabBar()
}

const onStudentTap = (id:string) => {
	uni.navigateTo({
		url:`/pages/member-student/member-student?id=${id}`
	})
}

const onLoginOption = (data: {from:string}) => {
	loginOptionPopup.value?.close()
	if (data.from === 'wx') {
		loginAuthPopup.value?.open()
	} else if (data.from === 'stu-num') {
		loginStuNoPopup.value?.open()
	}
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
	try {
		// 3. 登录
		if (usersStore.owner.from !== 'stuNo') {
			await usersStore.login()
		}
		// 4. 上传头像
		const isUpdatedPortrait = await usersStore.uploadPortrait()
		// 5. 更新昵称
		const isUpdatedNickname = usersStore.updateNickname(nickname)
		const unionid = usersStore.owner.unionid ?? ''
		const openid = usersStore.owner.openid ?? ''
		// 6. 更新云端用户信息
		if ((isUpdatedPortrait || isUpdatedNickname) &&
			(usersStore.owner.from === 'stuNo' ||
			(usersStore.owner.from === 'wx' && (unionid.length > 0 || openid.length > 0)))) {
			const isUpdated = await usersStore.updateCloudUser()
			if (isUpdated) {
				// 7. 退出界面
				onPopup()
				loadInitialData()
			} else {
				uni.showToast({
					title:"用户信息更新失败",
					duration:global.duration_toast,
					icon:"error"
				})
			}
		} else {
			onPopup()
		}
	} catch(e) {
		console.error(e)
	}
})

const onStuNoLogin = async(data:{stuNo:string, pwd:string}) => {
	const { stuNo, pwd } = data
	// 1. 验证学号
	if (typeof(stuNo) === 'undefined' || stuNo.length === 0) {
		uni.showToast({
			title:"请输入学号",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	// 2. 验证密码
	if (typeof(pwd) === 'undefined' || pwd.length === 0) {
		uni.showToast({
			title:"请输入密码",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	uni.showLoading({
		title: '正在登录...'
	})
	await usersStore.login('stuNo', stuNo, md5(pwd))
	uni.hideLoading()
	if (usersStore.isLogin) {
		loginStuNoPopup.value?.close()
		loadInitialData()
	} else {
		uni.showToast({
			title:"学号或密码错误",
			duration:global.duration_toast,
			icon:"error"
		})
	}
}

const nickNameBrief = (nickName:string) => {
	const length = nickName.length
	const briefName = length > 2?nickName.substring(length - 2):nickName
	return briefName
}

uni.$on(global.event_name.didSelectedRole, () => {
	selectRolePopup.value?.close()
})

uni.$on(global.event_name.selectRole, () => {
	showSelectRole()
	uni.hideTabBar()
})

const loadInitialData = async () => {
	uni.showLoading({
		title: "正在加载初始数据",
		mask: true
	})
	await usersStore.fetchStudents()
	await usersStore.loadAllEntries()
	await orgsStore.loadOrgData()
	if (usersStore.owner.from === 'wx') {
		await orgsStore.fetchAnonymousOrg()
	}
	uni.hideLoading()
}

</script>

<style lang="scss">
.org-container, .student-container, .account-container, .other-container {
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
		.icon {
			width: 30px;
			height: 30px;
			border-radius: $uni-border-radius-circle;
			position: relative;
			top: 3px;
		}
	}
}

.student-container {
	.box {
		position: relative;
		flex-direction: row;
		align-items: center;
		.wk-icon {
			width: 30px;
			height: 30px;
		}
		.nickName {
			position: absolute;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
			font-weight: 400;
			display: block;
			width: 100px;
			bottom: 4px;
			left: 40px;
		}
	}
}

</style>
