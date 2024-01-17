<template>
	<view class="payment-records-container" v-if="r">
		<view class="section">
			<text class="title">状态:</text>
			<text :class="statusCls">{{statusDesc}}</text>
		</view>
		<view class="section" v-if="operator && r.status !== 0">
			<text class="title">操作人:</text>
			<text class="desc">{{operator.nickName}}</text>
		</view>
		<view class="section" v-if="r.status !== 0">
			<text class="title">操作时间:</text>
			<text class="desc">{{format(new Date(r.modifyDate))}}</text>
		</view>
		<view class="section" v-if="r && r.status !== 3">
			<text class="title">续课时间:</text>
			<text class="desc">{{format(new Date(r.date))}}</text>
		</view>
		<view class="section" v-if="course">
			<text class="title">{{courseDesc}}</text>
			<text class="desc">{{r.count}}</text>
		</view>
		<view class="section" v-if="course && r && r.status !== 3">
			<text class="title">{{course.type === 2? '课次单价:':'课时单价:'}}</text>
			<text class="desc">{{r.price}}</text>
		</view>
		<view class="section area" v-if="r.remark && r.remark.length > 0">
			<text class="title">备注:</text>
			<text class="content">{{r.remark}}</text>
		</view>
		<view class="bottom" v-if="canOperate">
			<text class="action" @tap="onEditTap">编辑</text>
			<text class="action revoke" @tap="onRevokeTap">撤销</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { PaymentRecord } from '../../types/PaymentRecord'
import { User } from '../../types/user'
import { format } from '@/utils/wk-date'
import { Course } from '../../types/course'

const global = getApp().globalData!
const courseStore = useCourseStore()
const usersStore = useUsersStore()
const props = defineProps(['rId'])
const emit = defineEmits(['editPaymentAction', 'revokePaymentAction'])
const r = ref<PaymentRecord>()
const course = ref<Course>()
const operator = ref<User>()
const isValidate = ref(false)

onMounted(() => {
	const records = courseStore.paymentRecords.filter(r => r._id === props.rId)
	if (records.length > 0) {
		r.value = records[0]
	}
	const users = usersStore.users.filter(user => user._id === r.value?.operatorId)
	if (users.length > 0) {
		operator.value = users[0]
	}
	const courseId = r.value?.courseId ?? ''
	if (usersStore.owner.from === 'wx' && usersStore.owner.roles?.includes(1)) {
		const orgsStore = useOrgsStore()
		const orgs = orgsStore.orgs.filter(org => org.creatorId === usersStore.owner._id)
		if (courseId.length > 0) {
			const index = orgs.findIndex(org => org.courseIds?.includes(courseId))
			isValidate.value = index !== -1
		}
	}
	const courses = courseStore.courses.filter(c => c._id === courseId)
	if (courses.length === 1) {
		course.value = courses[0]
	}
})

const onEditTap = () => {
	emit('editPaymentAction', {'id': props.rId})
}

const onRevokeTap = () => {
	const count = r.value?.count ?? 0
	const content = "该记录保存了续课" + count + "课时, 撤销将扣除相应课时数, 确定撤销吗?"
	uni.showModal({
		title: global.appName,
		content: content,
		success: (res) => {
			if (res.confirm) {
				emit('revokePaymentAction', {'id': props.rId})
			}
		}
	})
}

const statusCls = computed(() => {
	let cls = "desc"
	const status = r.value?.status ?? 0
	if (status === 0) {
		cls = "renew"
	} else if (status === 1) {
		cls = "modify"
	} else if (status === 2 || status === 3) {
		cls = "revoke"
	}
	return cls
})

const statusDesc = computed(() => {
	let desc = ''
	const status = r.value?.status ?? 0
	if (status === 0) {
		desc = "续课"
	} else if (status === 1) {
		desc = "已变更"
	} else if (status === 2) {
		desc = "已撤销"
	} else if (status === 3) {
		desc = "已退费"
	} 
	return desc
})

const courseDesc = computed(() => {
	const section1 = r.value?.status === 3? '退课':'续课'
	const section2 = course.value?.type === 2? '次数:':'时数:'
	return section1 + section2
})

const canOperate = computed(() => {
	const isFrozen = r.value?.isFrozen ?? false
	const status = r.value?.status ?? 0
	return isValidate.value && 
			status !== 2 && 
			status !== 3 && 
			!isFrozen && 
			!usersStore.isExpired
})

</script>

<style lang="scss" scoped>
.payment-records-container {
	display: flex;
	flex-direction: column;
	background-color: white;
	border-radius: $uni-border-radius-base;
	.section {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		font-size: $uni-font-size-sm;
		.desc {
			color: $wk-text-color-grey;
		}
		.renew {
			color: $wk-theme-color;
		}
		.modify {
			color: $uni-color-warning;
		}
		.revoke {
			color: $uni-color-error;
		}
		.content {
			flex: 1;
			padding: $uni-padding-base;
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-base;
			margin-left: $uni-spacing-row-base;
			color: $wk-text-color-grey;
		}
	}
	.area {
		margin: $uni-spacing-col-sm 0;
	}
	.bottom {
		display: flex;
		justify-content: flex-end;
		margin-top: $uni-spacing-col-base;
		.action {
			margin-left: $uni-spacing-row-lg;
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-sm;
			padding: $uni-padding-sm $uni-padding-base;
			border-radius: $uni-border-radius-base;
		}
		.revoke {
			background-color: $uni-color-error;
		}
	}
}
</style>