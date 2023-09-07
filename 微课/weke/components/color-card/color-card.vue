<template>
	<view class="color-card-container" @tap="onTap">
		<template v-for="item in colors" :key="item.color">
			<view class="circle" :style="{'background-color': item.color}" :data-color="item.color">
				<template v-if="item.selected">
					<uni-icons class="icon" type="checkmarkempty" color="white" size="12"></uni-icons>
				</template>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
	
const colors = ref([
	{color: "#5073D6", selected: true}, 
	{color: "#71de55", selected: false}, 
	{color: "#f4b541", selected: false}, 
	{color: "#e27e38", selected: false}, 
	{color: "#c93528", selected: false}, 
	{color: "#ea5363", selected: false}, 
	{color: "#8844c2", selected: false}, 
	{color: "#67ceac", selected: false}
])

// @ts-ignore
const onTap = (e) => {
	const color = e.target.dataset.color
	if (typeof(color) !== 'undefined') {
		colors.value.forEach((item) => {
			if (item.color === color) {
				item.selected = true
			} else {
				item.selected = false
			}
		})
	}
}
</script>

<style lang="scss" scoped>
.color-card-container {
	display: flex;
	justify-content: flex-end;
	width: 250px;
	height: 20px;
	.circle {
		position: relative;
		width: 20px;
		height: 20px;
		display: inline-block;
		border-radius: $uni-border-radius-circle;
		margin-left: $uni-spacing-row-sm;
		.icon {
			position: absolute;
			left: 4px;
			bottom: 0px;
		}
	}
}
</style>