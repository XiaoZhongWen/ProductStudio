export type Org = {
	_id: string,
	name: string,
	nickname?: string,
	tel?: string,
	addr?: string,
	desc?: string,
	logoId?: string,
	logoUrl?: string,
	createDate: string,
	gradient: string[],
	creatorId: string,
	teacherIds?: string[],
	studentIds?: string[],
	courseIds?: string[],
	classIds?: string[]
}