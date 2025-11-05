<template>
  <div class="restaurant-view">
    <v-app-bar
      app
      flat
      color="white"
      class="restaurant-header"
    >
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="font-weight-bold">
        {{ headerTitle }}
      </v-toolbar-title>
      <v-spacer />
      <div
        v-if="headerCity"
        class="d-none d-md-flex align-center mr-4"
      >
        <v-icon small class="mr-1" color="grey darken-1">mdi-map-marker</v-icon>
        <span class="caption grey--text text--darken-1">
          {{ headerCity }}
        </span>
      </div>
      <v-badge
        :content="cartItemCount"
        color="deep-orange darken-2"
        overlap
        bordered
        :value="cartItemCount > 0"
      >
        <v-btn icon @click="openCart">
          <v-icon>mdi-cart-outline</v-icon>
        </v-btn>
      </v-badge>
    </v-app-bar>

    <v-main class="restaurant-main">
      <v-container class="py-0">
    <v-skeleton-loader
      v-if="detailLoading"
      type="image, heading, paragraph, paragraph, heading"
      class="mt-4"
    />

    <template v-else>
      <v-alert v-if="detailError" type="error" prominent class="mt-6">
        {{ detailError }}
        <v-divider class="my-4" />
        <v-btn color="primary" text @click="$router.back()">Retour</v-btn>
      </v-alert>

      <div v-else-if="detail">
        <v-img
          :src="detail.heroImage"
          height="320"
          class="hero-banner"
          cover
          gradient="to top, rgba(0,0,0,.45), rgba(0,0,0,.05)"
        >
          <div class="hero-info white--text">
            <div class="mb-2">
              <v-chip
                v-if="detail.rating"
                color="amber darken-3"
                text-color="white"
                class="mr-2"
              >
                <v-icon left small>mdi-star</v-icon>
                {{ detail.rating }} ({{ detail.reviewCount }})
              </v-chip>
              <v-chip v-if="detail.priceRange" outlined dark>
                {{ detail.priceRange }}
              </v-chip>
            </div>
            <h1 class="display-1 font-weight-bold mb-2">{{ detail.name }}</h1>
            <div class="subtitle-1 mb-2">{{ detail.tagline }}</div>
            <div class="caption">
              {{ detail.location?.address }}, {{ detail.location?.postalCode }}
              {{ detail.location?.city }}
            </div>
          </div>
        </v-img>

        <v-container class="mt-n8">
          <v-row>
            <v-col cols="12" md="8">
              <v-card class="mb-6" outlined>
                <v-card-text>
                  <div class="d-flex align-center flex-wrap mb-4 info-chips">
                    <v-chip class="mr-2 mb-2" color="grey lighten-4">
                      <v-icon left small color="grey darken-2">mdi-clock-outline</v-icon>
                      {{ etaText }}
                    </v-chip>
                    <v-chip class="mr-2 mb-2" color="grey lighten-4">
                      <v-icon left small color="grey darken-2">mdi-cash</v-icon>
                      {{ feeText }}
                    </v-chip>
                    <v-chip
                      v-for="category in detail.categories || []"
                      :key="category.id"
                      class="mr-2 mb-2"
                      small
                      outlined
                    >
                      {{ category.name }}
                    </v-chip>
                  </div>

                  <p class="body-1 mb-4">{{ detail.description }}</p>

                  <div
                    v-if="detail.highlights && detail.highlights.length"
                    class="mb-4"
                  >
                    <div class="subtitle-2 font-weight-bold mb-2">À retenir</div>
                    <v-chip
                      v-for="highlight in detail.highlights"
                      :key="highlight"
                      class="mr-2 mb-2"
                      small
                      color="green lighten-4"
                      text-color="green darken-3"
                    >
                      <v-icon left small color="green darken-3">mdi-check</v-icon>
                      {{ highlight }}
                    </v-chip>
                  </div>

                  <div
                    v-if="detail.deliveryNotes && detail.deliveryNotes.length"
                    class="mb-4"
                  >
                    <div class="subtitle-2 font-weight-bold mb-2">Livraison</div>
                    <ul class="delivery-notes">
                      <li v-for="note in detail.deliveryNotes" :key="note">
                        {{ note }}
                      </li>
                    </ul>
                  </div>
                </v-card-text>
              </v-card>

              <div
                v-for="section in detail.menuSections || []"
                :key="section.title"
                class="mb-8"
              >
                <div class="d-flex align-center mb-3">
                  <h2 class="title font-weight-bold mr-3">{{ section.title }}</h2>
                  <span class="caption grey--text">{{ section.subtitle }}</span>
                </div>
                <v-card outlined>
                  <v-list two-line>
                    <v-list-item
                      v-for="item in section.items"
                      :key="item.name"
                      class="menu-item"
                    >
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-medium">
                          {{ item.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="grey--text text--darken-1">
                          {{ item.description }}
                        </v-list-item-subtitle>
                        <div class="mt-1" v-if="item.tags && item.tags.length">
                          <v-chip
                            v-for="tag in item.tags"
                            :key="tag"
                            x-small
                            class="mr-1"
                            color="grey lighten-3"
                          >
                            {{ tag }}
                          </v-chip>
                        </div>
                      </v-list-item-content>
                      <v-list-item-action class="align-self-start text-no-wrap d-flex flex-column align-end">
                        <div class="subtitle-1 font-weight-bold mb-2">
                          {{ formatCurrency(item.price) }}
                        </div>
                        <v-btn
                          small
                          color="deep-orange darken-2"
                          class="text-none"
                          dark
                          :loading="cartUpdating"
                          :disabled="cartUpdating"
                          @click="addToCart(section, item)"
                        >
                          <v-icon left small>mdi-cart-plus</v-icon>
                          Ajouter
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-card>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <v-card outlined class="mb-6">
                <v-card-text>
                  <div class="subtitle-1 font-weight-bold mb-2">
                    Coordonnées
                  </div>
                  <div class="body-2 mb-3">
                    {{ detail.location?.address }}<br />
                    {{ detail.location?.postalCode }} {{ detail.location?.city }}
                  </div>
                  <div class="caption grey--text mb-3">
                    Prévision : {{ etaText }} · {{ feeText }}
                  </div>
                  <v-btn block color="deep-orange darken-2" dark class="mb-2">
                    Commander maintenant
                  </v-btn>
                  <v-btn block outlined color="grey darken-1">
                    Ajouter aux favoris
                  </v-btn>
                </v-card-text>
              </v-card>

              <v-card
                outlined
                v-if="detail.contact && (detail.contact.phone || detail.contact.website)"
              >
                <v-card-text>
                  <div class="subtitle-2 font-weight-bold mb-3">Contact</div>
                  <div v-if="detail.contact.phone" class="mb-2">
                    <v-icon small class="mr-1">mdi-phone</v-icon>
                    {{ detail.contact.phone }}
                  </div>
                  <div v-if="detail.contact.website" class="mb-2">
                    <v-icon small class="mr-1">mdi-web</v-icon>
                    <a :href="detail.contact.website" target="_blank" rel="noopener">
                      Site web
                    </a>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <section v-if="similar && similar.length" class="mt-4">
            <div class="d-flex align-center mb-3">
              <h2 class="title font-weight-bold mr-3">Similaires à découvrir</h2>
              <span class="caption grey--text">Les clients aiment aussi</span>
            </div>
            <v-slide-group show-arrows>
              <v-slide-item
                v-for="restaurant in similar"
                :key="restaurant.id"
              >
                <restaurant-card
                  class="mr-4"
                  :restaurant="restaurant"
                  @select="goToRestaurant"
                />
              </v-slide-item>
            </v-slide-group>
          </section>
        </v-container>
      </div>
    </template>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import RestaurantCard from '@/components/RestaurantCard.vue'

export default {
  name: 'RestaurantDetailView',
  components: {
    RestaurantCard,
  },
  computed: {
    ...mapState('restaurants', [
      'detail',
      'similar',
      'detailLoading',
      'detailError',
    ]),
    ...mapState('cart', {
      cartUpdating: state => state.updating,
    }),
    ...mapGetters('cart', {
      cartItemCount: 'itemCount',
    }),
    headerTitle() {
      if (this.detail && this.detail.name) {
        return this.detail.name
      }
      return 'Uber Eats'
    },
    headerCity() {
      if (this.detail && this.detail.location && this.detail.location.city) {
        return this.detail.location.city
      }
      return ''
    },
    etaText() {
      if (!this.detail) return ''
      const min = this.detail.deliveryTimeMin
      const max = this.detail.deliveryTimeMax
      if (!min || !max) {
        return 'Temps estimé'
      }
      return `${min}-${max} min`
    },
    feeText() {
      if (!this.detail) return ''
      if (this.detail.deliveryFeeDescription) {
        return this.detail.deliveryFeeDescription
      }
      if (typeof this.detail.deliveryFee === 'number') {
        return `Frais ${this.detail.deliveryFee.toFixed(2)} €`
      }
      return 'Frais variables'
    },
  },
  watch: {
    '$route.params.slug': {
      immediate: true,
      handler() {
        this.loadRestaurant()
      },
    },
  },
  beforeDestroy() {
    this.$store.commit('restaurants/SET_DETAIL', null)
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push({ name: 'home' })
      }
    },
    async loadRestaurant() {
      const slug = this.$route.params.slug
      if (!slug) return
      try {
        await this.$store.dispatch('restaurants/fetchDetail', slug)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        // handled by store
      }
    },
    goToRestaurant(restaurant) {
      const slug = typeof restaurant === 'string' ? restaurant : restaurant.slug
      this.$router.push({ name: 'restaurant', params: { slug } })
    },
    formatCurrency(value) {
      const amount = Number(value || 0)
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }).format(amount)
    },
    async addToCart(section, item) {
      if (!this.detail) return
      try {
        await this.$store.dispatch('cart/addItem', {
          item: {
            restaurantSlug: this.detail.slug,
            restaurantName: this.detail.name,
            sectionTitle: section.title || '',
            name: item.name,
            description: item.description || '',
            price: item.price || 0,
            image: item.image || this.detail.heroImage || '',
          },
          quantity: 1,
        })
      } catch (error) {
        console.warn('Impossible d’ajouter l’article au panier', error)
      }
    },
    openCart() {
      this.$store.dispatch('cart/open')
    },
  },
}
</script>

<style scoped>
.restaurant-view {
  background: #f6f6f6;
  min-height: 100vh;
}

.restaurant-header {
  border-bottom: 1px solid #f0f0f0;
}

.restaurant-main {
  background: #f6f6f6;
  min-height: calc(100vh - 64px);
}

@media (max-width: 600px) {
  .restaurant-main {
    min-height: calc(100vh - 56px);
  }
}

.hero-banner {
  border-radius: 0 0 32px 32px;
  overflow: hidden;
}

.hero-info {
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.delivery-notes {
  padding-left: 18px;
}

.menu-item {
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}
</style>
