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