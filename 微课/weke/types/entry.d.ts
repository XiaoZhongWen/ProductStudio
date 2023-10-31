export type Entry = {
	_id: string,
	orgId: string,
	teacherId: string,
	studentId: string,
	courseId: string,
	total: number,
	consume: number,
	info: {status: number, date:number, operator:string}
}