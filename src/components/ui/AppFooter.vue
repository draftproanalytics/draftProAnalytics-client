<!-- RosterTheory™ by DraftProAnalytics™ | Copyright © 2025-2026 Darryl Thompson. -->
<template>
  <footer class="app-footer" role="contentinfo">
    <div class="footer-brand">
      <strong>RosterTheory<sup>™</sup></strong>
      <span class="footer-divider" aria-hidden="true">·</span>
      <span>A DraftProAnalytics<sup>™</sup> product</span>
    </div>
    <p class="footer-purpose">The right talent. The right roster. Better decisions.</p>
    <p class="footer-legal">
      Copyright © 2025-2026 Darryl Thompson. All rights reserved.
      RosterTheory™ and DraftProAnalytics™ are claimed trademarks.
    </p>
  </footer>
</template>

<style scoped>
.app-footer {
  flex: 0 0 auto;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.24);
  background: #0f2747;
  color: #f8fafc;
  text-align: center;
}

.footer-brand {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.footer-brand strong {
  font-size: 1rem;
  letter-spacing: 0.01em;
}

.footer-brand sup {
  font-size: 0.58em;
  vertical-align: super;
}

.footer-divider {
  color: #f2b84b;
}

.footer-purpose,
.footer-legal {
  margin: 0.25rem 0 0;
}

.footer-purpose {
  color: #f8d98a;
  font-size: 0.78rem;
  font-weight: 600;
}

.footer-legal {
  color: rgba(248, 250, 252, 0.76);
  font-size: 0.68rem;
  line-height: 1.35;
}
</style>
