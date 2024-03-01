<template>
	<view class="add-grade-card-container">
		<view class="header">
			<wk-icon 
				class="icon" 
				:url="props.org.type === 0?props.org.logoUrl:usersStore.owner.avatarUrl" 
				:text="props.org.type === 0?orgBrief(props.org.name):nickNameBrief()">
			</wk-icon>
			<text class="org-name">
				{{props.org.type === 0?props.org.name:usersStore.owner.nickName}}
			</text>
		</view>
		<view class="grade-container" v-if="grades.length > 0">
			<template v-for="grade in grades" :key="grade._id">
				<view :class="gradeStyle(grade._id)" 
						@tap="onGradeTap(grade._id)" 
						@longpress="onLongPressGrade(grade._id)">
					<view :class="grade.icon"></view>
					<text class="grade-name">{{grade.name}}</text>
					<uni-icons
						v-if="longPressGradeId === grade._id"
						class="icon-minus" 
						type="minus-filled" 
						color="#dd524d" 
						size="24" 
						@tap="onDeleteTap">
					</uni-icons>
				</view>
			</template>
		</view>
		<view class="edit-container">
			<view class="icon" @tap="onTapGradeIcon">
				<view :class="selectedIconId"></view>
			</view>
			<text class="text">班级图标</text>
			<view class="gradeName">
				<input class="input" type="text" :disabled="!isEditable" v-model="gradeName" placeholder="班级名称" />
			</view>
			<view class="course-selector">
				<uni-data-select
					@change="onCourseChange"
					:disabled="!isEditable"
					class="selector"
					:clear="false"
					v-model="selectedCourseId"
					:localdata="courseSelectorData"
					placeholder="选择课程">
				</uni-data-select>
			</view>
			<view class="teacher-selector">
				<uni-data-select
					@change="onTeacherChange"
					:disabled="!isEditable"
					class="selector"
					:clear="false"
					v-model="selectedTeacherId"
					:localdata="teacherSelectorData"
					placeholder="选择授课老师">
				</uni-data-select>
			</view>
			<view class="member-container">
				<view class="content">
					<view class="top">
						<text>班级学员</text>
					</view>
					<view class="body">
						<template v-for="student in students" :key="student._id">
							<wk-portrait
								@tap="onStudentTap(student.studentNo)"
								:url="student.avatarUrl" 
								:name="student.nickName">
							</wk-portrait>
						</template>
						<view class="addBtn" v-if="isEditable" @tap="onAddStudent">
							<view class=".iconfont .icon-add .add"></view>
							<text class="text">邀请</text>
						</view>
						<view class="minusBtn" v-if="isEditable" @tap="onRemoveStudent">
							<view class=".iconfont .icon-reduce .minus"></view>
							<text class="text">移除</text>
						</view>
					</view>
				</view>
			</view>
			<view class="desc">
				<textarea 
					class="textarea" 
					:disabled="!isEditable"
					placeholder="班级描述" 
					v-model="gradeDesc" 
					maxlength="100" 
				/>
				<text class="number">{{number}}</text>
				<button
					@tap="onAddTap"
					v-if="isEditable"
					class="btn" 
					type="default">
					{{selectedGradeId.length === 0? "添加":"更新"}}
				</button>
			</view>
		</view>
	</view>
	
	<uni-popup ref="popup" type="bottom" id="popup">
		<wk-choose-member
			id="teacher"
			ref="chooseMemberRef"
			@onConfirm="onConfirm">
		</wk-choose-member>
	</uni-popup>
	
</template>

<script setup lang="ts">
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useUsersStore } from "@/store/users"
import { useGradesStore } from "@/store/grades"
import { useCourseStore } from "@/store/course"
import { computed, onMounted, ref } from 'vue';
import { Grade } from "../../../types/grade";
import { Org } from "../../../types/org";
import { Student, User } from "../../../types/user";
import wkChooseMemberVue from "../../../components/wk-choose-member/wk-choose-member.vue";
import { Course } from "../../../types/course";

