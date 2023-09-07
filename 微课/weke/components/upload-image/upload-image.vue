<template>
	<view class="container">
		<button
			class="circle"
			type="default"
			plain="true"
			open-type="chooseAvatar"
			@chooseavatar="onChooseAvatar">
			<template v-if="props.url.length">
				<view class="imgContainer">
					<image class="img" :src="props.url" mode="aspectFill"></image>
					<text class="text">修改{{props.prompt}}</text>
				</view>
			</template>
			<template v-else>
				<uni-icons class="icon" type="plusempty" color="#c6c8cf"></uni-icons>
				上传{{props.prompt}}
			</template>
		</button>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['url', 'prompt'])
const emit = defineEmits(['onChooseAvatar'])

const onChooseAvatar = (res:UniHelper.ButtonOnChooseavatarEvent) => {
	const url = res.detail.avatarUrl
	emit('onChooseAvatar', {url})
}
</script>

<style lang="scss" scoped>
.container {
	$container_width:160rpx;
	$container_height:160rpx;
	.circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: $container_width;
		height: $container_height;
		border: 0 solid transparent;
		border-radius: $uni-border-radius-circle;
		background-color: $wk-bg-color-grey;
		color: $wk-text-color-grey;
		font-size: $uni-font-size-sm;
		.icon {
			margin: 20rpx 0;
			height: 32rpx;
		}
		.imgContainer {
			position: relative;
			.text {
				position: absolute;
				bottom: 20rpx;
				left: 0;
				width: $container_width;
				height: 30px;
				color: white;
				font-size: $uni-font-size-sm;
				background-color: $uni-bg-color-mask;
			}
			.img {
				width: $container_width;
				height: $container_height;
			}
		}
	}
}
</style>