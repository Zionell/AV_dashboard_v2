import { defineStore } from 'pinia';

export const useMenuStore = defineStore('menu', {
	state: () => ({
		mainMenu: [
			{
				link: '/',
				label: 'Главная',
				value: 'home',
				name: 'index',
			},
			{
				link: '/company',
				label: 'Компания',
				value: 'company',
				name: 'company',
			},
			{
				link: '/projects',
				label: 'Проекты',
				value: 'projects',
				name: 'projects',
			},
			{
				link: '/timesheet',
				label: 'Активность',
				value: 'timesheet',
				name: 'timesheet',
			},
			{
				link: '/todo',
				label: 'Список задач',
				value: 'todo',
				name: 'todo',
			},
			{
				link: '/materials',
				label: 'Материалы',
				value: 'materials',
				name: 'materials',
			},
			{
				link: '/settings/account',
				label: 'Настройки',
				value: 'settings',
				name: 'settings',
			},
		],
		settingsMenu: [
			{
				link: '/settings/account',
				label: 'Аккаунт',
			},
			{
				link: '/settings/password',
				label: 'Пароль',
			},
			{
				link: '/settings/theme',
				label: 'Настройка темы',
			},
		],
	}),
});
