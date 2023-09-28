<template>
	<view @tap="onTap">
		{{ map.get("a") }}
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const map = ref(new Map())
map.value.set("a", [1])

const onTap = () => {
	let data = map.value.get("a")
	data = [1, 2, 4]
	// map.value.set("a", [1, 2])
}

</script>

<style lang="scss" scoped>

</style>
