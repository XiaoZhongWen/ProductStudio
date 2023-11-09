<template>
	<view class="edit-payment-record-container">
		<view class="header">
			<text>编辑</text>
		</view>
		<view class="body">
			<view class="section">
				<text class="title">续课时间:</text>
				<uni-datetime-picker 
					type="datetime" 
					return-type="timestamp" 
					v-model="date"
					:border="border" />
			</view>
			<view class="section">
				<text class="title">续课时数:</text>
				<uni-number-box 
					background="#5073D6" 
					color="#fff" 
					v-model="count"
					:min="1" />
			</view>
			<view class="section">
				<text class="title">价格:</text>
				<input 
					class="input" 
					type="number" 
					v-model="price" 
					:placeholder="price"/>
			</view>
			<view class="section-input">
				<text class="title">备注:</text>
				<textarea 
					class="textarea" 
					type="text" 
					v-model="remark" 
					placeholder="备注"/>
			</view>
			<button
				type="default" 
				class="btn"
				@tap="onTap">确定</button>
		</view>
		<view class="bottom">
		</view>
	</view>
</template>

<script setup lang="ts">
import { useCourseStore } from "@/store/course"
import { ref } from 'vue';
import { PaymentRecord } from "../../../types/PaymentRecord";

const global = getApp().globalData!
const emit = defineEmits(['change'])
const courseStore = useCourseStore()

const date = ref<number>(Date.now())
const record = ref<PaymentRecord>()
const count = ref<number>(1)
const price = ref<number>(0)
const remark = ref('')
const border = false

let rId = ''

const initial = (id:string) => {
	if (typeof(id) === 'undefined' || id.length === 0) {
		return
	}
	rId = id
	const res = courseStore.paymentRecords.filter(r => r._id === rId)
	if (res.length > 0) {
		record.value = res[0]
		date.value = record.value.date
		count.value = record.value.count
		price.value = record.value.price
		remark.value = record.value.remark ?? ''
	}
}
	
defineExpose({
	initial
})	

const onTap = () => {
	const record = {
		_id: rId,
		date: date.value,
		count: count.value,
		price: price.value,
		remark: remark.value
	}
	if (date.value.toString().length === 0) {
		uni.showToast({
			title: "请选择续课时间",
			duration: global.duration_toast,
			icon:'none'
		})
		return
	}
	emit('change', { ...record })
}

</script>

<style lang="scss" scoped>
.edit-payment-record-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 44px;
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0px 0px;
		font-size: $uni-font-size-lg;
		color: $wk-text-color;
	}
	.body {
		display: flex;
		flex-direction: column;
		width: 100%;
		background-color: white;
		.section, .section-input {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 40px;
			background-color: white;
			padding-left: $uni-padding-normal;
			padding-right: $uni-padding-normal;
			.title {
				color: $wk-text-color;
				font-size: $uni-font-size-base;
			}
			.textarea {
				flex: 1;
				margin-left: $uni-spacing-row-base;
				background-color: $wk-bg-color-grey;
				border-radius: $uni-border-radius-base;
				padding: $uni-padding-base;
				font-size: $uni-font-size-base;
				caret-color: $wk-theme-color;
				height: 80px;
				box-sizing: border-box;
			}
			.input {
				text-align: right;
				caret-color: $wk-theme-color;
			}
		}
		.section-input {
			height: 80px;
			align-items: flex-start;
			margin: $uni-spacing-col-sm 0;
		}
		.btn {
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
			margin-top: $uni-spacing-col-lg;
			margin-bottom: $uni-spacing-col-lg;
		}
	}
	.bottom {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 35px;
		background-color: white;
	}
}
</style>