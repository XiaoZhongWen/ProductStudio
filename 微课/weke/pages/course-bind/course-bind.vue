<template>
	<template v-for="entry in entries" :key="entry._id">
		<wk-course-card 
			forStudent
			:courseId="entry.courseId"
			:teacherId="entry.teacherId"
			:orgId="entry.orgId">
		</wk-course-card>
	</template>
	<view class="course-bind-container">
		<view class="course-selector">
			<uni-data-select
				@change="onChange"
				class="selector"
				:clear="false"
				v-model="selectedCourseId"
				:localdata="courseSelectorData"
				placeholder="选择课程">
			</uni-data-select>
		</view>
		<view class="teacher-selector">
			<uni-data-select
				class="selector"
				:clear="false"
				v-model="selectedTeacherId"
				:localdata="teacherSelectorData"
				placeholder="选择授课老师">
			</uni-data-select>
		</view>
		<view class="course-type">
			<view class="left">
				<text class="text title">课程类型</text>
			</view>
			<view class="right">
				<text class="text title">{{courseType}}</text>
			</view>
		</view>
		<view class="org">
			<view class="left">
				<text class="text title">机构名称</text>
			</view>
			<view class="right">
				<text class="text title">{{orgName}}</text>
			</view>
		</view>
		<view class="duration" v-if="type !== 2">
			<view class="left">
				<text class="text title">课程时长</text>
			</view>
			<view class="right">
				<text class="text title">{{courseDuration}}分钟</text>
			</view>
		</view>
		<textarea
			v-if="courseDesc.length > 0"
			class="textarea" 
			placeholder="课程描述"
			maxlength="100"
			:value="courseDesc"
			disabled
		/>
		<view class="form">
			<uni-forms ref="form" label-width=80>
				<uni-forms-item :label="type === 2? '总课次数':'总课时数'" required>
					<uni-easyinput type="number" v-model="totle" placeholder="请输入总课时数"/>
				</uni-forms-item>
				<uni-forms-item :label="type === 2? '已耗课次':'已耗课时'" required>
					<uni-easyinput type="number" v-model="consume" placeholder="请输入已耗课时数"/>
				</uni-forms-item>
				<uni-forms-item :label="type === 2? '课次单价':'课时单价'" required>
					<uni-easyinput type="number" v-model="price" placeholder="请输入课时单价"/>
				</uni-forms-item>
				<uni-forms-item label="报名时间" required>
					<uni-datetime-picker type="date" return-type="timestamp" v-model="date" />
				</uni-forms-item>
			</uni-forms>
		</view>
		<view :class="bindClass" @tap="onBindCourse">
			<text>绑定课程</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue';
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { Course } from '../../types/course';
import { Org } from '../../types/org';
import { User } from '../../types/user';
import { Entry } from '../../types/entry';

const global = getApp().globalData!

let stuNo = ''
let oIds:string[] = []
let courses:Course[] = []
let orgs:Org[] = []
let teachers:User[] = []

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const courseStore = useCourseStore()

const type = ref(-1)
const courseType = ref('')
const orgName = ref('')
const courseDuration = ref('')
const courseDesc = ref('')
const selectedCourseId = ref('')
const selectedTeacherId = ref('')
const courseSelectorData = ref<{value:string, text:string}[]>([])
const teacherSelectorData = ref<{value:string, text:string}[]>([])

const totle = ref()
const consume = ref()
const price = ref()
const date = ref()
const entries = ref<Entry[]>([])

onLoad(async (option) => {
	const {studentNo, orgIds} = option as {studentNo:string, orgIds:string}
	if (typeof(studentNo) !== 'undefined') {
		stuNo = studentNo
	}
	if (typeof(orgIds) !== 'undefined') {
		oIds = orgIds.split(',')
	}
	entries.value = await usersStore.fetchEntriesWithStudentNo(studentNo, oIds)
})

onMounted(async () => {
	if (stuNo.length === 0 || oIds.length === 0) {
		return
	}
	const id = usersStore.owner._id
	orgs = useOrgs.orgs.filter(org => (
		org.creatorId === id || org.teacherIds?.includes(id)) && 
		oIds.includes(org._id)
	)
	if (oIds.includes(useOrgs.anonymousOrg._id)) {
		orgs.push(useOrgs.anonymousOrg)
	}
	const courseIds:string[] = []
	const teacherIds:string[] = []
	orgs.forEach(org => {
		courseIds.push(...org.courseIds ?? [])
		teacherIds.push(...org.teacherIds ?? [])
	})
	const orgCourses = await courseStore.fetchCourses(courseIds ?? [])
	courses = orgCourses
	courses.forEach(course => {
		courseSelectorData.value.push({
			value: course._id,
			text: course.name
		})
	})
	teachers = await usersStore.fetchUsers(teacherIds ?? []) as User[]
	if (courses.length === 0) {
		uni.showToast({
			title: "请先添加课程",
			duration: global.duration_toast,
			icon: "error"
		})
	}
})

const bindClass = computed(() => {
	if (typeof(totle.value) === 'undefined' || totle.value === '' ||
		typeof(consume.value) === 'undefined' || consume.value === '' ||
		typeof(price.value) === 'undefined' || price.value === '' ||
		typeof(date.value) === 'undefined' || date.value === '') {
		return "bind disable"
	}
	const result = selectedCourseId.value.length > 0 && selectedTeacherId.value.length > 0
	return result? "bind able": "bind disable"
})

