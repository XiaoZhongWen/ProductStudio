enum RoleId {
	Org = 1,
	Teacher = 2,
	Student = 3,
	Parents = 4
}

export type Role = {
	id: number,
	name: string,
	checked: boolean
}

export type User = {
	_id: string,
	nickName?: string,
	avatarId?: string,
	avatarUrl?: string,
	birthday?: number,
	roles?: RoleId[],
	mobile?: string,
	orgIds?: string[],
	familyExpireDate: number,
	orgExpireDate: number,
	inputCount: number,
	status?: number,
	parentIds?: string[],
	signature?: string
}

export type WxIdentity = {
	unionid?: string,
	openid: string,
	session_key: string,
	nickName?: string,
	tempFileUrl?: string,
	isLogin: boolean
}