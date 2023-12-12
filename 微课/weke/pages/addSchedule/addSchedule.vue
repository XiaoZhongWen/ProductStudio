<template>
	<view class="add-schedule-container">
		<view class="section type">
			<text>类型</text>
			<radio-group @change="radioChange">
				<label class="radio">
					<radio 
						value="0" 
						color="#5073D6"
						:checked="selectedCourseType === 0" />
					<text :class="selectedCourseType === 0? 'selectedColor':'textColor'">学员</text>
				</label>
				<label class="radio">
					<radio 
						value="1" 
						color="#5073D6"
						:checked="selectedCourseType === 1" />
					<text :class="selectedCourseType === 1? 'selectedColor':'textColor'">班级</text>
				</label>
			</radio-group>
		</view>
		<view class="section main">
			<view class="row" v-if="selectedCourseType === 0" @tap="onStudentTap('single')">
				<view class="left">学员</view>
				<view class="right">
					<text>{{selectedStudent}}</text>
					<uni-icons type="right" color="#c6c8cf"></uni-icons>
				</view>
			</view>
			<template v-else>
				<view class="row" @tap="onClassTap">
					<view class="left">班级</view>
					<view class="right">
						<text>{{selectedGrade}}</text>
						<uni-icons type="right" color="#c6c8cf"></uni-icons>
					</view>
				</view>
				<view class="row after" v-if="selectedClassId.length > 0" @tap="onStudentTap('remove')">
					<view class="left">上课学员</view>
					<view class="right">
						<text>{{selectedStudentDesc}}</text>
						<uni-icons type="right" color="#c6c8cf"></uni-icons>
					</view>
				</view>
			</template>
			<view class="row after" @tap="onCourseTap">
				<view class="left">课程</view>
				<view class="right">
					<text>{{selectedCourse}}</text>
					<uni-icons type="right" color="#c6c8cf"></uni-icons>
				</view>
			</view>
			<view class="row after" @tap="onTeacherTap">
				<view class="left">授课老师</view>
				<view class="right">
					<text>{{selectedTeacher}}</text>
					<uni-icons type="right" color="#c6c8cf"></uni-icons>
				</view>
			</view>
			<view class="row after">
				<view class="left">标签</view>
				<view class="right">
					<color-card @onColorChanged="onColorChanged"></color-card>
				</view>
			</view>
		</view>
		<view class="section datePicker">
			<view class="picker-container">
				<DateCard 
					class="date-card" 
					type="date" 
					@onDateChange="onDateChange"
					:date="curDate" 
					:isFullDay="isFullDay" />
				<DateCard 
					class="date-card" 
					type="time" 
					@onTimeChange="onTimeChange"
					:date="curDate" 
					:isFullDay="isFullDay" />
			</view>
		</view>
		<view class="section full-day">
			<text>全天</text>
			<switch 
				class="switch" 
				:checked="false" 
				color="#5073D6" 
				style="transform:scale(0.7)"
				@change="onFullDaySwitchChange" />
		</view>
		<view class="section other">
			<view class="row">
				<view class="left">
					<view class="top">
						<uni-icons type="notification-filled" color="#5073D6"></uni-icons>
						<text class="notice">提醒</text>
					</view>
					<view class="bottom">
						<text class="desc">课前半小时及15分钟各提醒一次</text>
					</view>
				</view>
				<view class="right">
					<switch 
						class="switch" 
						:checked="false" 
						color="#5073D6" 
						style="transform:scale(0.7)" 
						@change="onNoticeSwitchChange" />
				</view>
			</view>
			<view class="row space" @tap="onRepeatTap">
				<text class="repeat">重复</text>
				<uni-icons type="right" color="#c6c8cf"></uni-icons>
			</view>
		</view>
		<view class="section course-content">
			<view class="desc">
				<textarea 
					class="textarea" 
					placeholder="课程内容"
					maxlength="1000" 
				/>
				<text class="number">1000</text>
			</view>
		</view>
		<view class="section preview-content">
			<view class="desc">
				<textarea 
					class="textarea" 
					placeholder="预习内容"
					maxlength="1000" 
				/>
				<text class="number">1000</text>
			</view>
		</view>
		<view class="finish">
			<button
				class="btn" 
				type="default">
				完成
			</button>
		</view>
		<uni-popup ref="popup" type="bottom" id="popup">
			<wk-choose-member
				id="teacher"
				ref="chooseMemberRef"
				@onConfirm="onConfirm">
			</wk-choose-member>
		</uni-popup>
		<uni-popup ref="repeatPopup" type="center">
			<RepeatCard
				v-if="curDate"
				:day="curDate.getDay()"
				@onCancel="onCancel" 
				@onRepeatConfirm="onRepeatConfirm" />
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Course } from '../../types/course'
import { Student, User } from '../../types/user'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { useGradesStore } from "@/store/grades"
import { Grade } from '../../types/grade'
import { onLoad } from '@dcloudio/uni-app'
import DateCard from './components/DateCard.vue'
import RepeatCard from './components/RepeatCard.vue'
import wkChooseMemberVue from '@/components/wk-choose-member/wk-choose-member.vue';

