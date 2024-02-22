export type ScheduleNotification = {
	userId:string,
	course:string,
	teacher:string,
	student:string,
	duration:string
}

export type ModifyDateNotification = {
	userId:string,
	course:string,
	student:string,
	originalTime:string,
	newTime:string
}

export type ConsumeNotification = {
	userId:string,
	student:string,
	course:string,
	consume:number,
	surplus:number
}

export type CancelNotification = {
	userId:string,
	orgName:string,
	student:string,
	course:string,
	time:string,
	reason:string
}