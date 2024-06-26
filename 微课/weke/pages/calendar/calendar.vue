<template>
	<z-paging ref="paging" refresher-only @onRefresh="onRefresh">
		<view class="calendar-container">
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
			<template v-if="usersStore.owner.roles?.includes(1)">
				<uni-collapse  accordion v-model="accordionVal">
					<template v-for="key in scheduleMap.keys()" :key="key">
						<uni-collapse-item :title="sectionName(key)">
							<template v-for="schedule in scheduleMap.get(key)" :key="schedule._id">
								<ScheduleCard
									:ownId="usersStore.owner._id"
									:schedule="schedule" 
									@tap="onScheduleCardTap(schedule)" />
								<view style="height: 10px;"></view>
							</template>
						</uni-collapse-item>
					</template>
				</uni-collapse>
			</template>
			<template v-else>
				<template v-for="schedule in schedules" :key="schedule._id">
					<ScheduleCard 
						class="scheduleCard" 
						:ownId="usersStore.owner._id"
						:schedule="schedule" 
						@tap="onScheduleCardTap(schedule)" />
				</template>
			</template>
			<view
				class="add-container" 
				@tap="onAddTap" 
				v-if="isShowAddBtn">
				<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
			</view>
		</view>
	</z-paging>
</template>

<script setup lang="ts">
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useScheduleStore } from "@/store/schedules"
import { useOrgsStore } from '@/store/orgs'
import { computed, ref, watchEffect } from 'vue';
import ScheduleCard from './components/ScheduleCard.vue'
import { timestampForBeginOfMonth, timestampForEndOfMonth, yyyyMMdd } from '@/utils/wk-date'
import { Schedule } from "../../types/schedule";
import { CourseTag } from "../../types/course";

const selectedDate = ref(yyyyMMdd(new Date()))
const usersStore = useUsersStore()
const scheduleStore = useScheduleStore()
const useOrgs = useOrgsStore()

const global = getApp().globalData!

const from = ref<number>()
const to = ref<number>()
const isShowLoading = ref(false)
const selected = ref<CourseTag[]>([])
const schedules = ref<Schedule[]>([])
const scheduleMap = ref<Map<string, Schedule[]>>(new Map())
const paging = ref(null)
const accordionVal = ref("1")

const isShowAddBtn = computed(() => {
	return !usersStore.isExpired && 
			(usersStore.owner.roles?.includes(1) ||
			usersStore.owner.roles?.includes(2))
})

onLoad(() => {
	uni.$on(global.event_name.didFinishedInitialData, async () => {
		const date = new Date()
		from.value = timestampForBeginOfMonth(date)
		to.value = timestampForEndOfMonth(date)
		selectedDate.value = yyyyMMdd(date)
		loaddata()
	})
	uni.$on(global.event_name.needUpdateCalendarData, async () => {
		const date = new Date()
		from.value = timestampForBeginOfMonth(date)
		to.value = timestampForEndOfMonth(date)
		selectedDate.value = yyyyMMdd(date)
		loaddata()
	})
})

onUnload(() => {
	uni.$off(global.event_name.didFinishedInitialData)
	uni.$off(global.event_name.needUpdateCalendarData)
})

watchEffect(() => {
	const result:CourseTag[] = []
	const userId = usersStore.owner._id
	const key1 = userId + "-" + from.value + "-" + to.value
	const scheduleDates = scheduleStore.scheduleDatesMap.get(key1) ?? []
	scheduleDates.forEach(s => {
		const tag:CourseTag = {
			date: s.date,
			info: '课',
			infoColor: s.status === 0?'#5073D6':'#808080'
		}
		result.push(tag)
	})
	selected.value = result
	
	const key2 = userId + "-" + selectedDate.value
	const values = scheduleStore.schedulesMap.get(key2) ?? []
	const res = values.filter(s => s.courseDate === selectedDate.value)
	res.sort((a, b) => {
	  // 先按status递增排序
	  if (a.status !== b.status) {
	    return a.status - b.status;
	  }
	  // 如果status相同，再按startTime递增排序
	  return a.startTime - b.startTime;
	})
	schedules.value = res
	if (usersStore.owner.roles?.includes(1)) {
		const map = new Map<string, Schedule[]>()
		res.forEach(item => {
			const teacherId = item.teacherId
			if (!map.has(teacherId)) {
				map.set(teacherId, [])
			}
			const array = map.get(teacherId)
			if (typeof(array) !== 'undefined') {
				array.push(item)
			}
		})
		const mySchedules = map.get(userId) ?? []
		if (mySchedules.length > 0) {
			const sortedMap = new Map<string, Schedule[]>()
			sortedMap.set(userId, mySchedules)
			Array.from(map.entries()).forEach(([key, value]) => {
				if (key !== userId) {
					sortedMap.set(key, value)
				}
			})
			scheduleMap.value = sortedMap
		} else {
			scheduleMap.value = map
		}
	}
	const index = scheduleDates.findIndex(item => item.date === selectedDate.value)
	isShowLoading.value = index !== -1 && schedules.value.length === 0
})

