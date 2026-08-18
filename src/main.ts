// DraftProAnalytics™ | Copyright © 2025-2026 Darryl Thompson. All rights reserved.
// See LICENSE and TRADEMARKS.md.
import * as Sentry from '@sentry/vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// Import global form styles
import './assets/styles/global-forms.css' // For HTML forms
import './assets/styles/global-info-display.css' // For info displays
import './assets/styles/global-primevue-enhancements.css' // For PrimeVue components

// PrimeVue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// PrimeVue styles
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// main.ts (or App.vue <style src>)
import './assets/styles/global-forms.css' // your existing file
import './assets/css/theme-five-colors.css' // the new one

// import 'primeflex/primeflex.css'

// Custom Icons
// import '@fortawesome/fontawesome-free/css/all.css' // <- this loads FA icons

// Custom styles
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable' //
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Panel from 'primevue/panel'
import Toast from 'primevue/toast'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Password from 'primevue/password'
import Menubar from 'primevue/menubar'
import ProgressSpinner from 'primevue/progressspinner'
import Tooltip from 'primevue/tooltip'
// main.ts updates
import { TeamColorsPlugin } from '../src/plug-ins/team-colors.plugin'

// Import global styles
import '../src/assets/styles/global-styles.css'
import Checkbox from 'primevue/checkbox'

const app = createApp(App)
const pinia = createPinia()
const bugsinkEnabled = import.meta.env.VITE_SENTRY_ENABLED === 'true'

const bugsinkDsn = import.meta.env.VITE_SENTRY_DSN?.trim()

const bugsinkEnvironment = import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE

if (bugsinkEnabled && bugsinkDsn) {
  Sentry.init({
    app,
    dsn: bugsinkDsn,
    environment: bugsinkEnvironment,
    release: __DPA_RELEASE__,
    sendDefaultPii: false,

    beforeSend(event) {
      if (event.request) {
        delete event.request.data
        delete event.request.query_string

        if (event.request.headers) {
          const headers = { ...event.request.headers }

          for (const key of Object.keys(headers)) {
            const lower = key.toLowerCase()

            if (lower === 'authorization' || lower === 'cookie' || lower === 'set-cookie') {
              headers[key] = '[Filtered]'
            }
          }

          event.request.headers = headers
        }

        delete event.request.cookies
      }

      if (event.user) {
        event.user = event.user.id ? { id: event.user.id } : undefined
      }

      return event
    },
  })

  console.info(
    `[bugsink] client error reporting enabled for ${bugsinkEnvironment}; release=${__DPA_RELEASE__}`
  )
} else {
  console.info('[bugsink] client error reporting disabled')
}
app.use(pinia)

app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(ConfirmationService)
app.use(TeamColorsPlugin)
app.use(router)

app.directive('tooltip', Tooltip)

// Register PrimeVue components globally
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('InputNumber', InputNumber)
app.component('Checkbox', Checkbox)
app.component('Calendar', Calendar)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Dropdown', Dropdown)
app.component('Dialog', Dialog)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Card', Card)
app.component('Panel', Panel)
app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)

app.component('Toast', Toast)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Menubar', Menubar)

app.mount('#app')
