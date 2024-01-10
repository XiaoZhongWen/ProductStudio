<template>
	<view class="schedule-card-container">
		<view class="top">
			<view :class="statusCls">{{statusDesc}}</view>
		</view>
		<view class="content">
			<view class="left" v-if="!isStudentOrParents">
				<view 
					@tap.stop="onCheckedTap"
					:checked="checked" 
					:class="cBoxCls"
					:style="{color: checked?'#c6c8cf':`${props.schedule.gradients[0]}`}">
				</view>
			</view>
			<view class="right">
				<view class="main">
					<template v-if="props.schedule.classId">
						<view v-if="grade" :class="grade.icon"></view>
						<text v-if="grade" class="class-name">{{grade.name}}</text>
						<wk-circle-progress
							v-if="total > 0"
							class="circle-progress" 
							:total="total" 
							:consume="consume">
						</wk-circle-progress>
					</template>
					<template v-else>
						<view class="wk-icon" v-if="student">
							<wk-icon
								@tap.stop="onStudentTap(student.studentNo)"
								:text="student.nickName"
								:url="student.avatarUrl">
							</wk-icon>
						</view>
						<text class="nickName" v-if="student">{{student.nickName}}</text>
						<wk-circle-progress
							v-if="total > 0"
							class="circle-progress" 
							:total="total" 
							:consume="consume">
						</wk-circle-progress>
					</template>
				</view>
				<view class="section tag" v-if="isShowTag" @tap.stop="onTagTap">
					<uni-tag
						id="preview"
						class="tag" 
						:circle="true" 
						size="mini" 
						type="primary" 
						text="预习" 
						v-if="isShowPreview">
					</uni-tag>
					<uni-tag
						id="course-content"
						class="tag" 
						:circle="true" 
						size="mini" 
						type="success" 
						text="课程内容" 
						v-if="isShowCourseContent">
					</uni-tag>
					<uni-tag
						id="assignment"
						class="tag" 
						:circle="true" 
						size="mini" 
						type="warning" 
						text="作业" 
						v-if="isShowAssignment">
					</uni-tag>
					<uni-tag 
						id="feedback"
						class="tag" 
						:circle="true" 
						size="mini" 
						custom-style="background-color: #5073D6; border-color: #5073D6; color: #fff;" 
						text="反馈" 
						v-if="isShowFeedback">
					</uni-tag>
				</view>
				<view class="section course" v-if="course">
					<text>课程: {{course.name}}</text>
				</view>
				<view class="section teacher" v-if="teacher">
					<text>老师: {{teacher.nickName}}</text>
				</view>
				<view class="students" v-if="presents.length > 0">
					<text>学员: </text>
					<view class="cell-container">
						<template v-for="student in presents" :key="student._id">
							<wk-portrait
								@tap.stop="onStudentTap(student.studentNo)"
								:url="student.avatarUrl" 
								:name="student.nickName">
							</wk-portrait>
						</template>
					</view>
				</view>
				<view class="section row" v-if="course">
					<text>{{course.type === 2?'课次:':'课时:'}} {{props.schedule.consume}}{{course.type === 2?'次课':'课时'}}</text>
				</view>
				<view class="section row" v-if="course && course.type === 1">
					<text>共计: {{props.schedule.consume}}*{{props.schedule.presentIds.length}}={{props.schedule.consume*props.schedule.presentIds.length}}课时</text>
				</view>
				<view :class="duration">
					<text>上课时间: {{dateDesc}} {{start}} ~ {{end}} {{props.schedule.remind?'⏰':''}} </text>
				</view>
			</view>
		</view>
		<view class="bottom">
			<text v-if="org">{{org.name}}</text>
			<template v-if="!isStudentOrParents">
				<view class="right offset-sm" v-if="props.schedule.status===0">
					<view
						@tap.stop="onEditCoursePreviewTap"
						class=".iconfont .icon-preview action preview">
					</view>
					<view
						@tap.stop="onEditCourseContentTap"
						class=".iconfont .icon-round-assignment-p action content">
					</view>
					<view 
						@tap.stop="onLeaveTap"
						class=".iconfont .icon-qingjia action leave">
					</view>
					<uni-icons
						@tap.stop="onDeleteTap"
						size="24"
						type="trash" 
						class="action delete" 
						color="#dd524d">
					</uni-icons>
				</view>
				<view class="right offset" v-else-if="props.schedule.status===1">
					<uni-icons
						@tap.stop="onEditCourseFeedbackTap"
						size="24"
						type="compose" 
						class="action feedback" 
						color="#5073D6">
					</uni-icons>
					<view
						@tap.stop="onEditCourseAssignmentTap"
						class=".iconfont .icon-round-assignment-p action assignment">
					</view>
				</view>
			</template>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Student } from '../../../types/user';
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { useGradesStore } from "@/store/grades"
import { useScheduleStore } from "@/store/schedules"
import { Course } from '../../../types/course';
import { hhmm, md } from '@/utils/wk-date'
import { Org } from '../../../types/org';
import { Grade } from '../../../types/grade';
import { Schedule } from '../../../types/schedule';

