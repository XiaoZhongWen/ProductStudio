<template>
	<view class="add-org-container">
		<view class="card-container"></view>
		<view class="org-edit-container">
			<view class="header" @tap="onTap">
				<upload-image :url="org.logoUrl" prompt="图标" @onChooseAvatar="onChooseAvatar"></upload-image>
			</view>
			<view class="body">
				<uni-list>
					<uni-list-item link class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">外观</text>
								<view class="color"></view>
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">机构名称</text>
								<input 
									class="input" 
									placeholder-style="color: #808080" 
									type="text" value="" 
									maxlength="15"
									placeholder="请输入名称" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">地址</text>
								<input 
									class="input" 
									placeholder-style="color: #808080" 
									type="text" value="" 
									maxlength="20"
									placeholder="请输入地址" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">简介</text>
								<input 
									class="input" 
									placeholder-style="color: #808080" 
									type="text" value="" 
									maxlength="30"
									placeholder="请输入简介" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">创建日期</text>
								<picker class="picker" mode="date" value="2023-09-07">
									<view class="uni-input">设置创建日期</view>
								</picker>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</view>
		<view class="org-member-container">
			
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue' 
import { Org } from '@/types/org'
import { useOrgsStore } from '@/store/orgs'

const useOrgs = useOrgsStore()
const org = ref<Org>({
	_id: '',
	name: '',
	tel: '',
	addr: '',
	desc: '',
	logoUrl: 'https://img2.baidu.com/it/u=2749970253,3556501208&fm=253&fmt=auto&app=138&f=JPG?w=800&h=500',
	createTime: 0,
	color: '#5073D6'
})

const onTap = () => {
	org.value.logoUrl = "https://img0.baidu.com/it/u=1242941133,368144607&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=1046"
}

const onChooseAvatar = (data:{url: string}) => {
	const url = data.url ?? ""
	org.value.logoUrl = url
}
	
</script>

<style lang="scss">
.add-org-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.card-container {
		width: 90%;
		height: 120px;
		border-style: dashed;
		border-color: $wk-text-color-grey;
		border-width: 1px;
		border-radius: $uni-border-radius-lg;
	}
	.org-edit-container {
		display: flex;
		flex-direction: column;
		width: 90%;
		background-color: white;
		margin-top: $uni-spacing-col-base;
		padding-bottom: $uni-padding-base;
		border-radius: $uni-border-radius-lg;
		.header {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100px;
			background-color: white;
			border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
		}
		.body {
			width: 100%;
			background-color: white;
			border-top: $uni-spacing-col-sm solid $wk-bg-color-grey;
			.item {
				.slot-box {
					position: relative;
					flex-direction: row;
					align-items: center;
					width: 100%;
					.slot-text {
						font-size: $uni-font-size-base;
						color: $wk-text-color;
						font-weight: 400;
					}
					.input {
						position: absolute;
						display: inline-block;
						right: 0;
						text-align: right;
						font-size: $uni-font-size-base;
						caret-color: $wk-theme-color;
					}
					.picker {
						position: absolute;
						display: inline-block;
						right: 0;
						font-size: $uni-font-size-base;
						color: $uni-text-color-placeholder;
					}
					.color {
						position: absolute;
						width: 16px;
						height: 16px;
						right: -8px;
						bottom: 3px;
						background-color: $wk-theme-color;
						border-radius: $uni-border-radius-circle
					}
				}
				.uni-icon-wrapper {
					padding: 0 $uni-spacing-row-base 0 0;
				}
			}
		}
	}
	.org-member-container {
		display: flex;
		flex-direction: column;
		width: 90%;
		margin-top: $uni-spacing-col-base;
	}
}
</style>
