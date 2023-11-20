import { defineStore } from 'pinia'
import { useOrgsStore } from "@/store/orgs"
import { Grade } from '../types/grade'

const grades_co = uniCloud.importObject('grades', {
	customUI: true
})

export const useGradesStore = defineStore('grades', {
	state: () => {
		return {
			grades:[] as Grade[]
		}
	},
	actions: {
		async fetchGrades(gIds:string[]) {
			if (typeof(gIds) === 'undefined' || gIds.length === 0) {
				return []
			}
			const g1 = this.grades.filter(grade => gIds.includes(grade._id))
			const ids1 = g1.map(grade => grade._id)
			const ids2 = gIds.filter(id => !ids1.includes(id))
			let other = [] as Grade[]
			if (ids2.length > 0) {
				other = await grades_co.fetchGrades(ids2) as Grade[]
				this.grades.push(...other)
			}
			return [...g1, ...other]
		},
		// 添加学生、老师、课程信息
		async createGrade(param: {
			name:string,
			icon:string,
			desc?:string,
			orgId: string,
			courseId?:string,
			teacherId?:string,
			studentIds?:string[]
		}) {
			const { name, icon, desc, orgId, courseId, teacherId, studentIds } = param
			if (typeof(name) === 'undefined' || name.length === 0 ||
				typeof(icon) === 'undefined' || icon.length === 0 ||
				typeof(orgId) === 'undefined' || orgId.length === 0) {
				return ''
			}
			const id = await grades_co.createGrade(param)
			if (typeof(id) !== 'undefined' && id.length > 0) {
				const grade: Grade = {
					_id: id, name, icon, desc, courseId, teacherId, studentIds,
					createTime: Date.now()
				}
				this.grades.push(grade)
				
				const orgsStore = useOrgsStore()
				let res = orgsStore.orgs.filter(org => org._id === orgId)
				if (res.length === 0 && orgsStore.anonymousOrg._id === orgId) {
					res = [orgsStore.anonymousOrg]
				}
				if (res.length > 0) {
					const org = res[0]
					if (!org.classIds?.includes(id)) {
						org.classIds?.push(id)
					}
				}
				return id
			} else {
				return ''
			}
		},
		async updateGrade(param:{
			_id:string,
			name:string,
			icon:string,
			desc?:string,
			courseId?:string,
			teacherId?:string,
			studentIds?:string[]
		}) {
			const { _id, name, icon, desc, courseId, teacherId, studentIds } = param
			if (typeof(_id) === 'undefined' || _id.length === 0 ||
				typeof(name) === 'undefined' || name.length === 0 ||
				typeof(icon) === 'undefined' || icon.length === 0) {
				return false
			}
			const result = await grades_co.updateGrade(param)
			if (result) {
				const res = this.grades.filter(grade => grade._id === _id)
				if (res.length === 1) {
					const grade = res[0]
					grade.name = name
					grade.icon = icon
					grade.desc = desc
					grade.courseId = courseId
					grade.teacherId = teacherId
					grade.studentIds = studentIds
				}
			}
			return result
		}
	}
})