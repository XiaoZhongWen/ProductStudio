<template>
	<view class="member-center-container">
		<view class="member-card-container">
			<template v-for="option in memberOptions" :key="option._id">
				<member-card :option="option" />
			</template>
		</view>
		<view class="indate"></view>
		<view class="capacity-container"></view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMemberStore } from "@/store/member"
import MemberCard from "./components/member-card.vue"
import { MemberOption } from "../../types/MemberOption";

const memberStore = useMemberStore()
const memberOptions = ref<MemberOption[]>([])

onMounted(async () => {
	const options = await memberStore.fetchMemberOptions()
	memberOptions.value = options
})

</script>

<style lang="scss" scoped>
.member-center-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.member-card-container {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}
}
</style>
