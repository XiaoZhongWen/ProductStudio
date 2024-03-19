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
							<view class="slot-box" v-if="item.type !== 'phone-filled'">
								<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
								<text class="slot-text">{{item.name}}</text>
							</view>
							<button v-else open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" class="slot-box btn" :plain="true">
								<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
								<text class="slot-text">{{item.name}}</text>
							</button>
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
								<uni-icons class="icon" :type="item.type" color="#007aff" size=22></uni-icons>
								<text class="slot-text">{{item.name}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			
			<uni-card title="嗒嗒课吧" sub-title="服务号" extra="点我关注" thumbnail="/static/icon/app_icon.png" @tap="followMe">
				<text class="uni-body">关注嗒嗒课吧服务号，您将接收到上课提醒、消课提醒、排课通知、课程变更通知、课程取消通知、课程充值通知、课程绑定通知等</text>
			</uni-card>
			
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
import { onLoad, onUnload } from '@dcloudio/uni-app'
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
const students = ref<Student[]>([])

let inviteOrgId = ''
let invitePhoneNumber = ''
let backToOrder = false

onLoad((option) => {
	const { orgId, phoneNumber, timestamp } = option as {
		orgId:string|undefined,
		phoneNumber: string|undefined,
		timestamp: number|undefined
	}
	
	if (typeof(orgId) !== 'undefined' && orgId.length > 0 &&
		typeof(phoneNumber) !== 'undefined' && phoneNumber.length > 0) {
		inviteOrgId = orgId
		invitePhoneNumber = phoneNumber
	}
	
	uni.$on(global.event_name.didSelectedRole, async () => {
		selectRolePopup.value?.close()
		await fetchChildren()
		showBindPhone()
		toOrder()
	})
	
	uni.$on(global.event_name.selectRole, () => {
		showSelectRole()
		uni.hideTabBar()
	})
	
	uni.$on(global.event_name.showWkProtocol, () => {
		uni.navigateTo({
			url: "/pages/webPage/webPage?targetUrl=" + global.domain + "agreement/user/index.html"
		})
	})
	
	uni.$on(global.event_name.login, async (data) => {
		console.info(Date.now() + " global.event_name.login " + data)
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
				icon:"none"
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
				icon:"none"
			})
			return
		}
		try {
			onPopup()
			uni.showLoading({
				title: '正在登录...'
			})
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
			let isUpdated = true
			uni.hideLoading()
			// 6. 更新云端用户信息
			if ((isUpdatedPortrait || isUpdatedNickname) &&
				(usersStore.owner.from === 'stuNo' ||
				(usersStore.owner.from === 'wx' && (unionid.length > 0 || openid.length > 0)))) {
				isUpdated = await usersStore.updateCloudUser()
				if (isUpdated) {
					loadInitialData()
				} else {
					uni.showToast({
						title:"用户信息更新失败",
						duration:global.duration_toast,
						icon:"none"
					})
				}
			}
		} catch(e) {
			console.error(e)
		}
	})
	uni.$on("backToOrder", () => {
		backToOrder = true
		loginOptionPopup.value?.open()
	})
})

