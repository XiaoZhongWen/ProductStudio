<template>
	<view class="course-record-container" v-if="r">
		<view class="section">
			<text class="title">状态:</text>
			<text :class="statusCls">{{statusDesc}}</text>
		</view>
		<view class="section" v-if="operator && r.status !== 1">
			<text class="title">操作人:</text>
			<text class="desc">{{operator.nickName}}</text>
		</view>
		<view class="section" v-if="r.status !== 1">
			<text class="title">操作时间:</text>
			<text class="desc">{{format(new Date(r.modifyDate))}}</text>
		</view>
		<view class="section">
			<text class="title">开始时间:</text>
			<text class="desc">{{format(new Date(r.startTime))}}</text>
		</view>
		<view class="section">
			<text class="title">结束时间:</text>
			<text class="desc">{{format(new Date(r.endTime))}}</text>
		</view>
		<view class="section" v-if="courseType !== -1">
			<text class="title">{{courseType === 2? '消耗课次:':'消耗课时:'}}</text>
			<text class="desc">{{r.consume}}</text>
		</view>
		<view class="section area" v-if="r.courseContent">
			<text class="title">课程内容:</text>
			<text class="content">{{r.courseContent}}</text>
		</view>
		<view class="section area" v-if="r.assignment">
			<text class="title">课后作业:</text>
			<text class="content">{{r.assignment}}</text>
		</view>
		<view class="section area" v-if="r.feedback">
			<text class="title">课程反馈:</text>
			<text class="content">{{r.feedback}}</text>
		</view>
		<!-- <view class="bottom" v-if="isValidate && r.status !== 3">
			<text class="action" @tap="onEditTap">编辑</text>
			<text class="action revoke" @tap="onRevokeTap">撤销</text>
		</view> -->
	</view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCourseStore } from "@/store/course"
import { useUsersStore } from "@/store/users"
import { useOrgsStore } from '@/store/orgs'
import { format } from '@/utils/wk-date'
import { User } from '../../types/user';
import { Schedule } from '../../types/schedule';

const global = getApp().globalData!

const props = defineProps(['record'])
const emit = defineEmits(['editAction', 'revokeAction'])
const r = ref<Schedule>()
const courseStore = useCourseStore()
const operator = ref<User>()
const isValidate = ref(false)
const courseType = ref(-1)

onMounted(async () => {
	if (typeof(props.record) === 'undefined') {
		return
	}
	r.value = props.record
	const usersStore = useUsersStore()
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
	if (courseId.length > 0) {
		const courses = await courseStore.fetchCourses([courseId])
		if (courses.length === 1) {
			const course = courses[0]
			courseType.value = course.type
		}
	}
})

const statusCls = computed(() => {
	let cls = "desc"
	const status = r.value?.status ?? 1
	if (status === 1) {
		cls = "consume"
	} else if (status === 4) {
		cls = "modify"
	} else if (status === 3) {
		cls = "revoke"
	}
	return cls
})

const statusDesc = computed(() => {
	let desc = ''
	const status = r.value?.status ?? 1
	if (status === 1) {
		desc = "课消"
	} else if (status === 4) {
		desc = "已变更"
	} else if (status === 3) {
		desc = "已撤销"
	}
	return desc
})

const onEditTap = () => {
	emit('editAction', {'id': props.record._id})
}

const onRevokeTap = () => {
	const count = r.value?.consume ?? 0
	const content = "该记录保存了课消" + count + "课时, 撤销将返还课时, 确定撤销吗?"
	uni.showModal({
		title: global.appName,
		content: content,
		success: (res) => {
			if (res.confirm) {
				emit('revokeAction', {'id': props.record._id})
			}
		}
	})
}

</script>

<style lang="scss" scoped>
.course-record-container {
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
		.consume {
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