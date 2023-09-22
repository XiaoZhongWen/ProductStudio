<template>
	<view class="add-student-container">
		
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onLoad } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { Org } from "../../types/org";

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()

onLoad(() => {
	if (usersStore.owner.roles?.includes(2)) {
		// 包含老师角色, 则创建老师的匿名机构
		useOrgs.createAnonymousOrg()
	}
})

// @ts-ignore
const orgs = computed<Org[]>({
	get() {
		
		return []
	}
})

</script>

<style lang="scss" scoped>

</style>