const global = getApp().globalData!
const usersStore = useUsersStore()	
const gradesStore = useGradesStore()
const courseStore = useCourseStore()

const props = defineProps(['org', 'gradeId'])
let studentsInfoDidUpdated = false

const grades = ref<Grade[]>([])
const selectedIconId = ref('.t-icon .t-icon-shetuan')
const longPressGradeId = ref('')
const gradeName = ref('')
const gradeDesc = ref('')
const selectedGradeId = ref('')
const selectedCourseId = ref('')
const selectedTeacherId = ref('')
const courseSelectorData = ref<{value:string, text:string}[]>([])
const teacherSelectorData = ref<{value:string, text:string}[]>([])
const courseSelectors:{value:string, text:string}[] = []
const teacherSelectors:{value:string, text:string}[] = []

const students = ref<Student[]>([])

const chooseMemberRef = ref(null)

const popup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const number = computed(() => {
	return 100 - gradeDesc.value.length
})

const isEditable = computed(() => {
	const org:Org = props.org
	return org.creatorId === usersStore.owner._id
})

onLoad(() => {
	uni.$on(global.event_name.didSelectedIcon, (data:{iconId:string, orgId:string}) => {
		const { iconId, orgId } = data
		if (typeof(iconId) !== 'undefined' && iconId.length > 0 &&
			typeof(orgId) !== 'undefined' && orgId.length > 0 &&
			orgId === props.org._id) {
			selectedIconId.value = iconId
		}
	})
})

onUnload(() => {
	uni.$off(global.event_name.didSelectedIcon)
})

onMounted(async () => {
	const org:Org = props.org
	const gradeId = props.gradeId
	let courses:Course[] = []
	if (gradeId.length > 0) {
		grades.value = await gradesStore.fetchGrades([gradeId])
		if (grades.value.length === 1) {
			const grade = grades.value[0]
			courses = await courseStore.fetchCourses([grade.courseId ?? ''])
		}
	} else {
		grades.value = await gradesStore.fetchGrades(org.classIds ?? [])
		courses = await courseStore.fetchCourses(org.courseIds ?? [])
	}
	
	// 获取所有的班课
	courses.forEach(course => {
		if (course.type === 1) {
			const index = courseSelectorData.value.findIndex(item => item.value === course._id)
			if (index === -1) {
				courseSelectors.push({
					value: course._id,
					text: course.name
				})
			}
		}
	})
	courseSelectorData.value = courseSelectors
	
	const id = usersStore.owner._id
	const teacherIds = org.teacherIds ?? []
	if (!teacherIds.includes(id)) {
		teacherIds.push(id)
	}
	const teachers = await usersStore.fetchUsers(teacherIds) as User[]
	teachers.forEach(teacher => {
		teacherSelectors.push({
			value: teacher._id,
			text: teacher.nickName
		})
	})
	teacherSelectorData.value = teacherSelectors
	
	if (teacherIds.length === 1) {
		selectedTeacherId.value = teacherIds[0]
	}
	
	if (gradeId.length > 0) {
		onGradeTap(gradeId)
	}
})

const invitedIds = computed(() => {
	return students.value.map(student => student._id)
})

const orgBrief = (orgName:string) => {
	return orgName.length > 2? orgName.substring(0, 2): orgName
}

const nickNameBrief = () => {
	const nickname = usersStore.owner.nickName
	const length = nickname?.length ?? 0
	return length > 2? nickname?.substring(length - 2, length): nickname
}

const gradeStyle = (gradeId:string) => {
	return selectedGradeId.value === gradeId? '.grade-cell .grade-cell-selected': '.grade-cell'
}

