<template>
	<view class="member-info-container">
		<view class="left">
			<wk-icon 
				class="icon" 
				url="https://img1.baidu.com/it/u=506645129,3151761344&fm=253&fmt=auto&app=138&f=PNG?w=500&h=773" 
				text="兮子">
			</wk-icon>
		</view>
		<view class="info">
			<text class="name">肖兮子</text>
			<text class="number">13545118725</text>
			<text class="sign">资深英语老师</text>
		</view>
	</view>
</template>

<script setup lang="ts">
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