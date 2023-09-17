<template>
	<view class="wk-icon-container">
		<template v-if="typeof(props.url) !== 'undefined' && props.url.length > 0">
			<image class="icon" :src="props.url" mode="aspectFill"></image>
		</template>
		<template v-else>
			<text>{{props.text}}</text>
		</template>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['url', 'text'])
</script>

<style lang="scss" scoped>
.wk-icon-container {
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: $wk-theme-color;
	border-radius: $uni-border-radius-circle;
	width: 100%;
	height: 100%;
	color: white;
	font-size: $uni-font-size-base;
	font-weight: bold;
	.icon {
		width: 100%;
		height: 100%;
		border-radius: $uni-border-radius-circle;
	}
}
</style>