const onGradeTap = (gradeId:string) => {
	if (selectedGradeId.value === gradeId) {
		if (props.gradeId.length === 0) {
			reset()
		}
	} else {
		const res = grades.value.filter(grade => grade._id === gradeId)
		if (res.length === 1) {
			const grade = res[0]
			selectedIconId.value = grade.icon
			gradeName.value = grade.name
			selectedCourseId.value = grade.courseId ?? ''
			selectedTeacherId.value = grade.teacherId ?? ''
			students.value = usersStore.students.filter(student => grade.studentIds?.includes(student._id))
			gradeDesc.value = grade.desc ?? ''
			selectedGradeId.value = gradeId
		}
	}
}

const onLongPressGrade = (gradeId:string) => {
	
}

const onDeleteTap = () => {
	
}

const onTapGradeIcon = () => {
	if (isEditable.value) {
		uni.navigateTo({
			url: "/pages/icon/icon?orgId="+props.org._id
		})
	}
}

const onStudentTap = (studentNo: string) => {
	uni.navigateTo({
		url: "/pages/course-bind/course-bind?studentNo="+studentNo+"&orgIds="+props.org._id
	})
}
	
const onAddTap = () => {
	if (selectedGradeId.value.length === 0) {
		createGrade()
	} else {
		updateGrade()
	}
}

const onAddStudent = async () => {
	if (selectedCourseId.value.length === 0) {
		uni.showToast({
			title: "请选择课程",
			duration: global.duration_toast,
			icon: "none"
		})
		return
	}
	if (selectedTeacherId.value.length === 0) {
		uni.showToast({
			title: "请选择老师",
			duration: global.duration_toast,
			icon: "none"
		})
		return
	}
	let studentNos:string[] = []
	usersStore.entries.filter(entry => {
		if (entry.orgId === props.org._id && 
			entry.courseId === selectedCourseId.value &&
			entry.teacherId === selectedTeacherId.value) {
			if (!studentNos.includes(entry.studentId)) {
				studentNos.push(entry.studentId)
			}
		}
	})
	const studentIds = await usersStore.fetchStudentIdsByNos(studentNos)
	if (studentIds.length === 0) {
		const cItems = courseSelectorData.value.filter(item => item.value === selectedCourseId.value)
		const tItems = teacherSelectorData.value.filter(item => item.value === selectedTeacherId.value)
		if (cItems.length === 1 && tItems.length === 1) {
			const cItem = cItems[0]
			const tItem = tItems[0]
			uni.showToast({
				title: "还没有学员添加"+tItem.text+"老师的"+cItem.text+"课程",
				duration: global.duration_toast,
				icon: "none"
			})
		}
		return
	}
	if (chooseMemberRef.value) {
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			memberIds: studentIds,
			type: "multiple",
			role: "student",
			invitedIds: invitedIds.value
		})
		popup.value?.open()
	}
}

const onRemoveStudent = () => {
	if (invitedIds.value.length === 0) {
		uni.showToast({
			title: "请先添加学员",
			duration: global.duration_toast,
			icon: "none"
		})
		return
	}
	if (chooseMemberRef.value) {
		const instance:InstanceType<typeof wkChooseMemberVue> = chooseMemberRef.value
		instance.initial({
			memberIds: invitedIds.value,
			type: "remove",
			role: "student"
		})
		popup.value?.open()
	}
}

const onConfirm = async (data: {
	type: string,
	memberIds: string[]
}) => {
	popup.value?.close()
	const { type, memberIds } = data
	if (type === 'multiple') {
		const result = usersStore.students.filter(student => memberIds.includes(student._id))
		students.value.push(...result)
	} else if (type === 'remove') {
		const result = students.value.filter(student => !memberIds.includes(student._id))
		students.value = result
	}
	studentsInfoDidUpdated = true
}

