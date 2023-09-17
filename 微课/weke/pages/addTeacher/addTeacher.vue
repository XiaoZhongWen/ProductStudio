<template>
	<view class="add-teacher-container" v-for="org in useOrgs.myOrgs" :key="org._id">
		<view class="header">
			<wk-icon 
				class="icon" 
				:url="org.logoUrl" 
				:text="org.name">
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
			<InviteCard name="兮子" />
		</view>
		<view class="edit-container">
			<EditCard :value="registerInfo" />
			<uni-icons 
				class="icon-add" 
				type="plus-filled" 
				color="#5073D6" 
				size="24"
				@tap="onAddTap(org._id)">
			</uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"
import { User } from '../../types/user'
import EditCard from './components/edit-card'
import InviteCard from './components/invite-card'

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const teachers = ref<User[]>([])
const registerInfo = ref({
	name: '',
	phoneNumber: ''
})

onShareAppMessage(() => {
	// const title = usersStore.owner.nickName + "向你发起老师邀请"
	// const path = "/pages/mine/mine?id=" + usersStore.owner._id
	// return {
	// 	title: title,
	// 	path: path
	// }
	return {}
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
	}
})

const fetchUserById = (userId:string) => {
	const result = teachers.value.filter(teacher => teacher._id === userId)
	return result[0]
}

const onAddTap = (orgId:string) => {
	console.info(orgId)
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
	.invite-container {
		
	}
	.edit-container {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px;
		.icon-add {
			position: absolute;
			right: $uni-spacing-row-base;
			bottom: 15px;
		}
	}
}
</style>
