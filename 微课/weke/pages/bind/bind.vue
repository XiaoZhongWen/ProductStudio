<template>
	<template v-if="bindType === 'studentNo'">
		<BindStudentNo />
	</template>
	<template v-else>
		<view></view>
	</template>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import BindStudentNo from './components/BindStudentNo'
import { ref } from 'vue';

const bindType = ref('')

onLoad((option) => {
	const { type } = option as {type:string}
	if (typeof(type) === 'undefined' || type.length === 0) {
		return
	}
	bindType.value = type
	if (type === "mobile") {
		uni.setNavigationBarTitle({
			title: "绑定手机号"
		})
	} else if (type === "studentNo") {
		uni.setNavigationBarTitle({
			title: "绑定学号"
		})
	}
})

</script>

<style lang="scss" scoped>

</style>
