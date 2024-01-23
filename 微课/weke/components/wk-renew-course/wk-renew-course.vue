<template>
	<view class="renew-course-container">
		<view class="header">
			<text>续课</text>
		</view>
		<view class="body">
			<view class="top">
				<view class="left">
					<wk-icon 
						class="icon" 
						:url="studentAvatarUrl"
						:text="briefName(studentNickname)">
					</wk-icon>
				</view>
				<view class="right">
					<text class="nickName">{{studentNickname}}</text>
					<text class="studentNo">{{studentNo}}</text>
				</view>
			</view>
			<view class="content">
				<view class="content">
					<view class="section" v-if="orgType === 0">
						<text class="title">机构</text>
						<view class="desc">
							{{orgName}}
						</view>
					</view>
				</view>
				<view class="section">
					<text class="title">课程</text>
					<view class="desc">
						<view :class="courseIcon"></view>
						<text style="margin-left: 4px;">{{courseName}}</text>
					</view>
				</view>
				<view class="section">
					<text class="title">授课老师</text>
					<view class="desc">
						<wk-icon 
							class="teacher"
							:url="teacherAvatarUrl"
							:text="teacherNickname">
						</wk-icon>
					</view>
				</view>
				<view class="section">
					<text class="title">课程类型</text>
					<view class="desc">
						{{typeName}}
					</view>
				</view>
				<view class="section">
					<text class="title">{{type === 2?"剩余课次":"剩余课时"}}</text>
					<view class="desc">
						{{typeof(entry) !== 'undefined'?(entry.total - entry.consume):0}}
					</view>
				</view>
				<view class="section">
					<text class="title">{{type === 2?"课次单价":"课时单价"}}</text>
					<view class="desc">
						<input class="input" type="number" v-model="price"/>
					</view>
				</view>
				<view class="section">
					<text class="title">{{type === 2?"续课次数":"续课时数"}}</text>
					<view class="desc">
						<uni-number-box 
							:max="1000"
							:min="1"
							v-model="renewCount" 
							background="#5073D6" 
							color="#fff" />
					</view>
				</view>
				<view class="remark">
					<textarea
						v-model="remark"
						class="textarea" 
						placeholder="备注"
						maxlength="100" 
					/>
					<text class="number">{{number}}</text>
				</view>
			</view>
			<button 
				:disabled="isRenewing"
				:loading="isRenewing"
				type="default" 
				class="btn" 
				@tap="onConfirm">确定</button>
		</view>
		<view class="bottom">
		</view>
	</view>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useOrgsStore } from '@/store/orgs'
import { computed, onMounted, ref } from "vue";
import { Student, User } from "../../types/user";
import { PaymentRecord } from "../../types/PaymentRecord";
import { Entry } from "../../types/entry";

const props = defineProps(['entryId'])
const usersStore = useUsersStore()
const courseStore = useCourseStore()
const useOrgs = useOrgsStore()

const studentAvatarUrl = ref('')
const studentNickname = ref('')
const studentNo = ref('')
const teacherAvatarUrl = ref('')
const teacherNickname = ref('')
const orgId = ref('')
const orgName = ref('')
const orgType = ref(0)
const courseId = ref('')
const courseIcon = ref('')
const courseName = ref('')
const type = ref(0)
const typeName = ref('')
const price = ref(0.0)
const renewCount = ref(20)
const remark = ref<string>()
const entry = ref<Entry>()
const paymentRecord = ref<PaymentRecord>()
const isRenewing = ref(false)
const total = ref(0)
const consume = ref(0)

const emit = defineEmits(['onConfirm'])

const global = getApp().globalData!

onMounted(async () => {
	if (typeof(props.entryId) !== 'undefined' && props.entryId.length > 0) {
		const entries = usersStore.entries.filter(entry => entry._id === props.entryId)
		if (entries.length === 1) {
			entry.value = entries[0]
			if (typeof(entry.value) === 'undefined') {
				return
			}
			total.value = entry.value.total
			consume.value = entry.value.consume
			const student = await usersStore.fetchStudentByNo(entry.value.studentId) as Student
			paymentRecord.value = await fetchLastestPaymentRecord(entry.value.courseId, student._id) as PaymentRecord
			if (typeof(paymentRecord.value) !== 'undefined') {
				price.value = paymentRecord.value.price
			}
			
			studentAvatarUrl.value = student.avatarUrl ?? ''
			studentNickname.value = student.nickName
			studentNo.value = student.studentNo
			
			const teachers = await usersStore.fetchUsers([entry.value.teacherId]) as User[]
			if (teachers.length === 1) {
				const teacher = teachers[0]
				teacherAvatarUrl.value = teacher.avatarUrl ?? ''
				teacherNickname.value = teacher.nickName
			}
			const orgs = useOrgs.orgs.filter(org => org._id === entry.value.orgId)
			if (orgs.length === 1) {
				const org = orgs[0]
				orgName.value = org.name
				orgType.value = org.type
				orgId.value = org._id
			}
			const courses = await courseStore.fetchCourses([entry.value.courseId])
			if (courses.length > 0) {
				const course = courses[0]
				courseId.value = course._id
				courseIcon.value = course.icon
				courseName.value = course.name
				if (course.type === 0) {
					typeName.value = "一对一"
				}
				if (course.type === 1) {
					typeName.value = "班课"
				}
				if (course.type === 2) {
					typeName.value = "次课"
				}
				if (course.type === 3) {
					typeName.value = "试听课"
				}
				type.value = course.type
			}
		}
	}
})

