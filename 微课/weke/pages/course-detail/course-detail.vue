<template>
	<view class="course-detail-container">
		<view class="header">
			<view class="top" v-if="course">
				<view :class="course.icon"></view>
				<text class="text">{{course.name}}</text>
				<wk-circle-progress
					class="circle-progress"
					:total="entry.total"
					:consume="entry.consume">
				</wk-circle-progress>
			</view>
			<view class="duration" v-if="course">
				<text>课程时长: {{course.duration}}分钟</text>
			</view>
			<view class="duration" v-if="student">
				<text>上课学员: {{student.nickName}}</text>
			</view>
			<!-- <view class="student" v-if="student">
				<text>上课学员: </text>
				<view class="student-cell">
					<wk-icon
						class="icon" 
						:url="student.avatarUrl"
						:text="student.nickName">
					</wk-icon>
				</view>
			</view> -->
			<view class="teacher" v-if="teacher">
				<text>授课老师: </text>
				<view class="teacher-cell">
					<wk-icon
						class="icon" 
						:url="teacher.avatarUrl"
						:text="teacher.nickName">
					</wk-icon>
				</view>
			</view>
			<view class="bottom">
				<text>{{orgName}}</text>
				<text>{{typeName}}</text>
			</view>
		</view>
		<view class="body">
			<uni-segmented-control 
				:current="current" 
				:values="options" 
				class="segmented" 
				styleType="text" 
				activeColor="#5073D6" 
				@clickItem="onClickItem">
			</uni-segmented-control>
			<view class="content">
				<uni-list v-show="current === 0">
					<uni-list-item v-for="r in courseConsumeRecords" :key="r._id">
						<template v-slot:body>
							<wk-course-record 
								class="course-record" 
								:rId="r._id"
								@editAction="onEditAction"
								@revokeAction="onRevokeAction">
							</wk-course-record>
						</template>
					</uni-list-item>
				</uni-list>
				<uni-list v-show="current === 1">
					<uni-list-item v-for="r in paymentRecords" :key="r._id">
						<template v-slot:body>
							<wk-payment-records
								class="payment-record" 
								:rId="r._id"
								@editPaymentAction="onEditPaymentAction"
								@revokePaymentAction="onRevokePaymentAction">
							</wk-payment-records>
						</template>
					</uni-list-item>
				</uni-list>
				<view v-show="current === 2">
					Content of Tab 3
				</view>
			</view>
		</view>
		<view class="placeholder" v-if="isShow">
			暂无记录
		</view>
	</view>
	<uni-popup ref="editCourseRecordPopup" type="bottom">
		<EditCourseRecord 
			ref="recordRef"
			@change="onChange" />
	</uni-popup>
	<uni-popup ref="editPaymentRecordPopup" type="bottom">
		<EditPaymentRecord 
			ref="paymentRecordRef"
			@change="onPaymentChange" />
	</uni-popup>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { computed, ref } from 'vue';
import { Course, CourseConsumeRecord } from '../../types/course';
import { Student, User } from '../../types/user';
import { Org } from '../../types/org';
import { Entry } from '../../types/entry';
import EditCourseRecord from './components/EditCourseRecord.vue'
import EditPaymentRecord from './components/EditPaymentRecord.vue'
import { PaymentRecord } from '../../types/PaymentRecord';

const global = getApp().globalData!

const entry = ref<Entry>()
const course = ref<Course>()
const student = ref<Student>()
const teacher = ref<User>()
const org = ref<Org>()
const typeName = ref('')
const orgName = ref('')
const current = ref(0)
const options = ["课程记录", "续课记录", "请假记录"]

const courseConsumeRecords = ref<CourseConsumeRecord[]>([])
const paymentRecords = ref<PaymentRecord[]>([])
const recordRef = ref(null)
const paymentRecordRef = ref(null)

const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const editCourseRecordPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const editPaymentRecordPopup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

