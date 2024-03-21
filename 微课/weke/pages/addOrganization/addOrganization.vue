<template>
	<view class="add-org-container">
		<!-- <view class="card-container">
			<org-card :org="org"></org-card>
		</view> -->
		<view class="org-edit-container">
			<view class="header">
				<upload-image :url="org.logoUrl" :editable="isCreator" prompt="图标" @onChooseAvatar="onChooseAvatar"></upload-image>
			</view>
			<view class="body">
				<uni-list>
					<!-- <uni-list-item class="item">
						<template v-slot:header>
							<view class="decoration">
								<text class="text">外观</text>
								<color-card :disabled="!isCreator" @onColorChanged="onColorChanged"></color-card>
							</view>
						</template>
					</uni-list-item> -->
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">机构名称</text>
								<input
									v-model="org.name"
									:disabled="!isCreator"
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="10"
									placeholder="请输入名称" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">地址</text>
								<input 
									v-model="org.addr"
									:disabled="!isCreator"
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="20"
									placeholder="请输入地址" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">简介</text>
								<input
									v-model="org.desc"
									:disabled="!isCreator"
									class="input" 
									placeholder-style="color: #808080" 
									type="text"
									maxlength="30"
									placeholder="请输入简介" />
							</view>
						</template>
					</uni-list-item>
					<uni-list-item class="item">
						<template v-slot:header>
							<view class="slot-box">
								<text class="slot-text">创建日期</text>
								<picker 
									class="picker" 
									mode="date"
									:disabled="!isCreator"
									:value="org.createDate" 
									@change="onDateChanged">
									<view class="uni-input">{{didSelectedDate?org.createDate:"创建日期"}}</view>
								</picker>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</view>
		<view class="org-member-container" v-if="orgId.length > 0">
			<uni-list>
				<uni-list-item class="item" direction="column">
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">老师</text>
							<uni-icons
								@tap.stop="onAddTeacher"
								v-if="isCreator" 
								class="right-arrow" 
								type="plus-filled" 
								color="#5073D6" 
								size="24">
							</uni-icons>
						</view>
					</template>
					<template v-slot:body>
						<uni-grid :column="5" :show-border="false" :square="false" @change="onTapTeacherItem">
							<uni-grid-item v-for="(teacher, index) in teachers" :index="index" :key="index">
								<wk-portrait
									class="cell"
									:url="teacher.avatarUrl"
									:name="teacher.nickName"
								></wk-portrait>
							</uni-grid-item>
						</uni-grid>
					</template>
				</uni-list-item>
				<uni-list-item class="item" direction="column">
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">学员</text>
							<uni-icons 
								@tap.stop="onAddStudent"
								v-if="isCreator" 
								class="right-arrow" 
								type="plus-filled" 
								color="#5073D6" 
								size="24">
							</uni-icons>
						</view>
					</template>
					<template v-slot:body>
						<uni-grid :column="5" :show-border="false" :square="false" @change="onTapStudentItem">
							<uni-grid-item v-for="(student, index) in students" :index="index" :key="index">
								<view class="grid-item-box">
									<wk-portrait
										class="cell"
										:url="student.avatarUrl"
										:name="student.nickName"
									></wk-portrait>
								</view>
							</uni-grid-item>
						</uni-grid>
					</template>
				</uni-list-item>
				<uni-list-item class="item" direction="column">
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">课程</text>
							<uni-icons 
								@tap.stop="onAddCourse"
								v-if="isCreator" 
								class="right-arrow" 
								type="plus-filled" 
								color="#5073D6" 
								size="24">
							</uni-icons>
						</view>
					</template>
					<template v-slot:body>
						<uni-grid :column="5" :show-border="false" :square="false">
							<uni-grid-item v-for="(course, index) in courses" :index="index" :key="index">
								<view class="grid-item-box">
									<view class="cell">
										<view :class="course.icon"></view>
										<text class="sub-name">{{course.name}}</text>
									</view>
								</view>
							</uni-grid-item>
						</uni-grid>
					</template>
				</uni-list-item>
				<uni-list-item class="item" direction="column">
					<template v-slot:header>
						<view class="slot-box">
							<text class="slot-text">班级</text>
							<uni-icons 
								@tap.stop="onAddClass"
								v-if="isCreator" 
								class="right-arrow" 
								type="plus-filled" 
								color="#5073D6" 
								size="24">
							</uni-icons>
						</view>
					</template>
					<template v-slot:body>
						<uni-grid :column="5" :show-border="false" :square="false" @change="onTapGradeItem">
							<uni-grid-item v-for="(grade, index) in classes" :index="index" :key="index">
								<view class="grid-item-box">
									<view class="cell">
										<view :class="grade.icon"></view>
										<text class="sub-name">{{grade.name}}</text>
									</view>
								</view>
							</uni-grid-item>
						</uni-grid>
					</template>
				</uni-list-item>
			</uni-list>
		</view>
		<button 
			v-if="isCreator && !usersStore.isExpired"
			class="btn" 
			type="default" 
			@tap="onTapAdd">
			{{orgId.length === 0? "添加": "更新"}}
		</button>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Org } from '@/types/org'
