const format = (date:Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	const dateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	return dateString;
}

const md = (date:Date) => {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return month + "月" + day + "日"
}

const hourDuration = (date:Date) => {
	const hour = date.getHours();
	const s = String(hour).padStart(2, '0');
	const e = String(hour + 1).padStart(2, '0');
	return s + ":00" + "-" + e + ":00"
}

export {
	format,
	md,
	hourDuration
}

