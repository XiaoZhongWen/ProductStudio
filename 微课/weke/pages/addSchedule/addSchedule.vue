<template>
	<view class="add-schedule-container">
		<view class="section type" v-if="scheduleId.length === 0">
			<text>类型</text>
			<radio-group @change="radioChange">
				<label class="radio">
					<radio 
						value="0" 
						color="#5073D6"
						:checked="selectedCourseType === 0" />
					<text :class="selectedCourseType === 0? 'selectedColor':'textColor'">一对一</text>
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
					<uni-icons 
						type="right" 
						color="#c6c8cf" 
						v-if="scheduleId.length === 0"></uni-icons>
				</view>
			</view>
			<template v-else>
				<view class="row" @tap="onClassTap">
					<view class="left">班级</view>
					<view class="right">
						<text>{{selectedGrade}}</text>
						<uni-icons v-if="scheduleId.length === 0" type="right" color="#c6c8cf"></uni-icons>
					</view>
				</view>
				<view class="row after" v-if="selectedClassId.length > 0" @tap="onStudentTap('multiple-plus')">
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
			<view class="picker-container" v-if="selectedDate">
				<DateCard 
					class="date-card" 
					type="date" 
					@onDateChange="onDateChange"
					:date="selectedDate" 
					:isFullDay="isFullDay" />
				<DateCard 
					class="date-card" 
					type="time" 
					@onTimeChange="onTimeChange"
					:date="selectedDate" 
					:isFullDay="isFullDay"
					:start="selectedStartTime"
					:end="selectedEndTime" />
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
		<view class="section duration" v-if="isShowCourseDesc">
			<view class="row">
				<text>课程类型</text>
				<text class="type">{{courseType}}</text>
			</view>
			<view class="row consume" v-if="courseTypeValue !== 2">
				<text>课程时长</text>
				<text class="type">{{duration + "分钟"}}</text>
			</view>
			<view class="row remain" v-if="isShowRemain">
				<text>剩余{{courseTypeValue === 2?'课次':'课时'}}:</text>
				<text class="desc">{{remainCount}}{{courseTypeValue === 2?'次课':'课时'}}</text>
			</view>
			<view class="row consume">
				<text>预计消耗</text>
				<uni-data-select
					:clear="false"
					v-model="consume"
					:localdata="range">
				</uni-data-select>
			</view>
			<view class="row total" v-if="selectedCourseType === 1">
				<text>共计:</text>
				<text class="desc">{{totalConsume}}</text>
			</view>
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
						:checked="isNotice" 
						color="#5073D6" 
						style="transform:scale(0.7)" 
						@change="onNoticeSwitchChange" />
				</view>
			</view>
			<view 
				class="row space" 
				@tap="onRepeatTap" 
				v-if="scheduleId.length === 0">
				<view class="left">
					<view class="top">
						<uni-icons type="loop" color="#5073D6"></uni-icons>
						<text class="repeat">重复</text>
					</view>
					<view class="bottom">
						<text class="desc">重复次数不超过50次</text>
					</view>
				</view>
				<view class="right">
					<text>{{repeatDesc}}</text>
					<uni-icons type="right" color="#c6c8cf"></uni-icons>
				</view>
			</view>
			<view 
				class="row deadline" 
				@tap="onDeadlineTap" 
				v-if="repeatOption !== 0 
						&& repeatOption !== 4 
						&& scheduleId.length === 0">
				<text>结束重复</text>
				<text style="color: #c6c8cf;">{{endRepeatDate.length > 0? endRepeatDate: '请选择截止日期'}}</text>
			</view>
		</view>
		<view class="section course-content">
			<view class="desc">
				<textarea 
					class="textarea" 
					placeholder="课程内容"
					maxlength="300"
					v-model="courseInfo"
				/>
				<text class="number">{{300 - courseInfo.length}}</text>
			</view>
		</view>
		<view class="section preview-content">
			<view class="desc">
				<textarea 
					class="textarea" 
					placeholder="预习内容"
					maxlength="300"
					v-model="previewInfo"
				/>
				<text class="number">{{300 - previewInfo.length}}</text>
			</view>
		</view>
		<view class="finish">
			<button
				v-if="!usersStore.isExpired"
				@tap="onSchedule"
				class="btn" 
				type="default">
				{{scheduleId.length > 0?"更新":"完成"}}
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
				ref="repeatCardRef"
				v-if="selectedDate"
				:day="selectedDate.getDay()"
				@onCancel="onCancel" 
				@onRepeatConfirm="onRepeatConfirm" />
		</uni-popup>
		<wu-calendar ref="calendar" @confirm="calendarConfirm" :insert="false"></wu-calendar>
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
import { useScheduleStore } from "@/store/schedules"
import { useSenderStore } from "@/store/sender"
import { Grade } from '../../types/grade'
import { onLoad } from '@dcloudio/uni-app'
import { totalClasses, yyyyMMdd, ymd, hhmm } from '@/utils/wk-date'
import DateCard from './components/DateCard.vue'
import RepeatCard from './components/RepeatCard.vue'
import wkChooseMemberVue from '@/components/wk-choose-member/wk-choose-member.vue';
import { Entry } from '../../types/entry'
import { Schedule } from '../../types/schedule'
import { ModifyDateNotification } from '../../types/notification'

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const courseStore = useCourseStore()
const gradesStore = useGradesStore()
const scheduleStore = useScheduleStore()
const senderStore = useSenderStore()

