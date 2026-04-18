<template>
  <span :class="[baseClass, variantClass]">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'UiBadge' });

const props = defineProps<{
  status: 'scheduled' | 'completed' | 'cancelled'
}>();

const baseClass = 'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center';

const variantClass = computed(() => {
  switch (props.status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
});
</script>
