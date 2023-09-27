<template>
	<view class="add-teacher-container" v-for="org in useOrgs.myOrgs" :key="org._id">
		<view class="header">
			<wk-icon 
				class="icon" 
				:url="org.logoUrl" 
				:text="org.name.length > 2? org.name.substring(0, 2): org.name">
			</wk-icon>
			<text class="org-name">{{org.name}}</text>
		</view>
		<view class="org-teacher-container" v-if="org.teacherIds?.length ?? 0 > 0">
			<template v-for="teacherId in org.teacherIds" :key="teacherId">
				<template v-if="fetchUserById(teacherId)">
					<wk-portrait
						class="portrait"
						:url="fetchUserById(teacherId).avatarUrl" 
						:name="fetchUserById(teacherId).nickName">
					</wk-portrait>
				</template>
				<template v-else>
					<image class="icon" src="@/static/icon/profile.png" mode="aspectFill"></image>
				</template>
			</template>
		</view>
		<view class="invite-container">
			<template v-for="info in inviteInfos" :key="info.phoneNumber">
				<InviteCard 
					v-if="info.orgId === org._id" 
					:info="info" 
					@onDeleteTap="onDeleteTap"
				/>
			</template>
		</view>
		<view class="edit-container">
			<edit-card :orgId="org._id" 
				name="老师姓名" 
				mobile="手机号"  
				@onAddTap="onAddTap">
			</edit-card>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"
import { User } from '../../types/user'
import InviteCard from './components/invite-card'

type EditInfo = {
	orgId:string, 
	name:string, 
	phoneNumber:string,
	timestamp: number
}

const inviteInfos = ref<EditInfo[]>([])
const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const teachers = ref<User[]>([])
const global = getApp().globalData!

onShareAppMessage((option) => {
	const { from, target } = option
	if (from === "button") {
		const { orgId, phoneNumber, timestamp } = target.dataset.info
		const title = usersStore.owner.nickName + "向你发起老师邀请"
		const path = `/pages/mine/mine?orgId=${orgId}&phoneNumber=${phoneNumber}&timestamp=${timestamp}`
		console.info(path)
		return {
			title: title,
			path: path
		}
	} else {
		return {
			path: '/pages/mine/mine'
		}
	}
})

onMounted(async () => {
	console.info("organization page...")
	if (usersStore.isLogin) {
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		uni.hideLoading()
		useOrgs.myOrgs.forEach(async org => {
			const users:User[] = await usersStore.fetchUsers(org.teacherIds ?? [])
			teachers.value.push(...users)
		})
		
		uni.getStorage({
			key: usersStore.owner._id,
			success: (res) => {
				console.info("邀请数据获取成功")
				const data:EditInfo[] = res.data
				data.forEach(info => {
					if (info.timestamp > Date.now()) {
						inviteInfos.value.push(info)
					} else {
						console.info("过期数据: " + info)
					}
				})
			},
			fail: () => {
				console.info("邀请数据获取失败")
			}
		})
	}
})

onUnmounted(() => {
	console.info("onUnmounted organization page...")
	const data:EditInfo[] = []
	inviteInfos.value.forEach(info => {
		if (info.timestamp > Date.now()) {
			data.push({
				...info
			})
		}
	})
	uni.setStorage({
		key:usersStore.owner._id,
		data:data,
		success: () => {
			console.info("邀请数据保存成功")
		},
		fail: () => {
			console.info("邀请数据保存失败")
		}
	})
})

const fetchUserById = (userId:string) => {
	const result = teachers.value.filter(teacher => teacher._id === userId)
	return result[0]
}

const onAddTap = async (data:{info:EditInfo}) => {
	const { orgId, name, phoneNumber } = data.info
	const index = inviteInfos.value.findIndex(
		info => info.orgId === orgId && 
				(info.name === name || info.phoneNumber === phoneNumber)
	)
	if (index !== -1) {
		uni.showToast({
			title:"已添加",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	
	uni.showLoading({
		title: "加载中..."
	})
	
	const user = await usersStore.fetchUserByPhoneNumber(phoneNumber) as User
	uni.hideLoading()
	if (JSON.stringify(user) === '{}') {
		const timestamp = Date.now() + 2 * 60 * 60 * 1000
		inviteInfos.value.push({
			orgId,
			name,
			phoneNumber,
			timestamp
		})
		uni.showToast({
			title:"该用户还未绑定手机号, 请通过微信邀请",
			duration:3000,
			icon:"none"
		})
	} else {
		const org = useOrgs.orgs.filter(org => org._id === orgId)[0]
		if (!org.teacherIds?.includes(user._id)) {
			useOrgs.addTeachers(org._id, [user._id])
			teachers.value.push(user)
			uni.$emit("add-teacher-success")
		} else {
			uni.showToast({
				title:"已添加",
				duration:global.duration_toast,
				icon:"error"
			})
		}
	}
}

const onDeleteTap = (data:{info:EditInfo}) => {
	const { orgId, phoneNumber } = data.info
	const index = inviteInfos.value.findIndex(info => info.orgId === orgId && info.phoneNumber === phoneNumber)
	inviteInfos.value.splice(index, 1)
}

</script>

<style lang="scss" scoped>
.add-teacher-container {
	display: flex;
	flex-direction: column;
	border-radius: $uni-border-radius-lg;
	background-color: white;
	margin: $uni-spacing-col-sm $uni-spacing-col-base;
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 80px;
		background-color: transparent;
		.icon {
			margin-left: $uni-spacing-row-base;
			width: 60px;
			height: 60px;
		}
		.org-name {
			margin-left: $uni-spacing-row-base;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
		}
	}
	.org-teacher-container {
		display: flex;
		flex-direction: row;
		flex-flow: row wrap;
		padding: 4px;
		border-top: 0.5px solid $wk-bg-color-grey;
		border-bottom: 0.5px solid $wk-bg-color-grey;
		.icon {
			width: 30px;
			height: 30px;
			border-radius: $uni-border-radius-circle;
			padding: $uni-padding-sm;
		}
	}
	.edit-container {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px;
	}
}
</style>