const props = defineProps(['schedule', 'ownId'])

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()
const gradesStore = useGradesStore()
const scheduleStore = useScheduleStore()

const student = ref<Student>()
const org = ref<Org>()
const grade = ref<Grade>()
const checked = ref(false)

const global = getApp().globalData!

onMounted(async () => {
	const courseId = props.schedule.courseId ?? ''
	const teacherId = props.schedule.teacherId ?? ''
	const orgId = props.schedule.orgId ?? ''
	if (typeof(courseId) === 'undefined' || courseId.length === 0 ||
		typeof(teacherId) === 'undefined' || teacherId.length === 0 ||
		typeof(orgId) === 'undefined' || orgId.length === 0) {
		return
	}
	checked.value = props.schedule.status !== 0
	
	const orgs = useOrgs.orgs.filter(org => org._id === orgId)
	if (orgs.length === 1) {
		org.value = orgs[0]
	}
	const classId = props.schedule.classId ?? ''
	if (typeof(classId) !== 'undefined' && 
		classId.length > 0) {
		const grades = gradesStore.grades.filter(c => c._id === classId)
		if (grades.length === 1) {
			grade.value = grades[0]
		}
	} else {
		const studentId = props.schedule.studentId
		if (typeof(studentId) !== 'undefined' && 
			studentId.length > 0) {
			const res = usersStore.students.filter(s => s._id === studentId)
			if (res.length === 1) {
				student.value = res[0]
			}
		}
	}
})

const onCheckedTap = async () => {
	const isChecked = !checked.value
	const schedule:Schedule = props.schedule
	const status = schedule.status
	const result = await scheduleStore.dealSchedule({
		scheduleId: schedule._id,
		orgId: schedule.orgId,
		teacherId: schedule.teacherId,
		studentId: schedule.studentId ?? '',
		courseId: schedule.courseId,
		classId: schedule.classId ?? '',
		presentIds: schedule.presentIds ?? [],
		consume: status === 2?0:schedule.consume,
		status: isChecked?1:0
	})
	if (result) {
		scheduleStore.updateCachedScheduleDate(props.ownId, schedule.courseDate)
		props.schedule.status = schedule.status
		checked.value = !checked.value
		if (status === 2) {
			return
		}
		const studentId = props.schedule.studentId ?? ''
		const classId = props.schedule.classId ?? ''
		uni.$emit("CourseConsumeNeedUpdate", {
			courseDate: props.schedule.courseDate,
			studentId,
			classId
		})
		if (checked.value && schedule.status === 1) {
			scheduleStore.playChecked()
		}
	}
}

const onLeaveTap = async () => {
	uni.showModal({
		title: global.appName,
		content: "确定要将此次课程标记为请假吗?",
		success: async (res) => {
			if (res.confirm) {
				const schedule:Schedule = props.schedule
				const status = 2
				const result = await scheduleStore.dealSchedule({
					scheduleId: schedule._id,
					orgId: schedule.orgId,
					teacherId: schedule.teacherId,
					studentId: schedule.studentId ?? '',
					courseId: schedule.courseId,
					classId: schedule.classId ?? '',
					presentIds: schedule.presentIds ?? [],
					consume: schedule.consume,
					status
				})
				if (result) {
					scheduleStore.updateCachedScheduleDate(props.ownId, schedule.courseDate)
					props.schedule.status = status
					checked.value = true
					scheduleStore.playChecked()
				}
			}
		}
	})
}

const onDeleteTap = () => {
	const content = "确定要删除学员" + student.value?.nickName + "在" + dateDesc.value + start.value + "~" + end.value + "的" + course.value?.name + "课程吗?"
	uni.showModal({
		title: global.appName,
		content: content,
		success: async (res) => {
			if (res.confirm) {
				const result = await scheduleStore.deleteSchedule(props.schedule._id)
				if (result) {
					scheduleStore.updateCachedScheduleDate(props.ownId, props.schedule.courseDate)
				}
			}
		}
	})
}

const onEditCourseContentTap = () => {
	uni.navigateTo({
		url: "/pages/editSchedule/editSchedule?type=1&scheduleId="+props.schedule._id
	})
}

const onEditCoursePreviewTap = () => {
	uni.navigateTo({
		url: "/pages/editSchedule/editSchedule?type=0&scheduleId="+props.schedule._id
	})
}

