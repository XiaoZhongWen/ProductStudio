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
			<view :class="courseStyle(course._id)" 
					@tap="onCourseTap(course._id)" 
					@longpress="onLongPressCourse(course._id)">
				<view :class="course.icon"></view>
				<text class="course-name">{{course.name}}</text>
				<uni-icons
					v-if="longPressCourseId === course._id"
					class="icon-minus" 
					type="minus-filled" 
					color="#dd524d" 
					size="24" 
					@tap="onDeleteTap">
				</uni-icons>
			</view>
		</template>
	</view>
	<view class="edit-container">
		<view class="icon" @tap="onTapCourseIcon">
			<view :class="selectedIconId"></view>
		</view>
		<text class="text">课程图标</text>
		<view class="list">
			<view class="course-type">
				<uni-data-select
					class="select" 
					:clear="false"
					v-model="type" 
					:localdata="range" 
					placeholder="课程类型">
				</uni-data-select>
			</view>
			<input class="input" type="text" v-model="courseName" placeholder="课程名称" />
			<view class="duration" v-if="type !== 2">
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
const longPressCourseId = ref('')

const type = ref(-1)
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
	const orgCourses = await courseStore.fetchCourses(org.courseIds ?? [])
	courses.value = orgCourses
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
	if (selectedCourseId.value === courseId) {
		reset()
	} else {
		const res = courses.value.filter(course => course._id === courseId)
		if (res.length === 1) {
			const course = res[0]
			courseName.value = course.name
			selectedIconId.value = course.icon
			courseDesc.value = course.desc ?? ''
			type.value = course.type
			duration.value = course.duration + "分钟"
			selectedCourseId.value = course._id
		}
	}
}

const onLongPressCourse = (courseId:string) => {
	longPressCourseId.value = courseId
}

const onDeleteTap = async () => {
	uni.showLoading({
		title:"删除中"
	})
	let result = await useOrgs.removeCourse(props.org._id, longPressCourseId.value)
	if (result) {
		result = await courseStore.removeCourse(longPressCourseId.value)
	}
	uni.hideLoading()
	uni.showToast({
		title: result?"删除成功":"删除失败",
		duration: global.duration_toast,
		icon: result?"success":"error"
	})
	if (result) {
		const index = courses.value.findIndex(course => course._id === longPressCourseId.value)
		if (index !== -1) {
			courses.value.splice(index, 1)
		}
		if (longPressCourseId.value === selectedCourseId.value) {
			selectedCourseId.value = ''
			reset()
		}
		longPressCourseId.value = ''
	}
}

const onDurationChange = (e:{detail:{value:number}}) => {
	const { value } = e.detail
	duration.value = durations[value]
}

const onAddTap = async () => {
	const isValid = validate()
	if (!isValid) {
		return
	}
	
	if (selectedCourseId.value.length === 0) {
		createCourse()
	} else {
		updateCourse()
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

const validate = () => {
	if (type.value === -1) {
		uni.showToast({
			title: "请选择课程类型",
			duration: global.duration_toast,
			icon: "error"
		})
		return false
	}
	if (courseName.value.trim().length === 0) {
		uni.showToast({
			title: "请输入课程名称",
			duration: global.duration_toast,
			icon: "error"
		})
		return false
	}
	const suffix = '分钟'
	if (type.value !== 2 && duration.value === suffix) {
		uni.showToast({
			title: "请设置课程时长",
			duration: global.duration_toast,
			icon: "error"
		})
		return false
	}
	return true
}

const createCourse = async () => {
	// 创建
	uni.showLoading({
		title:"添加中"
	})
	// 1. 创建课程
	const suffix = '分钟'
	const index = duration.value.indexOf(suffix)
	const minutes = Number(duration.value.substring(0, index))
	const cId = await courseStore.addCourse({
		name: courseName.value,
		icon: selectedIconId.value,
		desc: courseDesc.value,
		type: type.value,
		duration: type.value !== 2?minutes:0
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
			type: type.value,
			duration: type.value !== 2?minutes:0
		}
		courses.value.push(course)
		reset()
	}
}

const updateCourse = async () => {
	// 更新
	const suffix = '分钟'
	const index = duration.value.indexOf(suffix)
	const minutes = Number(duration.value.substring(0, index))
	const res = courses.value.filter(course => course._id === selectedCourseId.value)
	if (res.length === 1) {
		const course = res[0]
		if (course.name === courseName.value &&
			course.icon === selectedIconId.value &&
			course.type === type.value &&
			course.duration === minutes &&
			course.desc === courseDesc.value) {
			selectedCourseId.value = ''
			reset()
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
				type: type.value,
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
				course.type = type.value
				course.duration === minutes
				course.desc === courseDesc.value
				
				selectedCourseId.value = ''
				reset()
			}
		}
	}
}

const reset = () => {
	selectedIconId.value = ".t-icon .t-icon-yuwen1"
	type.value = -1
	courseName.value = ''
	duration.value = "分钟"
	courseDesc.value = ''
	selectedCourseId.value = ''
}

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
		position: relative;
		width: 50px;
		height: 60px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		.icon-minus {
			position: absolute;
			top: -6px;
			left: -2px;
		}
		.course-name {
			width: 50px;
			height: 20px;
			text-align: center;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
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
				justify-content: space-between;
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