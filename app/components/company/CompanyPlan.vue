<script setup lang="ts">
import { ECompanyPlan, COMPANY_PLANS, type ICompanyPlanState } from '#shared/types/company';
import { formatBytes, planSummary } from '#shared/utils/format';

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const { isReadonly, readonlyAttrs } = useReadonly();
const userStore = useUserStore();

const { data: state, refresh } = await useFetch<ICompanyPlanState | null>('/api/company/plan', {
    default: () => null as ICompanyPlanState | null,
});

const isOpen = ref(false);
const isSaving = ref(false);
const errorMsg = ref('');
const selected = ref<ECompanyPlan>(ECompanyPlan.FREE);

const planOptions = Object.values(ECompanyPlan).map((plan) => ({ value: plan, ...COMPANY_PLANS[plan] }));

/** Доля в процентах, ограниченная сотней: прогресс-бар не должен уезжать за край. */
function percent(used: number, total: number): number {
    return total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
}

const seatsPercent = computed(() => percent(state.value?.usage.seats || 0, state.value?.limits.seats || 0));
const projectsPercent = computed(() => percent(state.value?.usage.projects || 0, state.value?.limits.projects || 0));
const storagePercent = computed(() =>
    percent(state.value?.usage.storageBytes || 0, state.value?.limits.storageBytes || 0)
);

function open() {
    selected.value = state.value?.plan || ECompanyPlan.FREE;
    errorMsg.value = '';
    isOpen.value = true;
}

// Отдельные функции, а не присваивание в шаблоне: `@click="isOpen = false"`
// возвращает значение и не проходит по типу обработчика (ожидается void).
function close() {
    isOpen.value = false;
}

function select(plan: ECompanyPlan) {
    selected.value = plan;
}

async function save() {
    try {
        isSaving.value = true;
        errorMsg.value = '';

        await $csrfFetch('/api/company/plan', { method: 'PATCH', body: { plan: selected.value } });
        await refresh();

        toast.add({ title: 'Plan updated', color: 'success' });
        isOpen.value = false;
    } catch (e) {
        // Понижение может не пройти по текущему использованию — показываем причину в модалке.
        errorMsg.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to change the plan';
    } finally {
        isSaving.value = false;
    }
}
</script>

<template>
    <UPageCard
        v-if="state"
        title="Company Plan"
        variant="subtle"
    >
        <p class="text-sm font-medium">{{ state.limits.label }} Plan</p>

        <p class="text-xs text-muted">{{ state.usage.seats }} / {{ state.limits.seats }} seats used</p>
        <UProgress
            :model-value="seatsPercent"
            :color="seatsPercent >= 100 ? 'error' : 'primary'"
            size="sm"
        />

        <p class="text-xs text-muted">{{ state.usage.projects }} / {{ state.limits.projects }} projects used</p>
        <UProgress
            :model-value="projectsPercent"
            :color="projectsPercent >= 100 ? 'error' : 'primary'"
            size="sm"
        />

        <UButton
            label="Manage Plan"
            variant="outline"
            color="neutral"
            block
            :title="readonlyAttrs.title"
            :style="readonlyAttrs.style"
            :disabled="!userStore.isOwner || isReadonly"
            @click="open"
        />

        <UModal
            v-model:open="isOpen"
            title="Change plan"
            description="Pick the plan that fits your team."
        >
            <template #body>
                <div class="grid gap-4">
                    <div class="grid gap-2">
                        <button
                            v-for="option in planOptions"
                            :key="option.value"
                            type="button"
                            class="flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition"
                            :class="
                                selected === option.value
                                    ? 'border-primary bg-primary/10'
                                    : 'border-default hover:bg-elevated/50'
                            "
                            @click="select(option.value)"
                        >
                            <span class="text-sm font-medium">
                                {{ option.label }}
                                <span
                                    v-if="option.value === state.plan"
                                    class="text-xs text-muted"
                                >
                                    · current
                                </span>
                            </span>
                            <span class="text-xs text-muted">{{ planSummary(option) }}</span>
                        </button>
                    </div>

                    <p
                        v-if="errorMsg"
                        class="text-sm text-error"
                    >
                        {{ errorMsg }}
                    </p>

                    <div class="flex justify-end gap-3">
                        <UButton
                            label="Cancel"
                            variant="ghost"
                            color="neutral"
                            @click="close"
                        />
                        <UButton
                            :title="readonlyAttrs.title"
                            :style="readonlyAttrs.style"
                            label="Save plan"
                            :loading="isSaving"
                            :disabled="isReadonly || selected === state.plan"
                            @click="save"
                        />
                    </div>
                </div>
            </template>
        </UModal>
    </UPageCard>

    <UPageCard
        v-if="state"
        title="Storage"
        variant="subtle"
    >
        <p class="text-xs text-muted">
            {{ formatBytes(state.usage.storageBytes) }} / {{ formatBytes(state.limits.storageBytes) }} used
        </p>
        <UProgress
            :model-value="storagePercent"
            :color="storagePercent >= 100 ? 'error' : 'primary'"
            size="sm"
        />
        <p class="text-xs text-muted">Task attachments are stored in the database.</p>
    </UPageCard>
</template>
