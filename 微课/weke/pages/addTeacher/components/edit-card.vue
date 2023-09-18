<template>
	<view class="edit-card-container">
		<input 
			id="name"
			class="edit name" 
			type="text" 
			placeholder="姓名"
			@input="onValueChange"
		/>
		<input 
			id="phoneNumber"
			class="edit phoneNumber" 
			type="text" 
			placeholder="手机号"
			@input="onValueChange"
		/>
	</view>
</template>

<script setup lang="ts">
const props = defineProps(['orgId'])
const emit = defineEmits(['onValueChange'])

let name = ''
let phoneNumber = ''
const onValueChange = (event: Event) => {
	// @ts-ignore
	const { id, value } = event.target
	if (id === "name") {
		name = value
	}
	if (id === "phoneNumber") {
		phoneNumber = value
	}
	emit('onValueChange', {
		orgId: props.orgId,
		name: name,
		phoneNumber: phoneNumber
	})
}
	
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