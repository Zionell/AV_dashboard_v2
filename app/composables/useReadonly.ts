import { READONLY_HINT } from '#shared/constants';

/**
 * Режим просмотра для демо-роли TEST.
 *
 * Настоящий запрет стоит на сервере (см. `server/middleware/auth.ts`), здесь — только
 * внешний вид: кнопки и поля остаются на месте, но неактивны, чтобы витрина показывала
 * продукт целиком, а не пустые страницы.
 *
 *   <UButton v-bind="readonlyAttrs" @click="remove">Удалить</UButton>
 */
export default function useReadonly() {
    const userStore = useUserStore();

    const isReadonly = computed((): boolean => userStore.isReadonly);

    /**
     * Готовый набор атрибутов для контрола, который пишет в базу. `title` вместо UTooltip —
     * не требует оборачивать каждую кнопку лишним компонентом.
     *
     * `pointer-events` возвращаем инлайном: Nuxt UI гасит их у неактивных контролов
     * (`disabled:pointer-events-none`), а без событий мыши браузер не показывает `title` —
     * подсказка молча не появлялась бы. Инлайн-стиль перебивает класс; на клики это не
     * влияет, disabled-элемент их всё равно не отдаёт.
     */
    const readonlyAttrs = computed(() =>
        isReadonly.value
            ? { disabled: true, title: READONLY_HINT, style: 'pointer-events: auto' }
            : { disabled: false, title: undefined, style: undefined }
    );

    return {
        isReadonly,
        readonlyAttrs,
    };
}
