<template>
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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { md, hourDuration } from '@/utils/wk-date'

const props = defineProps(['type', 'date'])
const title = ref('')
const content = ref('')
const foot = ref('')
const mode = ref(props.type)

onMounted(() => {
	const date = new Date(props.date)
	loadDate(date)
})

const loadDate = (date:Date) => {
	if (props.type === 'date') {
		const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
		title.value = "日期"
		content.value = md(date) + ", " + weeks[date.getDay()]
		foot.value = "今天"
	} else if (props.type === 'time') {
		title.value = "时间"
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
		color: $wk-theme-color
	}
	.bottom {
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
	}
}
</style>