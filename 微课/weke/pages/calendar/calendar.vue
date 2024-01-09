<template>
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
		<template v-for="schedule in schedules" :key="schedule._id">
			<ScheduleCard 
				class="scheduleCard" 
				:ownId="usersStore.owner._id"
				:schedule="schedule" 
				@tap="onScheduleCardTap(schedule)" />
		</template>
		<view
			class="add-container" 
			@tap="onAddTap" 
			v-if="isShowAddBtn">
			<uni-icons class="icon" type="plusempty" color="#fff" size=25></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useScheduleStore } from "@/store/schedules"
import { computed, onMounted, ref } from 'vue';
import ScheduleCard from './components/ScheduleCard.vue'
import { timestampForBeginOfMonth, timestampForEndOfMonth, yyyyMMdd } from '@/utils/wk-date'
import { Schedule } from "../../types/schedule";
import { CourseTag } from "../../types/course";

const selectedDate = ref(yyyyMMdd(new Date()))
const usersStore = useUsersStore()
const scheduleStore = useScheduleStore()

const global = getApp().globalData!

const isShowAddBtn = computed(() => {
	return usersStore.owner.roles?.includes(1) ||
			usersStore.owner.roles?.includes(2)
})

onMounted(() => {
	uni.$on(global.didFinishedInitialData, async () => {
		const date = new Date()
		const from = timestampForBeginOfMonth(date)
		const to = timestampForEndOfMonth(date)
		const userId = usersStore.owner._id
		await scheduleStore.fetchSchedulesDate(userId, from, to)
		await scheduleStore.fetchSchedules(userId, yyyyMMdd(date))
	})
})

const selected = computed(() => {
	const result:CourseTag[] = []
	const userId = usersStore.owner._id
	const scheduleDates = scheduleStore.scheduleDatesMap.get(userId) ?? []
	scheduleDates.forEach(s => {
		const tag:CourseTag = {
			date: s.date,
			info: '课',
			infoColor: s.status === 0?'#5073D6':'#808080'
		}
		result.push(tag)
	})
	return result
})

const schedules = computed(() => {
	const userId = usersStore.owner._id
	const schedules = scheduleStore.schedulesMap.get(userId) ?? []
	const result = schedules.filter(s => s.courseDate === selectedDate.value)
	result.sort((a, b) => {
	  // 先按status递增排序
	  if (a.status !== b.status) {
	    return a.status - b.status;
	  }
	  // 如果status相同，再按startTime递增排序
	  return a.startTime - b.startTime;
	})
	return result
})

const isShowLoading = computed(() => {
	const userId = usersStore.owner._id
	const scheduleDates = scheduleStore.scheduleDatesMap.get(userId) ?? []
	const index = scheduleDates.findIndex(item => item.date === selectedDate.value)
	return index !== -1 && schedules.value.length === 0
})

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
	const from = timestampForBeginOfMonth(date)
	const to = timestampForEndOfMonth(date)
	uni.showLoading({
		title: "加载中"
	})
	const userId = usersStore.owner._id
	await scheduleStore.fetchSchedulesDate(userId, from, to)
	uni.hideLoading()
}

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addSchedule/addSchedule?date="+selectedDate.value
	})
}

const onScheduleCardTap = (schedule: Schedule) => {
	const roles = usersStore.roles ?? []
	const res = usersStore.owner.from === 'stuNo' || 
		(roles.includes(3) && roles.length === 1)
	if (res) {
		return
	}
	uni.navigateTo({
		url: "/pages/addSchedule/addSchedule?id="+schedule._id
	})
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
