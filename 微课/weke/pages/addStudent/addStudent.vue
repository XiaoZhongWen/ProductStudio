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
			:orgId="org._id"
		/>
		<view class="edit-container">
			<edit-card 
				:orgId="org._id" 
				name="学员姓名" 
				mobile="关联手机号" 
				@onAddTap="onAddTap">
			</edit-card>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { computed, onMounted } from 'vue'
import OrgStudentContainer from './components/OrgStudentContainer';
import { Student } from "../../types/user";
import { Org } from "../../types/org";
// @ts-ignore
import md5 from 'js-md5'

type EditInfo = {
	orgId:string, 
	name:string, 
	phoneNumber:string,
	timestamp: number
}

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const global = getApp().globalData!

onMounted(() => {
	if (usersStore.isLogin) {
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
const orgs = computed<Org[]>({
	get() {
		const userId = usersStore.owner._id
		let normalOrgs = []
		if (usersStore.owner.roles?.includes(1)) {
			const orgs = useOrgs.orgs.filter(org => org.creatorId === userId)
			if (orgs.length > 0) {
				normalOrgs.push(...orgs)
			}
		}
		if (usersStore.owner.roles?.includes(2) &&
			useOrgs.anonymousOrg._id.length > 0) {
			const index = normalOrgs.findIndex(org => org._id === useOrgs.anonymousOrg._id)
			if (index === -1) {
				normalOrgs.push(useOrgs.anonymousOrg)
			}
		}
		return normalOrgs
	}
})

const onAddTap = async (data:{info:EditInfo}) => {
	const { orgId, name, phoneNumber } = data.info
	const res = orgs.value.filter(org => org._id === orgId)
	let isAvailable = true
	if (res.length === 1) {
		const org = res[0]
		let identity = md5(name + "-" + phoneNumber)
		org.studentIds?.forEach(id => {
			const data:Student[] = usersStore.students.filter(student => student._id === id)
			if (data.length === 1) {
				const student = data[0]
				if (process.env.NODE_ENV === 'development') {
					// 开发环境
					identity = phoneNumber
				}
				if (student.identity === identity) {
					isAvailable = false
				}
			}
		})
		if (isAvailable) {
			// 1. 创建并返回该学员的云端数据记录
			const id = await usersStore.createStudent(orgId, name, phoneNumber) as string
			// 2. 将该学员记录id添加到相应的机构里
			if (id.length > 0) {
				uni.$emit(global.event_name.didUpdateOrgData)
			}
		} else {
			uni.showToast({
				title:"该学员已添加",
				duration:global.duration_toast,
				icon:"error"
			})
		}
	}
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
