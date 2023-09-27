<template>
	<view class="edit-card-container">
		<input 
			id="name"
			class="edit name" 
			type="text" 
			:placeholder="props.name"
			v-model="name"
		/>
		<input 
			id="phoneNumber"
			class="edit phoneNumber" 
			type="text" 
			:placeholder="props.mobile"
			v-model="phoneNumber"
		/>
		<uni-icons
			class="icon-add" 
			type="plus-filled" 
			color="#5073D6" 
			size="24"
			@tap="onAddTap">
		</uni-icons>
	</view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import isChinesePhoneNumber from '@/utils/wk_phoneNumber_validate'
import { useUsersStore } from "@/store/users"

const props = defineProps(['orgId', 'name', 'mobile'])
const emit = defineEmits(['onAddTap'])
const global = getApp().globalData!
const usersStore = useUsersStore()

const name = ref('')
const phoneNumber = ref('')

const onAddTap = () => {
	if (typeof(name.value) === 'undefined' || name.value.length === 0) {
		uni.showToast({
			title:"请输入姓名",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	if (name.value.indexOf(" ") !== -1) {
		uni.showToast({
			title:"不能包含空格",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	if (typeof(phoneNumber.value) === 'undefined' || phoneNumber.value.length === 0) {
		uni.showToast({
			title:"请输入手机号",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	if (!isChinesePhoneNumber.mobile(phoneNumber.value)) {
		uni.showToast({
			title:"手机号格式不正确",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	if (phoneNumber.value === usersStore.owner.mobile) {
		uni.showToast({
			title:"不能添加自己",
			duration:global.duration_toast,
			icon:"error"
		})
		return
	}
	emit('onAddTap', {
		info:{
			orgId: props.orgId,
			name: name.value.trim(),
			phoneNumber: phoneNumber.value.trim()
		}
	})
	name.value = ''
	phoneNumber.value = ''
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
		width: 60%;
		margin-left: $uni-spacing-row-base;
	}
	.icon-add {
		position: absolute;
		right: $uni-spacing-row-base;
	}
}
</style>