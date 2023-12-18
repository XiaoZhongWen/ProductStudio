<template>
	<view class="repeat-card-container">
		<view class="top">
			<text class="cancel" @tap="onCancel">取消</text>
			<text>重复</text>
			<text class="confirm" @tap="onConfirm">确定</text>
		</view>
		<view class="body">
			<radio-group name="" class="radio-list" @change="onChange">
				<label class="radio-item">
					<radio 
						:checked="selectedOption === 0" 
						:value="0"
						color="#5073D6" />
					<text :class="selectedOption === 0?'selected':'normal'">无</text>
				</label>
				<label class="radio-item">
					<radio 
						:checked="selectedOption === 1" 
						:value="1"
						color="#5073D6" />
					<text :class="selectedOption === 1?'selected':'normal'">每天</text>
				</label>
				<label class="radio-item">
					<radio 
						:checked="selectedOption === 2" 
						:value="2"
						color="#5073D6" />
					<text :class="selectedOption === 2?'selected':'normal'">每周</text>
					<text class="extra">{{'(' + weeks[props.day] + ')'}}</text>
				</label>
				<label class="radio-item">
					<radio 
						:checked="selectedOption === 3" 
						:value="3" 
						color="#5073D6" />
					<text :class="selectedOption === 3?'selected':'normal'">自定义</text>
				</label>
				<label class="radio-item">
					<radio 
						:checked="selectedOption === 4" 
						:value="4" 
						color="#5073D6" />
					<text :class="selectedOption === 4?'selected':'normal'">自选日期</text>
				</label>
			</radio-group>
		</view>
		<view class="custom" v-if="selectedOption === 3">
			<text class="desc">每周的{{desc}}</text>
			<view class="day-container" @tap="onSelectedDay">
				<template v-for="(day, index) in weeks" :key="index">
					<text :id="index" :class="selectedDays.includes(index)?'selectedDay':'day'">{{day}}</text>
				</template>
			</view>
		</view>
		<view class="select-date-byself" v-else-if="selectedOption === 4">
			<wu-calendar
				:insert="true"
				:date="dates"
				mode="multiple"
				color="#5073D6"
				slideSwitchMode="horizontal">
			</wu-calendar>
		</view>
		<view class="bottom"></view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const emits = defineEmits(['onCancel', 'onRepeatConfirm'])
const props = defineProps(['day'])
const selectedOption = ref<number>(0)
const selectedDays = ref<number[]>([props.day])
const didConfirm = ref(false)
const weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

const dates = ref<string[]>([])

const global = getApp().globalData!

const initial = (selectedDates: string[]) => {
	if (typeof(selectedDates) !== 'undefined' && 
		selectedDates.length > 0) {
		dates.value = selectedDates
	}
}

defineExpose({
	initial
})

const desc = computed(() => {
	const s:string[] = []
	selectedDays.value.sort((d1, d2) => {
		return d1 - d2
	})
	selectedDays.value.forEach(day => {
		s.push(weeks[day])
	})
	return s.join('、')
})

const onChange = (e:{detail:{value:string}}) => {
	const { value } = e.detail
	selectedOption.value = parseInt(value)
}

const onSelectedDay = (e:{target:{id:string}}) => {
	const { id } = e.target
	const day = parseInt(id)
	const index = selectedDays.value.findIndex(item => item === day)
	if (index === -1) {
		selectedDays.value.push(day)
	} else {
		if (props.day !== day) {
			selectedDays.value.splice(index, 1)
		}
	}
}

const onCancel = () => {
	if (!didConfirm.value) {
		selectedOption.value = 0
		selectedDays.value = [props.day]
	}
	emits('onCancel')
}

const onConfirm = () => {
	if (selectedOption.value === 4) {
		if (dates.value.length > 50) {
			uni.showToast({
				title: "重复次数不能超过50次",
				duration: global.duration_toast,
				icon: "none"
			})
			return
		}
		if (dates.value.length <= 0) {
			uni.showToast({
				title: "请选择日期",
				duration: global.duration_toast,
				icon: "none"
			})
			return
		}
	}
	didConfirm.value = true
	emits('onRepeatConfirm', {
		option: selectedOption.value,
		days: selectedDays.value,
		dates: dates.value
	})
}

</script>

<style lang="scss">
.repeat-card-container {
	display: flex;
	flex-direction: column;
	width: 300px;
	.top {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		height: 44px;
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
		padding: 0 $uni-padding-normal;
		font-size: $uni-font-size-base;
		.cancel {
			color: $wk-text-color-grey;
		}
		.confirm {
			color: $wk-theme-color;
		}
	}
	.body {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: $uni-padding-base $uni-padding-normal;
		.radio-list {
			display: flex;
			flex-direction: column;
			font-size: $uni-font-size-base;
		}
		.radio-item {
			display: flex;
			flex-direction: row;
			align-items: center;
			margin: $uni-spacing-col-sm 0;
			.normal {
				color: $wk-text-color;
				margin-left: $uni-spacing-col-sm;
			}
			.selected {
				color: $wk-theme-color;
				margin-left: $uni-spacing-col-sm;
			}
			.extra {
				color: $wk-text-color-grey;
				margin-left: $uni-spacing-row-sm;
			}
		}
	}
	.custom {
		display: flex;
		flex-direction: column;
		background-color: white;
		font-size: $uni-font-size-base;
		padding: 0 $uni-padding-normal;
		.desc {
			color: $wk-text-color-grey;
			margin-left: $uni-spacing-row-sm;
		}
		.day-container {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin-bottom: $uni-spacing-col-base;
			.day {
				padding: $uni-padding-sm $uni-padding-base;
				color: $wk-text-color;
				background-color: $wk-bg-color-grey;
				border-radius: $uni-border-radius-lg;
				margin: $uni-spacing-row-mini $uni-spacing-row-sm;
			}
			.selectedDay {
				padding: $uni-padding-sm $uni-padding-base;
				color: white;
				background-color: $wk-theme-color;
				border-radius: $uni-border-radius-lg;
				margin: $uni-spacing-row-mini $uni-spacing-row-sm;
			}
		}
		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			background-color: $wk-bg-color-grey;
			padding: 0 $uni-padding-base;
			border-radius: $uni-border-radius-base;
			.uni-data-select :v-deep(.uni-select) {
			    border: none !important;
			}
		}
	}
	.bottom {
		height: 10px;
		background-color: white;
		border-radius: 0 0 $uni-border-radius-lg $uni-border-radius-lg;
	}
}
</style>