<template>
  <span
    class="team-badge"
    :class="[`team-badge--${size}`, `team-badge--${shape}`]"
    :style="badgeStyle"
    :title="resolved?.name ?? displayText"
    :aria-label="resolved ? `${resolved.name} (${resolved.abbreviation})` : displayText"
    role="img"
  >
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveTeamBadge, type TeamBadgeInput } from '@/domain/team/teamBadge'

interface Props {
  team?: TeamBadgeInput | null
  name?: string | null
  abbreviation?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'rounded' | 'circle'
}

const props = withDefaults(defineProps<Props>(), {
  team: null,
  name: null,
  abbreviation: null,
  size: 'md',
  shape: 'rounded',
})

const resolved = computed(() => resolveTeamBadge(
  props.abbreviation,
  props.name,
  props.team,
))

const displayText = computed(() =>
  resolved.value?.abbreviation
    ?? props.abbreviation?.trim().toUpperCase()
    ?? props.name?.trim().slice(0, 3).toUpperCase()
    ?? 'TBD'
)

const badgeStyle = computed(() => ({
  backgroundColor: resolved.value?.primaryColor ?? '#475569',
  color: resolved.value?.secondaryColor ?? '#FFFFFF',
}))
</script>

<style scoped>
.team-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.34);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.18);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  user-select: none;
}
.team-badge--rounded { border-radius: 22%; }
.team-badge--circle { border-radius: 50%; }
.team-badge--xs { width: 1.5rem; height: 1.5rem; font-size: 0.55rem; }
.team-badge--sm { width: 2rem; height: 2rem; font-size: 0.66rem; }
.team-badge--md { width: 2.5rem; height: 2.5rem; font-size: 0.76rem; }
.team-badge--lg { width: 3.5rem; height: 3.5rem; font-size: 0.95rem; }
.team-badge--xl { width: 5rem; height: 5rem; font-size: 1.15rem; }
</style>