const popup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const repeatPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const calendar = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const scheduleId = ref('')
const originalSchedule = ref<Schedule>()
const consume = ref(0)
const isFullDay = ref(false)
const isNotice = ref(false)
const chooseMemberRef = ref(null)
const repeatCardRef = ref(null)
const range = ref<{value:number, text:string}[]>([])

const selectedCourseType = ref<number>()
const selectedClassId = ref('')
const selectedStudentId = ref('')
// 学员课程
const selectedCourseId = ref('')
// 学员老师
const selectedTeacherId = ref('')
// 班级课程
const selectedClassCourseId = ref('')
// 班级老师
const selectedClassTeacherId = ref('')
const repeatOption = ref<number>(0)
const repeatDays = ref<number[]>([])
const repeatDates = ref<string[]>([])
const endRepeatDate = ref<string>('')
const courseInfo = ref('')
const previewInfo = ref('')
const selectedGradient = ref<string[]>(['#4e54c8', '#8f94fb'])
const courseType = ref('')
const courseTypeValue = ref()
const duration = ref(0)

const students = ref<Student[]>([])
const grades = ref<Grade[]>([])
const courses = ref<Course[]>([])
const teachers = ref<User[]>([])

const selectedDate = ref<Date>()
const selectedStartTime = ref<{hour:number, min:number}>()
const selectedEndTime = ref<{hour:number, min:number}>()

const global = getApp().globalData!

// 控制consume初始化的值被异步更新
let skip = false
let _ownId = ''
onLoad(async (option) => {
	const { id, date, ownId } = option as {
		id?: string,
		date?: string,
		ownId?: string
	}
	_ownId = ownId ?? ''
	const userId = usersStore.owner._id
	const orgIds = useOrgs.orgs.filter(
		o => o.creatorId === userId || 
			 o.teacherIds?.includes(userId)).map(org => org._id)
	const cIds:string[] = []
	const tIds:string[] = []
	usersStore.entries.forEach(e => {
		if (e.status === 0 && 
			orgIds.includes(e.orgId)) {
			if (!cIds.includes(e.courseId)) {
				cIds.push(e.courseId)
			}
			if (!tIds.includes(e.teacherId)) {
				tIds.push(e.teacherId)
			}
		}
	})
	uni.showLoading({
		title: "加载中..."
	})
	if (cIds.length > 0) {
		await courseStore.fetchCourses(cIds)
	}
	if (tIds.length > 0) {
		await usersStore.fetchUsers(tIds)
	}
	if (date) {
		selectedDate.value = new Date(date)
		const hour = (new Date()).getHours()
		selectedStartTime.value = {
			hour: hour,
			min: 0
		}
		selectedEndTime.value = {
			hour: hour + 1,
			min: 0
		}
	}
	if (id) {
		skip = true
		uni.setNavigationBarTitle({
			title: "更新"
		})
		scheduleId.value = id
		let schedule = {} as Schedule
		Array.from(scheduleStore.schedulesMap).find(([k, v]) => {
			const index = v.findIndex(s => s._id === scheduleId.value)
			const result = index !== -1
			if (result) {
				schedule = v[index]
			}
			return result
		})
		originalSchedule.value = schedule
		
		if (JSON.stringify(schedule) !== '{}') {
			const type = schedule.classId?.length === 0? 0: 1
			if (type === 0) {
				selectedStudentId.value = schedule.studentId ?? ''
				selectedCourseId.value = schedule.courseId
				selectedTeacherId.value = schedule.teacherId
			} else {
				selectedClassId.value = schedule.classId ?? ''
				students.value = await usersStore.fetchStudentsByIds(schedule.presentIds ?? [])
				selectedClassCourseId.value = schedule.courseId
				selectedClassTeacherId.value = schedule.teacherId
			}
			selectedCourseType.value = type
			if (schedule.gradients.length > 0) {
				selectedGradient.value = schedule.gradients
			}
			selectedDate.value = new Date(schedule.courseDate)
			const start = new Date(schedule.startTime)
			const sh = start.getHours()
			const sm = start.getMinutes()
			selectedStartTime.value = {
				hour: start.getHours(),
				min: start.getMinutes()
			}
			const end = new Date(schedule.endTime)
			const eh = end.getHours()
			const em = end.getMinutes()
			selectedEndTime.value = {
				hour: end.getHours(),
				min: end.getMinutes()
			}
			isFullDay.value = sh === 0 && sm === 0 && eh === 23 && em === 59
			consume.value = schedule.consume
			isNotice.value = schedule.remind ?? false
			courseInfo.value = schedule.courseContent ?? ''
			previewInfo.value = schedule.previewContent ?? ''
			uni.$emit(global.event_name.onGradientChanged, {gradient:schedule.gradients})
		}
	} else {
		selectedCourseType.value = 0
	}
	uni.hideLoading()
})

