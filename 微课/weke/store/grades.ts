import { defineStore } from 'pinia'
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
		async addGrade(name:string, icon:string, desc?:string) {
			if (typeof(name) === 'undefined' || name.length === 0 ||
				typeof(icon) === 'undefined' || icon.length === 0) {
				return ''
			}
			const id = await grades_co.addGrade(name, icon, desc)
			if (typeof(id) !== 'undefined' && id.length > 0) {
				const grade: Grade = {
					_id: id, name, icon, desc
				}
				this.grades.push(grade)
				return id
			} else {
				return ''
			}
		}
	}
})