<template>
  <v-app>
    <router-view />
    <cart-modal />
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import CartModal from '@/components/CartModal.vue'

export default {
  name: 'App',
  components: {
    CartModal,
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
}
</script>