import { useOrgsStore } from '@/store/orgs'
import { useUsersStore } from "@/store/users"
import { useCourseStore } from "@/store/course"
import { useGradesStore } from "@/store/grades"
import { User, Student } from '../../types/user'
import { Course } from '../../types/course'
import { Grade } from '../../types/grade'

const useOrgs = useOrgsStore()
const usersStore = useUsersStore()
const useCourses = useCourseStore()
const useGrades = useGradesStore()
const global = getApp().globalData!

let didSelectedDate = false
const isCreator = ref(true)
const date = new Date(Date.now())
const month = date.getMonth() + 1
const createDate = date.getFullYear() + "-" + month + "-" + date.getDate()

const orgId = ref("")
const org = ref<Org>({
				_id: '',
				name: '',
				nickname: usersStore.owner.nickName,
				tel: usersStore.owner.mobile ?? '',
				addr: '',
				desc: '',
				logoUrl: '',
				createDate: createDate,
				gradient: ["#4e54c8", "#8f94fb"],
				creatorId: usersStore.owner._id,
				teacherIds: [],
				studentIds: [],
				courseIds: [],
				classIds: [],
				type: 0
			})

const teachers = ref<User[]>([])
const students = ref<Student[]>([])
const courses = ref<Course[]>([])
const classes = ref<Grade[]>([])

//@ts-ignore
onLoad(async (option) => {
	let title = "创建机构"
	const id = option!.orgId
	if (typeof(id) !== 'undefined') {
		orgId.value = id
		didSelectedDate = true
		const data:Org = useOrgs.fetchOrgById(id)
		const { 
				_id, 
				name, 
				tel, 
				addr, 
				desc, 
				logoId, 
				logoUrl, 
				createDate, 
				gradient, 
				creatorId,
				teacherIds,
				studentIds,
				courseIds,
				classIds
		} = data
		org.value._id = _id
		org.value.name = name
		org.value.tel = tel ?? ''
		org.value.addr = addr ?? ''
		org.value.desc = desc ?? ''
		org.value.logoUrl = logoUrl ?? ''
		org.value.logoId = logoId ?? ''
		org.value.createDate = createDate
		org.value.gradient = gradient
		org.value.creatorId = creatorId
		org.value.teacherIds = teacherIds ?? []
		org.value.studentIds = studentIds ?? []
		org.value.courseIds = courseIds ?? []
		org.value.classIds = classIds ?? []
		isCreator.value = creatorId === usersStore.owner._id
		title = isCreator.value === true? "更新机构": "机构详情"
		if (!isCreator.value && org.value.logoUrl.length === 0) {
			org.value.logoUrl = "/static/icon/org.png"
		}
		uni.setNavigationBarTitle({
			title:title
		})
		uni.showLoading({
			title: "正在加载"
		})
		const tIds = [org.value.creatorId]
		tIds.push(...org.value.teacherIds)
		teachers.value = await usersStore.fetchUsers(tIds) as User[]
		if (org.value.studentIds.length > 0) {
			students.value = await usersStore.fetchStudentsByIds(org.value.studentIds) as Student[]
		}
		if (org.value.courseIds.length > 0) {
			courses.value = await useCourses.fetchCourses(org.value.courseIds) as Course[]
		}
		if (org.value.classIds.length > 0) {
			classes.value = await useGrades.fetchGrades(org.value.classIds) as Grade[]
		}
		uni.hideLoading()
	}
	uni.$emit(global.event_name.onGradientChanged, {gradient:org.value.gradient})
})

const onChooseAvatar = (data:{url: string}) => {
	const url = data.url ?? ""
	org.value.logoUrl = url
}

const onColorChanged = (data:{gradient: string[]}) => {
	const gradient = data.gradient
	org.value.gradient = gradient
}

// @ts-ignore
const onDateChanged = (e) => {
	didSelectedDate = true
	org.value.createDate = e.detail.value
}

const onTapAdd = async () => {
	// 1. 验证机构名称
	if (org.value.name.length === 0) {
		uni.showToast({
			title: "请填写机构名称",
			duration: global.duration_toast,
			icon:"none"
		})
		return
	}
	// 2. 验证机构创建者
	if (org.value.creatorId !== usersStore.owner._id) {
		uni.showToast({
			title: "权限错误",
			duration: global.duration_toast,
			icon:"none"
		})
		return
	}
	
	if (org.value.desc?.length === 0) {
		org.value.desc = "简介"
	}
	
	if (org.value.addr?.length === 0) {
		org.value.addr = "地址"
	}
	
	// 3. 上传图标
	const logoUrl = org.value.logoUrl ?? ""
	if (logoUrl.length > 0) {
		const fileId:string = await useOrgs.uploadIcon(org.value._id, logoUrl) ?? ""
		if (fileId.length === 0) {
			uni.showToast({
				title:"机构图标上传失败",
				duration:global.duration_toast,
				icon:"none"
			})
			return
		} else {
			org.value.logoId = fileId
		}
	}
	
	// 4. 创建|更新机构
	uni.showLoading({
		title: orgId.value.length === 0? "创建中...": "更新中..."
	})
	const result:boolean = await useOrgs.createOrg(org.value)
	uni.hideLoading()
	if (result) {
		uni.showToast({
			title: orgId.value.length === 0? "机构创建成功": "机构更新成功",
			duration:global.duration_toast,
			icon: "success"
		})
		uni.navigateBack()
		uni.$emit(global.event_name.didUpdateOrgData)
	} else {
		uni.showToast({
			title: orgId.value.length === 0? "机构创建失败": "机构更新失败",
			duration:global.duration_toast,
			icon:"none"
		})
	}
}

