<template>
	<view class="signature-container">
		<uni-easyinput 
			class="input"
			type="textarea" 
			v-model="sigText" 
			placeholder="个性签名"
			maxlength=30
			:inputBorder="false"
			focus
			trim
			@confirm="onConfirm">
		</uni-easyinput>
		<text class="number">{{number}}</text>
	</view>
	<view class="bottom">
		<button class="btn" type="default" @tap="onConfirm">确定</button>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUsersStore } from "@/store/users"

const usersStore = useUsersStore()
const signature = usersStore.owner.signature ?? ''
const sigText = ref(signature)
// @ts-ignore
const number = computed({
	get() {
		return 30 - sigText.value.length
	}
})
const onConfirm = () => {
	if (signature !== sigText.value && 
		sigText.value.length <= 30) {
		usersStore.updateSignature(sigText.value)
	}
	uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.signature-container {
	padding: 0 $uni-padding-normal;
	background-color: white;
	position: relative;
	.input {
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg;
		caret-color: $wk-theme-color;
		color: $wk-text-color;
		font-size: $uni-font-size-base;
	}
	.number {
		position: absolute;
		right: $uni-spacing-row-base;
		bottom: $uni-spacing-col-base;
		font-size: $uni-font-size-base;
		color: $wk-text-color-grey;
	}
}
.bottom {
	margin-top: $uni-spacing-col-lg;
	.btn {
		background-color: $wk-theme-color;
		color: white;
		font-size: $uni-font-size-base;
		width: 90%;
	}
}
</style>
