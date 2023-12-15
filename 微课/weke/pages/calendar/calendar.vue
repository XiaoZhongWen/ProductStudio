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
		<view class="unfinished">
			
		</view>
		<view class="finished">
			
		</view>
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
import { format, yyyyMMdd } from '@/utils/wk-date'
import { Schedule } from "../../types/schedule";

type CourseTag = {
	date: string,
	info: string,
	infoColor: string
}

const selectedDate = ref(format(new Date()))
const usersStore = useUsersStore()
const scheduleStore = useScheduleStore()
const scheduleList = ref<Schedule[]>([])

const isShowAddBtn = computed(() => {
	return usersStore.owner.roles?.includes(1) ||
			usersStore.owner.roles?.includes(2)
})

onMounted(async () => {
	const schedules = await scheduleStore.fetchSchedules(new Date())
	scheduleList.value.push(...schedules)
})

const selected = computed(() => {
	const result:CourseTag[] = []
	scheduleList.value.forEach(s => {
		const tag:CourseTag = {
			date: yyyyMMdd(new Date(s.startTime)),
			info: '课',
			infoColor: '#5073D6'
		}
		result.push(tag)
	})
	return result
})

const calendarChange = (e:{fulldate:string}) => {
	const { fulldate } = e
	selectedDate.value = fulldate
}

const onMonthSwitch = (e:{year:number, month:number}) => {
	console.info(e)
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
}
</style>
