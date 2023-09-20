<template>
	<view class="wk-circle-container">
		<l-circularProgress
			progressColor="#5073D6" 
			fontColor="#5073D6"
			bgColor="#f4f5f6"
			boxWidth="40"
			boxHeight="40"
			fontSize=10
			:fontShow="percent > 0"
			:lineWidth="4" 
			:percent="percent">
		</l-circularProgress>
		<text class="progress" v-if="percent > 0">60/100</text>
		<text class="text" v-if="percent === 0">未排课</text>
	</view>
</template>

<script setup lang="ts">
import { ref } from "vue";
const percent = ref(0)
</script>

<style lang="scss" scoped>
.wk-circle-container {
	position: relative;
	font-size: $uni-font-size-10;
	display: flex;
	flex-direction: column;
	.progress {
		color: $wk-theme-color;
		text-align: center;
	}
	.text {
		position: absolute;
		top: 14px;
		left: 8px;
		color: $wk-text-color-grey;
		font-size: 8px;
	}
}
</style>