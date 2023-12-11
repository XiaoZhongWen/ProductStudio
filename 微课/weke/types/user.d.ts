export enum RoleId {
	Org = 1,
	Teacher = 2,
	Parents = 3
}

export type User = {
	_id: string,
	nickName: string,
	avatarId: string,
	avatarUrl?: string,
	roles?: RoleId[],
	mobile?: string,
	expireDate: number,
	signature?: string,
}

export type Student = {
	_id: string,
	studentNo: string,
	pwd: string,
	nickName: string,
	avatarId: string,
	avatarUrl?: string,
	mobile?: string,
	signature?: string,
	associateIds?: string[]
	identity: string,
}

export type WxIdentity = {
	unionid?: string,
	openid: string,
	session_key: string,
	nickName?: string,
	tempFileUrl?: string
}
