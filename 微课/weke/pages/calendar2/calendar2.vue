<template>
	<view class="calendar2-container">
		<wu-calendar
			:insert="true" 
			:fold="true"
			:selected="selected"
			color="#5073D6"
			slideSwitchMode="horizontal"
			@change="calendarChange"
			@monthSwitch="onMonthSwitch">
		</wu-calendar>
		<uni-load-more v-if="isShowLoading" status="loading" />
		<template v-for="schedule in schedules" :key="schedule._id">
			<ScheduleCard 
				class="scheduleCard" 
				:ownId="_id"
				:schedule="schedule" 
				@tap="onScheduleCardTap(schedule)" />
		</template>
	</view>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { useScheduleStore } from "@/store/schedules"
import ScheduleCard from '../calendar/components/ScheduleCard.vue';
import { CourseTag } from '../../types/course';
import { timestampForBeginOfMonth, timestampForEndOfMonth, yyyyMMdd } from '@/utils/wk-date'
import { Schedule } from '../../types/schedule';

const selectedDate = ref(yyyyMMdd(new Date()))
const usersStore = useUsersStore()
const scheduleStore = useScheduleStore()
const useOrgs = useOrgsStore()

const _id = ref('')
const _role = ref('')
const _from = ref(0)
const _to = ref(0)
const selected = ref<CourseTag[]>([])
const schedules = ref<Schedule[]>([])
const isShowLoading = ref(false)

onLoad(async (option) => {
	const { id, role } = option as {
		id: string,
		role: string
	}
	_id.value = id
	_role.value = role
})

onMounted(async () => {
	uni.showLoading({
		title: "加载中..."
	})
	const date = new Date()
	const from = timestampForBeginOfMonth(date)
	const to = timestampForEndOfMonth(date)
	_from.value = from
	_to.value = to
	await scheduleStore.fetchSchedulesDate(_id.value, from, to)
	await scheduleStore.fetchSchedules(_id.value, yyyyMMdd(date))
	let title = ''
	if (_role.value === "2") {
		const users = usersStore.users.filter(u => u._id === _id.value)
		if (users.length === 1) {
			const teacher = users[0]
			title = teacher.nickName
		}
	} else if (_role.value === "4") {
		const students = usersStore.students.filter(s => s._id === _id.value)
		if (students.length === 1) {
			const student = students[0]
			title = student.nickName
		}
	}
	uni.setNavigationBarTitle({
		title
	})
	uni.hideLoading()
})

watchEffect(() => {
	const result:CourseTag[] = []
	const key1 = _id.value + "-" + _from.value + "-" + _to.value
	const scheduleDates = scheduleStore.scheduleDatesMap.get(key1) ?? []
	if (scheduleDates) {
		scheduleDates.forEach(s => {
			const tag:CourseTag = {
				date: s.date,
				info: '课',
				infoColor: s.status === 0?'#5073D6':'#808080'
			}
			result.push(tag)
		})
	}
	selected.value = result
	
	const key2 = _id.value + "-" + selectedDate.value
	const values = scheduleStore.schedulesMap.get(key2)
	if (values) {
		values.sort((a, b) => {
		  // 先按status递增排序
		  if (a.status !== b.status) {
		    return a.status - b.status;
		  }
		  // 如果status相同，再按startTime递增排序
		  return a.startTime - b.startTime;
		})
		schedules.value = values
	}
	
	const index = scheduleDates.findIndex(item => item.date === selectedDate.value)
	isShowLoading.value = index !== -1 && schedules.value.length === 0
})

const calendarChange = async (e:{fulldate:string}) => {
	const { fulldate } = e
	selectedDate.value = fulldate
	await scheduleStore.fetchSchedules(_id.value, fulldate)
}

const onMonthSwitch = async (e:{year:number, month:number}) => {
	const { year, month } = e
	const str = year + '-' + month + '-' + '1'
	const date = new Date(str)
	const from = timestampForBeginOfMonth(date)
	const to = timestampForEndOfMonth(date)
	_from.value = from
	_to.value = to
	uni.showLoading({
		title: "加载中"
	})
	await scheduleStore.fetchSchedulesDate(_id.value, from, to)
	uni.hideLoading()
}

const onScheduleCardTap = (schedule: Schedule) => {
	// 家长和学生不能进入详情
	const roles = usersStore.roles ?? []
	const res = usersStore.owner.from === 'stuNo' || 
		(roles.includes(3) && roles.length === 1)
	if (res) {
		return
	} else {
		// 非该课程老师并且非该课程所在机构的管理员不能进入详情
		const userId = usersStore.owner._id
		const isTeacher = schedule.teacherId === userId
		if (!isTeacher) {
			const orgs = useOrgs.orgs.filter(org => org.creatorId === userId)
			const index = orgs.findIndex(org => org.courseIds?.includes(schedule.courseId))
			if (index === -1) {
				return
			}
		}
	}
	uni.navigateTo({
		url: "/pages/addSchedule/addSchedule?id="+schedule._id + "&ownId=" + _id.value
	})
}

</script>

<style lang="scss">
.calendar2-container {
	display: flex;
	flex-direction: column;
	.card {
		margin: $uni-spacing-col-sm $uni-spacing-row-base;
		height: 100px;
		background-color: white
	}
	.wu-calendar__content {
		background-color: transparent !important;
		.wu-calendar__header-btn-box {
			visibility: hidden;
		}
		.wu-calendar__weeks {
			color: $wk-text-color-grey;
		}
	}
	.scheduleCard {
		margin: $uni-spacing-row-base $uni-spacing-row-base 0 $uni-spacing-row-base;
	}
}
</style>