const isFullDay = ref(false)
const isNotice = ref(false)
const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const courseStore = useCourseStore()
const gradesStore = useGradesStore()

const popup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const repeatPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const chooseMemberRef = ref(null)

const selectedCourseType = ref<number>(0)
const selectedClassId = ref('')
const selectedStudentId = ref('')
const selectedCourseId = ref('')
const selectedTeacherId = ref('')

const students = ref<Student[]>([])
const grades = ref<Grade[]>([])
const courses = ref<Course[]>([])
const teachers = ref<User[]>([])

const curDate = ref<Date>()
onLoad(async (option) => {
	const { date } = option as {
		date: string
	}
	curDate.value = new Date(date)
})

watch(selectedCourseType, async (type) => {
	students.value = []
	courses.value = []
	teachers.value = []
	const userId = usersStore.owner._id
	if (type === 0) {
		const studentIds:string[] = []
		const courseIds:string[] = []
		const teacherIds:string[] = []
		const orgIds = useOrgs.orgs.filter(o => o.creatorId === userId).map(org => org._id)
		let studentNo = ''
		if (selectedStudentId.value.length > 0) {
			const res = usersStore.students.filter(s => s._id === selectedStudentId.value)
			if (res.length === 1) {
				studentNo = res[0].studentNo
			}
		}
		for (let e of usersStore.entries) {
			if (e.status === 0 && orgIds.includes(e.orgId)) {
				const res = await courseStore.fetchCourses([e.courseId])
				if (res.length === 1) {
					const c = res[0]
					if (c.type !== 1) {
						if (!studentIds.includes(e.studentId)) {
							studentIds.push(e.studentId)
						}
						if (!courseIds.includes(e.courseId) && (
							studentNo.length === 0 || 
							(studentNo.length > 0 && e.studentId === studentNo))) {
							courseIds.push(e.courseId)
						}
						if (!teacherIds.includes(e.teacherId) && (
							studentNo.length === 0 || 
							(studentNo.length > 0 && e.studentId === studentNo))) {
							teacherIds.push(e.teacherId)
						}
					}
				}
			}
		}
		students.value = usersStore.students.filter(s => studentIds.includes(s.studentNo))
		if (students.value.length === 1) {
			const student = students.value[0]
			selectedStudentId.value = student._id
		}
		courses.value = await courseStore.fetchCourses(courseIds)
		if (courses.value.length === 1) {
			selectedCourseId.value = courseIds[0]
		} else {
			selectedCourseId.value = ''
		}
		teachers.value = await usersStore.fetchUsers(teacherIds) as User[]
		if (teachers.value.length === 1) {
			selectedTeacherId.value = teacherIds[0]
		} else {
			selectedTeacherId.value = ''
		}
	} else {
		const classIds:string[] = []
		if (selectedClassId.value.length > 0) {
			classIds.push(selectedClassId.value)
		} else {
			useOrgs.orgs.forEach(org => {
				if (org.creatorId === userId) {
					classIds.push(...org.classIds ?? [])
				}
			})
		}
		grades.value = await gradesStore.fetchGrades(classIds)
		if (grades.value.length === 1) {
			const grade = grades.value[0]
			const courseId = grade.courseId ?? ''
			const teacherId = grade.teacherId ?? ''
			students.value = usersStore.students.filter(s => grade.studentIds?.includes(s._id))
			courses.value = await courseStore.fetchCourses([courseId])
			teachers.value = usersStore.users.filter(u => u._id === teacherId)
			selectedClassId.value = classIds[0]
			selectedCourseId.value = courseId
			selectedTeacherId.value = teacherId
		} else {
			const studentIds:string[] = []
			const courseIds:string[] = []
			const teacherIds:string[] = []
			grades.value.forEach(c => {
				c.studentIds?.forEach(id => {
					if (!studentIds.includes(id)) {
						studentIds.push(id)
					}
				})
				if (c.courseId && !courseIds.includes(c.courseId)) {
					courseIds.push(c.courseId)
				}
				if (c.teacherId && !teacherIds.includes(c.teacherId)) {
					teacherIds.push(c.teacherId)
				}
			})
			students.value = usersStore.students.filter(s => studentIds.includes(s._id))
			if (students.value.length === 1) {
				const student = students.value[0]
				selectedStudentId.value = student._id
			}
			courses.value = await courseStore.fetchCourses(courseIds)
			if (courses.value.length === 1) {
				selectedCourseId.value = courseIds[0]
			} else {
				selectedCourseId.value = ''
			}
			teachers.value = await usersStore.fetchUsers(teacherIds) as User[]
			if (teachers.value.length === 1) {
				selectedTeacherId.value = teacherIds[0]
			} else {
				selectedTeacherId.value = ''
			}
		}
	}
}, {
	immediate: true
})

