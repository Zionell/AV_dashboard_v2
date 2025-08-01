export const PAGES = {
	dashboard: {
		link: "/dashboard",
		value: "dashboard",
		label: "Главная",
	},
	company: {
		link: "/company",
		value: "company",
		label: "Компания",
	},
	projects: {
		link: "/projects",
		value: "projects",
		label: "Проекты",
	},
	timesheet: {
		link: "/timesheet",
		value: "timesheet",
		label: "Активность",
	},
	todo: {
		link: "/todo",
		value: "todo",
		label: "Список задач",
	},
	materials: {
		link: "/materials",
		value: "materials",
		label: "Материалы",
	},
	settings: {
		link: "/settings/account",
		value: "settings",
		label: "Настройки",
		subLinks: {
			account: {
				link: "/settings/account",
				value: "account",
				label: "Аккаунт",
			},
			password: {
				link: "/settings/password",
				value: "password",
				label: "Пароль",
			},
			theme: {
				link: "/settings/theme",
				value: "theme",
				label: "Настройка темы",
			},
		},
	},
};
