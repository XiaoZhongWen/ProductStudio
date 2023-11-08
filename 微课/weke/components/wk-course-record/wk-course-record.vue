<template>
	<view class="course-record-container" v-if="r">
		<view class="section">
			<text class="title">开始时间:</text>
			<text class="desc">{{format(new Date(r.startTime))}}</text>
		</view>
		<view class="section">
			<text class="title">结束时间:</text>
			<text class="desc">{{format(new Date(r.endTime))}}</text>
		</view>
		<view class="section">
			<text class="title">消耗课时:</text>
			<text class="desc">{{r.count}}</text>
		</view>
		<view class="section area">
			<text class="title">课程内容:</text>
			<text class="content">{{r.content}}</text>
		</view>
		<view class="section area">
			<text class="title">课后作业:</text>
			<text class="content">{{r.assignment}}</text>
		</view>
		<view class="section area">
			<text class="title">课程反馈:</text>
			<text class="content">{{r.feedback}}</text>
		</view>
		<view class="bottom">
			<text class="action" @tap="onEditTap">编辑</text>
			<text class="action revoke" @tap="onRevokeTap">撤销</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CourseConsumeRecord } from '../../types/course';
import { useCourseStore } from "@/store/course"
import { format } from '@/utils/wk-date'

const props = defineProps(['rId'])
const emit = defineEmits(['editAction', 'revokeAction'])
const r = ref<CourseConsumeRecord>()
const courseStore = useCourseStore()

onMounted(() => {
	const res = courseStore.courseConsumeRecords.filter(r => r._id === props.rId)
	if (res.length > 0) {
		r.value = res[0]
	}
})

const onEditTap = () => {
	emit('editAction', {'id': props.rId})
}

const onRevokeTap = () => {
	emit('revokeAction', {'id': props.rId})
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