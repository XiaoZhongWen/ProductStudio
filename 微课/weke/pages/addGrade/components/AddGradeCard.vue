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
				<input class="input" type="text" v-model="gradeName" placeholder="班级名称" />
			</view>
			<view class="course-selector">
				<uni-data-select
					@change="onChange"
					class="selector"
					:clear="false"
					v-model="selectedCourseId"
					:localdata="courseSelectorData"
					placeholder="选择课程">
				</uni-data-select>
			</view>
			<view class="teacher-selector">
				<uni-data-select
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
								:url="student.avatarUrl" 
								:name="student.nickName">
							</wk-portrait>
						</template>
						<view class="addBtn" @tap="onAddStudent">
							<view class=".iconfont .icon-add .add"></view>
							<text class="text">邀请</text>
						</view>
						<view class="minusBtn" @tap="onRemoveStudent">
							<view class=".iconfont .icon-reduce .minus"></view>
							<text class="text">移除</text>
						</view>
					</view>
				</view>
			</view>
			<view class="desc">
				<textarea 
					class="textarea" 
					placeholder="班级描述" 
					v-model="gradeDesc" 
					maxlength="100" 
				/>
				<text class="number">{{number}}</text>
				<button
					@tap="onAddTap"
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
			:memberIds="props.org.studentIds"
			:invitedIds="invitedIds"
			:type="selectType"
			role="student"
			@onConfirm="onConfirm">
		</wk-choose-member>
	</uni-popup>
	
</template>

<script setup lang="ts">
import { useUsersStore } from "@/store/users"
import { useGradesStore } from "@/store/grades"
import { useOrgsStore } from '@/store/orgs'
import { useCourseStore } from "@/store/course"
import { computed, onMounted, ref } from 'vue';
import { Grade } from "../../../types/grade";
import { Org } from "../../../types/org";
import { Student, User } from "../../../types/user";

const global = getApp().globalData!
const usersStore = useUsersStore()	
const gradesStore = useGradesStore()
const useOrgs = useOrgsStore()
const courseStore = useCourseStore()

const props = defineProps(['org'])

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

const students = ref<Student[]>([])

const selectType = ref('')

const popup = ref<{
	open: (type?: UniHelper.UniPopupType) => void
	close: () => void
}>()

const number = computed(() => {
	return 100 - gradeDesc.value.length
})

onMounted(async () => {
	const org:Org = props.org
	grades.value = await gradesStore.fetchGrades(org.classIds ?? [])
	
	const courses = await courseStore.fetchCourses(org.courseIds ?? [])
	courses.forEach(course => {
		const index = courseSelectorData.value.findIndex(item => item.value === course._id)
		if (index === -1) {
			courseSelectorData.value.push({
				value: course._id,
				text: course.name
			})
		}
	})
	
	const id = usersStore.owner._id
	const teacherIds = org.teacherIds ?? []
	if (!teacherIds.includes(id)) {
		teacherIds.push(id)
	}
	const teachers = await usersStore.fetchUsers(teacherIds) as User[]
	teachers.forEach(teacher => {
		teacherSelectorData.value.push({
			value: teacher._id,
			text: teacher.nickName
		})
	})
	if (teacherIds.length === 1) {
		selectedTeacherId.value = teacherIds[0]
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
	
}

const onLongPressGrade = (gradeId:string) => {
	
}

const onDeleteTap = () => {
	
}

const onTapGradeIcon = () => {
	uni.navigateTo({
		url: "/pages/icon/icon?orgId="+props.org._id
	})
}
	
const onAddTap = () => {
	if (selectedGradeId.value.length === 0) {
		createGrade()
	} else {
		updateGrade()
	}
}

const onAddStudent = () => {
	selectType.value = 'multiple'
	popup.value?.open()
}

const onRemoveStudent = () => {
	selectType.value = 'remove'
	popup.value?.open()
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
		// const result = await gradesStore.addStudents(selectedGradeId.value, memberIds)
		// uni.showToast({
		// 	title: result?"添加成功":"添加失败",
		// 	duration: global.duration_toast,
		// 	icon: result?"success":"error"
		// })
		// const res = grades.value.filter(grade => grade._id === selectedGradeId.value)
		// if (res.length === 1) {
		// 	const grade = res[0]
		// 	students.value = usersStore.students.filter(student => grade.studentIds?.includes(student._id))
		// }
	}
}

const createGrade = async () => {
	const name = gradeName.value.trim()
	const icon = selectedIconId.value
	const desc = gradeDesc.value.trim()
	if (name.length === 0) {
		uni.showToast({
			title: "请设置班级名称",
			duration: global.duration_toast,
			icon: "error"
		})
		return
	}
	uni.showLoading({
		title:"添加中"
	})
	const id = await gradesStore.addGrade(name, icon, desc)
	let result = false
	if (typeof(id) !== 'undefined' && id.length > 0) {
		result = await useOrgs.addGrade(props.org._id, id)
	}
	uni.hideLoading()
	uni.showToast({
		title: result?"添加成功":"添加失败",
		duration: global.duration_toast,
		icon: result?"success":"error"
	})
	if (result) {
		const grade = {
			_id: id,
			name: name,
			desc: desc,
			icon: icon
		}
		grades.value.push(grade)
		reset()
	}
}

const updateGrade = async () => {
	
}

const onChange = (e:string) => {
	
}

uni.$on(global.event_name.didSelectedIcon, (data:{iconId:string, orgId:string}) => {
	const { iconId, orgId } = data
	if (typeof(iconId) !== 'undefined' && iconId.length > 0 &&
		typeof(orgId) !== 'undefined' && orgId.length > 0 &&
		orgId === props.org._id) {
		selectedIconId.value = iconId
	}
})

const reset = () => {
	selectedIconId.value = ".t-icon .t-icon-shetuan"
	longPressGradeId.value = ""
	gradeName.value = ""
	gradeDesc.value = ""
	selectedGradeId.value = ""
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
					margin-top: $uni-spacing-col-base;
					.addBtn, .minusBtn {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-right: 30px;
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