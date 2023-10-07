<template>
	<view class="header">
		<wk-icon 
			class="icon" 
			:url="props.org.type === 0?props.org.logoUrl:usersStore.owner.avatarUrl" 
			:text="props.org.type === 0?orgBrief(props.org.name):nickNameBrief()">
		</wk-icon>
		<text class="org-name">
			{{props.org.type === 0?props.org.name:usersStore.owner.nickName}}
		</text>
	</view>
	<view class="edit-container">
		<view class="icon" @tap="onTapCourseIcon">
			<view :class="selectedIconId"></view>
		</view>
		<text class="text">课程图标</text>
		<view class="list">
			<uni-data-select
				class="select" 
				:clear="false"
				v-model="value" 
				:localdata="range" 
				placeholder="课程类型">
			</uni-data-select>
			<input class="input" type="text" v-model="courseName" placeholder="课程名称" />
			<view class="duration">
				<view class="left">
					<text class="text title">课程时长</text>
				</view>
				<view class="right">
					<picker
						@change="onDurationChange"
						:range="durations">
						<text class="text minute">{{duration}}</text>
					</picker>
				</view>
			</view>
		</view>
		<view class="desc">
			<textarea 
				class="textarea" 
				placeholder="课程描述" 
				v-model="courseDesc" 
				maxlength="100" 
			/>
			<text class="number">{{number}}</text>
			<button
				@tap="onAddTap"
				class="btn" 
				type="default">
				添加
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { computed, ref } from "vue";

const global = getApp().globalData!
const usersStore = useUsersStore()
const courseStore = useCourseStore()
const props = defineProps(['org'])
const selectedIconId = ref('.t-icon .t-icon-yuwen1')

const value = ref(-1)
const range = [
	{
		value: 0,
		text: '一对一'
	},
	{
		value: 1,
		text: '班课'
	},
	{
		value: 2,
		text: '次课'
	},
	{
		value: 3,
		text: '试听课'
	}
]
const courseName = ref('')
const courseDesc = ref('')
const number = computed(() => {
	return 100 - courseDesc.value.length
})

const durations = ["30分钟", "35分钟", "40分钟", "45分钟", "50分钟", "60分钟"]
const duration = ref('分钟')
const orgBrief = (orgName:string) => {
	return orgName.length > 2? orgName.substring(0, 2): orgName
}

const nickNameBrief = () => {
	const nickname = usersStore.owner.nickName
	const length = nickname?.length ?? 0
	return length > 2? nickname?.substring(length - 2, length): nickname
}

const onTapCourseIcon = () => {
	uni.navigateTo({
		url: "/pages/icon/icon?orgId="+props.org._id
	})
}

const onDurationChange = (e:{detail:{value:number}}) => {
	const { value } = e.detail
	duration.value = durations[value]
}

const onAddTap = async () => {
	if (value.value === -1) {
		uni.showToast({
			title: "请选择课程类型",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	if (courseName.value.length === 0) {
		uni.showToast({
			title: "请输入课程名称",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	const suffix = '分钟'
	if (duration.value === suffix) {
		uni.showToast({
			title: "请设置课程时长",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	
	const index = duration.value.indexOf(suffix)
	const cId = await courseStore.addCourse({
		name: courseName.value,
		icon: selectedIconId.value,
		desc: courseDesc.value,
		type: value.value,
		duration: Number(duration.value.substring(0, index))
	})
	if (typeof(cId) === 'undefined' || cId.length === 0) {
		
	}
}

uni.$on(global.event_name.didSelectedIcon, (data:{iconId:string, orgId:string}) => {
	const { iconId, orgId } = data
	if (typeof(iconId) !== 'undefined' && iconId.length > 0 &&
		typeof(orgId) !== 'undefined' && orgId.length > 0 &&
		orgId === props.org._id) {
		selectedIconId.value = iconId
	}
})

</script>

<style lang="scss" scoped>
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
		padding: 0 $uni-padding-base;
		box-sizing: border-box;
		.input {
			height: 35px;
			background-color: $wk-bg-color-grey;
			padding: 0 $uni-padding-normal;
			font-size: $uni-font-size-base;
			border-radius: $uni-border-radius-base;
			caret-color: $wk-theme-color;
			margin-top: $uni-spacing-col-sm;
		}
		.select {
			width: 100%;
		}
		.duration {
			display: flex;
			flex-direction: row;
			height: 35px;
			margin-top: $uni-spacing-col-sm;
			padding: 0 $uni-padding-normal;
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-base;
			.text {
				position: relative;
				top: 5px;
				color: $uni-text-color-placeholder;
				font-size: $uni-font-size-base;
			}
			.left {
				width: 60px;
				height: 100%;
			}
			.right {
				flex: 1;
				height: 100%;
				.minute {
					display: inline-block;
					width: 100%;
					text-align: right;
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
</style>