const briefName = (name:string) => {
	const length = name.length
	if (length < 3) {
		return name
	} else {
		return name.substring(length - 2)
	}
}

const number = computed(() => {
	const len = remark.value?.length ?? 0
	return 100 - len
})

const onConfirm = async () => {
	await renewCourse()
}

const renewCourse = async () => {
	if (!isFinite(total.value) ||
		!isFinite(consume.value) ||
		!isFinite(price.value)) {
		uni.showToast({
			title:"请输入正确格式的数字",
			duration:global.duration_toast,
			icon:"none"
		})
		return
	}
	if (price.value < 0) {
		uni.showToast({
			title:"课程单价不能小于0",
			duration:global.duration_toast,
			icon:"none"
		})
		return false
	}
	if (renewCount.value <= 0) {
		uni.showToast({
			title:"续课数要大于0",
			duration:global.duration_toast,
			icon:"none"
		})
		return false
	}
	isRenewing.value = true
	const id = await courseStore.addPaymentRecord({
		orgId: orgId.value,
		studentId: studentNo.value,
		date: Date.now(),
		courseId: courseId.value,
		count: renewCount.value,
		price: price.value,
		remark: remark.value ?? '',
		entryId: props.entryId,
		delta: renewCount.value,
		operatorId: usersStore.owner._id
	})
	let result = false
	if (typeof(id) !== 'undefined' && 
		id.length > 0 && 
		typeof(entry.value) !== 'undefined') {
		const operatorId = usersStore.owner._id
		result = true
		entry.value.total += renewCount.value
		entry.value.status = 0
		entry.value.modifyDate = Date.now()
		entry.value.operatorId = operatorId
		emit('onConfirm', {count:renewCount.value})
		uni.$emit(global.event_name.didUpdateCourseData, {
			studentNo: entry.value.studentId,
			courseId: entry.value.courseId
		})
	}
	uni.showToast({
		title:result?"续课成功":"续课失败",
		duration:global.duration_toast,
		icon:result?"success":"none"
	})
	isRenewing.value = false
	return result
}

const fetchLastestPaymentRecord = async (courseId:string, studentId:string) => {
	const records = await courseStore.fetchPaymentRecords(courseId, studentId)
	if (records.length > 0) {
		records.sort((r1, r2) => {
			return r2.date - r1.date
		})
		return records[0]
	} else {
		return {}
	}
}

</script>

<style lang="scss" scoped>
.renew-course-container {
	display: flex;
	flex-direction: column;
	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 44px;
		background-color: $wk-bg-color-grey;
		border-radius: $uni-border-radius-lg $uni-border-radius-lg 0px 0px;
		font-size: $uni-font-size-lg;
		color: $wk-text-color;
	}
	.body {
		display: flex;
		flex-direction: column;
		width: 100%;
		background-color: white;
		.top {
			display: flex;
			flex-direction: row;
			width: 100%;
			height: 60px;
			border-bottom: 2px solid $wk-bg-color-grey;
			.left {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 60px;
				.icon {
					width: 40px;
					height: 40px;
					border-radius: $uni-border-radius-circle;
					padding-top: $uni-spacing-col-sm;
				}
			}
			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: center;
				.nickName {
					color: $wk-text-color;
					font-size: $uni-font-size-lg;
				}
				.studentNo {
					color: $wk-text-color-grey;
					font-size: $uni-font-size-sm;
				}
			}
		}
		.content {
			width: 100%;
			.section {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 40px;
				background-color: white;
				padding-left: $uni-padding-normal;
				padding-right: $uni-padding-normal;
				.title {
					color: $wk-text-color;
					font-size: $uni-font-size-base;
				}
				.desc {
					display: flex;
					align-items: center;
					color: $wk-text-color-grey;
					font-size: $uni-font-size-base;
					.teacher {
						width: 30px;
						height: 30px;
						border-radius: $uni-border-radius-circle;
						padding-top: $uni-spacing-col-sm;
					}
				}
				.input {
					text-align: right;
					caret-color: $wk-theme-color;
					font-size: $uni-font-size-base;
					color: $wk-text-color;
				}
			}
			.remark {
				background-color: white;
				padding-left: $uni-padding-normal;
				padding-right: $uni-padding-normal;
				.textarea {
					width: 100%;
					height: 100px;
					background-color: $wk-bg-color-grey;
					caret-color: $wk-theme-color;
					font-size: $uni-font-size-base;
					color: $wk-text-color;
					box-sizing: border-box;
					padding: $uni-padding-normal;
					border-radius: $uni-border-radius-base;
				}
				.number {
					position: absolute;
					right: $uni-spacing-col-lg;
					right: 15px;
					bottom: 60px;
					font-size: $uni-font-size-base;
					color: $wk-text-color-grey;
				}
			}
		}
		.btn {
			background-color: $wk-theme-color;
			color: white;
			font-size: $uni-font-size-base;
			width: 90%;
			margin-top: $uni-spacing-col-lg;
			margin-bottom: $uni-spacing-col-lg;
		}
	}
	.bottom {
		position: fixed;
		bottom: 0;
		width: 100%;
		height: 35px;
		background-color: white;
	}
}
</style>