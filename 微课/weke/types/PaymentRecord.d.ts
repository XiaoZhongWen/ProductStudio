export type PaymentRecord = {
	_id: string,
	orgId: string,
	studentId: string,
	date: number,
	courseId: string,
	count: number,
	price: number
	status: number,
	operatorId: string,
	modifyDate: number,
	remark?: string,
	isFrozen?: boolean
}