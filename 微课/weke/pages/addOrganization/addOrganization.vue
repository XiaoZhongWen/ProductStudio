<template>
	<view class="add-org-container">
		<view class="card-container">
			<org-card :org="org"></org-card>
		</view>
		<view class="org-edit-container">
			<view class="header">
				<upload-image :url="org.logoUrl" prompt="图标" @onChooseAvatar="onChooseAvatar"></upload-image>
			</view>
			<view class="body">
				<uni-list>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="decoration">
								<text class="text">外观</text>
								<color-card @onColorChanged="onColorChanged"></color-card>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">机构名称</text>
								<input
									v-model="org.name"
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
								<text class="slot-text">地址</text>
								<input 
									v-model="org.addr"
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="20"
									placeholder="请输入地址" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">简介</text>
								<input
									v-model="org.desc"
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="30"
									placeholder="请输入简介" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">创建日期</text>
								<picker 
									class="picker" 
									mode="date" 
									:value="org.createDate" 
									@change="onDateChanged">
									<view class="uni-input">{{didSelectedDate?org.createDate:"创建日期"}}</view>
								</picker>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</view>
		<view class="org-member-container">
			<uni-list>
				<uni-list-item class="item" clickable>
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">添加老师</text>
							<uni-icons class="right-arrow" type="forward" color="#808080"></uni-icons>
						</view>
					</template>
				</uni-list-item>
				<uni-list-item class="item" clickable>
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">添加学员</text>
							<uni-icons class="right-arrow" type="forward" color="#808080"></uni-icons>
						</view>
					</template>
				</uni-list-item>
				<uni-list-item class="item" clickable>
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">添加课程</text>
							<uni-icons class="right-arrow" type="forward" color="#808080"></uni-icons>
						</view>
					</template>
				</uni-list-item>
				<uni-list-item class="item" clickable>
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">添加班级</text>
							<uni-icons class="right-arrow" type="forward" color="#808080"></uni-icons>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</view>
		<button class="btn" type="default" @tap="onTapAdd">添加</button>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Org } from '@/types/org'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const global = getApp().globalData!

let didSelectedDate = false
const date = new Date(Date.now())
const month = date.getMonth() + 1
const createDate = date.getFullYear() + "-" + month + "-" + date.getDate()

const org = ref<Org & {nickname?: string}>({
	_id: '',
	name: '',
	nickname: usersStore.owner.nickName,
	tel: usersStore.owner.mobile ?? '13545118725',
	addr: '',
	desc: '',
	logoUrl: '',
	createDate: createDate,
	gradient: ["#4e54c8", "#8f94fb"]
})

const onChooseAvatar = (data:{url: string}) => {
	const url = data.url ?? ""
	org.value.logoUrl = url
}

const onColorChanged = (data:{gradient: string[]}) => {
	const gradient = data.gradient
	org.value.gradient = gradient
}

// @ts-ignore
const onDateChanged = (e) => {
	didSelectedDate = true
	org.value.createDate = e.detail.value
}

const onTapAdd = async () => {
	// 1. 验证机构名称
	if (org.value.name.length === 0) {
		uni.showToast({
			title: "请填写机构名称",
			duration: global.duration_toast,
			icon:"error"
		})
		return
	}
	// 2. 验证机构创建时间
	if (didSelectedDate === false) {
		uni.showToast({
			title: "请填写机构创建时间",
			duration: global.duration_toast,
			icon:"error"
		})
		return
	}
	if (org.value.desc?.length === 0) {
		org.value.desc = "简介"
	}
	
	// 3. 上传图标
	const logoUrl = org.value.logoUrl ?? ""
	if (logoUrl.length > 0) {
		const fileId:string = await useOrgs.uploadIcon(org.value._id, logoUrl) ?? ""
		if (fileId.length === 0) {
			uni.showToast({
				title:"机构图标上传失败",
				duration:global.duration_toast,
				icon:"error"
			})
			return
		} else {
			org.value.logoId = fileId
		}
	}
	
	// 4. 创建|更新机构
	uni.showLoading({
		title: "创建中..."
	})
	const result:boolean = await useOrgs.createOrg(org.value)
	uni.hideLoading()
	if (result) {
		uni.showToast({
			title:"机构创建成功",
			duration:global.duration_toast
		})
		uni.navigateBack()
	} else {
		uni.showToast({
			title:"机构创建失败",
			duration:global.duration_toast,
			icon:"error"
		})
	}
}
	
</script>

<style lang="scss">
.add-org-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.card-container {
		width: 90%;
		height: 200px;
		border-style: dashed;
		border-color: $wk-text-color-grey;
		border-width: 1px;
		border-radius: $uni-border-radius-lg;
		padding: $uni-padding-base;
		box-sizing: border-box;
	}
	.org-edit-container {
		display: flex;
		flex-direction: column;
		width: 90%;
		background-color: white;
		margin-top: $uni-spacing-col-base;
		padding-bottom: $uni-padding-base;
		border-radius: $uni-border-radius-lg;
		.header {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100px;
			background-color: white;
			border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
		}
		.body {
			width: 100%;
			border-top: $uni-spacing-col-sm solid $wk-bg-color-grey;
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
				.decoration {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					height: 100%;
					.text {
						font-size: $uni-font-size-base;
						color: $wk-text-color;
						font-weight: 400;
					}
				}
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
					.picker {
						position: absolute;
						display: inline-block;
						right: 0;
						font-size: $uni-font-size-base;
						color: $uni-text-color-placeholder;
					}
				}
			}
		}
	}
	.org-member-container {
		display: flex;
		flex-direction: column;
		width: 90%;
		margin-top: $uni-spacing-col-base;
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
				.right-arrow {
					position: absolute;
					right: -4px;
					bottom: -2px;
				}
			}
		}
	}
	.btn {
		margin: 20px 0 40px 0;
		background-color: $wk-theme-color;
		font-size: $uni-font-size-base;
		color: white;
		width: 90%;
	}
}
</style>
