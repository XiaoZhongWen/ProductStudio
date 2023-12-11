<template>
	<template v-if="mode === 'date'">
		<picker
			class="picker" 
			:mode="mode"
			@change="onPickerChange">
			<view class="date-card-container">
				<text class="top">{{title}}</text>
				<text class="mid">{{content}}</text>
				<text class="bottom">{{foot}}</text>	
			</view>
		</picker>
	</template>
	<template v-else>
		<view class="date-card-container" @tap="onTimeTap">
			<text class="top">{{title}}</text>
			<text class="mid">{{content}}</text>
			<text class="bottom">{{foot}}</text>	
		</view>
		<timeSlot
		    ref="timeslot"
		    :title="'选择时间段'"
		    @confirm="confirmTime">
		</timeSlot>
	</template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { md, hourDuration, daysBetweenDates } from '@/utils/wk-date'
import timeSlot from "@/components/wanghexu-timeslot/wanghexu-timeslot.vue"

const timeslot = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()
const props = defineProps(['type', 'date'])
const title = ref('')
const content = ref('')
const foot = ref('')
const mode = ref(props.type)

onMounted(() => {
	const date = new Date(props.date)
	if (props.type === 'date') {
		title.value = "日期"
	} else if (props.type === 'time') {
		title.value = "时间"
	}
	loadDate(date)
})

const loadDate = (date:Date) => {
	if (props.type === 'date') {
		const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
		const day = date.getDay()
		content.value = md(date) + ", " + weeks[day]
		const days = daysBetweenDates(new Date(), date)
		foot.value = daysFormat(days)
	} else if (props.type === 'time') {
		content.value = hourDuration(date)
		foot.value = "持续时间1小时"
	}
}

const onPickerChange = (e:{detail:{value:string}}) => {
	const { value } = e.detail
	if (props.type === 'date') {
		const date = new Date(value)
		loadDate(date)
	}
}

const onTimeTap = () => {
	timeslot.value?.open()
}

const confirmTime = (e:{
	start:{
		hour: string,
		min: string
	},
	end:{
		hour: string,
		min: string
	}
}) => {
	const { start, end } = e
	content.value = start.hour + ":" + start.min + "-" + end.hour + ":" + end.min
	const delta = parseInt(end.hour) * 60 + parseInt(end.min) - parseInt(start.hour) * 60 - parseInt(start.min)
	const hour = Math.floor(delta / 60)
	const min = delta % 60
	let duration = "持续时间"
	if (hour > 0) {
		duration += hour + "小时"
	}
	if (min > 0) {
		duration += min + "分钟"
	}
	foot.value = duration
}

const daysFormat = (days: number) => {
	let desc = ""
	if (days === 0) {
		desc = "今天"
	} else if (days === -1) {
		desc = "昨天"
	} else if (days === -2) {
		desc = "前天"
	} else if (days < -2) {
		desc = -days + "天前"
	} else if (days === 1) {
		desc = "明天"
	} else if (days === 2) {
		desc = "后天"
	} else if (days > 2) {
		desc = days + "天后"
	}
	return desc
}

</script>

<style lang="scss" scoped>
.date-card-container {
	display: flex;
	flex-direction: column;
	padding: $uni-padding-base;
	box-sizing: border-box;
	background-color: $wk-bg-color-grey;
	border-radius: $uni-border-radius-base;
	.top {
		font-size: $uni-font-size-base;
		color: $wk-text-color;
	}
	.mid {
		font-size: 15px;
		color: $wk-theme-color;
		margin-top: $uni-spacing-col-sm;
	}
	.bottom {
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
}
</style>