export const leadingZero = (num: number): number | string => {
	return num < 10 ? `0${num}` : num;
};
