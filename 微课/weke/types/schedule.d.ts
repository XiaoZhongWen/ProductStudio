export type Schedule = {
	_id: string,
	date: number,
	orgId: string,
	studentId: string,
	classId: string,
	presentIds: string[],
	courseId: string,
	teacherId: string,
	gradients: string[],
	startTime: number,
	endTime: number,
	remind: boolean,
	repeatType: number,
	repeat: number[],
	courseContent: string,
	previewContent: string
}