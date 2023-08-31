enum Role {
	Org = 1,
	Teacher = 2,
	Student = 3,
	Parents = 4
}

export type User = {
	_id: string,
	nickName?: string,
	avatarUrl?: string,
	birthday?: number,
	roles?: Role[],
	mobile?: string,
	orgIds?: string[],
	expireDate: number,
	inputCount: number,
	status?: number,
	parentIds?: string[],
	signature?: string
}

export type WxIdentity = {
	unionid: string,
	openid: string
}