const onEditCourseFeedbackTap = () => {
	uni.navigateTo({
		url: "/pages/editSchedule/editSchedule?type=3&scheduleId="+props.schedule._id
	})
}

const onEditCourseAssignmentTap = () => {
	uni.navigateTo({
		url: "/pages/editSchedule/editSchedule?type=2&scheduleId="+props.schedule._id
	})
}

const onStudentTap = (studentNo:string) => {
	uni.navigateTo({
		url:"/pages/course-bind/course-bind?studentNo="+studentNo+"&orgIds="+org.value?._id
	})
}

const onTagTap = (e:{target:{id:string}}) => {
	const { id } = e.target
	let url = ''
	if (id === 'preview') {
		url = "/pages/editSchedule/editSchedule?type=0&scheduleId="+props.schedule._id
	} else if (id === 'course-content') {
		url = "/pages/editSchedule/editSchedule?type=1&scheduleId="+props.schedule._id
	} else if (id === 'assignment') {
		url = "/pages/editSchedule/editSchedule?type=2&scheduleId="+props.schedule._id
	} else if (id === 'feedback') {
		url = "/pages/editSchedule/editSchedule?type=3&scheduleId="+props.schedule._id
	}
	uni.navigateTo({url})
}

const isShowTag = computed(() => {
	const preview = props.schedule.previewContent ?? ''
	const courseContent = props.schedule.courseContent ?? ''
	const assignment = props.schedule.assignment ?? ''
	const feedback = props.schedule.feedback ?? ''
	return preview.length > 0 || 
			courseContent.length > 0 || 
			assignment.length > 0 || 
			feedback.length > 0
})

const course = computed(() => {
	const courses:Course[] = courseStore.courses.filter(c => c._id === props.schedule.courseId)
	return courses[0]
})

const teacher = computed(() => {
	const users = usersStore.users.filter(user => user._id === props.schedule.teacherId)
	return users[0]
})

const presents = computed(() => {
	const studentIds = props.schedule.presentIds ?? []
	return usersStore.students.filter(s => studentIds.includes(s._id))
})

const isShowPreview = computed(() => {
	const preview = props.schedule.previewContent ?? ''
	return preview.length > 0
})

const isShowCourseContent = computed(() => {
	const courseContent = props.schedule.courseContent ?? ''
	return courseContent.length > 0
})

const isShowAssignment = computed(() => {
	const assignment = props.schedule.assignment ?? ''
	return assignment.length > 0
})

const isShowFeedback = computed(() => {
	const feedback = props.schedule.feedback ?? ''
	return feedback.length > 0
})

const isStudentOrParents = computed(() => {
	const roles = usersStore.roles ?? []
	return usersStore.owner.from === 'stuNo' || 
		(roles.includes(3) && roles.length === 1)
})

const statusDesc = computed(() => {
	const status = props.schedule.status
	let str = ''
	switch (status) {
		case 0: {
			str = "已排课"
			break
		}
		case 1: {
			str = "已消课"
			break
		}
		case 2: {
			str = "已请假"
			break
		}
	}
	return str
})

const statusCls = computed(() => {
	const status = props.schedule.status
	let cls = 'row'
	switch (status) {
		case 0: {
			cls = "row status_0"
			break
		}
		case 1: {
			cls = "row status_1"
			break
		}
		case 2: {
			cls = "row status_2"
			break
		}
	}
	return cls
})

const cBoxCls = computed(() => {
	if (checked.value) {
		return 'iconfont icon-round-check_box-px checkbox'
	} else {
		return 'iconfont icon-checkbox-blank-outline checkbox'
	}
})

const start = computed(() => {
	return hhmm(new Date(props.schedule.startTime))
})

const end = computed(() => {
	return hhmm(new Date(props.schedule.endTime))
})

const dateDesc = computed(() => {
	const cur = new Date()
	const date = new Date(props.schedule.startTime)
	const offset = cur.getDate() - date.getDate()
	let str = ''
	switch (offset) {
		case 0: {
			str = "今天, "
			break
		}
		case 1: {
			str = "昨天, "
			break
		}
		case -1: {
			str = "明天, "
			break
		}
		case 2: {
			str = "前天, "
			break
		}
		case -2: {
			str = "后天, "
			break
		}
		default: {
			str = md(date) + ", "
		}
	}
	return str
})

const duration = computed(() => {
	const cur = new Date()
	const date = new Date(props.schedule.startTime)
	const offset = cur.getTime() - date.getTime()
	if (checked.value) {
		return 'section done'
	}
	return offset > 0? "section expired": "section duration"
})