onUnload(() => {
	uni.$off(global.event_name.didSelectedRole)
	uni.$off(global.event_name.selectRole)
	uni.$off(global.event_name.showWkProtocol)
	uni.$off(global.event_name.login)
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
			const roles = usersStore.owner.roles ?? []
			if (roles.length === 0) {
				org = []
			} else {
				if (roles.includes(3) && roles.length === 1) {
					// 家长
					org = []
				} else if (!roles.includes(1)) {
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
		const memberItem = {
			type: "vip-filled",
			name: "会员中心",
			to: "/pages/memberCenter/memberCenter"
		}
		const phoneItem = {
			type: "phone-filled",
			name: "绑定手机号"
		}
		const bindStuNoItem = {
			type: "auth-filled",
			name: "绑定学号",
			to: "/pages/bind/bind?type=studentNo"
		}
		const order = {
			type: "cart-filled",
			name: "订单",
			to: "/pages/order/order"
		}
		let s = []
		const roles = usersStore.owner.roles ?? []
		if (usersStore.owner.from === 'wx' && roles.length > 0) {
			if (roles.includes(3)) {
				s.push(bindStuNoItem)
			}
			const mobile = usersStore.owner.mobile ?? ''
			if (mobile.length === 0) {
				s.push(phoneItem)
			}
			if (roles.includes(1) || roles.includes(2)) {
				s.push(memberItem)
				s.push(order)
			}
		}
		return s
	}
})

const followMe = async () => {
	uni.showLoading({
		title: "加载中..."
	})
	const result = await uniCloud.getTempFileURL({
		fileList: ["cloud://tcb-pwxt7mejf8zs8rb-1cwte216d53a.7463-tcb-pwxt7mejf8zs8rb-1cwte216d53a-1319472732/ddkb/qrCode/fwh.jpg"]
	})
	uni.hideLoading()
	const { tempFileURL } = result.fileList[0]
	if (typeof(tempFileURL) !== 'undefined' && tempFileURL.length > 0) {
		uni.previewImage({
			urls:[tempFileURL]
		})
	}
}
 
const other:ListItem[] = [{
	type: "gear-filled",
	name: "设置",
	to: "/pages/setting/setting"
}]

onMounted(async () => {
	uni.showLoading({
		title: "加载中"
	})
	selectRole()
	await fetchChildren()
	uni.hideLoading()
	handleTeacherInvite()
})

// @ts-ignore
const { isLogin, beInvited } = storeToRefs(usersStore)
watch(isLogin, () => {
	if (isLogin) {
		selectRole()
	}
})

watch(beInvited, () => {
	if (beInvited) {
		handleTeacherInvite()
	}
})

const selectRole = () => {
	if (usersStore.owner.from === 'wx') {
		if (usersStore.isLogin) {
			const roles = usersStore.owner.roles ?? []
			is_mask_click.value = !(usersStore.isLogin && roles.length === 0)
			if (roles.length === 0) {
				showSelectRole()
				uni.hideTabBar()
			} else {
				showBindPhone()
				toOrder()
			}
		}
	} else if (usersStore.owner.from === 'stuNo') {
		toOrder()
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

const onStuNoLogin = async(data:{stuNo:string, pwd:string}) => {
	const { stuNo, pwd } = data
	// 1. 验证学号
	if (typeof(stuNo) === 'undefined' || stuNo.length === 0) {
		uni.showToast({
			title:"请输入学号",
			duration:global.duration_toast,
			icon:"none"
		})
		return
	}
	// 2. 验证密码
	if (typeof(pwd) === 'undefined' || pwd.length === 0) {
		uni.showToast({
			title:"请输入密码",
			duration:global.duration_toast,
			icon:"none"
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
			icon:"none"
		})
	}
}

const nickNameBrief = (nickName:string) => {
	const length = nickName.length
	const briefName = length > 2?nickName.substring(length - 2):nickName
	return briefName
}

const showBindPhone = () => {
	if (usersStore.owner.from === 'wx') {
		const mobile = usersStore.owner.mobile ?? ''
		if (typeof(mobile) === 'undefined' || mobile.length === 0) {
			console.info("手机号空")
			uni.showToast({
				title:"请绑定手机号",
				duration:global.duration_toast,
				icon:"none"
			})
		}
	}
}

const getPhoneNumber = async (e) => {
	const { code } = e.detail
	const result = await usersStore.fetchPhoneNumber(code)
	const res = typeof(result) !== 'undefined' && result.length > 0
	uni.showToast({
		title: res? "绑定成功": "绑定失败",
		duration: global.duration_toast,
		icon: res? "success": "none"
	})
	if (result) {
		handleTeacherInvite()
	}
}

const handleTeacherInvite = async () => {
	if (typeof(inviteOrgId) !== 'undefined' &&
		typeof(invitePhoneNumber) !== 'undefined' &&
		inviteOrgId.length > 0 && 
	 	invitePhoneNumber.length > 0) {
		if (!usersStore.isLogin) {
			uni.showToast({
				title:"请先登录",
				duration:global.duration_toast,
				icon:"none"
			})
			return
		}
		const mobile = usersStore.owner.mobile ?? ''
		if (typeof(mobile) === 'undefined' || mobile.length === 0) {
			console.info("手机号空")
			showBindPhone()
		} else if (mobile === invitePhoneNumber) {
			console.info("手机号一致")
			// 1. 添加到机构的老师集合中
			const result = await orgsStore.addTeachers(inviteOrgId, [usersStore.owner._id])
			// 2. 提醒用户加入机构成功
			uni.showToast({
				title:result?"加入机构成功":"加入机构失败",
				duration:global.duration_toast,
				icon:result?"success":"none"
			})
		} else {
			console.info("手机号不一致")
			uni.showToast({
				title:"您绑定的手机号与受邀请的手机号不一致",
				duration:global.duration_toast,
				icon:"none"
			})
		}
	}
}

const loadInitialData = async () => {
	uni.showLoading({
		title: "正在加载初始数据",
		mask: true
	})
	await usersStore.loadAllEntries()
	await orgsStore.loadOrgData()
	if (usersStore.owner.from === 'wx') {
		await orgsStore.fetchAnonymousOrg()
	}
	uni.hideLoading()
}

const fetchChildren = async () => {
	if (usersStore.owner.from === 'wx') {
		const roles = usersStore.owner.roles ?? []
		if (roles.includes(3)) {
			const id = usersStore.owner._id
			students.value = await usersStore.fetchChildren(id)
			return
		}
	}
	students.value = []
}

const toOrder = () => {
	if (backToOrder) {
		uni.navigateTo({
			url: "/pages/order/order"
		})
		backToOrder = false
	}
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
	.btn {
		border-radius: 0;
		background-color: transparent;
		border: none;
		padding: 0;
		line-height: 1;
		width: 300px;
		text-align: left;
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
