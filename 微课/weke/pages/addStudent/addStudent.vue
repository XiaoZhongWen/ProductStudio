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
		<view class="org-student-container" v-if="org.studentIds?.length ?? 0 > 0">
			<template v-for="studentId in org.studentIds" :key="studentId">
				<template v-if="fetchUserById(studentId)">
					<wk-portrait
						class="portrait"
						:url="fetchUserById(studentId).avatarUrl" 
						:name="fetchUserById(studentId).nickName">
					</wk-portrait>
				</template>
				<template v-else>
					<image class="icon" src="@/static/icon/profile.png" mode="aspectFill"></image>
				</template>
			</template>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { User } from "../../types/user";
import { Org } from "../../types/org";

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const students = ref<User[]>([])
const orgs = ref<Org[]>([])
const global = getApp().globalData!

onLoad(async () => {
	if (usersStore.isLogin) {
		// 加载所有相关机构
		uni.showLoading({
			title:"加载中"
		})
		const userId = usersStore.owner._id
		await useOrgs.loadOrgData()
		useOrgs.orgs.forEach(org => {
			if (org.creatorId === userId || org.teacherIds?.includes(userId)) {
				orgs.value.push(org)
			}
		})
		if (usersStore.owner.roles?.includes(2)) {
			// 包含老师角色, 则创建老师的匿名机构
			await useOrgs.fetchAnonymousOrg()
			if (useOrgs.anonymousOrg._id.length > 0) {
				orgs.value.push(useOrgs.anonymousOrg)
			}
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
		orgs.value.forEach(async org => {
			const users:User[] = await usersStore.fetchUsers(org.studentIds ?? [])
			students.value.push(...users)
		})
	}
})

const fetchUserById = (userId:string) => {
	const result = students.value.filter(student => student._id === userId)
	return result[0]
}

const orgBrief = (orgName:string) => {
	return orgName.length > 2? orgName.substring(0, 2): orgName
}

const nickNameBrief = () => {
	const nickname = usersStore.owner.nickName
	const length = nickname?.length ?? 0
	return length > 2? nickname?.substring(length - 2, length): nickname
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
	.org-student-container {
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
}
</style>
