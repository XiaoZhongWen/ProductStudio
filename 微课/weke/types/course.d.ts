type CourseTag = {
	date: string,
	info: string,
	infoColor: string
}

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
	presentIds?: string[],
	feedback?: string,
	courseContent?: string,
	assignment?: string,
	consume: number,
	status: number,
	modifyDate: number,
	operatorId: string
}