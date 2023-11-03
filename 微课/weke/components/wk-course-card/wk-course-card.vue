<template>
	<view class="course-card" v-if="display">
		<view class="top">
			<view :class="course.icon"></view>
			<text class="text">{{course.name}}</text>
			<text v-if="statusDesc.length > 0" :class="statusClass">{{statusDesc}}</text>
			<uni-icons 
				@tap="onEditTap"
				type="undo" 
				class="undo" 
				color="#f0ad4e" 
				v-if="status === 0">
			</uni-icons>
			<wk-circle-progress 
				v-if="props.forStudent" 
				class="circle-progress"
				:total="totalCourse"
				:consume="consumeCourse">
			</wk-circle-progress>
		</view>
		<view class="duration" v-if="status === 0">
			<text>课程时长: {{course.duration}}分钟</text>
		</view>
		<view class="teacher" v-if="isShowTeacher">
			<text>授课老师: </text>
			<view class="teacher-cell">
				<wk-icon
					class="icon" 
					:url="teacher.avatarUrl"
					:text="teacher.nickName">
				</wk-icon>
				<uni-icons 
					type="loop" 
					class="replace" 
					color="#5073D6" 
					@tap="onReplaceTap"
					v-if="canReplaceTeacher">
				</uni-icons>
			</view>
		</view>
		<view class="operator" v-if="status !== 0">
			<text>执行人: {{typeof(operator) !== 'undefined'?operator.nickName:""}}</text>
		</view>
		<view class="operateTime" v-if="status !== 0">
			<text>执行时间: {{operateTime}}</text>
		</view>
		<view class="operation" v-if="props.forStudent && 
											isCreator && 
											hasAdminOrTeacherRole &&
											course.type !== 3">
			<view class="left">
				<text>{{orgName}}</text>
			</view>
			<view class="right" @tap="onActionTap">
				<text class="action" id="renew">续课</text>
				<text :class="finishClass" id="finish" v-if="status !== 2">{{status === 1?"已结课":"结课"}}</text>
				<text :class="revokeClass" id="revoke" v-if="status !== 1">{{status === 2?"已退课":"退课"}}</text>
			</view>
		</view>
		<view class="bottom" v-else>
			<text>{{orgName}}</text>
			<text>{{typeName}}</text>
		</view>
		
		<uni-popup ref="popup" type="bottom">
			<wk-choose-teacher 
				:entryId="props.entryId"
				@onConfirm="onConfirm">
			</wk-choose-teacher>
		</uni-popup>
		
		<uni-popup ref="renewPopup" type="bottom">
			<wk-renew-course
				:isRenew="isRenew"
				:entryId="props.entryId"
				@onConfirm="onRenewConfirm">
			</wk-renew-course>
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Course } from '../../types/course';
import { Org } from '../../types/org';
import { Student, User } from '../../types/user';
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { Entry } from '../../types/entry';
import { format } from '@/utils/wk-date'
import { PaymentRecord } from '../../types/PaymentRecord';

const entry = ref<Entry>()
const course = ref<Course>()
const teacher = ref<User>()
const operator = ref<User>()
const org = ref<Org>()
const typeName = ref('')
const orgName = ref('')
const operateTime = ref('')
const display = ref(false)
const isCreator = ref(false)
const hasAdminOrTeacherRole = ref(false)
const canReplaceTeacher = ref(false)
const status = ref(0)
const isRenew = ref(true)

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const props = defineProps(['forStudent', 'entryId', 'courseId', 'teacherId', 'orgId', 'total', 'consume'])
const global = getApp().globalData!

const totalCourse = ref<number>(props.total)
const consumeCourse = ref<number>(props.consume)

const popup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const renewPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

