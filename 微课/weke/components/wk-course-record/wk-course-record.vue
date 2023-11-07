<template>
	<view class="course-record-container">
		<view class="section">
			<text class="title">开始时间:</text>
			<text class="desc">2023-11-22 15:36</text>
		</view>
		<view class="section">
			<text class="title">结束时间:</text>
			<text class="desc">2023-11-22 16:36</text>
		</view>
		<view class="section">
			<text class="title">消耗课时:</text>
			<text class="desc">1</text>
		</view>
		<view class="section area">
			<text class="title">课程内容:</text>
			<text class="content">{{test}}</text>
		</view>
		<view class="section area">
			<text class="title">课后作业:</text>
			<text class="content">{{test}}</text>
		</view>
		<view class="section area">
			<text class="title">课程反馈:</text>
			<text class="content">{{test}}</text>
		</view>
		<view class="bottom">
			<uni-icons type="undo" color="#dd524d" class="icon" size="20"></uni-icons>
			<uni-icons type="compose" color="#5073D6" class="icon" size="20"></uni-icons>
		</view>
	</view>
</template>

<script setup lang="ts">
const test = "1. 第一\n2. 第二\n3. 第三\n"
</script>

<style lang="scss" scoped>
.course-record-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	border-radius: $uni-border-radius-base;
	.section {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		font-size: $uni-font-size-sm;
		.desc {
			color: $wk-text-color-grey;
		}
		.content {
			flex: 1;
			padding: $uni-padding-base;
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-base;
			margin-left: $uni-spacing-row-base;
			color: $wk-text-color-grey;
		}
	}
	.area {
		margin: $uni-spacing-col-sm 0;
	}
	.bottom {
		display: flex;
		justify-content: flex-end;
		margin-top: $uni-spacing-col-base;
		.icon {
			margin-left: $uni-spacing-col-lg;
		}
	}
}
</style>