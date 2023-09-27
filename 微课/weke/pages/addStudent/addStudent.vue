<template>
	<view class="add-student-container" v-for="org in orgs" :key="org._id">
		<view class="header">
			<wk-icon 
				class="icon" 
				:url="org.type === 0?org.logoUrl:usersStore.owner.avatarUrl" 
				:text="org.type === 0?orgBrief(org.name):nickNameBrief()">
			</wk-icon>
			<text class="org-name">
				{{org.type === 0?org.name:usersStore.owner.nickName}}
			</text>
		</view>
		<OrgStudentContainer
			v-if="org.studentIds?.length ?? 0 > 0"
			:studentIds="org.studentIds"
		/>
		<view class="edit-container">
			<edit-card 
				:orgId="org._id" 
				name="学生姓名" 
				mobile="关联手机号" 
				@onAddTap="onAddTap">
			</edit-card>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onLoad } from '@dcloudio/uni-app'
import { computed } from 'vue'
import OrgStudentContainer from './components/OrgStudentContainer';

type EditInfo = {
	orgId:string, 
	name:string, 
	phoneNumber:string,
	timestamp: number
}

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const global = getApp().globalData!

onLoad(async () => {
	if (usersStore.isLogin) {
		// 加载所有相关机构
		uni.showLoading({
			title:"加载中"
		})
		await useOrgs.loadOrgData()
		if (usersStore.owner.roles?.includes(2)) {
			await useOrgs.fetchAnonymousOrg()
		}
		uni.hideLoading()
		if (usersStore.owner.roles?.includes(1) && useOrgs.orgs.length === 0) {
			// 如果是机构管理员且没有创建过机构,则提示创建机构
			uni.showToast({
				title: "请先创建机构",
				duration: global.duration_toast,
				icon: "error"
			})
		}
	}
})

const orgBrief = (orgName:string) => {
	return orgName.length > 2? orgName.substring(0, 2): orgName
}

const nickNameBrief = () => {
	const nickname = usersStore.owner.nickName
	const length = nickname?.length ?? 0
	return length > 2? nickname?.substring(length - 2, length): nickname
}

// @ts-ignore
const orgs = computed({
	get() {
		const userId = usersStore.owner._id
		let normalOrgs = useOrgs.orgs.filter(org => org.creatorId === userId || 
											org.teacherIds?.includes(userId))
		if (usersStore.owner.roles?.includes(2) &&
			useOrgs.anonymousOrg._id.length > 0) {
			normalOrgs.push(useOrgs.anonymousOrg)
		}
		return normalOrgs
	}
})

const onAddTap = (data:{info:EditInfo}) => {
	const { orgId, name, phoneNumber } = data.info
	console.info(orgId)
	console.info(name)
	console.info(phoneNumber)
}

</script>

<style lang="scss" scoped>
.add-student-container {
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
	.edit-container {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px;
	}
}
</style>
