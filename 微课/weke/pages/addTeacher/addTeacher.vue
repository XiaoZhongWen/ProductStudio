<template>
	<view class="add-teacher-container" v-for="org in orgs" :key="org._id">
		<view class="header">
			<wk-icon 
				class="icon" 
				:url="orgLogo(org)" 
				:text="orgBriefName(org)">
			</wk-icon>
			<text class="org-name">{{orgName(org)}}</text>
		</view>
		<view class="org-teacher-container" v-if="org.teacherIds?.length ?? 0 > 0">
			<template v-for="teacherId in org.teacherIds" :key="teacherId">
				<template v-if="fetchUserById(teacherId)">
					<view class="cell" @longpress="onLongPress" :id="teacherId">
						<uni-icons
							v-if="selectedId === teacherId"
							class="icon-minus" 
							type="minus-filled" 
							color="#dd524d" 
							size="24" 
							@tap="onDelete(org._id)">
						</uni-icons>
						<wk-portrait
							class="portrait"
							:url="fetchUserById(teacherId).avatarUrl" 
							:name="fetchUserById(teacherId).nickName">
						</wk-portrait>
					</view>
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
import { onLoad } from '@dcloudio/uni-app'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"
import { User } from '../../types/user'
import InviteCard from './components/invite-card'
import { Org } from '../../types/org'

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
const orgs = ref<Org[]>([])
const global = getApp().globalData!
const selectedId = ref('')

let organizationId = ''

onLoad((option) => {
	const { orgId } = option as {
		orgId?: string
	}
	if (typeof(orgId) !== 'undefined' && orgId.length > 0) {
		organizationId = orgId
	}
})

onShareAppMessage((option) => {
	const { from, target } = option
	if (from === "button") {
		const { orgId, phoneNumber, timestamp } = target.dataset.info
		const title = usersStore.owner.nickName + "向你发起老师邀请"
		const path = `/pages/mine/mine?orgId=${orgId}&phoneNumber=${phoneNumber}&timestamp=${timestamp}`
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
	if (usersStore.isLogin) {
		orgs.value = useOrgs.myOrgs.filter(org => {
			const flag = organizationId.length === 0 ||
			(organizationId.length > 0 && org._id === organizationId)
			return flag
		})
		
		const teacherIds:string[] = []
		orgs.value.forEach(org => {
			org.teacherIds?.forEach(id => {
				if (!teacherIds.includes(id)) {
					teacherIds.push(id)
				}
			})
		})
		const users = await usersStore.fetchUsers(teacherIds) as User[]
		teachers.value.push(...users)
		
		uni.getStorage({
			key: usersStore.owner._id,
			success: (res) => {
				const data:EditInfo[] = res.data
				data.forEach(info => {
					if (info.timestamp > Date.now()) {
						inviteInfos.value.push(info)
					} else {
					}
				})
			},
			fail: () => {
			}
		})
	}
})

onUnmounted(() => {
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
		},
		fail: () => {
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
		title: "添加中..."
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
		const org = orgs.value.filter(org => org._id === orgId)[0]
		if (!org.teacherIds?.includes(user._id)) {
			useOrgs.addTeachers(org._id, [user._id])
			teachers.value.push(user)
			uni.$emit("modify-teacher-success")
		} else {
			uni.showToast({
				title:"已添加",
				duration:global.duration_toast,
				icon:"error"
			})
		}
	}
}

// 删除邀请的老师
const onDeleteTap = (data:{info:EditInfo}) => {
	const { orgId, phoneNumber } = data.info
	const index = inviteInfos.value.findIndex(info => info.orgId === orgId && info.phoneNumber === phoneNumber)
	inviteInfos.value.splice(index, 1)
}

// 删除已添加到机构的老师
const onDelete = async (orgId:string) => {
	uni.showLoading({
		title:"正在删除"
	})
	const result = await useOrgs.removeTeachers(orgId, [selectedId.value])
	if (result) {
		uni.$emit("modify-teacher-success")
	}
	uni.hideLoading()
	uni.showToast({
		title:result?"删除成功":"删除失败",
		duration:global.duration_toast,
		icon:result?"success":"error"
	})
	selectedId.value = ''
}

const onLongPress = (e) => {
	const { id } = e.currentTarget
	selectedId.value = id
}

const orgLogo = (org:Org) => {
	let logo = org.logoUrl
	if (org.type === 1) {
		const users = usersStore.users.filter(u => u._id === org.creatorId)
		if (users.length === 1) {
			const creator = users[0]
			logo = creator.avatarUrl
		}
	}
	return logo
}

const orgBriefName = (org:Org) => {
	let name = org.name
	if (org.type === 1) {
		name = usersStore.owner.nickName
	}
	return name.length > 2? name.substring(0, 2): name
}

const orgName = (org:Org) => {
	let name = org.name
	if (org.type === 1) {
		name = usersStore.owner.nickName
	}
	return name
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
		padding: 8px 4px 4px 4px;
		border-top: 0.5px solid $wk-bg-color-grey;
		border-bottom: 0.5px solid $wk-bg-color-grey;
		.cell {
			position: relative;
			.icon-minus {
				position: absolute;
				top: -8px;
			}
		}
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
