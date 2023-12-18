<template>
	<view class="schedule-card-container">
		<view class="top">今天</view>
		<view class="content">
			<view class="left">
				<view class="check-box"></view>
			</view>
			<view class="right">
				<view class="main">
					<view class="wk-icon">
						<wk-icon
							text="孙允珠"
							url="https://img1.baidu.com/it/u=1493065438,4162663216&fm=253&fmt=auto&app=138&f=JPEG?w=403&h=500">
						</wk-icon>
					</view>
					<text class="nickName">孙允珠</text>
					<wk-circle-progress
						class="circle-progress" 
						:total="100" 
						:consume="20">
					</wk-circle-progress>
				</view>
				<view class="section course">
					<text>课程: 英语</text>
				</view>
				<view class="section teacher">
					<text>老师: Julien</text>
				</view>
				<view class="section duration">
					<text>上课时间: 9:00 - 10:00 ⏰</text>
				</view>
				<view class="students">
					<text>学员: </text>
					<view class="cell-container">
						<template v-for="index in [1, 2, 3, 4, 5, 6, 7, 8]" :key="index">
							<wk-portrait
								url="https://img1.baidu.com/it/u=1493065438,4162663216&fm=253&fmt=auto&app=138&f=JPEG?w=403&h=500" 
								name="孙允珠">
							</wk-portrait>
						</template>
					</view>
				</view>
			</view>
		</view>
		<view class="bottom">
			<text>兮子英语</text>
			<view class="right">
				<text class="action leave">请假</text>
				<text class="action delete">删除</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.schedule-card-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	padding: $uni-padding-normal;
	border-radius: $uni-border-radius-lg;
	.top {
		color: $wk-text-color;
		font-size: $uni-font-size-sm;
		margin-bottom: $uni-spacing-row-base;;
	}
	.content {
		display: flex;
		flex-direction: row;
		.left {
			display: flex;
			width: 30px;
			height: 30px;
			justify-content: center;
			align-items: center;
			.check-box {
				width: 20px;
				height: 20px;
				border: 2px solid;
				border-image: linear-gradient(to right, #8f41e9, #578aef) 1;
			}
		}
		.right {
			display: flex;
			flex-direction: column;
			flex: 1;
			margin-left: $uni-spacing-row-base;
			.main {
				position: relative;
				display: flex;
				flex-direction: row;
				align-items: center;
				.wk-icon {
					width: 30px;
					height: 30px;
				}
				.nickName {
					font-size: $uni-font-size-base;
					color: $wk-text-color;
					margin-left: $uni-spacing-row-base;
				}
				.circle-progress {
					position: absolute;
					top: 0px;
					right: 0px;
				}
			}
			.section {
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
			}
			.course {
				margin-top: $uni-spacing-col-lg;
			}
			.teacher {
				margin-top: $uni-spacing-col-sm;
			}
			.students {
				display: flex;
				flex-direction: row;
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
				margin-top: $uni-spacing-col-sm;
				.cell-container {
					flex: 1;
					display: flex;
					flex-direction: row;
					flex-flow: row wrap;
				}
			}
		}
	}
	.bottom {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: $uni-font-size-sm;
		color: $wk-text-color-grey;
		margin-top: $uni-spacing-col-lg;
		.action {
			margin-left: $uni-spacing-row-lg;
			background-color: $wk-theme-color;
			color: white;
			padding: $uni-padding-sm $uni-padding-base;
			border-radius: $uni-border-radius-base;
		}
		.delete {
			background-color: $uni-color-error;
		}
	}
}
</style>