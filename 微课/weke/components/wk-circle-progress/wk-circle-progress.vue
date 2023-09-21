<template>
	<view class="wk-circle-container">
		<l-circle 
			:percent="percent" 
			size="34" 
			strokeWidth="3" 
			trailWidth="3"
			trailColor="#f4f5f6"
			strokeColor="#5073D6">
			<text class="text" :style="style">{{percent === 0? "未排课":`${percent}%`}}</text>
		</l-circle>
		<text class="progress" v-if="percent > 0">60/100</text>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const percent = ref(40)

// @ts-ignore
const style = computed({
	get() {
		return {
			color: percent.value === 0? "#c6c8cf": "#5073D6"
		}
	}
})
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
		color: $wk-text-color-grey;
		font-size: 8px;
	}
}
</style>