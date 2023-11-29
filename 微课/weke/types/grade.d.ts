export type Grade = {
	_id: string,
	name: string,
	desc?: string,
	icon: string,
	orgId: string,
	teacherId?: string,
	courseId?: string,
	studentIds?: string[],
	createTime: number
}