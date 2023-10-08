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
	<view class="course-container" v-if="courses.length > 0">
		<template v-for="course in courses" :key="course._id">
			<view :class="courseStyle(course._id)" @tap="onCourseTap(course._id)">
				<view :class="course.icon"></view>
				<text>{{course.name}}</text>
			</view>
		</template>
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
				{{selectedCourseId.length === 0? "添加":"更新"}}
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { computed, onMounted, ref } from "vue";
import { Course } from "../../../types/course";
import { Org } from "../../../types/org";

const global = getApp().globalData!
const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const courseStore = useCourseStore()
const props = defineProps(['org'])
const selectedIconId = ref('.t-icon .t-icon-yuwen1')
const selectedCourseId = ref('')

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
const courses = ref<Course[]>([])
const durations = ["30分钟", "35分钟", "40分钟", "45分钟", "50分钟", "60分钟"]
const duration = ref('分钟')

onMounted(async () => {
	const org:Org = props.org
	const result = await courseStore.fetchCourses(org.courseIds ?? [])
	courses.value = result
})

const number = computed(() => {
	return 100 - courseDesc.value.length
})

const courseStyle = (courseId:string) => {
	return selectedCourseId.value === courseId? '.course-cell .course-cell-selected': '.course-cell'
}

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

const onCourseTap = (courseId:string) => {
	const res = courses.value.filter(course => course._id === courseId)
	if (res.length === 1) {
		const course = res[0]
		courseName.value = course.name
		selectedIconId.value = course.icon
		courseDesc.value = course.desc ?? ''
		value.value = course.type
		duration.value = course.duration + "分钟"
		selectedCourseId.value = course._id
	}
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
	const minutes = Number(duration.value.substring(0, index))
	if (selectedCourseId.value.length === 0) {
		// 创建
		uni.showLoading({
			title:"添加中"
		})
		// 1. 创建课程
		const cId = await courseStore.addCourse({
			name: courseName.value,
			icon: selectedIconId.value,
			desc: courseDesc.value,
			type: value.value,
			duration: minutes
		})
		let result = false
		if (typeof(cId) !== 'undefined' && cId.length > 0) {
			// 2. 将课程添加到相应机构
			result = await useOrgs.addCourse(props.org._id, cId)
		}
		uni.hideLoading()
		uni.showToast({
			title: result?"添加成功":"添加失败",
			duration: global.duration_toast,
			icon: result?"success":"error"
		})
		if (result) {
			const course = {
				_id: cId,
				name: courseName.value,
				desc: courseDesc.value,
				icon: selectedIconId.value,
				type: value.value,
				duration: minutes
			}
			courses.value.push(course)
			selectedIconId.value = ".t-icon .t-icon-yuwen1"
			value.value = -1
			courseName.value = ''
			duration.value = "分钟"
			courseDesc.value = ''
		}
	} else {
		// 更新
		const res = courses.value.filter(course => course._id === selectedCourseId.value)
		if (res.length === 1) {
			const course = res[0]
			if (course.name === courseName.value &&
				course.icon === selectedIconId.value &&
				course.type === value.value &&
				course.duration === minutes &&
				course.desc === courseDesc.value) {
				return
			} else {
				uni.showLoading({
					title:"更新中"
				})
				const result = await courseStore.updateCourse({
					_id: selectedCourseId.value,
					name: courseName.value,
					icon: selectedIconId.value,
					desc: courseDesc.value,
					type: value.value,
					duration: minutes
				})
				uni.hideLoading()
				uni.showToast({
					title: result?"更新成功":"更新失败",
					duration: global.duration_toast,
					icon: result?"success":"error"
				})
				if (result) {
					course.name = courseName.value
					course.icon = selectedIconId.value
					course.type = value.value
					course.duration === minutes
					course.desc === courseDesc.value
				}
			}
		}
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
.course-container {
	display: flex;
	margin: $uni-padding-base;
	.course-cell {
		width: 40px;
		height: 60px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: $uni-font-size-base;
		color: $wk-text-color-grey;
	}
	.course-cell-selected {
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg;
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