const sectionName = (teacherId:string) => {
	if (teacherId === usersStore.owner._id) {
		return "我的排课"
	}
	const data = usersStore.users.filter(user => user._id === teacherId)
	if (data.length > 0) {
		const teacher = data[0]
		return teacher.nickName + "的排课"
	}
	return ''
}

const calendarChange = async (e:{fulldate:string}) => {
	const { fulldate } = e
	const userId = usersStore.owner._id
	selectedDate.value = fulldate
	await scheduleStore.fetchSchedules(userId, fulldate)
}

const onMonthSwitch = async (e:{year:number, month:number}) => {
	const { year, month } = e
	const str = year + '-' + month + '-' + '1'
	const date = new Date(str)
	from.value = timestampForBeginOfMonth(date)
	to.value = timestampForEndOfMonth(date)
	uni.showLoading({
		title: "加载中"
	})
	const userId = usersStore.owner._id
	await scheduleStore.fetchSchedulesDate(userId, from.value, to.value)
	uni.hideLoading()
}

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addSchedule/addSchedule?date="+selectedDate.value
	})
}

const onScheduleCardTap = (schedule: Schedule) => {
	// 家长和学生不能进入详情
	const userId = usersStore.owner._id
	const roles = usersStore.roles ?? []
	const res = usersStore.owner.from === 'stuNo' || 
		(roles.includes(3) && roles.length === 1)
	if (res) {
		return
	} else {
		// 非该课程老师并且非该课程所在机构的管理员不能进入详情
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
		url: "/pages/addSchedule/addSchedule?id="+schedule._id + "&ownId=" + userId
	})
}

const onRefresh = async () => {
	const date = new Date(selectedDate.value)
	from.value = timestampForBeginOfMonth(date)
	to.value = timestampForEndOfMonth(date)
	await loaddata()
	paging.value?.complete()
}

const loaddata = async () => {
	if (from.value && to.value) {
		const userId = usersStore.owner._id
		const key1 = userId + "-" + from.value + "-" + to.value
		const key2 = userId + "-" + selectedDate.value
		scheduleStore.scheduleDatesMap.delete(key1)
		scheduleStore.schedulesMap.delete(key2)
		await scheduleStore.fetchSchedulesDate(userId, from.value, to.value)
		await scheduleStore.fetchSchedules(userId, selectedDate.value)
	}
}

</script>

<style lang="scss">
.calendar-container {
	display: flex;
	flex-direction: column;
	.card {
		margin: $uni-spacing-col-sm $uni-spacing-row-base;
		height: 100px;
		background-color: white
	}
	.add-container {
		display: flex;
		position: fixed;
		justify-content: center;
		align-items: center;
		background-color: $wk-theme-color;
		width: 60px;
		height: 60px;
		border-radius: $uni-border-radius-circle;
		bottom: 30px;
		right: $uni-spacing-row-lg;
		z-index: 1;
	}
	.scheduleCard {
		margin: $uni-spacing-row-base $uni-spacing-row-base 0 $uni-spacing-row-base;
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
	.uni-collapse {
		background-color: transparent;
		.uni-collapse-item {
			.uni-collapse-item__title {
				background-color: transparent;
			}
			.uni-collapse-item__wrap-content.uni-collapse-item--border {
				border-bottom-width: 0px;
			}
		}
		.uni-collapse-item__wrap-content.open {
			padding-left: $uni-spacing-row-base;
			padding-right: $uni-spacing-row-base;
		}
	}
	.uni-collapse-item__title-box, .uni-collapse-item__wrap {
		background-color: transparent;
	}
}
</style>
