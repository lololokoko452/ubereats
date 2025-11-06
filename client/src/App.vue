<template>
  <SentryErrorBoundary :fallback="renderFallback">
    <v-app>
      <router-view />
      <cart-modal />
    </v-app>
  </SentryErrorBoundary>
</template>

<script>
import { mapGetters } from 'vuex'
import CartModal from '@/components/CartModal.vue'
import { Sentry, withProfiler } from '@/plugins/sentry'

export default withProfiler({
  name: 'App',
  components: {
    CartModal,
    SentryErrorBoundary: Sentry.ErrorBoundary,
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
  },
  watch: {
    isAuthenticated(newValue, oldValue) {
      if (newValue && !oldValue) {
        this.$store.dispatch('cart/fetch')
      }
      if (!newValue && oldValue) {
        this.$store.dispatch('cart/reset')
      }
    },
  },
  created() {
    if (this.isAuthenticated) {
      this.$store.dispatch('cart/fetch')
    }
  },
  methods: {
    renderFallback(h) {
      return h(
        'div',
        { class: 'sentry-fallback' },
        'Une erreur est survenue. Merci de réessayer plus tard.'
      )
    },
  },
})
</script>
