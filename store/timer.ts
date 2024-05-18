import { defineStore } from 'pinia';

export const useTimerStore = defineStore('timer', {
	state: () => ({
		isStarted: false as boolean,
	}),

	getters: {
		getIsStarted: state => state.isStarted,
	},

	actions: {
		setIsStarted(payload: boolean) {
			this.isStarted = payload;
		},
	},
});