watch(selectedCourseType, async (type) => {
	if (scheduleId.value.length === 0) {
		students.value = []
	}
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
			const res = await usersStore.fetchStudentsByIds([selectedStudentId.value])
			if (res.length === 1) {
				studentNo = res[0].studentNo
			}
		}
		usersStore.entries.forEach(e => {
			if (e.status === 0 && orgIds.includes(e.orgId)) {
				const res = courseStore.courses.filter(c => c._id === e.courseId)
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
		})
		students.value = await usersStore.fetchStudentsByNos(studentIds)
		if (students.value.length === 1) {
			const student = students.value[0]
			selectedStudentId.value = student._id
		}
		courses.value = courseStore.courses.filter(c => courseIds.includes(c._id))
		if (courses.value.length === 1) {
			selectedCourseId.value = courseIds[0]
		}
		teachers.value = usersStore.users.filter(user => teacherIds.includes(user._id))
		if (teachers.value.length === 1) {
			selectedTeacherId.value = teacherIds[0]
		}
	} else {
		const classIds:string[] = [] 
		useOrgs.orgs.forEach(org => {
			if (org.creatorId === userId) {
				classIds.push(...org.classIds ?? [])
			}
		})
		grades.value = await gradesStore.fetchGrades(classIds)
		if (selectedClassId.value.length > 0 || grades.value.length === 1) {
			let grade = grades.value[0]
			if (selectedClassId.value.length > 0) {
				const res = grades.value.filter(c => c._id === selectedClassId.value)
				if (res.length === 1) {
					grade = res[0]
				}
			}
			const courseId = grade.courseId ?? ''
			const teacherId = grade.teacherId ?? ''
			if (scheduleId.value.length === 0) {
				students.value = await usersStore.fetchStudentsByIds(grade.studentIds ?? [])
			}
			courses.value = courseStore.courses.filter(c => c._id === courseId)
			teachers.value = usersStore.users.filter(u => u._id === teacherId)
			selectedClassId.value = grade._id
			selectedClassCourseId.value = courseId
			selectedClassTeacherId.value = teacherId
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
			students.value = await usersStore.fetchStudentsByIds(studentIds)
			if (students.value.length === 1) {
				const student = students.value[0]
				selectedStudentId.value = student._id
			}
			courses.value = courseStore.courses.filter(c => courseIds.includes(c._id))
			if (courses.value.length === 1) {
				selectedClassCourseId.value = courseIds[0]
			}
			teachers.value = usersStore.users.filter(user => teacherIds.includes(user._id))
			if (teachers.value.length === 1) {
				selectedClassTeacherId.value = teacherIds[0]
			}
		}
	}
})