watch(selectedStudentId, async (sId) => {
	const userId = usersStore.owner._id
	const courseIds:string[] = []
	const teacherIds:string[] = []
	const orgIds = useOrgs.orgs.filter(o => o.creatorId === userId).map(org => org._id)
	const res = usersStore.students.filter(s => s._id === sId)
	if (res.length === 1) {
		const student = res[0]
		for (let e of usersStore.entries) {
			if (e.status === 0) {
				const res = await courseStore.fetchCourses([e.courseId])
				if (res.length === 1) {
					const c = res[0]
					if (orgIds.includes(e.orgId) && c.type !== 1 && e.studentId === student.studentNo) {
						if (!courseIds.includes(e.courseId)) {
							courseIds.push(e.courseId)
						}
						if (!teacherIds.includes(e.teacherId)) {
							teacherIds.push(e.teacherId)
						}
					}
				}
			}
		}
	}
	courses.value = await courseStore.fetchCourses(courseIds)
	if (courses.value.length === 1) {
		selectedCourseId.value = courseIds[0]
	} else {
		selectedCourseId.value = ''
	}
	teachers.value = usersStore.users.filter(u => teacherIds.includes(u._id))
	if (teachers.value.length === 1) {
		selectedTeacherId.value = teacherIds[0]
	} else {
		selectedTeacherId.value = ''
	}
})

watch(selectedClassId, (classId) => {
	const res = grades.value.filter(c => c._id === classId)
	if (res.length === 1) {
		const grade = res[0]
		students.value = usersStore.students.filter(s => grade.studentIds?.includes(s._id))
		if (students.value.length === 1) {
			const student = students.value[0]
			selectedStudentId.value = student._id
		}
		courses.value = courseStore.course.filter(c => c._id === grade.courseId)
		teachers.value = usersStore.users.filter(u => u._id === grade.teacherId)
		selectedCourseId.value = grade.courseId ?? ''
		selectedTeacherId.value = grade.teacherId ?? ''
	}
})

const selectedStudent = computed(() => {
	const sId = selectedStudentId.value
	if (sId.length > 0 && students.value.length > 0) {
		const res = students.value.filter(s => s._id === sId)
		return res[0].nickName
	} else {
		return "选择学员"
	}
})

const selectedStudentDesc = computed(() => {
	const res = students.value.map(s => s.nickName)
	if (res.length < 4) {
		if (res.length === 0) {
			return "无"
		}
		return res.join('、')
	} else {
		return res.slice(0, 3).join('、') + "等" + res.length + "人"
	}
})

const selectedGrade = computed(() => {
	const cId = selectedClassId.value
	if (cId.length > 0 && grades.value.length > 0) {
		const res = grades.value.filter(c => c._id === cId)
		return res[0].name
	} else {
		return "选择班级"
	}
})

const selectedCourse = computed(() => {
	const courseId = selectedCourseId.value
	if (courseId.length > 0 && courses.value.length > 0) {
		const res = courses.value.filter(c => c._id === courseId)
		return res[0].name
	} else {
		return "选择课程"
	}
})

const selectedTeacher = computed(() => {
	const teacherId = selectedTeacherId.value
	if (teacherId.length > 0 && teachers.value.length > 0) {
		const res = teachers.value.filter(t => t._id === teacherId)
		return res[0].nickName
	} else {
		return "选择老师"
	}
})

const onStudentTap = (type:string) => {
	if (students.value.length < 2) {
		return
	}
	if (chooseMemberRef.value) {
		const studentIds = students.value.map(s => s._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			memberIds: studentIds,
			type,
			role: "student"
		})
		popup.value?.open()
	}
}

const onTeacherTap = () => {
	if (teachers.value.length < 2) {
		return
	}
	if (chooseMemberRef.value) {
		const teacherIds = teachers.value.map(s => s._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			memberIds: teacherIds,
			type: "single",
			role: "teacher"
		})
		popup.value?.open()
	}
}

