import { defineStore } from 'pinia';

export const useDomainStore = defineStore('domain', {
	state: () => ({
		domainUrl: null as null | string, // определяется автоматически, не менять
		protocol: 'https',
	}),
	getters: {
		getDomainAddress: state => `${state.protocol}://${state.domainUrl}`,
	},
	actions: {
		async init(headers: { [key: string]: any }) {
			if (headers['x-forwarded-host']) {
				this.changeActiveDomain(headers['x-forwarded-host']);
			}
			else if (process.env.PROXY_URL) {
				const regex = /^(\w+):\/\/(?:www.)?([^/]+)/g;
				const array = [...process.env.PROXY_URL.matchAll(regex)];
				const found = array.reduce(
					(acc: any, current: any) => [
						...acc,
						current[1],
						current[2],
					],
					[],
				);
				const protocol = found[0];
				const domain = found[1];

				if (protocol) {
					this.changeActiveProtocol(protocol);
				}

				if (domain) {
					this.changeActiveDomain(domain);
				}
			}
			else {
				console.warn(
					'[store domain/actions/init Error] domain address is not set',
				);
			}
		},

		changeActiveDomain(payload: string): void {
			this.domainUrl = payload;
		},

		changeActiveProtocol(payload: string): void {
			this.protocol = payload;
		},
	},
});
