<template>
  <Accordion v-if="methodology" :multiple="true">
    <AccordionTab header="Framework Metadata">
      <div class="meta-grid">
        <div><strong>Version:</strong> {{ methodology.frameworkVersion }}</div>
        <div><strong>Framework Type:</strong> {{ methodology.positionGroupFrameworkType }}</div>
        <div><strong>Lineage:</strong> {{ methodology.methodologyLineage }}</div>
        <div><strong>Validation:</strong> {{ methodology.validationStatus }}</div>
        <div><strong>Scoring Mode:</strong> {{ methodology.scoringModeUsed }}</div>
      </div>
      <p v-if="methodology.validationNote">{{ methodology.validationNote }}</p>
    </AccordionTab>

    <AccordionTab
      v-for="section in methodologySections"
      :key="section.key"
      :header="section.title"
    >
      <p>{{ section.body }}</p>
    </AccordionTab>

    <AccordionTab header="Known Limitations">
      <ul v-if="knownLimitations.length > 0" class="limitation-list">
        <li v-for="item in knownLimitations" :key="item">{{ item }}</li>
      </ul>
      <p v-else>No limitations were returned.</p>
    </AccordionTab>
  </Accordion>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import type {
  B4MeMethodologyMetadata,
  B4MeMethodologySection,
} from '../types/b4meAnalysis';

const props = defineProps<{
  methodology: B4MeMethodologyMetadata | null;
}>();

/**
 * Methodology snapshots created by earlier framework versions may not contain
 * collection fields that are required by the current client contract. Normalize
 * them here so historical evaluations remain renderable without pretending the
 * missing values were supplied by the backend.
 */
const methodologySections = computed<B4MeMethodologySection[]>(() =>
  Array.isArray(props.methodology?.methodologySections)
    ? props.methodology.methodologySections
    : [],
);

const knownLimitations = computed<string[]>(() =>
  Array.isArray(props.methodology?.knownLimitations)
    ? props.methodology.knownLimitations
    : [],
);
</script>

<style scoped>
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.limitation-list {
  margin: 0;
  padding-left: 1.25rem;
}
</style>
