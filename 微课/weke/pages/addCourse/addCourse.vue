<template>
	<view class="add-course-container" v-for="org in orgs" :key="org._id">
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
		<view class="edit-container">
			<view class="icon">
				<uni-icons type="wallet-filled" color="#5073D6" size="24"></uni-icons>
			</view>
			<text class="text">添加图标</text>
			<view class="list">
				<uni-list>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">课程名称</text>
								<input
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="10"
									placeholder="请输入名称" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">课程类型</text>
								<input
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="10"
									placeholder="请输入类型" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">课程时长</text>
								<input
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="10"
									placeholder="请输入时长" />
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			<view class="desc">
				<textarea class="textarea" placeholder="课程描述" />
				<text class="number">100</text>
				<button
					class="btn" 
					type="default">
					添加
				</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onLoad } from '@dcloudio/uni-app'
import { computed } from 'vue'

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
</script>

<style lang="scss" scoped>
.add-course-container {
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
		display: flex;
		flex-direction: column;
		align-items: center;
		border: $wk-bg-color-grey dashed 1px;
		margin: $uni-padding-base;
		.icon {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 40px;
			height: 40px;
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-circle;
			margin-top: $uni-spacing-col-base;
		}
		.text {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-bottom: $uni-spacing-col-base;
		}
		.list {
			width: 100%;
			.uni-list {
				border-radius: $uni-border-radius-lg;
				background-color: white;
				.uni-list--border-top, .uni-list--border-bottom {
					height: 0px;
				}
				.uni-list-item {
					border-radius: $uni-border-radius-lg;
					.uni-list-item__content {
						padding: 0;
					}
				}
			}
			.item {
				.slot-box {
					position: relative;
					flex-direction: row;
					align-items: center;
					width: 100%;
					.slot-text {
						font-size: $uni-font-size-base;
						color: $wk-text-color;
						font-weight: 400;
					}
					.input {
						position: absolute;
						display: inline-block;
						right: 0;
						text-align: right;
						font-size: $uni-font-size-base;
						caret-color: $wk-theme-color;
						width: 70%;
					}
				}
			}
		}
		.desc {
			position: relative;
			width: 100%;
			padding: $uni-padding-base;
			box-sizing: border-box;
			.textarea {
				width: 100%;
				height: 100px;
				background-color: $wk-bg-color-grey;
				caret-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				box-sizing: border-box;
				padding: $uni-padding-normal;
				border-radius: $uni-border-radius-base;
			}
			.number {
				position: absolute;
				right: $uni-spacing-col-lg;
				bottom: 50px;
				font-size: $uni-font-size-base;
				color: $wk-text-color-grey;
			}
			.btn {
				margin-top: $uni-spacing-col-base;
				background-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				color: white;
				width: 100%;
			}
		}
	}
}
</style>
