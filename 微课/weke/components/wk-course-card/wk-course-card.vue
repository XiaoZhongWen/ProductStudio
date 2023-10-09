<template>
	<view class="course-card">
		<view class="top">
			<view class=".t-icon .t-icon-yuwen1"></view>
			<text class="text">语文</text>
			<wk-circle-progress v-if="flag" class="circle-progress"></wk-circle-progress>
		</view>
		<view class="duration">
			<text>课程时长: 45分钟</text>
		</view>
		<view class="teacher" v-if="flag">
			<text>授课老师: </text>
			<view class="teacher-cell">
				<wk-icon
					class="icon" 
					url="https://img1.baidu.com/it/u=1493065438,4162663216&fm=253&fmt=auto&app=138&f=JPEG?w=403&h=500"
					text="允珠">
				</wk-icon>
				<text class="name">孙允珠</text>
			</view>
		</view>
		<view class="bottom">
			<text>兮子英语</text>
			<text>班课</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const flag = ref(true)
</script>

<style lang="scss" scoped>
.course-card {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.top {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 30px;
		.text {
			margin-left: $uni-spacing-row-sm;
			font-size: $uni-font-size-base;
		}
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: 0;
			right: 0;
		}
	}
	.duration {
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
	.teacher {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 50px;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		.teacher-cell {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 45px;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			.icon {
				width: 28px;
				height: 28px;
				border-radius: $uni-border-radius-circle;
				padding-top: $uni-spacing-col-sm;
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-sm;
	}
}

</style>