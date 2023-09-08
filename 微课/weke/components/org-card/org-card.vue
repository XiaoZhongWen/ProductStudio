<template>
	<view 
		class="org-card-container"
		:style="{background: `linear-gradient(to right, ${props.org.gradient[0]}, ${props.org.gradient[1]})`}">
		<view class="left">
			<image class="icon" src="" mode="aspectFill"></image>
			<text 
				class="text" 
				:style="{'background-color': props.org?.name.length === 0? '#c6c8cf':''}">
				{{props.org?.name}}
			</text>
			<text class="text text-middle">
				{{props.org?.nickname}}
			</text>
			<text class="text-sm">机构负责人</text>
		</view>
		<view class="right">
			<text 
				class="text" 
				:style="{'background-color': props.org?.desc.length === 0? '#c6c8cf':''}">
				{{props.org?.desc}}
			</text>
			<view class="row" v-if="props.org?.tel?.length > 0">
				<uni-icons class="uni-icons" type="phone-filled" color="white"></uni-icons>
				<text class="text">
					{{props.org?.tel}}
				</text>
			</view>
			<view class="row">
				<uni-icons class="uni-icons" type="location-filled" color="white"></uni-icons>
				<text
					class="text" 
					:style="{'background-color': props.org?.addr.length === 0? '#c6c8cf':''}">
					{{props.org?.addr}}
				</text>
			</view>
			<text
				class="createDate" 
				:style="{'background-color': props.org?.createDate.length === 0? '#c6c8cf':''}">
				创建日期:{{props.org?.createDate}}
			</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { Org } from '@/types/org'
const props:Readonly<{
    org?: Org & {nickname?: string}
}>	= defineProps(['org'])

</script>

<style lang="scss" scoped>
.org-card-container {
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	border-radius: $uni-border-radius-lg;
	.left {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 120px;
		height: 100%;
		.icon {
			margin-top: $uni-spacing-col-base;
			width: 60px;
			height: 60px;
			background-color: $wk-text-color-grey;
			border-radius: $uni-border-radius-circle;
		}
		.text {
			margin-top: $uni-spacing-col-sm;
			color: white;
			border-radius: $uni-border-radius-base;
			width: 100px;
			height: 30px;
			text-align: center;
			font-size: $uni-font-size-lg
		}
		.text-middle {
			margin-top: $uni-spacing-col-lg;
			height: 20px;
			font-size: $uni-font-size-base
		}
		.text-sm {
			font-size: $uni-font-size-10;
			text-align: center;
			color: white;
		}
	}
	.right {
		flex: 1;
		height: 100%;
		width: 200px;
		position: relative;
		display: flex;
		flex-direction: column;
		.text {
			display: inline-block;
			margin-top: $uni-spacing-col-base;
			border-radius: $uni-border-radius-base;
			width: 95%;
			height: 100px;
			color: white;
			word-wrap: break-word;
		}
		.row {
			display: flex;
			align-items: center;
			width: 95%;
			height: 20px;
			.text {
				margin-left: $uni-spacing-row-sm;
				display: inline-block;
				font-size: $uni-font-size-sm;
				border-radius: $uni-border-radius-base;
				color: white;
				width: 85%;
				height: 20px;
			}
			.uni-icons {
				position: relative;
				top: 2px;
			}
		}
		.createDate {
			position: absolute;
			right: $uni-spacing-row-base;
			bottom: $uni-spacing-col-sm;
			font-size: $uni-font-size-10;
			text-align: right;
			color: white;
		}
	}
}
</style>