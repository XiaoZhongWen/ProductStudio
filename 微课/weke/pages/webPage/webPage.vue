<template>
	<view>
		<web-view :src="url" @load="loadSuccess" @error="loadFailure"></web-view>
	</view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from '../../uni_modules/lime-shared/vue';

const url = ref('')

onLoad((option) => {
	const { targetUrl } = option as { targetUrl:string }
	if (typeof(targetUrl) !== 'undefined' && targetUrl.length > 0) {
		url.value = targetUrl
	}
	uni.showLoading({
		title: "加载中...",
		mask: true
	})
})

const loadSuccess = () => {
	uni.hideLoading()
}

const loadFailure = () => {
	uni.hideLoading()
}

</script>

<style lang="scss" scoped>

</style>
