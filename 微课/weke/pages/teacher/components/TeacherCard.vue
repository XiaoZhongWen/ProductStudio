<template>
	<view class="teacher-card-container" @tap="onCardTap">
		<view class="top">
			<member-info 
				:url="user.avatarUrl"
				:nickname="user.nickName"
				:mobile="user.mobile"
				:signature="user.signature">
			</member-info>
			<wk-circle-progress 
				class="circle-progress"
				v-if="total > 0 && !props.forStudent" 
				:total="total"
				:consume="consume">
			</wk-circle-progress>
		</view>
		<view class="bottom">
			<text class="text">{{orgNames}}</text>
			<view class="icon-container" v-if="!props.forStudent" @tap.stop="onIconTap">
				<uni-icons id="course" class="icon" type="wallet-filled" color="#5073D6" size="24"></uni-icons>
				<uni-icons id="schedule" class="icon" type="calendar-filled" color="#5073D6" size="24"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { onMounted, ref } from "../../../uni_modules/lime-shared/vue";
import { Org } from "../../../types/org";
const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const props = defineProps(['teacherId', 'forStudent'])
const user = usersStore.users.filter(user => user._id === props.teacherId)[0]
const orgNames = ref('')
const total = ref(0)
const consume = ref(0)

onMounted(() => {
	const userId = usersStore.owner._id
	let orgs = useOrgs.orgs.filter(org => (org.type === 0 && org.teacherIds?.includes(props.teacherId)) ||
										(org.type === 1 && org.creatorId === props.teacherId))
	if (!props.forStudent) {
		orgs = orgs.filter(org => org.creatorId === userId)
	}
	handleOrgNames(orgs)
	const orgIds = orgs.map(org => org._id)
	const entries = usersStore.fetchEntriesWithTeacherId(props.teacherId, orgIds)
	entries.forEach(entry => {
		total.value += entry.total
		consume.value += entry.consume
	})
})

const onCardTap = () => {
	// uni.navigateTo({
	// 	url: `/pages/teacher-detail/teacher-detail?orgId=${props.orgId}&teacherId=${props.teacherId}`
	// })
}

// @ts-ignore
const onIconTap = (e) => {
	const { id } = e.target
	if (id === "course") {
		uni.navigateTo({
			url: "/pages/member-course/member-course?id=" + props.teacherId
		})
	}
	if (id === "schedule") {
		uni.navigateTo({
			url: "/pages/calendar2/calendar2?id="+props.teacherId+"&role=2"
		})
	}
}

const handleOrgNames = async (orgs:Org[]) => {
	let index = 0
	let str = ''
	for (let org of orgs) {
		let name = org.name
		str += name + " "
		index++
		if (index > 2) {
			str += "等"
			break
		}
	}
	orgNames.value = str
}

</script>

<style lang="scss" scoped>
.teacher-card-container {
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