<template>
	<view class="schedule-card-container">
		<view :class="statusCls">{{statusDesc}}</view>
		<view class="content">
			<view class="left">
				<view 
					@tap="onCheckedTap"
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
								:url="student.avatarUrl" 
								:name="student.nickName">
							</wk-portrait>
						</template>
					</view>
				</view>
				<view class="section row" v-if="course">
					<text>{{course.type === 1?'课次:':'课时:'}} {{props.schedule.consume}} {{course.type === 1?'次课':'课时'}}</text>
				</view>
				<view :class="duration">
					<text>上课时间: {{dateDesc}} {{start}} ~ {{end}} {{props.schedule.remind?'⏰':''}} </text>
				</view>
			</view>
		</view>
		<view class="bottom">
			<text v-if="org">{{org.name}}</text>
			<view class="right" v-if="!checked">
				<text class="action leave" @tap="onLeaveTap">标记请假</text>
				<text class="action delete" @tap="onDeleteTap">删除</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Student, User } from '../../../types/user';
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

const props = defineProps(['schedule'])

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()
const gradesStore = useGradesStore()
const scheduleStore = useScheduleStore()

const student = ref<Student>()
const total = ref(0)
const consume = ref(0)
const course = ref<Course>()
const teacher = ref<User>()
const start = ref(hhmm(new Date(props.schedule.startTime)))
const end = ref(hhmm(new Date(props.schedule.endTime)))
const presents = ref<Student[]>([])
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
	const courses = courseStore.courses.filter(c => c._id === courseId)
	if (courses.length === 1) {
		course.value = courses[0]
	}
	const users = usersStore.users.filter(user => user._id === teacherId)
	if (users.length === 1) {
		teacher.value = users[0]
	}
	
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
			const studentIds = grade.value.studentIds ?? []
			presents.value = usersStore.students.filter(s => studentIds.includes(s._id))
			const studentNos = presents.value.map(s => s.studentNo)
			usersStore.entries.forEach(e => {
				if (studentNos.includes(e.studentId) && 
					e.courseId === courseId &&
					e.teacherId === teacherId &&
					e.orgId === orgId) {
					total.value += e.total
					consume.value += e.consume
				}
			})
		}
	} else {
		const studentId = props.schedule.studentId
		if (typeof(studentId) !== 'undefined' && 
			studentId.length > 0) {
			const res = usersStore.students.filter(s => s._id === studentId)
			if (res.length === 1) {
				student.value = res[0]
			}
			const entries = usersStore.entries.filter(e => e.studentId === student.value?.studentNo &&
											e.courseId === courseId &&
											e.teacherId === teacherId &&
											e.orgId === orgId)
			if (entries.length === 1) {
				const entry = entries[0]
				total.value = entry.total
				consume.value = entry.consume
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
		props.schedule.status = schedule.status
		checked.value = !checked.value
		if (status === 2) {
			return
		}
		if (schedule.status === 0) {
			consume.value -= schedule.consume
		} else {
			consume.value += schedule.consume
		}
		if (checked.value && schedule.status === 1) {
			scheduleStore.playChecked()
		}
	}
}

const onLeaveTap = async () => {
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
		props.schedule.status = status
		checked.value = true
		scheduleStore.playChecked()
	}
}

const onDeleteTap = () => {
	const content = "确定要删除学员" + student.value?.nickName + "在" + dateDesc.value + start.value + "~" + end.value + "的" + course.value?.name + "课程吗?"
	uni.showModal({
		title: global.appName,
		content: content,
		success: async (res) => {
			if (res.confirm) {
				await scheduleStore.deleteSchedule(props.schedule._id)
			}
		}
	})
}

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
	let cls = 'top'
	switch (status) {
		case 0: {
			cls = "top status_0"
			break
		}
		case 1: {
			cls = "top status_1"
			break
		}
		case 2: {
			cls = "top status_2"
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

</script>

<style lang="scss" scoped>
.schedule-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	padding: $uni-padding-normal;
	border-radius: $uni-border-radius-lg;
	.top {
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
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-lg;
		.action {
			margin-left: $uni-spacing-row-lg;
			background-color: $wk-theme-color;
			color: white;
			padding: $uni-padding-sm $uni-padding-base;
			border-radius: $uni-border-radius-base;
		}
		.delete {
			background-color: $uni-color-error;
		}
	}
}
</style>