<script setup>
import { computed } from 'vue'
import { planStatus, PLAN_STATUS_META } from '../../services/selectors'

const props = defineProps({
  plan: { type: Object, required: true },
})

const info = computed(() => planStatus(props.plan))
const meta = computed(() => PLAN_STATUS_META[info.value.status])
</script>

<template>
  <span class="plan-status-tag" :class="meta.tagClass">
    <i class="status-dot" :class="`dot-${info.status}`" />
    {{ meta.label }}
    <small v-if="info.status === 'upcoming' && info.daysToStart !== null">
      · 还剩 {{ info.daysToStart }} 天
    </small>
  </span>
</template>

<style scoped>
.plan-status-tag {
  gap: 6px;
  white-space: nowrap;
}

.plan-status-tag small {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.85;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}

.dot-ongoing {
  animation: status-pulse 1.6s ease-in-out infinite;
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
