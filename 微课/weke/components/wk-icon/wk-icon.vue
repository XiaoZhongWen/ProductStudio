<template>
	<view :class="cls">
		<template v-if="typeof(props.url) !== 'undefined' && props.url.length > 0">
			<image class="icon" :src="props.url" mode="aspectFill"></image>
		</template>
		<template v-else>
			<text>{{props.text}}</text>
		</template>
	</view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps(['url', 'text'])

const cls = computed(() => {
	let clsName = 'wk-icon-container'
	if (typeof(props.url) === 'undefined' || props.url.length === 0) {
		clsName = 'wk-icon-container bg'
	}
	return clsName
})

</script>

<style lang="scss" scoped>
.wk-icon-container {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: $uni-border-radius-circle;
	width: 100%;
	height: 100%;
	color: white;
	font-size: $uni-font-size-base;
	font-weight: bold;
	text-align: center;
	.icon {
		width: 100%;
		height: 100%;
		border-radius: $uni-border-radius-circle;
	}
}
.bg {
	background-color: $wk-theme-color;
}
</style>