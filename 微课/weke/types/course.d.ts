export type Course = {
	_id: string,
	name: string,
	desc?: string,
	icon: string,
	type: number,
	duration: number
}

export type CourseConsumeRecord = {
	_id: string,
	courseId: string,
	teacherId: string,
	studentId: string,
	startTime: number,
	endTime: number,
	classId?: string,
	studentIds?: string[],
	feedback?: string,
	content?: string,
	assignment?: string,
	count: number,
	status: number,
	modifyDate: number,
	operatorId: string
}