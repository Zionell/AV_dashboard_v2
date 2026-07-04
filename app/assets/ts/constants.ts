import type { SpecType } from '#shared/types';

export const LOGIN_CONTENT = {
    title: 'Sign in',
    linkLabel: " Don't have an account?",
    linkValue: '/auth/registration',
    linkText: 'Sign up',
};
export const REGISTRATION_CONTENT = {
    title: 'Sign up',
    linkLabel: 'Already have an account?',
    linkValue: '/auth/login',
    linkText: 'Sign in',
};

export const fullListMonth: SpecType[] = [
    {
        label: 'Январь',
        value: 1,
    },
    {
        label: 'Февраль',
        value: 2,
    },
    {
        label: 'Март',
        value: 3,
    },
    {
        label: 'Апрель',
        value: 4,
    },
    {
        label: 'Май',
        value: 5,
    },
    {
        label: 'Июнь',
        value: 6,
    },
    {
        label: 'Июль',
        value: 7,
    },
    {
        label: 'Август',
        value: 8,
    },
    {
        label: 'Сентябрь',
        value: 9,
    },
    {
        label: 'Октябрь',
        value: 10,
    },
    {
        label: 'Ноябрь',
        value: 11,
    },
    {
        label: 'Декабрь',
        value: 12,
    },
];

export const rangesList = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', months: 3 },
    { label: 'Last 6 months', months: 6 },
    { label: 'Last year', years: 1 },
];
