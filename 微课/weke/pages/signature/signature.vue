<template>
	<view>
		<uni-easyinput 
			class="input"
			type="textarea" 
			v-model="sigText" 
			placeholder="请输入内容"
			maxlength=50
			inputBorder=false
			focus
			trim>
		</uni-easyinput>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const sigText = ref('')
</script>

<style lang="scss">
.input {
	background-color: $wk-bg-color-grey;
	border-radius: $uni-border-radius-lg;
	caret-color: $wk-theme-color;
	color: $wk-text-color;
}
</style>
