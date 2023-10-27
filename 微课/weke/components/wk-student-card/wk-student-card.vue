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
			<text class="text">{{orgNames}}</text>
			<view class="icon-container" @tap.stop="onIconTap">
				<uni-icons id="course" class="icon" type="wallet-filled" color="#5073D6" size="24"></uni-icons>
				<uni-icons id="schedule" class="icon" type="calendar-filled" color="#5073D6" size="24"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from '../../uni_modules/lime-shared/vue';
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'

const total = ref(0)
const consume = ref(0)
const orgIds = ref<string[]>([])

const usersStore = useUsersStore()
const useOrgs = useOrgsStore()
const props = defineProps([
	'id', 'url', 'name', 'studentNo', 'signature'
])

const onIconTap = (e:UniHelper.EventTarget) => {
	const { id } = e.target
	if (id === 'course') {
		uni.navigateTo({
			url: "/pages/course-bind/course-bind?studentNo="+props.studentNo+"&orgIds="+orgIds.value
		})
	}
	if (id === 'schedule') {
		
	}
}

onMounted(async () => {
	const orgs = useOrgs.orgs.filter(org => org.studentIds?.includes(props.id))
	orgIds.value = orgs.map(org => org._id)
	const entries = await usersStore.fetchEntriesWithStudentNo(props.studentNo, orgIds.value)
	entries.forEach(entry => {
		total.value += entry.total
		consume.value += entry.consume
	})
})

const orgNames = computed(() => {
	const userId = usersStore.owner._id
	const roles = usersStore.owner.roles ?? []
	const from = usersStore.owner.from
	const orgs = useOrgs.orgs.filter(
		org => org.studentIds?.includes(props.id) &&
			(org.creatorId === userId || 
			org.teacherIds?.includes(userId) || 
			from === 'stuNo' ||
			(roles.includes(3) && roles.length === 1))
	)
	let index = 0
	let str = ''
	for (let org of orgs) {
		str += org.name + " "
		index++
		if (index > 2) {
			str += "等"
			break
		}
	}
	return str
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