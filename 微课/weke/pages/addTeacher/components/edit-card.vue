<template>
	<view class="edit-card-container">
		<input 
			class="edit name" 
			type="text" 
			placeholder="姓名" 
			v-model="props.name"
		/>
		<input 
			class="edit phoneNumber" 
			type="text" 
			placeholder="手机号"
			v-model="props.phoneNumber"
		/>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['value'])
</script>

<style lang="scss" scoped>
.edit-card-container {
	display: flex;
	flex-direction: row;
	align-items: center;
	.edit {
		height: 40px;
		caret-color: $wk-theme-color;
		background-color: $wk-bg-color-grey;
		font-size: $uni-font-size-base;
		color: $wk-text-color;
		border-radius: $uni-border-radius-base;
		padding-left: $uni-padding-normal;
	}
	.name {
		width: 80px;
	}
	.phoneNumber {
		width: 180px;
		margin-left: $uni-spacing-row-base;
	}
}
</style>