onLoad(async (option) => {
	const { entryId } = option as { entryId:string }
	const entries = usersStore.entries.filter(entry => entry._id === entryId)
	if (entries.length <= 0) {
		return
	}
	entry.value = entries[0]
	const courseId = entry.value.courseId
	const courses =  await courseStore.fetchCourses([courseId])
	if (courses.length <= 0) {
		return
	}
	course.value = courses[0]
	if (course.value.type === 0) {
		typeName.value = "一对一"
	}
	if (course.value.type === 1) {
		typeName.value = "班课"
	}
	if (course.value.type === 2) {
		typeName.value = "次课"
	}
	if (course.value.type === 3) {
		typeName.value = "试听课"
	}
	
	const studentId = entry.value.studentId
	const students = usersStore.students.filter(student => student.studentNo === studentId)
	if (students.length <= 0) {
		return
	}
	student.value = students[0]
	const teacherId = entry.value.teacherId
	const users = usersStore.users.filter(user => user._id === teacherId)
	if (users.length <= 0) {
		return
	}
	teacher.value = users[0]
	const orgId = entry.value.orgId
	const orgs = useOrgs.orgs.filter(org => org._id === orgId)
	if (orgs.length <= 0) {
		return
	}
	org.value = orgs[0]
	if (org.value.type === 0) {
		orgName.value = org.value.name
	} else {
		const users = await usersStore.fetchUsers([org.value.creatorId])
		if (users.length === 1) {
			const creator = users[0]
			orgName.value = creator.nickName
		}
	}
	courseConsumeRecords.value = await courseStore.fetchCourseConsumeRecords(courseId, student.value._id)
	paymentRecords.value = await courseStore.fetchPaymentRecords(entry.value.courseId, student.value.studentNo)
})

const onClickItem = (e: { currentIndex:number }) => {
	if (current.value !== e.currentIndex) {
		current.value = e.currentIndex
	}
}

const onEditAction = (param:{id:string}) => {
	const { id } = param
	if (typeof(id) === 'undefined' || id.length === 0) {
		return
	}
	if (recordRef.value) {
		const instance:InstanceType<typeof EditCourseRecord> = recordRef.value
		instance.initial(id)
	}
	editCourseRecordPopup.value?.open()
}

const onRevokeAction = async (param:{id:string}) => {
	const { id } = param
	if (typeof(id) === 'undefined' || id.length === 0) {
		return
	}
	const res = courseConsumeRecords.value.filter(r => r._id === id)
	let flag = false
	if (res.length > 0) {
		const r = res[0]
		const result = await courseStore.revokeCourseConsumeRecord(id)
		if (result) {
			if (entry.value) {
				let consume = entry.value.consume
				consume -= r.count
				const res = await courseStore.modifyCourseCount(entry.value._id, entry.value.total, consume)
				if (res) {
					entry.value.consume = consume
					uni.$emit(global.event_name.didUpdateCourseData, {
						studentNo:entry.value.studentId,
						courseId: entry.value.courseId
					})
					flag = true
				}
			}
		}
	}
	uni.showToast({
		title: flag? "撤销成功": "撤销失败",
		duration: global.duration_toast,
		icon:flag?"success":"error"
	})
}

const onEditPaymentAction = (param:{id:string}) => {
	const { id } = param
	if (typeof(id) === 'undefined' || id.length === 0) {
		return
	}
	if (paymentRecordRef.value) {
		const instance:InstanceType<typeof EditPaymentRecord> = paymentRecordRef.value
		instance.initial(id)
	}
	editPaymentRecordPopup.value?.open()
}

const onRevokePaymentAction = async (param:{id:string}) => {
	const { id } = param
	if (typeof(id) === 'undefined' || id.length === 0) {
		return
	}
	const res = paymentRecords.value.filter(r => r._id === id)
	let flag = false
	if (res.length > 0) {
		const r = res[0]
		const result = await courseStore.revokePaymentRecord(id)
		if (result) {
			if (entry.value) {
				let total = entry.value.total
				total -= r.count
				const res = await courseStore.modifyCourseCount(entry.value._id, total, entry.value.consume)
				if (res) {
					entry.value.total = total
					uni.$emit(global.event_name.didUpdateCourseData, {
						studentNo:entry.value.studentId,
						courseId: entry.value.courseId
					})
					flag = true
				}
			}
		}
	}
	uni.showToast({
		title: flag? "撤销成功": "撤销失败",
		duration: global.duration_toast,
		icon:flag?"success":"error"
	})
}

