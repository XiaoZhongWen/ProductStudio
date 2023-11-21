<template>
	<view class="add-org-container">
		<view class="card-container">
			<org-card :org="org"></org-card>
		</view>
		<view class="org-edit-container">
			<view v-if="isCreator" class="header">
				<upload-image :url="org.logoUrl" prompt="图标" @onChooseAvatar="onChooseAvatar"></upload-image>
			</view>
			<view class="body">
				<uni-list>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="decoration">
								<text class="text">外观</text>
								<color-card :disabled="!isCreator" @onColorChanged="onColorChanged"></color-card>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">机构名称</text>
								<input
									v-model="org.name"
									:disabled="!isCreator"
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
									:disabled="!isCreator"
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
									:disabled="!isCreator"
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
									:disabled="!isCreator"
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
		<view class="org-member-container" v-if="isCreator">
			<uni-list>
				<uni-list-item class="item" clickable :to="toTeacher">
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">添加老师</text>
							<uni-icons class="right-arrow" type="forward" color="#808080"></uni-icons>
						</view>
					</template>
				</uni-list-item>
				<uni-list-item class="item" clickable to="/pages/student2/student2">
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
		<button 
			v-if="isCreator"
			class="btn" 
			type="default" 
			@tap="onTapAdd">
			{{orgId.length === 0? "添加": "更新"}}
		</button>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Org } from '@/types/org'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const global = getApp().globalData!

let didSelectedDate = false
const isCreator = ref(true)
const date = new Date(Date.now())
const month = date.getMonth() + 1
const createDate = date.getFullYear() + "-" + month + "-" + date.getDate()

const orgId = ref("")
const org = ref<Org>({
				_id: '',
				name: '',
				nickname: usersStore.owner.nickName,
				tel: usersStore.owner.mobile ?? '',
				addr: '',
				desc: '',
				logoUrl: '',
				createDate: createDate,
				gradient: ["#4e54c8", "#8f94fb"],
				creatorId: usersStore.owner._id,
				teacherIds: [],
				studentIds: [],
				courseIds: [],
				classIds: [],
				type: 0
			})

const toTeacher = computed(() => {
	return "/pages/teacher/teacher?orgId=" + orgId.value
})

//@ts-ignore
onLoad((option) => {
	let title = "创建机构"
	const id = option!.orgId
	if (typeof(id) !== 'undefined') {
		orgId.value = id
		didSelectedDate = true
		const data:Org = useOrgs.fetchOrgById(id)
		const { 
				_id, 
				name, 
				tel, 
				addr, 
				desc, 
				logoId, 
				logoUrl, 
				createDate, 
				gradient, 
				creatorId,
				teacherIds,
				studentIds,
				courseIds,
				classIds
		} = data
		org.value._id = _id
		org.value.name = name
		org.value.tel = tel ?? ''
		org.value.addr = addr ?? ''
		org.value.desc = desc ?? ''
		org.value.logoUrl = logoUrl ?? ''
		org.value.logoId = logoId ?? ''
		org.value.createDate = createDate
		org.value.gradient = gradient
		org.value.creatorId = creatorId
		org.value.teacherIds = teacherIds ?? []
		org.value.studentIds = studentIds ?? []
		org.value.courseIds = courseIds ?? []
		org.value.classIds = classIds ?? []
		isCreator.value = creatorId === usersStore.owner._id
		title = isCreator.value === true? "更新机构": "机构详情"
		uni.setNavigationBarTitle({
			title:title
		})
	}
	uni.$emit(global.event_name.onGradientChanged, {gradient:org.value.gradient})
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
			icon:"none"
		})
		return
	}
	// 2. 验证机构创建时间
	if (didSelectedDate === false) {
		uni.showToast({
			title: "请填写创建时间",
			duration: global.duration_toast,
			icon:"none"
		})
		return
	}
	const date = new Date(org.value.createDate)
	const now = Date.now()
	if (date.getTime() > now) {
		uni.showToast({
			title: "创建时间有误",
			duration: global.duration_toast,
			icon:"none"
		})
		return
	}
	// 3. 验证机构创建者
	if (org.value.creatorId !== usersStore.owner._id) {
		uni.showToast({
			title: "权限错误",
			duration: global.duration_toast,
			icon:"none"
		})
		return
	}
	
	if (org.value.desc?.length === 0) {
		org.value.desc = "简介"
	}
	
	if (org.value.addr?.length === 0) {
		org.value.addr = "地址"
	}
	
	// 3. 上传图标
	const logoUrl = org.value.logoUrl ?? ""
	if (logoUrl.length > 0) {
		const fileId:string = await useOrgs.uploadIcon(org.value._id, logoUrl) ?? ""
		if (fileId.length === 0) {
			uni.showToast({
				title:"机构图标上传失败",
				duration:global.duration_toast,
				icon:"none"
			})
			return
		} else {
			org.value.logoId = fileId
		}
	}
	
	// 4. 创建|更新机构
	uni.showLoading({
		title: orgId.value.length === 0? "创建中...": "更新中..."
	})
	const result:boolean = await useOrgs.createOrg(org.value)
	uni.hideLoading()
	if (result) {
		uni.showToast({
			title: orgId.value.length === 0? "机构创建成功": "机构更新成功",
			duration:global.duration_toast,
			icon: "success"
		})
		uni.navigateBack()
		uni.$emit(global.event_name.didUpdateOrgData)
	} else {
		uni.showToast({
			title: orgId.value.length === 0? "机构创建失败": "机构更新失败",
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