const onClassTap = () => {
	if (grades.value.length < 2) {
		return
	}
	if (chooseMemberRef.value) {
		const classIds = grades.value.map(c => c._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			memberIds: classIds,
			type: "single",
			role: "class"
		})
		popup.value?.open()
	}
}

const onCourseTap = () => {
	if (courses.value.length < 2) {
		return
	}
	if (chooseMemberRef.value) {
		const courseIds = courses.value.map(c => c._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			memberIds: courseIds,
			type: "single",
			role: "course"
		})
		popup.value?.open()
	}
}

const onRepeatTap = () => {
	repeatPopup.value?.open()
}

const onCancel = () => {
	repeatPopup.value?.close()
}

const onRepeatConfirm = () => {
	debugger
}

const radioChange = (e:{detail:{value:string}}) => {
	const { value } = e.detail
	selectedCourseType.value = parseInt(value)
}

const onColorChanged = (data:{gradient: string[]}) => {
	
}

const onFullDaySwitchChange = (e:{detail:{value: boolean}}) => {
	const { value } = e.detail
	isFullDay.value = value
}

const onNoticeSwitchChange = (e:{detail:{value: boolean}}) => {
	const { value } = e.detail
	isNotice.value = value
}

const onConfirm = (data: {
	role:string, 
	type:string, 
	memberId: string,
	memberIds: string[]
}) => {
	const { role, type, memberId, memberIds } = data
	if (role === 'student') {
		if (type === 'single') {
			selectedStudentId.value = memberId
		} else if (type === 'remove') {
			memberIds.forEach(id => {
				const index = students.value.findIndex(s => s._id === id)
				students.value.splice(index, 1)
			})
		}
	} else if (role === 'teacher') {
		selectedTeacherId.value = memberId
	} else if (role === 'course') {
		selectedCourseId.value = memberId
	} else if (role === 'class') {
		selectedClassId.value = memberId
	}
	popup.value?.close()
}

const onDateChange = (data: {date:Date}) => {
	const { date } = data
	curDate.value = date
}

const onTimeChange = (data: {
	start:{hour:number, min:number}, 
	end: {hour:number, min:number},
}) => {
	const { start, end } = data
	console.info(start)
	console.info(end)
}

</script>

<style lang="scss" scoped>
.add-schedule-container {
	display: flex;
	flex-direction: column;
	.section {
		background-color: white;
		border-radius: $uni-border-radius-base;
		margin: $uni-spacing-col-sm $uni-spacing-row-base;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.switch {
			position: relative;
			left: $uni-spacing-row-base;
		}
	}
	.type {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-size: $uni-font-size-base;
		.radio {
			margin-left: $uni-spacing-row-lg;
			.textColor {
				color: $wk-text-color-grey;
			}
			.selectedColor {
				color: $wk-theme-color;
			}
		}
	}
	.main {
		display: flex;
		flex-direction: column;
		font-size: $uni-font-size-base;
		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
		.after {
			margin-top: $uni-spacing-col-base;
		}
		.right {
			color: $wk-text-color-grey;
		}
	}
	.datePicker {
		display: flex;
		flex-direction: column;
		font-size: $uni-font-size-base;
		.picker-container {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			.date-card {
				width: 48%;
			}
		}
	}
	.full-day {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-size: $uni-font-size-base;
		color: $wk-text-color;
	}
	.other {
		display: flex;
		flex-direction: column;
		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			.top {
				display: flex;
				align-items: center;
			}
			.notice {
				font-size: $uni-font-size-base;
				color: $wk-text-color;
				margin-left: $uni-spacing-row-sm;
			}
			.desc {
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
			}
			.repeat {
				font-size: $uni-font-size-base;
				color: $wk-text-color;
			}
		}
		.space {
			margin-top: $uni-spacing-col-base;
		}
	}
	.course-content, .preview-content {
		.desc {
			position: relative;
			width: 100%;
			.textarea {
				width: 100%;
				height: 100px;
				caret-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				border-radius: $uni-border-radius-base;
			}
			.number {
				position: absolute;
				right: 0px;
				bottom: 0px;
				font-size: $uni-font-size-base;
				color: $wk-text-color-grey;
			}
		}
	}
	.btn {
		margin: 10px 0 40px 0;
		background-color: $wk-theme-color;
		font-size: $uni-font-size-base;
		color: white;
		width: 100%;
	}
	.finish {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: $uni-spacing-col-sm $uni-spacing-row-base;
	}
}
</style>
