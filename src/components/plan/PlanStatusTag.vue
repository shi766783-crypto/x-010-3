<script setup>
import { computed } from 'vue'
import { PLAN_STATUS_LABEL } from '../../constants'
import { planStatus } from '../../services/planStatus'

const props = defineProps({
  plan: { type: Object, required: true },
  // 是否在「未出发」时附带「还剩 N 天」
  showCountdown: { type: Boolean, default: false },
})

const info = computed(() => planStatus(props.plan))

const tagClass = computed(
  () =>
    ({
      upcoming: 'tag-blue',
      ongoing: 'tag-green',
      ended: 'tag-gray',
    })[info.value.status]
)

const label = computed(() => PLAN_STATUS_LABEL[info.value.status])
</script>

<template>
  <span class="plan-status-tag">
    <span class="tag" :class="tagClass">
      <i class="status-dot" :class="`dot-${info.status}`" />
      {{ label }}
    </span>
    <span
      v-if="showCountdown && info.status === 'upcoming' && info.daysLeft !== null"
      class="countdown"
    >
      {{ info.daysLeft === 0 ? '今天出发' : `还剩 ${info.daysLeft} 天` }}
    </span>
  </span>
</template>

<style scoped>
.plan-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.dot-ongoing {
  animation: status-pulse 1.4s ease-in-out infinite;
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

.countdown {
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
}
</style>
