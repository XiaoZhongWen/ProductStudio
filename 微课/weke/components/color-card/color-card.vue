<template>
	<view class="color-card-container" @tap="onTap">
		<template v-for="item in colors" :key="item.id">
			<view 
				class="circle" 
				:data-id="item.id"
				:style="{background: `linear-gradient(to right, ${item.gradient[0]}, ${item.gradient[1]})`}">
				<template v-if="item.selected">
					<uni-icons class="icon" type="checkmarkempty" color="white" size="12"></uni-icons>
				</template>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['onColorChanged'])
const colors = ref([
	{id:0, gradient: ["#4e54c8", "#8f94fb"], selected: true},
	{id:1, gradient: ["#2193b0", "#6dd5ed"], selected: false}, 
	{id:2, gradient: ["#1f4037", "#99f2c8"], selected: false}, 
	{id:3, gradient: ["#f953c6", "#b91d73"], selected: false}, 
	{id:4, gradient: ["#f12711", "#f5af19"], selected: false}, 
	{id:5, gradient: ["#3c3b3f", "#605c3c"], selected: false}, 
	{id:6, gradient: ["#396afc", "#2948ff"], selected: false},
	{id:7, gradient: ["#642b73", "#c6426e"], selected: false},
	{id:8, gradient: ["#4b6cb7", "#182848"], selected: false}
])

uni.$on("onGradientChanged", function (data) {
	colors.value.forEach((color) => {
		color.selected = color.gradient.toString() === data.gradient.toString()
	})
})

// @ts-ignore
const onTap = (e) => {
	const id = e.target.dataset.id
	if (typeof(id) !== 'undefined') {
		colors.value.forEach((color) => {
			if (color.id === id) {
				color.selected = true
			} else {
				color.selected = false
			}
		})
		emit('onColorChanged', { gradient: colors.value[id].gradient })
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