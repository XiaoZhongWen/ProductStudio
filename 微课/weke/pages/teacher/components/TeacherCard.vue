<template>
	<view class="teacher-card-container">
		<member-info></member-info>
		<wk-progress-circle></wk-progress-circle>
		<view class="bottom">
			<text class="text">兮子英语</text>
			<view class="icon-container">
				<uni-icons class="icon" type="wallet-filled" color="#5073D6" size="24"></uni-icons>
				<uni-icons class="icon" type="calendar-filled" color="#5073D6" size="24"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.teacher-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.bottom {
		position: relative;
		height: 30px;
		.text {
			position: absolute;
			left: 0;
			bottom: 0;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
		.icon-container {
			position: absolute;
			right: 0;
			bottom: 0;
			.icon {
				margin-left: $uni-spacing-row-base;
			}
		}
	}
}
</style>