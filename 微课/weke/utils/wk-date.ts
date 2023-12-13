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

const yyyyMMdd = (date:Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
	const day = String(date.getDate()).padStart(2, '0');
	return year + "-" + month + "-" + day
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

const daysBetweenDates = (from: Date, to: Date) => {
	from.setHours(0, 0, 0, 0)
	to.setHours(0, 0, 0, 0)
	const timeDifference = to.getTime() - from.getTime()
	const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
	return daysDifference
}

const timestampForBeginOfMonth = (date: Date) => {
	const year = date.getFullYear()
	const month = date.getMonth()
	const newDate = new Date(year, month, 1)
	newDate.setHours(0, 0, 0, 0)
	return newDate.getTime()
}

const timestampForEndOfMonth = (date: Date) => {
	const year = date.getFullYear()
	const month = date.getMonth()
	const newDate = new Date(year, month + 1, 0)
	newDate.setHours(23, 59, 59, 999)
	return newDate.getTime()
}

export {
	format,
	yyyyMMdd,
	md,
	hourDuration,
	daysBetweenDates,
	timestampForBeginOfMonth,
	timestampForEndOfMonth
}