watch(selectedStudentId, async (sId) => {
	const userId = usersStore.owner._id
	const courseIds:string[] = []
	const teacherIds:string[] = []
	const orgIds = useOrgs.orgs.filter(o => o.creatorId === userId).map(org => org._id)
	const res = await usersStore.fetchStudentsByIds([sId])
	if (res.length === 1) {
		const student = res[0]
		usersStore.entries.forEach(e => {
			if (e.status === 0) {
				const res = courseStore.courses.filter(c => c._id === e.courseId)
				if (res.length === 1) {
					const c = res[0]
					if (orgIds.includes(e.orgId) && 
						c.type !== 1 && 
						e.studentId === student.studentNo) {
						if (!courseIds.includes(e.courseId)) {
							courseIds.push(e.courseId)
						}
						if (!teacherIds.includes(e.teacherId)) {
							teacherIds.push(e.teacherId)
						}
					}
				}
			}
		})
	}
	courses.value = courseStore.courses.filter(c => courseIds.includes(c._id))
	if (courses.value.length === 1) {
		selectedCourseId.value = courseIds[0]
	} else {
		if (scheduleId.value.length === 0) {
			selectedCourseId.value = ''
		}
	}
	teachers.value = usersStore.users.filter(u => teacherIds.includes(u._id))
	if (teachers.value.length === 1) {
		selectedTeacherId.value = teacherIds[0]
	} else {
		selectedTeacherId.value = ''
	}
})

watch(selectedClassId, async (classId) => {
	const res = grades.value.filter(c => c._id === classId)
	if (res.length === 1) {
		const grade = res[0]
		students.value = await usersStore.fetchStudentsByIds(grade.studentIds ?? [])
		courses.value = courseStore.courses.filter(c => c._id === grade.courseId)
		teachers.value = usersStore.users.filter(u => u._id === grade.teacherId)
		selectedClassCourseId.value = grade.courseId ?? ''
		selectedClassTeacherId.value = grade.teacherId ?? ''
	}
})