onMounted(async () => {
	if (typeof(props.forStudent) !== 'undefined' && 
		props.forStudent &&
		typeof(props.teacherId) !== 'undefined' && 
		props.teacherId.length > 0) {
		const res = await usersStore.fetchUsers([props.teacherId]) as User[]
		if (res.length > 0) {
			teacher.value = res[0]
		}
	}
	if (typeof(props.courseId) !== 'undefined' && 
		props.courseId.length > 0) {
		const res = await courseStore.fetchCourses([props.courseId])
		if (res.length > 0) {
			course.value = res[0]
			if (course.value.type === 0) {
				typeName.value = "一对一"
			}
			if (course.value.type === 1) {
				typeName.value = "班课"
			}
			if (course.value.type === 2) {
				typeName.value = "次课"
			}
			if (course.value.type === 3) {
				typeName.value = "试听课"
			}
			display.value = true
		}
	}
	if (typeof(props.orgId) !== 'undefined' &&
		props.orgId.length > 0) {
		org.value = useOrgs.fetchOrgById(props.orgId)
		isCreator.value = org.value.creatorId === usersStore.owner._id
		const roles = usersStore.owner.roles ?? []
		hasAdminOrTeacherRole.value = roles.includes(1) || roles.includes(2)
		const teacherIds = org.value.teacherIds ?? []
		canReplaceTeacher.value = isCreator.value && hasAdminOrTeacherRole.value && teacherIds.length > 1
		if (org.value.type === 0) {
			orgName.value = org.value.name
		} else {
			const users = await usersStore.fetchUsers([org.value.creatorId])
			if (users.length === 1) {
				const creator = users[0]
				orgName.value = creator.nickName
			}
		}
	}
	const entries = usersStore.entries.filter(entry => entry._id === props.entryId)
	if (entries.length > 0) {
		entry.value = entries[0]
		status.value = entry.value.info.status
		const operatorId = entry.value.info.operator
		const users = await usersStore.fetchUsers([operatorId]) as User[]
		if (users.length > 0) {
			operator.value = users[0]
			const timestamp = entry.value.info.date
			const date = new Date(timestamp)
			operateTime.value = format(date)
		}
	}
})

const isShowTeacher = computed(() => {
	return props.forStudent && 
		typeof(teacher.value) !== 'undefined' && 
		status.value === 0
})

const statusDesc = computed(() => {
	let desc = ''
	if (status.value === 0) {
		desc = "·  在读"
	} else if (status.value === 1) {
		desc = "·  已结课"
	} else if (status.value === 2) {
		desc = "·  已退课"
	}
	return desc
})

const statusClass = computed(() => {
	let cls = ''
	if (status.value === 0) {
		cls = "status normal"
	} else if (status.value === 1) {
		cls = "status finish"
	} else if (status.value === 2) {
		cls = "status revoke"
	}
	return cls
})

const finishClass = computed(() => {
	let cls = 'action finish'
	if (status.value === 1) {
		cls = "action disable"
	}
	return cls
})

const revokeClass = computed(() => {
	let cls = 'action revoke'
	if (status.value === 2) {
		cls = "action disable"
	}
	return cls
})

const onReplaceTap = () => {
	popup.value?.open()
}

const onConfirm = async (data: {teacherId: string}) => {
	if (typeof(entry.value) !== 'undefined') {
		const teacherId = data.teacherId
		uni.showLoading({
			title:"正在变更"
		})
		const result = await courseStore.changeCourseTeacher(entry.value._id, teacherId)
		if (result) {
			entry.value.teacherId = teacherId
			const teachers = await usersStore.fetchUsers([teacherId]) as User[]
			if (teachers.length === 1) {
				teacher.value = teachers[0]
			}
		}
		uni.hideLoading()
		uni.showToast({
			title: result?"变更成功":"变更失败",
			duration: global.duration_toast,
			icon: result?"success":"error"
		})
	}
	popup.value?.close()
}

const onRenewConfirm = (data: {
							isRenew:boolean, 
							updated:boolean, 
							count:number, 
							total:number, 
							consume:number}) => {
	renewPopup.value?.close()
	const { isRenew, updated, count, total, consume } = data
	if (isRenew) {
		status.value = 0
		totalCourse.value += count
	} else {
		if (updated) {
			totalCourse.value = total
			consumeCourse.value = consume
		}
	}
}

const onActionTap = (e:UniHelper.EventTarget) => {
	const { id } = e.target
	if (id === 'renew') {
		isRenew.value = true
		renewPopup.value?.open()
	} else if (id === 'finish') {
		finishCourse()
	} else if (id === 'revoke') {
		revokeCourse()
	}
}

const onEditTap = () => {
	isRenew.value = false
	renewPopup.value?.open()
}

