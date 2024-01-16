<template>
	<view class="container">
		<view class="top">
			订阅
		</view>
		<view class="body normal" v-if="props.option">
			<view class=".iconfont .icon-rmb rmb"></view>
			<text class="desc">{{desc}}</text>
			<text class="charge">{{props.option.charge}}</text>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed } from '../../../uni_modules/lime-shared/vue';
const props = defineProps(['option'])

const desc = computed(() => {
	let info = ''
	const { type } = props.option
	if (type === 0) {
		info = "连续包月"
	} else if (type === 1) {
		info = "连续包年"
	} else if (type === 2) {
		info = "一个月"
	}
	return info
})

</script>

<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100px;
	height: 120px;
	background-color: transparent;
	.top {
		width: 100%;
		height: 30px;
		background-color: $wk-theme-color;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: $uni-font-size-base;
	}
	.normal {
		border-color: $uni-text-color-disable;
	}
	.selected {
		border-color: $wk-theme-color;
	}
	.body {
		position: relative;
		width: 100%;
		height: 90px;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: white;
		border-radius:  0 0 $uni-border-radius-lg $uni-border-radius-lg;
		border-style: solid;
		border-width: 0px 1px 1px 1px;
		box-sizing: border-box;
		.rmb {
			position: absolute;
			left: 15px;
			bottom: 15px;
		}
		.desc, .charge {
			font-size: $uni-font-size-base;
			margin-top: 10px;
		}
		.charge {
			font-size: 28px;
		}
	}
}
</style>