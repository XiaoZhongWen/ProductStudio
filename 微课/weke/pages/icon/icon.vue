<template>
	<view class="wk-icon-menu-container">
		<uni-grid :column="5" :show-border="false" :square="false" @change="onChange">
			<uni-grid-item v-for="(item ,index) in list" :index="index" :key="index">
				<view class="grid-item-box">
					<view :class="item">
					</view>
				</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

let orgId = ''
const global = getApp().globalData!
const list = [
	".t-icon .t-icon-fenzu2x",
	".t-icon .t-icon-yuwen1",
	".t-icon .t-icon-jisuanqi",
	".t-icon .t-icon-shuxue2x",
	".t-icon .t-icon-gongchenghuitu",
	".t-icon .t-icon-yingyu2x",
	".t-icon .t-icon-yingyu2",
	".t-icon .t-icon-yingyu3",
	".t-icon .t-icon-yingyu4",
	".t-icon .t-icon-yingyu5",
	".t-icon .t-icon-xiaoyuzhong",
	".t-icon .t-icon-diqiuyi",
	".t-icon .t-icon-diqiuyi1",
	".t-icon .t-icon-diqiuyi2",
	".t-icon .t-icon-dili1",
	".t-icon .t-icon-huaxue1",
	".t-icon .t-icon-huaxue2",
	".t-icon .t-icon-huaxue3",
	".t-icon .t-icon-huaxue4",
	".t-icon .t-icon-huaxue5",
	".t-icon .t-icon-huaxuepingzi",
	".t-icon .t-icon-DNA",
	".t-icon .t-icon-shengwu1",
	".t-icon .t-icon-xianweijing",
	".t-icon .t-icon-wuli1",
	".t-icon .t-icon-wuli-",
	".t-icon .t-icon-lishi1",
	".t-icon .t-icon-lanqiu1",
	".t-icon .t-icon-yundong",
	".t-icon .t-icon-zuqiu",
	".t-icon .t-icon-jianshenke",
	".t-icon .t-icon-tiyu1",
	".t-icon .t-icon-youyong",
	".t-icon .t-icon-zhengzhi",
	".t-icon .t-icon-huihua",
	".t-icon .t-icon-huihua1",
	".t-icon .t-icon-meishu",
	".t-icon .t-icon-yinle",
	".t-icon .t-icon-yinle2",
	".t-icon .t-icon-yinle3",
	".t-icon .t-icon-wudao1",
	".t-icon .t-icon-wudao",
	".t-icon .t-icon-shufa",
	".t-icon .t-icon-shufa2",
	".t-icon .t-icon-cpp",
	".t-icon .t-icon-scratch",
	".t-icon .t-icon-python",
	".t-icon .t-icon-tuoguan",
	".t-icon .t-icon-banhui",
	".t-icon .t-icon-guanli",
	".t-icon .t-icon-shetuan",
	".t-icon .t-icon-taolun"
]

onLoad((option) => {
	orgId = option!.orgId
})

const onChange = (e:{detail:{index:number}}) => {
	const index = e.detail.index
	const iconId = list[index]
	uni.navigateBack()
	uni.$emit(global.event_name.didSelectedIcon, {iconId:iconId, orgId:orgId})
}

</script>

<style lang="scss" scoped>
.wk-icon-menu-container {
	padding: $uni-spacing-col-sm $uni-spacing-row-base;
	.grid-item-box {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: $uni-spacing-col-lg 0;
		background-repeat: no-repeat
	}
}
</style>