const onChange = async (
	param:{
		_id:string, 
		startTime:number,
		endTime: number,
		count: number,
		content: string,
		assignment: string,
		feedback: string
	}) => {
	const { _id, startTime, endTime, count, content, assignment, feedback } = param
	const res = courseConsumeRecords.value.filter(r => r._id === _id)
	let flag = false
	if (res.length > 0) {
		const r = res[0]
		if (r.startTime !== startTime ||
			r.endTime !== endTime ||
			r.count !== count ||
			r.content !== content ||
			r.assignment !== assignment ||
			r.feedback !== feedback) {
			const delta = r.count - count
			const result = await courseStore.modifyCourseConsumeRecord({...param})
			if (result) {
				if (entry.value && delta !== 0) {
					let consume = entry.value.consume
					consume -= delta
					const res = await courseStore.modifyCourseCount(entry.value._id, entry.value.total, consume)
					if (res) {
						entry.value.consume = consume
						uni.$emit(global.event_name.didUpdateCourseData, {
							studentNo:entry.value.studentId,
							courseId: entry.value.courseId
						})
						flag = true
					}
				} else {
					flag = true
				}
			}
		}
	} else {
		editCourseRecordPopup.value?.close()
		return
	}
	editCourseRecordPopup.value?.close()
	uni.showToast({
		title: flag? "修改成功": "修改失败",
		duration: global.duration_toast,
		icon:flag?"success":"error"
	})
}

const onPaymentChange = async (param:{
		_id:string, 
		date:number,
		count: number,
		price: number,
		remark: string
	}) => {
	const { _id, date, count, price, remark } = param
	const res = paymentRecords.value.filter(r => r._id === _id)
	let flag = false
	if (res.length > 0) {
		const r = res[0]
		if (r.date !== date ||
			r.count !== count ||
			r.price !== price ||
			r.remark !== remark) {
			const delta = r.count - count
			const result = await courseStore.modifyPaymentRecord({...param})
			if (result) {
				if (entry.value && delta !== 0) {
					let total = entry.value.total
					total -= delta
					const res = await courseStore.modifyCourseCount(entry.value._id, total, entry.value.consume)
					if (res) {
						entry.value.total = total
						uni.$emit(global.event_name.didUpdateCourseData, {
							studentNo:entry.value.studentId,
							courseId: entry.value.courseId
						})
						flag = true
					}
				} else {
					flag = true
				}
			}
		}
	} else {
		editPaymentRecordPopup.value?.close()
		return
	}
	editPaymentRecordPopup.value?.close()
	uni.showToast({
		title: flag? "修改成功": "修改失败",
		duration: global.duration_toast,
		icon:flag?"success":"error"
	})
}

const isShow = computed(() => {
	return (current.value === 0 && courseConsumeRecords.value.length === 0) ||
			(current.value === 1 && paymentRecords.value.length === 0)
})

</script>

<style lang="scss" scoped>
.course-detail-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: $uni-padding-normal;
		box-sizing: border-box;
		.top {
			position: relative;
			display: flex;
			flex-direction: row;
			align-items: center;
			height: 30px;
			.text {
				margin-left: $uni-spacing-row-sm;
				font-size: $uni-font-size-base;
			}
			.circle-progress {
				width: 37px;
				height: 54px;
				position: absolute;
				top: 0;
				right: 0;
			}
		}
		.duration {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
		.teacher, .student {
			display: flex;
			flex-direction: row;
			align-items: center;
			height: 28px;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			.teacher-cell, .student-cell {
				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
				.icon {
					width: 28px;
					height: 28px;
					border-radius: $uni-border-radius-circle;
					margin: 0 $uni-spacing-row-sm;
				}
			}
		}
		.bottom {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-top: $uni-spacing-col-sm;
		}
	}
	.body {
		display: flex;
		flex-direction: column;
		margin-top: $uni-spacing-col-sm;
		background-color: white;
		.segmented {
			font-size: $uni-font-size-base;
		}
		.course-record, .payment-record {
			width: 100%;
		}
	}
	.placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		color: $wk-text-color-grey;
		font-size: $uni-font-size-base;
		margin-top: 100px;
	}
}

</style>