const onTapTeacherItem = (e:{"detail":{"index":number}}) => {
	const { index } = e.detail
	if (typeof(index) !== 'undefined') {
		uni.navigateTo({
			url: "/pages/member-course/member-course?id=" + teachers.value[index]._id
		})
	}
}

const onTapStudentItem = (e:{"detail":{"index":number}}) => {
	const { index } = e.detail
	if (typeof(index) !== 'undefined') {
		const s = students.value[index]
		uni.navigateTo({
			url: "/pages/course-bind/course-bind?studentNo="+s.studentNo+"&orgIds="+orgId.value
		})
	}
}

const onTapGradeItem = (e:{"detail":{"index":number}}) => {
	const { index } = e.detail
	if (typeof(index) !== 'undefined') {
		const c = classes.value[index]
		uni.navigateTo({
			url: "/pages/addGrade/addGrade?gradeId="+c._id
		})
	}
}

const onAddTeacher = () => {
	uni.navigateTo({
		url: "/pages/addTeacher/addTeacher?orgId=" + orgId.value
	})
}

const onAddStudent = () => {
	uni.navigateTo({
		url: "/pages/addStudent/addStudent?orgId=" + orgId.value
	})
}

const onAddCourse = () => {
	uni.navigateTo({
		url: '/pages/addCourse/addCourse?orgId=' + orgId.value
	})
}

const onAddClass = () => {
	uni.navigateTo({
		url: '/pages/addGrade/addGrade?orgId=' + orgId.value
	})
}
	
</script>

<style lang="scss">
.add-org-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	.card-container {
		width: 90%;
		height: 200px;
		border-style: dashed;
		border-color: $wk-text-color-grey;
		border-width: 1px;
		border-radius: $uni-border-radius-lg;
		padding: $uni-padding-base;
		box-sizing: border-box;
	}
	.org-edit-container {
		display: flex;
		flex-direction: column;
		width: 90%;
		background-color: white;
		margin-top: $uni-spacing-col-base;
		padding-bottom: $uni-padding-base;
		border-radius: $uni-border-radius-lg;
		.header {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100px;
			background-color: white;
			border-radius: $uni-border-radius-lg $uni-border-radius-lg 0 0;
		}
		.body {
			width: 100%;
			border-top: $uni-spacing-col-sm solid $wk-bg-color-grey;
			.uni-list {
				border-radius: $uni-border-radius-lg;
				background-color: white;
				.uni-list--border-top, .uni-list--border-bottom {
					height: 0px;
				}
				.uni-list-item {
					border-radius: $uni-border-radius-lg;
					.uni-list-item__content {
						padding: 0;
					}
				}
			}
			.item {
				.decoration {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					height: 100%;
					.text {
						font-size: $uni-font-size-base;
						color: $wk-text-color;
						font-weight: 400;
					}
				}
				.slot-box {
					position: relative;
					flex-direction: row;
					align-items: center;
					width: 100%;
					.slot-text {
						font-size: $uni-font-size-base;
						color: $wk-text-color;
						font-weight: 400;
					}
					.input {
						position: absolute;
						display: inline-block;
						right: 0;
						text-align: right;
						font-size: $uni-font-size-base;
						caret-color: $wk-theme-color;
						width: 70%;
					}
					.picker {
						position: absolute;
						display: inline-block;
						right: 0;
						font-size: $uni-font-size-base;
						color: $uni-text-color-placeholder;
					}
				}
			}
		}
	}
	.org-member-container {
		display: flex;
		flex-direction: column;
		width: 90%;
		margin-top: $uni-spacing-col-base;
		.uni-list {
			border-radius: $uni-border-radius-lg;
			background-color: white;
			.uni-list--border-top, .uni-list--border-bottom {
				height: 0px;
			}
			.uni-list-item {
				border-radius: $uni-border-radius-lg;
				.uni-list-item__content {
					padding: 0;
				}
			}
		}
		.item {
			.slot-box {
				position: relative;
				flex-direction: row;
				align-items: center;
				width: 100%;
				.slot-text {
					font-size: $uni-font-size-base;
					color: $wk-text-color;
					font-weight: 400;
				}
				.right-arrow {
					position: absolute;
					right: -4px;
					bottom: -2px;
				}
			}
			.cell {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
			.sub-name {
				font-size: $uni-font-size-sm;
				color: $wk-text-color-grey;
				text-align: center;
			}
		}
	}
	.btn {
		margin: 20px 0 40px 0;
		background-color: $wk-theme-color;
		font-size: $uni-font-size-base;
		color: white;
		width: 90%;
	}
}
</style>