const createGrade = async () => {
	const name = gradeName.value.trim()
	const icon = selectedIconId.value
	const desc = gradeDesc.value.trim()
	if (name.length === 0) {
		uni.showToast({
			title: "请设置班级名称",
			duration: global.duration_toast,
			icon: "none"
		})
		return
	}
	uni.showLoading({
		title:"添加中"
	})
	const id = await gradesStore.createGrade({
		name, icon, desc,
		orgId: props.org._id,
		courseId: selectedCourseId.value,
		teacherId: selectedTeacherId.value,
		studentIds: students.value.map(student => student._id)
	})
	const result = typeof(id) !== 'undefined' && id.length > 0
	uni.hideLoading()
	uni.showToast({
		title: result?"添加成功":"添加失败",
		duration: global.duration_toast,
		icon: result?"success":"none"
	})
	if (result) {
		const grade = {
			_id: id,
			name: name,
			desc: desc,
			icon: icon,
			courseId: selectedCourseId.value,
			teacherId: selectedTeacherId.value,
			studentIds: students.value.map(student => student._id),
			createTime: Date.now()
		}
		grades.value.push(grade)
		reset()
		uni.$emit(global.event_name.didCreateGrade, {gradeId:id, orgId:props.org._id})
	}
}

const updateGrade = async () => {
	const res = grades.value.filter(grade => grade._id === selectedGradeId.value)
	if (res.length === 1) {
		const grade = res[0]
		if (grade.icon !== selectedIconId.value ||
			grade.name !== gradeName.value ||
			grade.courseId !== selectedCourseId.value ||
			grade.teacherId !== selectedTeacherId.value ||
			grade.desc !== gradeDesc.value ||
			studentsInfoDidUpdated) {
			uni.showLoading({
				title:"更新中"
			})
			const result = await gradesStore.updateGrade({
				_id: selectedGradeId.value,
				icon: selectedIconId.value,
				name: gradeName.value,
				courseId: selectedCourseId.value,
				teacherId: selectedTeacherId.value,
				studentIds: students.value.map(student => student._id),
				desc: gradeDesc.value
			})
			if (result) {
				grade.icon = selectedIconId.value
				grade.name = gradeName.value
				grade.courseId = selectedCourseId.value
				grade.teacherId = selectedTeacherId.value
				grade.studentIds = students.value.map(student => student._id)
				grade.desc = gradeDesc.value
				studentsInfoDidUpdated = false
				uni.$emit(global.event_name.didUpdatedGradeData, {gradeId:selectedGradeId.value})
			}
			uni.hideLoading()
			uni.showToast({
				title: result?"更新成功":"更新失败",
				duration: global.duration_toast,
				icon: result?"success":"none"
			})
		}
	}
}

const onCourseChange = (courseId:string) => {
	const entries = usersStore.entries.filter(entry => entry.courseId === courseId && entry.orgId === props.org._id)
	const teacherIds = entries.map(entry => entry.teacherId)
	const data = teacherSelectors.filter(item => teacherIds.includes(item.value))
	teacherSelectorData.value = data
	if (selectedTeacherId.value.length > 0 && 
		teacherIds.includes(selectedTeacherId.value)) {
		return
	}
	if (teacherSelectorData.value.length === 1) {
		selectedTeacherId.value = teacherSelectorData.value[0].value
	} else {
		selectedTeacherId.value = ''
	}
}

const onTeacherChange = (teacherId:string) => {
	const entries = usersStore.entries.filter(entry => entry.teacherId === teacherId && entry.orgId === props.org._id)
	const courseIds = entries.map(entry => entry.courseId)
	const data = courseSelectors.filter(item => courseIds.includes(item.value))
	courseSelectorData.value = data
	if (selectedCourseId.value.length > 0 &&
		courseIds.includes(selectedCourseId.value)) {
		return
	}
	if (courseSelectorData.value.length === 1) {
		selectedCourseId.value = courseSelectorData.value[0].value
	} else {
		selectedCourseId.value = ''
	}
}

const reset = () => {
	selectedIconId.value = ".t-icon .t-icon-shetuan"
	longPressGradeId.value = ""
	gradeName.value = ""
	gradeDesc.value = ""
	selectedGradeId.value = ""
	selectedCourseId.value = ""
	selectedTeacherId.value = ""
	students.value = []
}
	
