<template>
  <v-dialog
    v-model="dialogProxy"
    width="420"
    scrollable
    transition="dialog-bottom-transition"
    content-class="cart-modal"
  >
    <v-card elevation="10" class="cart-card">
      <v-card-title class="justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="deep-orange darken-2" class="mr-2">mdi-cart-outline</v-icon>
          <span class="font-weight-bold">Mon panier</span>
        </div>
        <v-btn icon small @click="closeCart">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="py-4" style="max-height: 60vh;">
        <v-alert
          v-if="error"
          type="error"
          dense
          outlined
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-skeleton-loader
          v-if="loading"
          type="list-item-three-line, list-item-three-line, heading"
        />

        <div v-else>
          <div v-if="isEmpty" class="text-center py-6 grey--text">
            <v-icon large color="grey lighten-1" class="mb-3">mdi-silverware-fork-knife</v-icon>
            <div class="subtitle-1">Ton panier est vide</div>
            <div class="caption mt-1">Ajoute des plats depuis la fiche restaurant.</div>
          </div>

          <v-list two-line v-else dense>
            <v-list-item
              v-for="item in items"
              :key="item.itemKey"
              class="cart-item"
            >
              <v-list-item-avatar tile size="56">
                <v-img :src="item.image || fallbackImage" contain></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle class="caption grey--text text--darken-1">
                  {{ item.restaurantName }}
                </v-list-item-subtitle>
                <div v-if="item.sectionTitle" class="caption grey--text">
                  {{ item.sectionTitle }}
                </div>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-column align-end">
                <div class="quantity-toggle mb-2">
                  <v-btn icon small :disabled="updating" @click="decrement(item)">
                    <v-icon small>mdi-minus</v-icon>
                  </v-btn>
                  <div class="quantity-value">
                    {{ item.quantity }}
                  </div>
                  <v-btn icon small :disabled="updating" @click="increment(item)">
                    <v-icon small>mdi-plus</v-icon>
                  </v-btn>
                </div>
                <div class="subtitle-2 font-weight-bold">
                  {{ formatCurrency(item.lineTotal) }}
                </div>
                <v-btn text x-small color="grey" :disabled="updating" @click="remove(item)">
                  Retirer
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="px-5 py-4" v-if="!isEmpty">
        <div class="flex-grow-1">
          <div class="d-flex justify-space-between subtitle-2 mb-1">
            <span>Sous-total</span>
            <span class="font-weight-bold">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="caption grey--text">
            Les frais de livraison s'afficheront lors du paiement.
          </div>
        </div>
        <v-btn
          color="deep-orange darken-2"
          dark
          class="text-none"
          :disabled="updating"
        >
          Passer commande
        </v-btn>
      </v-card-actions>

      <v-card-actions v-else class="px-5 pb-4 pt-0">
        <v-btn text color="deep-orange darken-2" class="text-none" @click="closeCart">
          Continuer tes découvertes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'CartModal',
  computed: {
    ...mapGetters('cart', ['itemCount', 'subtotal', 'isOpen', 'isEmpty']),
    ...mapState('cart', ['items', 'currency', 'loading', 'error', 'updating']),
    dialogProxy: {
      get() {
        return this.isOpen
      },
      set(value) {
        if (!value) {
          this.$store.dispatch('cart/close')
        }
      },
    },
    fallbackImage() {
      return 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80'
    },
  },
  methods: {
    formatCurrency(amount) {
      const value = Number(amount || 0)
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: this.currency || 'EUR',
        minimumFractionDigits: 2,
      }).format(value)
    },
    closeCart() {
      this.$store.dispatch('cart/close')
    },
    increment(item) {
      if (this.updating) return
      const quantity = item.quantity + 1
      this.$store.dispatch('cart/updateItemQuantity', {
        itemKey: item.itemKey,
        quantity,
      })
    },
    decrement(item) {
      if (this.updating) return
      const quantity = item.quantity - 1
      if (quantity <= 0) {
        this.remove(item)
        return
      }
      this.$store.dispatch('cart/updateItemQuantity', {
        itemKey: item.itemKey,
        quantity,
      })
    },
    remove(item) {
      if (this.updating) return
      this.$store.dispatch('cart/removeItem', item.itemKey)
    },
  },
}
</script>

<style scoped>
.cart-modal {
  align-self: flex-start;
  margin-top: 70px;
  margin-right: 24px;
}

.cart-card {
  border-radius: 18px;
}

.cart-item {
  border-bottom: 1px solid #f1f1f1;
}

.cart-item:last-child {
  border-bottom: none;
}

.quantity-toggle {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 999px;
  padding: 2px 6px;
}

.quantity-toggle .v-btn {
  height: 28px !important;
  width: 28px !important;
  min-width: 28px !important;
  color: #1d1d1d;
}

.quantity-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
