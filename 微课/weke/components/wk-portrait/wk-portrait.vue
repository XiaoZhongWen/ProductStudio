<template>
	<view class="wk-portrait-container">
		<wk-icon 
			class="icon" 
			:url="props.url"
			:text="props.name.length > 2?props.name.substring(props.name.length - 2):props.name">
		</wk-icon>
		<text class="name">{{props.name}}</text>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['url', 'name'])

</script>

<style lang="scss" scoped>
.wk-portrait-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 50px;
	font-size: $uni-font-size-sm;
	color: $wk-text-color-grey;
	.icon {
		width: 30px;
		height: 30px;
		border-radius: $uni-border-radius-circle;
		padding-top: $uni-spacing-col-sm;
	}
	.name {
		margin: $uni-spacing-col-sm 0;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
}
</style>