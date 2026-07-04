export const PAGES = {
    dashboard: {
        label: 'Dashboard',
        icon: 'i-lucide-house',
        to: ERoutes.DASHBOARD,
    },
    company: {
        label: 'Company',
        icon: 'i-lucide-briefcase-conveyor-belt',
        to: ERoutes.COMPANY,
    },
    projects: {
        label: 'Projects',
        icon: 'i-lucide-folder-open',
        to: ERoutes.PROJECTS,
    },
    times: {
        label: 'Times',
        icon: 'i-lucide-clock',
        to: ERoutes.TIMES,
    },
    tasks: {
        label: 'Tasks',
        icon: 'i-lucide-clipboard-list',
        to: ERoutes.TASKS,
    },
    materials: {
        label: 'Materials',
        icon: 'i-lucide-book-open-text',
        to: ERoutes.MATERIALS,
    },
    settings: {
        label: 'Settings',
        to: ERoutes.SETTINGS,
        icon: 'i-lucide-settings',
        defaultOpen: true,
        type: 'trigger',
        children: [
            {
                label: 'General',
                to: ERoutes.SETTINGS,
                exact: true,
            },
            // {
            //     label: 'Notifications',
            //     to: ERoutes.NOTIFICATIONS,
            // },
            {
                label: 'Security',
                to: ERoutes.SECURITY,
            },
        ],
    },
};