</script>

<style lang="scss" scoped>
.add-grade-card-container {
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 80px;
		background-color: transparent;
		.icon {
			margin-left: $uni-spacing-row-base;
			width: 60px;
			height: 60px;
		}
		.org-name {
			margin-left: $uni-spacing-row-base;
			font-size: $uni-font-size-base;
			color: $wk-text-color;
		}	
	}
	.grade-container {
		display: flex;
		margin: $uni-padding-base;
		.grade-cell {
			position: relative;
			width: 50px;
			height: 60px;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			.icon-minus {
				position: absolute;
				top: -6px;
				left: -2px;
			}
			.grade-name {
				width: 50px;
				height: 20px;
				text-align: center;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
		.grade-cell-selected {
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-lg;
		}
	}
	.edit-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: $wk-bg-color-grey dashed 1px;
		margin: $uni-padding-base;
		.icon {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 40px;
			height: 40px;
			background-color: $wk-bg-color-grey;
			border-radius: $uni-border-radius-circle;
			margin-top: $uni-spacing-col-base;
		}
		.text {
			font-size: $uni-font-size-sm;
			color: $wk-text-color-grey;
			margin-bottom: $uni-spacing-col-base;
		}
		.gradeName {
			width: 100%;
			padding: 0 $uni-padding-base;
			box-sizing: border-box;
			.input {
				height: 35px;
				background-color: $wk-bg-color-grey;
				padding: 0 $uni-padding-normal;
				font-size: $uni-font-size-base;
				border-radius: $uni-border-radius-base;
				caret-color: $wk-theme-color;
				margin-top: $uni-spacing-col-sm;
			}
		}
		.course-selector, .teacher-selector {
			width: 100%;
			background-color: white;
			margin-top: $uni-spacing-col-sm;
			padding-left: $uni-padding-base;
			padding-right: $uni-padding-base;
			box-sizing: border-box;
		}
		.member-container {
			width: 100%;
			background-color: white;
			box-sizing: border-box;
			.content {
				display: flex;
				flex-direction: column;
				border: $wk-bg-color-grey solid 1px;
				border-radius: $uni-border-radius-base;
				margin: $uni-spacing-col-sm $uni-padding-base 0 $uni-padding-base;
				padding: 0 $uni-padding-base;
				.top {
					margin-top: $uni-spacing-col-sm;
					font-size: $uni-font-size-base;
					color: $wk-text-color;
				}
				.body {
					display: flex;
					flex-direction: row;
					flex-flow: row wrap;
					margin-top: $uni-spacing-col-base;
					.addBtn, .minusBtn {
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
						width: 50px;
						height: 60px;
						.add, .minus {
							display: flex;
							justify-content: center;
							align-items: center;
							width: 30px;
							height: 30px;
							background-color: $wk-bg-color-grey;
							color: $uni-text-color-placeholder;
							border-radius: $uni-border-radius-circle;
						}
						.text {
							font-size: $uni-font-size-sm;
							color: $wk-text-color;
							margin: $uni-spacing-col-sm 0;
						}
					}
				}
			}
		}
		.desc {
			position: relative;
			width: 100%;
			padding: $uni-padding-base;
			box-sizing: border-box;
			.textarea {
				width: 100%;
				height: 100px;
				background-color: $wk-bg-color-grey;
				caret-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				box-sizing: border-box;
				padding: $uni-padding-normal;
				border-radius: $uni-border-radius-base;
			}
			.number {
				position: absolute;
				right: $uni-spacing-col-lg;
				bottom: 50px;
				font-size: $uni-font-size-base;
				color: $wk-text-color-grey;
			}
			.btn {
				margin-top: $uni-spacing-col-base;
				background-color: $wk-theme-color;
				font-size: $uni-font-size-base;
				color: white;
				width: 100%;
			}
		}
	}
}
</style>