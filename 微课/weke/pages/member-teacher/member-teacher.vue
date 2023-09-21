<template>
	<view>
		
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'



onLoad((option) => {
	const { orgId, teacherId } = option as {orgId: string, teacherId:string}
	if (typeof(orgId) !== 'undefined' 
		&& typeof(teacherId) !== 'undefined') {
		
	}
})
	
</script>

<style lang="scss" scoped>

</style>