const total = computed(() => {
	const classId = props.schedule.classId ?? ''
	const courseId = props.schedule.courseId ?? ''
	const teacherId = props.schedule.teacherId ?? ''
	const orgId = props.schedule.orgId ?? ''
	
	let t = 0
	if (typeof(classId) !== 'undefined' && 
		classId.length > 0) {
		const studentIds = grade.value?.studentIds ?? []
		const datas = usersStore.students.filter(s => studentIds.includes(s._id))
		const studentNos = datas.map(s => s.studentNo)
		usersStore.entries.forEach(e => {
			if (studentNos.includes(e.studentId) && 
				e.courseId === courseId &&
				e.teacherId === teacherId &&
				e.orgId === orgId) {
				t += e.total
			}
		})
	} else {
		const entries = usersStore.entries.filter(e => e.studentId === student.value?.studentNo &&
										e.courseId === courseId &&
										e.teacherId === teacherId &&
										e.orgId === orgId)
		if (entries.length === 1) {
			const entry = entries[0]
			t = entry.total
		}
	}
	return t
})

const consume = computed(() => {
	const classId = props.schedule.classId ?? ''
	const courseId = props.schedule.courseId ?? ''
	const teacherId = props.schedule.teacherId ?? ''
	const orgId = props.schedule.orgId ?? ''
	
	let c = 0
	if (typeof(classId) !== 'undefined' && 
		classId.length > 0) {
		const studentIds = grade.value?.studentIds ?? []
		const datas = usersStore.students.filter(s => studentIds.includes(s._id))
		const studentNos = datas.map(s => s.studentNo)
		usersStore.entries.forEach(e => {
			if (studentNos.includes(e.studentId) && 
				e.courseId === courseId &&
				e.teacherId === teacherId &&
				e.orgId === orgId) {
				c += e.consume
			}
		})
	} else {
		const entries = usersStore.entries.filter(e => e.studentId === student.value?.studentNo &&
										e.courseId === courseId &&
										e.teacherId === teacherId &&
										e.orgId === orgId)
		if (entries.length === 1) {
			const entry = entries[0]
			c = entry.consume
		}
	}
	return c
})

</script>

<style lang="scss" scoped>
.schedule-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	padding: $uni-padding-normal;
	border-radius: $uni-border-radius-lg;
	position: relative;
	.top {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		.row {
			font-size: $uni-font-size-sm;
			margin-bottom: $uni-spacing-row-base;;
		}
		.status_0 {
			color: $wk-theme-color;
		}
		.status_1 {
			color: $wk-text-color-grey;
		}
		.status_2 {
			color: $uni-color-warning;
		}
	}
	.content {
		display: flex;
		flex-direction: row;
		.left {
			display: flex;
			width: 30px;
			height: 30px;
			justify-content: center;
			align-items: center;
			.checkbox {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 20px;
				width: 30px;
				height: 30px;
			}
		}
		.right {
			display: flex;
			flex-direction: column;
			flex: 1;
			margin-left: $uni-spacing-row-base;
			.main {
				position: relative;
				display: flex;
				flex-direction: row;
				align-items: center;
				.wk-icon {
					width: 30px;
					height: 30px;
				}
				.nickName {
					font-size: $uni-font-size-base;
					color: $wk-text-color;
					margin-left: $uni-spacing-row-base;
				}
				.circle-progress {
					position: absolute;
					top: 0px;
					right: 0px;
				}
				.icon {
					margin-left: $uni-spacing-row-sm;
				}
			}
			.section {
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
			}
			.tag {
				margin: $uni-spacing-col-lg $uni-spacing-col-lg 0 0 ;
			}
			.course {
				margin-top: $uni-spacing-col-lg;
			}
			.teacher {
				margin-top: $uni-spacing-col-sm;
			}
			.row {
				margin-top: $uni-spacing-col-sm;
			}
			.expired {
				margin-top: $uni-spacing-col-sm;
				color: $uni-color-error;
			}
			.done {
				margin-top: $uni-spacing-col-sm;
				color: $wk-text-color-grey;
			}
			.duration {
				margin-top: $uni-spacing-col-sm;
				color: $wk-theme-color;
			}
			.students {
				display: flex;
				flex-direction: row;
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
				margin-top: $uni-spacing-col-sm;
				.cell-container {
					flex: 1;
					display: flex;
					flex-direction: row;
					flex-flow: row wrap;
				}
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-end;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-lg;
		.right {
			display: flex;
			flex-direction: row;
			.action {
				margin-left: $uni-spacing-row-lg;
			}
			.content, .preview {
				position: relative;
				top: 2px;
				font-size: 22px;
				color: $wk-theme-color;
			}
			.assignment {
				position: relative;
				top: 5px;
				font-size: 22px;
				color: $wk-theme-color;
			}
			.leave, .feedback {
				font-size: 24px;
				color: $wk-theme-color;
			}
		}
		.offset-sm {
			position: relative;
			top: 2px;
		}
		.offset {
			position: relative;
			top: 6px;
		}
	}
}
</style>