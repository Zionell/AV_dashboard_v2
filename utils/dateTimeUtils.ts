import { leadingZero } from '~/utils/numberUtils';

type TimeParamsKey =
	| '$d'
	| '$j'
	| '$D'
	| '$l'
	| '$m'
	| '$n'
	| '$M'
	| '$b'
	| '$F'
	| '$E'
	| '$e'
	| '$y'
	| '$g'
	| '$G'
	| '$h'
	| '$H'
	| '$i'
	| '$I'
	| '$s'
	| '$S'
	| '$w';

export const dayByIndex = (index: number, short?: boolean): string => {
	const fullList: string[] = [
		'Понедельник',
		'Вторник',
		'Среда',
		'Четверг',
		'Пятница',
		'Суббота',
		'Воскресение',
	];

	const shortList: string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

	return short ? shortList[index] : fullList[index];
};

export const monthByIndex = (
	index: number,
	short?: boolean,
	plural?: boolean,
): string => {
	const fullList: string[] = [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь',
	];

	const pluralList: string[] = [
		'Января',
		'Февраля',
		'Марта',
		'Апреля',
		'Мая',
		'Июня',
		'Июля',
		'Августа',
		'Сентября',
		'Октября',
		'Ноября',
		'Декабря',
	];

	const shortList: string[] = [
		'Янв',
		'Фев',
		'Мар',
		'Апр',
		'Май',
		'Июн',
		'Июл',
		'Авг',
		'Сен',
		'Окт',
		'Ноя',
		'Дек',
	];

	if (short) {
		return shortList[index];
	}

	return plural ? pluralList[index] : fullList[index];
};

export const isValidDate = (date: string) => !isNaN(Date.parse(date));
// export const isDateObject = date => date instanceof Date;
// export const toDateObject = date => isDateObject(date) ? date : new Date(date);

export const formatDateTime = (date: string, pattern: string): string => {
	if (!date) {
		return '';
	}

	const d: Date = isValidDate(date) ? new Date(date) : new Date();

	const symbols: TimeParamsKey[] = pattern.match(
		/[$][a-zA-Z]/gm,
	) as TimeParamsKey[];
	let result: string = pattern;

	symbols?.forEach((s: TimeParamsKey): void => {
		const replaceTo: string = getTimeSymbol(d, s).toString();
		result = result.replace(s, replaceTo);
	});

	return result.toString();
};

function getTimeSymbol(d: Date, key: TimeParamsKey): string | number {
	const params: Record<TimeParamsKey, string | number> = {
		// Date
		$d: leadingZero(d.getDate()), // Day of the month, 2 digits with leading zeros. // '01' to '31'
		$j: d.getDate(), // Day of the month without leading zeros. // '1' to '31'

		// Days of the week
		$D: dayByIndex(d.getDay(), true), // Day of the week, textual, 3 letters. // 'Пн', 'Вт'
		$w: dayByIndex(d.getDay(), true).toLowerCase(), // Day of the week, textual, 3 letters. // 'Пн', 'Вт'
		$l: dayByIndex(d.getDay()), // Day of the week, textual, long. // 'Пятница'

		// Month
		$m: leadingZero(d.getMonth() + 1), // Month, 2 digits with leading zeros. // '01' to '12'
		$n: d.getMonth() + 1, // Month without leading zeros. // '1' to '12'
		$M: monthByIndex(d.getMonth(), true), // Month, textual, 3 letters. // 'Янв'
		$b: monthByIndex(d.getMonth(), true).toLowerCase(), // Month, textual, 3 letters, lowercase. // 'янв'
		$F: monthByIndex(d.getMonth()), // Month, textual, long. // 'Январь'
		$E: monthByIndex(d.getMonth(), false, true), // Month, plural, long. // 'Января'
		$e: monthByIndex(d.getMonth(), false, true).toLowerCase(), // Month, plural, long, lowercase // 'января'

		// Year
		$y: d.getFullYear(), // Year, 4 digits. // 1993

		// Time
		// Hours
		$g: Math.floor(d.getHours() / 2), // Hour, 12-hour format without leading zeros. // '1' to '12'
		$G: d.getHours(), // Hour, 24-hour format without leading zeros. // '0' to '23'
		$h: leadingZero(Math.floor(d.getHours() / 2)), // Hour, 12-hour format. // '01' to '12'
		$H: leadingZero(d.getHours()), // Hour, 24-hour format. // '01' to '23'

		// Minutes
		$i: d.getMinutes(), // Minutes, without leading zeros. // '1' to '59'
		$I: leadingZero(d.getMinutes()), // Minutes. // '01' to '59'

		// Seconds
		$s: d.getSeconds(), // Seconds, without leading zeros. // '1' to '59'
		$S: leadingZero(d.getSeconds()), // Seconds. // '01' to '59'
	};

	return params[key];
}

export function isPassed(date: Date): boolean {
	let today = new Date();
	today = new Date(
        `${today.getMonth() + 1}.${today.getDate()}.${today.getFullYear()}`,
	);
	return date.getTime() < today.getTime();
}

export const daysInMonth = (month: number, year: number): number => {
	return new Date(year, month, 0).getDate();
};

export const daysArrayByCurMonth = (curMonth: number): string[] => {
	const labels: string[] = [];
	const date: Date = new Date();
	const year: number = date.getFullYear();
	const daysCount: number = daysInMonth(curMonth, year);

	for (let i: number = 1; i <= daysCount; i++) {
		labels.push(`${leadingZero(i)}.${leadingZero(curMonth)}.${year}`);
	}

	return labels;
};

export const msToTime = (duration: number) => {
	const s = Math.floor((duration / 1000) % 60);
	const m = Math.floor((duration / (1000 * 60)) % 60);
	const h = Math.floor((duration / (1000 * 60 * 60)) % 24);

	return {
		h,
		m,
		s,
	};
};
