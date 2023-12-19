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
		<template v-for="schedule in schedules" :key="schedule._id">
			<ScheduleCard class="scheduleCard" :schedule="schedule" />
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

type CourseTag = {
	date: string,
	info: string,
	infoColor: string
}

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
		await scheduleStore.fetchSchedulesDate(from, to)
		await scheduleStore.fetchSchedules(yyyyMMdd(date))
	})
})

const selected = computed(() => {
	const result:CourseTag[] = []
	scheduleStore.scheduleDates.forEach(s => {
		const tag:CourseTag = {
			date: s,
			info: '课',
			infoColor: '#5073D6'
		}
		result.push(tag)
	})
	return result
})

const schedules = computed(() => {
	const result = scheduleStore.schedules.filter(s => s.courseDate === selectedDate.value)
	return result
})

const calendarChange = async (e:{fulldate:string}) => {
	const { fulldate } = e
	selectedDate.value = fulldate
	await scheduleStore.fetchSchedules(fulldate)
}

const onMonthSwitch = async (e:{year:number, month:number}) => {
	const { year, month } = e
	const str = year + '-' + month + '-' + '1'
	const date = new Date(str)
	const from = timestampForBeginOfMonth(date)
	const to = timestampForEndOfMonth(date)
	await scheduleStore.fetchSchedulesDate(from, to)
}

const onAddTap = () => {
	uni.navigateTo({
		url: "/pages/addSchedule/addSchedule?date="+selectedDate.value
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
