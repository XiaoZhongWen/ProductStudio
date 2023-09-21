<template>
	<view class="member-info-container">
		<view class="left">
			<wk-icon 
				class="icon" 
				:url="props.url"
				:text="props.nickname">
			</wk-icon>
		</view>
		<view class="info">
			<text class="name">{{props.nickname}}</text>
			<text class="number">{{props.mobile}}</text>
			<text class="sign">{{props.signature}}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['url', 'nickname', 'mobile', 'signature'])
</script>

<style lang="scss">
.member-info-container {
	display: flex;
	flex-direction: row;
	.left {
		width: 50px;
		height: 50px;
	}
	.info {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		margin-left: $uni-spacing-row-base;
		.name {
			font-size: $uni-font-size-base;
			color: $wk-text-color;
		}
		.number {
			font-size: $uni-font-size-base;
			color: $wk-text-color-grey;
		}
		.sign {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
	}
}
</style>