watch([selectedCourseId, selectedClassCourseId], ([id1, id2]) => {
	let id = id1
	if (selectedCourseType.value === 1) {
		id = id2
	}
	const res = courseStore.courses.filter(c => c._id === id)
	if (res.length === 1) {
		range.value = []
		const course = res[0]
		
		duration.value = course.duration
		courseTypeValue.value = course.type
		
		if (course.type === 0) {
			courseType.value = "一对一"
		} else if (course.type === 1) {
			courseType.value = "班课"
		} else if (course.type === 2) {
			courseType.value = "次课"
		} else if (course.type === 3) {
			courseType.value = "试听课"
		}
		let unit = "课时"
		if (course.type === 2) {
			unit = "次课"
			if (!skip) {
				consume.value = 1
			}
		} else {
			const hourOffset = (selectedEndTime.value?.hour ?? 0) - (selectedStartTime.value?.hour ?? 0)
			const minOffset =  (selectedEndTime.value?.min ?? 0) - (selectedStartTime.value?.min ?? 0)
			const offset = hourOffset * 60 + minOffset
			const count = Math.floor(offset / course.duration)
			if (!skip) {
				consume.value = count
			}
		}
		[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(i => {
			range.value.push({
				value: i + 1,
				text: i + 1 + unit
			})
		})
	}
})

watch([selectedStartTime, selectedEndTime], ([s, e]) => {
	if (skip) {
		return
	}
	let cId = selectedCourseId.value
	if (selectedCourseType.value === 1) {
		cId = selectedClassCourseId.value
	}
	const res = courseStore.courses.filter(c => c._id === cId)
	if (res.length === 1) {
		const course = res[0]
		if (course.type === 2) {
			consume.value = 1
		} else {
			const hourOffset = (e?.hour ?? 0) - (s?.hour ?? 0)
			const minOffset =  (e?.min ?? 0) - (s?.min ?? 0)
			const offset = hourOffset * 60 + minOffset
			const count = Math.floor(offset / course.duration)
			consume.value = count
			if (count === 0) {
				consume.value = 1
			}
		}
	}
},{ deep: true })

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

const totalConsume = computed(() => {
	const count = students.value.length
	if (count === 0) {
		return consume.value + "课时"
	} else {
		return consume.value + "*" + count + "=" + consume.value * count + "课时"
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
	let courseId = selectedCourseId.value
	if (selectedCourseType.value === 1) {
		courseId = selectedClassCourseId.value
	}
	if (courseId.length > 0 && courses.value.length > 0) {
		const res = courses.value.filter(c => c._id === courseId)
		return res[0].name
	} else {
		return "选择课程"
	}
})

const selectedTeacher = computed(() => {
	let teacherId = selectedTeacherId.value
	if (selectedCourseType.value === 1) {
		teacherId = selectedClassTeacherId.value
	}
	if (teacherId.length > 0 && teachers.value.length > 0) {
		const res = teachers.value.filter(t => t._id === teacherId)
		return res[0].nickName
	} else {
		return "选择老师"
	}
})

const repeatDesc = computed(() => {
	const weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
	let str = "无"
	if (repeatOption.value === 4) {
		str = "自选日期"
	} else if (repeatOption.value === 3) {
		const s:string[] = []
		repeatDays.value.forEach(day => {
			s.push(weeks[day])
		})
		str = s.join('、')
	} else {
		if (repeatOption.value === 0) {
			str = "无"
		} else if (repeatOption.value === 1) {
			str = "每天"
		} else if (repeatOption.value === 2) {
			const day = selectedDate.value?.getDay() ?? 0
			str = "每" + weeks[day]
		}
	}
	return str
})

const isShowCourseDesc = computed(() => {
	const c1 = selectedCourseType.value === 0 && selectedCourseId.value.length > 0
	const c2 = selectedCourseType.value === 1 && selectedClassCourseId.value.length > 0
	return c1 || c2
})

const isShowRemain = computed(() => {
	if (selectedCourseType.value === 0) {
		return selectedStudentId.value.length > 0 &&
		selectedCourseId.value.length > 0 &&
		selectedTeacherId.value.length > 0
	} else {
		return selectedClassId.value.length > 0 &&
		selectedClassCourseId.value.length > 0 &&
		selectedClassTeacherId.value.length > 0
	}
})

const remainCount = computed(() => {
	if (selectedCourseType.value === 0) {
		const res = usersStore.students.filter(s => s._id === selectedStudentId.value)
		if (res.length === 1) {
			const student = res[0]
			const entries = usersStore.entries.filter(e => e.studentId === student.studentNo &&
											e.courseId === selectedCourseId.value &&
											e.teacherId === selectedTeacherId.value)
			if (entries.length === 1) {
				const entry:Entry = entries[0]
				return entry.total - entry.consume
			}
		}
		return ''
	} else {
		const classes = gradesStore.grades.filter(c => c._id === selectedClassId.value)
		if (classes.length === 1) {
			const c:Grade = classes[0]
			const res = usersStore.students.filter(s => c.studentIds?.includes(s._id))
			if (res.length > 0) {
				const studentNos = res.map(s => s.studentNo)
				let total = 0
				let consume = 0
				usersStore.entries.forEach(e => {
					if (studentNos.includes(e.studentId) &&
						e.courseId === selectedClassCourseId.value &&
						e.teacherId === selectedClassTeacherId.value) {
						total += e.total
						consume += e.consume
					}
				})
				return total - consume
			}
		}
		return ''
	}
})

const onStudentTap = async (type:string) => {
	if (students.value.length < 2 && selectedCourseType.value === 0) {
		return
	}
	if (type === 'single' && scheduleId.value.length > 0) {
		return
	}
	if (chooseMemberRef.value) {
		const studentIds = students.value.map(s => s._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		if (type === 'single') {
			instance.initial({
				selectedMemberId: selectedStudentId.value,
				memberIds: studentIds,
				type,
				role: "student"
			})
		} else {
			const res = grades.value.filter(c => c._id === selectedClassId.value)
			if (res.length === 1) {
				const grade = res[0]
				const members = await usersStore.fetchStudentsByIds(grade.studentIds ?? [])
				const memberIds = members.map(member => member._id)
				instance.initial({
					memberIds: memberIds,
					invitedIds: studentIds,
					type,
					role: "student"
				})
			}
		}
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
		let teacherId = selectedTeacherId.value
		if (selectedCourseType.value === 1) {
			teacherId = selectedClassTeacherId.value
		}
		instance.initial({
			selectedMemberId: teacherId,
			memberIds: teacherIds,
			type: "single",
			role: "teacher"
		})
		popup.value?.open()
	}
}

const onClassTap = () => {
	if (grades.value.length < 2 || scheduleId.value.length > 0) {
		return
	}
	if (chooseMemberRef.value) {
		const classIds = grades.value.map(c => c._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			selectedMemberId: selectedClassId.value,
			memberIds: classIds,
			type: "single",
			role: "class"
		})
		popup.value?.open()
	}
}

const onCourseTap = () => {
	// 课程数小于2或者该排课已经发送过通知
	if (courses.value.length < 2 || originalSchedule.value?.isNotified) {
		return
	}
	if (chooseMemberRef.value) {
		const courseIds = courses.value.map(c => c._id)
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			selectedMemberId: selectedCourseId.value,
			memberIds: courseIds,
			type: "single",
			role: "course"
		})
		popup.value?.open()
	}
}

