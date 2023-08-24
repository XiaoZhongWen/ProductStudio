<template>
	<view class="container">
		<text>{{props.content}}</text>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['content'])
</script>

<style lang="scss">
.container {
	display: inline;
	background-color: #EDF2FD;
	padding: 2px 4px;
	border-radius: 2px;
	font-size: $uni-font-size-10;
	color: $wk-theme-color;
}
</style>