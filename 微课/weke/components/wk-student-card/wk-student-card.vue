<template>
	<view class="student-card">
		<view class="top">
			<member-info
				:url="props.url"
				:nickname="props.name"
				:mobile="`学号: ${props.studentNo}`"
				:signature="props.signature">
			</member-info>
			<wk-circle-progress 
				v-if="total > 0" 
				class="circle-progress" 
				:total="total" 
				:consume="consume">
			</wk-circle-progress>
			<view v-else class="bind">绑定课程</view>
		</view>
		<view class="body">
			
		</view>
		<view class="bottom">
			<text class="text">{{props.orgNames}}</text>
			<view class="icon-container" @tap.stop="onIconTap">
				<uni-icons id="course" class="icon" type="wallet-filled" color="#5073D6" size="24"></uni-icons>
				<uni-icons id="schedule" class="icon" type="calendar-filled" color="#5073D6" size="24"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from '../../uni_modules/lime-shared/vue';
import { useUsersStore } from "@/store/users"

const total = ref(0)
const consume = ref(0)

const usersStore = useUsersStore()
const props = defineProps([
	'id', 'orgIds', 'url', 'name', 'studentNo', 'signature', 'orgNames'
])
const onIconTap = (e:UniHelper.EventTarget) => {
	const { id } = e.target
	if (id === 'course') {
		uni.navigateTo({
			url: "/pages/course-bind/course-bind?studentNo="+props.studentNo+"&orgIds="+props.orgIds
		})
	}
	if (id === 'schedule') {
		
	}
}

onMounted(async () => {
	const entries = await usersStore.fetchEntriesWithStudentNo(props.studentNo, props.orgIds)
	entries.forEach(entry => {
		total.value += entry.total
		consume.value += entry.consume
	})
})
	
</script>

<style lang="scss" scoped>
.student-card {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: $uni-spacing-row-base;
	border-radius: $uni-border-radius-base;
	padding: $uni-padding-normal;
	box-sizing: border-box;
	.top {
		position: relative;
		height: 60px;
		.circle-progress {
			width: 37px;
			height: 54px;
			position: absolute;
			top: 0;
			right: 0;
		}
		.bind {
			position: absolute;
			top: 0;
			right: 0;
			font-size: $uni-font-size-10;
			color: $wk-text-color-grey;
		}
	}
	.bottom {
		position: relative;
		height: 30px;
		.text {
			position: absolute;
			left: 0;
			bottom: 0;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
		}
		.icon-container {
			position: absolute;
			right: 0;
			bottom: 0;
			.icon {
				margin-left: $uni-spacing-row-base;
			}
		}
	}
}
</style>