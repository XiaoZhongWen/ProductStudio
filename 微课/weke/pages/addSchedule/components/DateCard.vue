<template>
	<template v-if="mode === 'date'">
		<picker
			class="picker" 
			:mode="mode"
			:value="selectedYYYYMMDD"
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
			v-if="!props.isFullDay"
		    ref="timeslot"
		    :title="'选择时间段'"
			:start="start.hour"
			:end="end.hour"
			:startMin="start.min"
			:endMin="end.min"
		    @confirm="confirmTime">
		</timeSlot>
	</template>
</template>

<script setup lang="ts">
import { watch, onBeforeUpdate, onMounted, ref, computed } from 'vue';
import { md, daysBetweenDates, yyyyMMdd } from '@/utils/wk-date'
import timeSlot from "@/components/wanghexu-timeslot/wanghexu-timeslot.vue"

type Time = {
	hour: number,
	min: number
}

const timeslot = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()
const props = defineProps(['type', 'date', 'isFullDay'])
const emits = defineEmits(['onDateChange', 'onTimeChange'])
const curDate = new Date()
const title = ref('')
const content = ref('')
const foot = ref('')
const mode = ref(props.type)
const isFullDay = ref(false)
const didSelectedDate = ref(false)
const selectedDate = ref<Date>()
const start = ref<Time>({
	hour: curDate.getHours(),
	min: 0
})
const end = ref<Time>({
	hour: (curDate.getHours() + 1),
	min: 0
})

onBeforeUpdate(() => {
	isFullDay.value = props.isFullDay
	if (props.type === 'time' && !didSelectedDate.value) {
		selectedDate.value = props.date
		loadTime()
	}
})

watch(isFullDay, () => {
	if (!didSelectedDate.value) {
		selectedDate.value = props.date
	}
	if (props.type === 'date') {
		loadDate()
	} else if (props.type === 'time') {
		loadTime()
	}
})

onMounted(() => {
	if (!didSelectedDate.value) {
		selectedDate.value = props.date
	}
	if (props.type === 'date') {
		loadDate()
	} else if (props.type === 'time') {
		loadTime()
	}
})

const selectedYYYYMMDD = computed(() => {
	if (selectedDate.value) {
		return yyyyMMdd(selectedDate.value)
	} else {
		return yyyyMMdd(new Date())
	}
})

const loadDate = () => {
	const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
	const day = selectedDate.value!.getDay()
	const s = md(selectedDate.value!) + ", " + weeks[day]
	title.value = props.isFullDay?"开始":"日期"
	content.value = s
	const days = daysBetweenDates(new Date(), selectedDate.value!)
	foot.value = daysFormat(days)
}

const loadTime = () => {
	if (props.isFullDay) {
		title.value = "结束"
		const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
		const day = selectedDate.value!.getDay()
		const s = md(selectedDate.value!) + ", " + weeks[day]
		content.value = s
		foot.value = "持续时间: 1天"
	} else {
		title.value = "时间"
		const sh = String(start.value!.hour).padStart(2, '0')
		const eh = String(end.value!.hour).padStart(2, '0')
		const sm = String(start.value!.min).padStart(2, '0')
		const em = String(end.value!.min).padStart(2, '0')
		content.value = sh + ":" + sm + "-" + eh + ":" + em
		const delta = end.value!.hour * 60 + end.value!.min - start.value!.hour * 60 - start.value!.min
		const hour = Math.floor(delta / 60)
		const min = delta % 60
		let duration = "持续时间: "
		if (hour > 0) {
			duration += hour + "小时"
		}
		if (min > 0) {
			duration += min + "分钟"
		}
		foot.value = duration
	}
}

const onPickerChange = (e:{detail:{value:string}}) => {
	const { value } = e.detail
	if (props.type === 'date') {
		const date = new Date(value)
		selectedDate.value = date
		loadDate()
		didSelectedDate.value = true
		emits('onDateChange', { date })
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
	start.value.hour = parseInt(e.start.hour)
	end.value.hour = parseInt(e.end.hour)
	start.value.min = parseInt(e.start.min)
	end.value.min = parseInt(e.end.min)
	loadTime()
	emits('onTimeChange', { start:start.value, end:end.value })
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