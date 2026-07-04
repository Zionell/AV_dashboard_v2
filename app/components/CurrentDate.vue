<script setup lang="ts">
const formatted = useDateFormat(useNow(), 'DD MMMM YYYY');
</script>

<template>
    <div>
        <div class="text-3xl font-semibold">Today</div>
        <div class="font-medium text-xl">
            {{ formatted }}
        </div>
    </div>
</template>