const onRepeatTap = () => {
	repeatPopup.value?.open()
	if (repeatCardRef.value) {
		const instance:InstanceType<typeof RepeatCard> = repeatCardRef.value
		let selectedDates = []
		if (repeatDates.value.length > 0) {
			selectedDates = repeatDates.value
		} else {
			selectedDates = [yyyyMMdd(selectedDate.value!)]
		}
		const days:number[] = []
		repeatDays.value.forEach(day => days.push(day))
		instance.initial(repeatOption.value, days, selectedDates)
	}
}

const onCancel = () => {
	repeatPopup.value?.close()
}

const onRepeatConfirm = (data: {
	option: number,
	days: number[],
	dates: string[]
}) => {
	const { option, days, dates } = data
	repeatOption.value = option
	repeatDays.value = days
	repeatDates.value = dates
	repeatPopup.value?.close()
}

const radioChange = (e:{detail:{value:string}}) => {
	const { value } = e.detail
	selectedCourseType.value = parseInt(value)
}

const onColorChanged = (data:{gradient: string[]}) => {
	const { gradient } = data
	selectedGradient.value = gradient
}

const onFullDaySwitchChange = (e:{detail:{value: boolean}}) => {
	const { value } = e.detail
	isFullDay.value = value
}

const onNoticeSwitchChange = (e:{detail:{value: boolean}}) => {
	const { value } = e.detail
	isNotice.value = value
}

const onConfirm = async (data: {
	role:string, 
	type:string, 
	memberId: string,
	memberIds: string[]
}) => {
	skip = false
	const { role, type, memberId, memberIds } = data
	if (role === 'student') {
		if (type === 'single') {
			selectedStudentId.value = memberId
		} else if (type === 'multiple-plus') {
			students.value = await usersStore.fetchStudentsByIds(memberIds)
		}
	} else if (role === 'teacher') {
		if (selectedCourseType.value === 0) {
			selectedTeacherId.value = memberId
		} else if (selectedCourseType.value === 1) {
			selectedClassTeacherId.value = memberId
		}
	} else if (role === 'course') {
		if (selectedCourseType.value === 0) {
			selectedCourseId.value = memberId
		} else if (selectedCourseType.value === 1) {
			selectedClassCourseId.value = memberId
		}
	} else if (role === 'class') {
		selectedClassId.value = memberId
	}
	popup.value?.close()
}

const onDateChange = (data: {date:Date}) => {
	const { date } = data
	selectedDate.value = date
}

const onTimeChange = (data: {
	start:{hour:number, min:number}, 
	end: {hour:number, min:number},
}) => {
	skip = false
	const { start, end } = data
	selectedStartTime.value = start
	selectedEndTime.value = end
}

const onDeadlineTap = () => {
	calendar.value?.open()
}

const calendarConfirm = (e:{fulldate:string}) => {
	const { fulldate } = e
	const start = new Date(selectedDate.value as Date)
	start.setHours(0, 0, 0, 0)
	const deadline = new Date(fulldate)
	deadline.setHours(0, 0, 0, 0)
	if (deadline.getTime() >= start.getTime()) {
		endRepeatDate.value = fulldate
	} else {
		uni.showToast({
			title: "截止日期不能早于排课日期",
			duration: global.duration_toast,
			icon: "none"
		})
	}
}