const finishCourse = async () => {
	// 1. 检查剩余课时
	const count = props.total - props.consume
	if (count > 0) {
		uni.showToast({
			title:"还剩余" + count + (course.value?.type === 2? "课次":"课时") + "，不能结课",
			duration: global.duration_toast,
			icon: "none"
		})
		return
	}
	// 2. 结课
	if (typeof(entry.value) !== 'undefined') {
		const student = await usersStore.fetchStudentByNo(entry.value.studentId) as Student
		if (typeof(student) !== 'undefined' && 
			student.nickName.length > 0) {
			const content = "确定要给" + student.nickName + "的" + course.value?.name + "课程结课吗?"
			uni.showModal({
				title: global.appName,
				content: content,
				success: async function (res) {
					if (res.confirm && typeof(entry.value) !== 'undefined') {
						const entryId = entry.value._id
						const operator = usersStore.owner._id
						const result = await courseStore.finishCourse(entryId, operator)
						if (result) {
							status.value = 1
							operateTime.value = format(new Date())
							entry.value.info = {
								status: 1,
								date: Date.now(),
								operator
							}
						}
						uni.showToast({
							title:result?"结课成功":"结课失败",
							duration: global.duration_toast,
							icon: result?"success":"fail"
						})
					} else if (res.cancel) {}
				}
			});
		}
	}
}

const revokeCourse = async () => {
	if (typeof(entry.value) !== 'undefined') {
		const count = entry.value.total - entry.value.consume
		if (count === 0) {
			uni.showToast({
				title:"课程已耗完，您可以选择结课",
				duration: global.duration_toast,
				icon: "none"
			})
			return
		}
		const student = await usersStore.fetchStudentByNo(entry.value.studentId) as Student
		if (typeof(student) !== 'undefined' &&
			student.nickName.length > 0) {
			const prefix = "还剩余" + count + (course.value?.type === 2?"课次":"课时")
			const content = prefix + "，确定要给" + student.nickName + "的" + course.value?.name + "课程退课吗?"
			uni.showModal({
				title: global.appName,
				content: content,
				success: async function (res) {
					if (res.confirm && typeof(entry.value) !== 'undefined') {
						const entryId = entry.value._id
						const operator = usersStore.owner._id
						const result = await courseStore.revokeCourse(entryId, operator, entry.value.consume)
						if (result) {
							status.value = 2
							totalCourse.value = entry.value.consume
							entry.value.total = entry.value.consume
							operateTime.value = format(new Date())
							entry.value.info = {
								status: 2,
								date: Date.now(),
								operator
							}
							const paymentRecord = await courseStore.fetchLastestPaymentRecord(entry.value.studentId, entry.value.courseId) as PaymentRecord
							courseStore.revokePaymentRecord({
								orgId: entry.value.orgId,
								studentId: entry.value.studentId,
								date: Date.now(),
								courseId: entry.value.courseId,
								count: -count,
								price: paymentRecord.price,
								remark: ''
							})
							uni.$emit(global.event_name.didUpdateCourseData, {studentNo: entry.value.studentId})
						}
						uni.showToast({
							title:result?"退课成功":"退课失败",
							duration: global.duration_toast,
							icon: result?"success":"fail"
						})
					} else if (res.cancel) {}
				}
			});
		}
	}
}

</script>

<style lang="scss" scoped>
.course-card {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.top {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 30px;
		.text {
			margin-left: $uni-spacing-row-sm;
			font-size: $uni-font-size-base;
		}
		.undo {
			margin-left: $uni-spacing-row-sm;
		}
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: 0;
			right: 0;
		}
		.status {
			margin-left: $uni-spacing-row-sm;
			font-size: $uni-font-size-sm;
		}
		.normal {
			color: $wk-theme-color;
		}
		.finish {
			color: $wk-text-color-grey;
		}
		.revoke {
			color: $uni-color-error;
		}
	}
	.duration, .operator, .operateTime {
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
	.teacher {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 28px;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		.teacher-cell {
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			.icon {
				width: 28px;
				height: 28px;
				border-radius: $uni-border-radius-circle;
				margin: 0 $uni-spacing-row-sm;
			}
			.replace {
				margin-left: $uni-spacing-row-sm;
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
	.operation {
		display: flex;
		flex-direction: row;
		align-items: center;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
		.right {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
			.action {
				margin-left: $uni-spacing-row-lg;
				background-color: $wk-theme-color;
				color: white;
				padding: $uni-padding-sm $uni-padding-base;
				border-radius: $uni-border-radius-base;
			}
			.revoke {
				background-color: $uni-color-error;
			}
			.disable {
				background-color: $wk-bg-color-grey;
				color: $wk-text-color-grey;
			}
		}
	}
}
</style>