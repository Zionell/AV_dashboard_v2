import { ETodoStatus } from '#shared/types/times';

export function getTodoColor(status: ETodoStatus): string {
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
