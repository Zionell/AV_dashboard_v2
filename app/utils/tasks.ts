import { ETaskPriority } from '#shared/types/todo';
import { ETodoStatus } from '#shared/types/times';

type BadgeColor = 'error' | 'warning' | 'success' | 'secondary' | 'neutral';

export function taskPriorityColor(priority: number | null): BadgeColor {
    switch (priority) {
        case ETaskPriority.HIGH:
            return 'error';
        case ETaskPriority.MEDIUM:
            return 'warning';
        case ETaskPriority.LOW:
            return 'success';
        default:
            return 'neutral';
    }
}

/** В БД приоритет числом — в UI показываем текстом. */
export function taskPriorityLabel(priority?: number | null): string {
    switch (priority) {
        case ETaskPriority.HIGH:
            return 'HIGH';
        case ETaskPriority.MEDIUM:
            return 'MEDIUM';
        case ETaskPriority.LOW:
            return 'LOW';
        default:
            return '';
    }
}

export function taskStatusColor(status: ETodoStatus): BadgeColor {
    switch (status) {
        case ETodoStatus.DONE:
            return 'success';
        case ETodoStatus.IN_PROGRESS:
            return 'secondary';
        case ETodoStatus.REVIEW:
            return 'warning';
        default:
            return 'neutral';
    }
}

export function taskStatusLabel(status: ETodoStatus): string {
    switch (status) {
        case ETodoStatus.DONE:
            return 'Done';
        case ETodoStatus.IN_PROGRESS:
            return 'In Progress';
        case ETodoStatus.REVIEW:
            return 'Review';
        default:
            return 'Todo';
    }
}
