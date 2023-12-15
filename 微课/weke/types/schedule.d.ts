export type Schedule = {
	_id: string,
	date: number,
	orgId: string,
	studentId?: string,
	classId?: string,
	presentIds?: string[],
	courseId: string,
	teacherId: string,
	gradients: string[],
	startTime: string,
	endTime: string,
	startDate: number,
	endDate: number,
	remind?: boolean,
	repeatType?: number,
	repeat?: number[],
	courseContent?: string,
	previewContent?: string,
	feedback?: string,
	assignment?: string,
	consume: number,
	status: number,
	modifyDate?:number,
	operatorId?:string
}