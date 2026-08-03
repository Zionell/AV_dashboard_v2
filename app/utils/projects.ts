import { EProjectPriority } from '#shared/types/projects';

/** В БД приоритет проекта числом — в UI показываем текстом. */
export function projectPriorityLabel(priority?: number | null): string {
    switch (priority) {
        case EProjectPriority.HIGH:
            return 'HIGH';
        case EProjectPriority.MEDIUM:
            return 'MEDIUM';
        case EProjectPriority.LOW:
            return 'LOW';
        default:
            return '';
    }
}