const validate = () => {
	if (selectedCourseType.value === 0) {
		// 学员
		if (selectedStudentId.value.length === 0) {
			uni.showToast({
				title: "请选择学员",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
		if (selectedCourseId.value.length === 0) {
			uni.showToast({
				title: "请选择课程",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
		if (selectedTeacherId.value.length === 0) {
			uni.showToast({
				title: "请选择老师",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
	} else if (selectedCourseType.value === 1) {
		// 班级
		if (selectedClassId.value.length === 0) {
			uni.showToast({
				title: "请选择班级",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
		// 上课学员
		if (students.value.length === 0) {
			uni.showToast({
				title: "请选择上课学员",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
		if (selectedClassCourseId.value.length === 0) {
			uni.showToast({
				title: "请选择课程",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
		if (selectedClassTeacherId.value.length === 0) {
			uni.showToast({
				title: "请选择老师",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		}
	}
	if (repeatOption.value !== 0 && 
		repeatOption.value !== 4) {
		if (endRepeatDate.value.length === 0) {
			uni.showToast({
				title: "请选择截止日期",
				duration: global.duration_toast,
				icon: "none"
			})
			return false
		} else {
			const deadline = new Date(endRepeatDate.value)
			let daysOfWeek:number[] = []
			if (repeatOption.value === 1) {
				// 每天
				daysOfWeek = [0, 1, 2, 3, 4, 5, 6]
			}
			if (repeatOption.value === 2) {
				// 每周
				const day = selectedDate.value?.getDay() ?? 0
				daysOfWeek = [day]
			}
			if (repeatOption.value === 3) {
				daysOfWeek = repeatDays.value
			}
			const total = totalClasses(selectedDate.value!, deadline, daysOfWeek)
			if (total > 50) {
				uni.showToast({
					title: "重复次数不能超过50次",
					duration: global.duration_toast,
					icon: "none"
				})
				return false
			}
		}
	}
	if (repeatOption.value === 4 && repeatDates.value.length > 50) {
		uni.showToast({
			title: "重复次数不能超过50次",
			duration: global.duration_toast,
			icon: "none"
		})
		return false
	}
	return true
}

const onSchedule = async () => {
	const isValid = validate()
	if (!isValid) {
		return
	}
	const date = Date.now()
	let courseId = selectedCourseId.value
	let teacherId = selectedTeacherId.value
	const gradients = selectedGradient.value
	
	let studentId = ''
	let classId = ''
	let presentIds:string[] = []
	if (selectedCourseType.value === 0) {
		studentId = selectedStudentId.value
	} else {
		classId = selectedClassId.value
		presentIds = students.value.map(s => s._id)
		courseId = selectedClassCourseId.value
		teacherId = selectedClassTeacherId.value
	}
	
	let orgId = ''
	const res = useOrgs.orgs.filter(org => org.courseIds?.includes(courseId))
	if (res.length === 1) {
		const org = res[0]
		orgId = org._id
	}
	
	if (orgId.length === 0) {
		uni.showToast({
			title: "排课失败",
			duration: global.duration_toast,
			icon: "none"
		})
		return
	}
	const start = new Date(selectedDate.value as Date)
	let sh = selectedStartTime.value?.hour ?? 0
	let sm = selectedStartTime.value?.min ?? 0
	if (isFullDay.value) {
		sh = 0
		sm = 0
	}
	start?.setHours(sh)
	start?.setMinutes(sm)
	const end = new Date(selectedDate.value as Date)
	let eh = selectedEndTime.value?.hour ?? 0
	let em = selectedEndTime.value?.min ?? 0
	if (isFullDay.value) {
		eh = 23
		em = 59
	}
	end?.setHours(eh)
	end?.setMinutes(em)
	const startTime = start!.getTime()
	const endTime = end!.getTime()

	const remind = isNotice.value
	const repeatType = repeatOption.value
	let days = repeatDays.value
	if (repeatType === 0 || repeatType === 4) {
		days = []
	}
	if (repeatType === 1) {
		days = [0, 1, 2, 3, 4, 5, 6]
	}
	if (repeatType === 2) {
		days = [start.getDay()]
	}
	const dates = repeatDates.value
	const courseContent = courseInfo.value
	const previewContent = previewInfo.value
	
	if (scheduleId.value.length > 0) {
		// 更新
		uni.showLoading({
			title: "正在更新"
		})
		let schedule = {} as Schedule
		Array.from(scheduleStore.schedulesMap).find(([k, v]) => {
			const index = v.findIndex(s => s._id === scheduleId.value)
			const result = index !== -1
			if (result) {
				schedule = v[index]
			}
			return result
		})
		if (JSON.stringify(schedule) !== '{}') {
			const oStartTime = originalSchedule.value!.startTime
			const oEndTime = originalSchedule.value!.endTime
			const preCourseDate = schedule.courseDate
			const result = await scheduleStore.updateSchedule2({
				scheduleId: scheduleId.value,
				studentId: schedule.studentId ?? '',
				classId: schedule.classId ?? '',
				status: schedule.status,
				date,
				orgId,
				presentIds,
				courseId,
				teacherId,
				gradients,
				startTime,
				endTime,
				remind,
				courseContent,
				previewContent,
				consume: consume.value,
				preConsume: schedule.consume
			})
			uni.hideLoading()
			if (result) {
				uni.navigateBack()
				const cDate = new Date(startTime)
				const year = cDate.getFullYear()
				const month = String(cDate.getMonth() + 1).padStart(2, '0')
				const day = String(cDate.getDate()).padStart(2, '0')
				const courseDate = year + '-' + month + '-' + day
				if (courseDate !== preCourseDate && _ownId.length > 0) {
					scheduleStore.modifyCachedScheduleDates(
						_ownId,
						preCourseDate, 
						courseDate, 
						schedule.status
					)
				}
				if (oStartTime !== startTime ||
					oEndTime !== endTime) {
					// 排课时间变更通知
					const oStart = new Date(oStartTime)
					const oEnd = new Date(oEndTime)
					const mStartTime = new Date(startTime)
					const mEndTime = new Date(endTime)
					const originalTime = ymd(oStart) + " " + hhmm(oStart) + "~" + hhmm(oEnd)
					const modifyTime = ymd(mStartTime) + " " + hhmm(mStartTime) + "~" + hhmm(mEndTime)
					modifyTimeNotification(originalTime, modifyTime)
				}
			} else {
				uni.showToast({
					title: "更新失败",
					duration: global.duration_toast,
					icon: "none"
				})
			}
		}
	} else {
		// 创建
		uni.showLoading({
			title: "排课中"
		})
		const result = await scheduleStore.createSchedule({
			date,
			orgId,
			studentId,
			classId,
			presentIds,
			courseId,
			teacherId,
			gradients,
			startTime,
			endTime,
			remind,
			repeatType,
			repeatDays: days,
			repeatDates: dates,
			endRepeatDate: endRepeatDate.value,
			courseContent,
			previewContent,
			consume: consume.value
		})
		uni.hideLoading()
		uni.showToast({
			title: result.length > 0?"排课成功":"排课失败",
			duration: global.duration_toast,
			icon: result.length > 0?"success":"none"
		})
		if (result.length > 0) {
			selectedStudentId.value = ''
			selectedClassId.value = ''
			selectedTeacherId.value = ''
			courseInfo.value = ''
			previewInfo.value = ''
			repeatOption.value = 0
			repeatDays.value = []
			repeatDates.value = []
			endRepeatDate.value = ''
		}
	}
}

const modifyTimeNotification = (originalTime:string, newTime:string) => {
	const set:ModifyDateNotification[] = []
	if (selectedCourseType.value === 0) {
		const s = usersStore.students.filter(s => s._id === selectedStudentId.value)
		if (s.length === 1) {
			s[0].associateIds?.forEach(id => {
				const item:ModifyDateNotification = {
					userId: id,
					course: selectedCourse.value,
					student: selectedStudent.value,
					originalTime,
					newTime
				}
				set.push(item)
			})
		}
	} else {
		students.value.forEach(s => {
			s.associateIds?.forEach(id => {
				const item:ModifyDateNotification = {
					userId: id,
					course: selectedCourse.value,
					student: s.nickName,
					originalTime,
					newTime
				}
				set.push(item)
			})
		})
	}
	senderStore.templateMessage(set, "modify_date")
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
	.duration {
		font-size: $uni-font-size-base;
		color: $wk-text-color;
		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			.type {
				color: $wk-text-color-grey;
			}
		}
		.consume {
			margin-top: $uni-spacing-col-base;
			.input {
				text-align: right;
			}
		}
		.total, .remain {
			margin-top: $uni-spacing-col-sm;
			.desc {
				font-size: $uni-font-size-base;
				color: $wk-text-color-grey;
			}
		}
		.remain {
			margin-top: $uni-spacing-col-base;
		}
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
		}
		.space {
			font-size: $uni-font-size-base;
			margin-top: $uni-spacing-col-base;
			.left {
				.repeat {
					margin-left: $uni-spacing-row-sm;
					color: $wk-text-color;
				}
			}
			.right {
				display: flex;
				flex-direction: row;
				align-items: center;
				color: $wk-text-color-grey;
			}
		}
		.deadline {
			color: $wk-text-color;
			font-size: $uni-font-size-base;
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