const onChange = (e:string) => {
	selectedCourseId.value = e
	const res = courses.filter(course => course._id === e)
	if (res.length > 0) {
		const course = res[0]
		type.value = course.type
		switch (course.type) {
			case 0:
				courseType.value = "一对一"
				break
			case 1:
				courseType.value = "班课"
				break
			case 2:
				courseType.value = "次课"
				break
			case 3:
				courseType.value = "试听课"
				break
		}
		courseDuration.value = course.duration.toString()
		courseDesc.value = course.desc ?? ''
	}
	
	const length = teacherSelectorData.value.length
	teacherSelectorData.value.splice(0, length)
	// 1. 获取课程所属的机构
	const result = orgs.filter(org => org.courseIds?.includes(selectedCourseId.value))
	if (result.length === 1) {
		const org = result[0]
		orgName.value = org.name
		if (org.creatorId === usersStore.owner._id) {
			// 2. 对于机构负责人
			teachers.forEach(teacher => {
				if (org.teacherIds?.includes(teacher._id)) {
					teacherSelectorData.value.push({
						value: teacher._id,
						text: teacher.nickName
					})
				}
			})
		} else {
			// 3. 对于机构老师
			teachers.forEach(teacher => {
				if (teacher._id === usersStore.owner._id) {
					teacherSelectorData.value.push({
						value: teacher._id,
						text: teacher.nickName
					})
				}
			})
		}
	}
	if (teacherSelectorData.value.length === 0) {
		uni.showToast({
			title: "请先添加老师",
			duration: global.duration_toast,
			icon: "error"
		})
	}
}

const onBindCourse = async () => {
	if (!isFinite(totle.value)) {
		uni.showToast({
			title: "总课" + (type.value === 2?"次":"时") + "数格式错误",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	if (!isFinite(consume.value)) {
		uni.showToast({
			title: "已耗课" + (type.value === 2?"次":"时") + "数格式错误",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	if (!isFinite(price.value)) {
		uni.showToast({
			title: "单价格式错误",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	if (totle.value <= 0) {
		uni.showToast({
			title: "总课" + (type.value === 2?"次":"时") + "要大于0",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	if (price.value < 0) {
		uni.showToast({
			title: "单价不能小于0",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	const org = orgs.filter(org => org.courseIds?.includes(selectedCourseId.value))[0]
	uni.showLoading({
		title:"正在绑定..."
	})
	const entryId = await courseStore.bindCourse({
		orgId: org._id,
		teacherId: selectedTeacherId.value,
		studentId: stuNo,
		courseId: selectedCourseId.value,
		total: parseInt(totle.value),
		consume: parseInt(consume.value)
	})
	let result = false
	if (entryId.length > 0) {
		result = await courseStore.addPaymentRecord({
			orgId: org._id,
			studentId: stuNo,
			date: date.value,
			courseId: selectedCourseId.value,
			count: parseInt(totle.value),
			price: parseFloat(price.value)
		})
	}
	uni.hideLoading()
	uni.showToast({
		title: result? "绑定成功": "绑定失败",
		duration: global.duration_toast,
		icon: result? "success": "error"
	})
	if (result) {
		const entry = {
			_id: entryId,
			orgId: org._id,
			teacherId: selectedTeacherId.value,
			studentId: stuNo,
			courseId: selectedCourseId.value,
			total: parseInt(totle.value),
			consume: parseInt(consume.value)
		}
		entries.value.push(entry)
		reset()
	}
}

const reset = () => {
	type.value = -1
	courseType.value = ''
	orgName.value = ''
	courseDuration.value = ''
	courseDesc.value = ''
	selectedCourseId.value = ''
	selectedTeacherId.value = ''
	totle.value = null
	consume.value = null
	price.value = null
	date.value = null
}

</script>

<style lang="scss">
.course-bind-container {
	padding: $uni-padding-normal;
	.course-selector, .teacher-selector {
		background-color: white;
		margin-top: $uni-spacing-col-sm;
	}
	.course-type, .org, .duration {
		display: flex;
		flex-direction: row;
		height: 35px;
		margin-top: $uni-spacing-col-sm;
		padding: 0 $uni-padding-normal;
		background-color: white;
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
			text-align: right;
		}
	}
	.textarea {
		width: 100%;
		height: 100px;
		background-color: white;
		font-size: $uni-font-size-base;
		box-sizing: border-box;
		padding: $uni-padding-normal;
		border-radius: $uni-border-radius-base;
		margin-top: $uni-spacing-col-sm;
		color: $uni-text-color-placeholder;
	}
	.form {
		margin-top: $uni-spacing-col-base;
		.uni-forms-item {
			margin-bottom: $uni-spacing-col-sm;
		}
	}
	.bind {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: $uni-font-size-base;
		border-style: dashed;
		border-width: 1px;
		border-radius: $uni-border-radius-lg;
		padding: $uni-padding-base 0;
		margin-top: $uni-spacing-col-lg;
	}
	.able {
		color: $wk-theme-color;
		border-color: $wk-theme-color;
	}
	.disable {
		color: $uni-text-color-disable;
		border-color: $uni-text-color-disable;
	}
}

</style>
