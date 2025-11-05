<template>
  <div class="home-view">
    <v-navigation-drawer v-model="drawer" app width="260">
      <v-list dense>
        <v-list-item-group>
          <v-list-item v-for="item in drawerItems" :key="item.title" link>
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="white" flat>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="font-weight-bold">Uber Eats</v-toolbar-title>

      <v-divider vertical class="mx-4 d-none d-md-block" />

      <v-btn depressed class="mr-2" small>
        <v-icon left small>mdi-truck-delivery</v-icon>
        Livraison
      </v-btn>
      <v-btn text class="mr-6" small>
        À emporter
      </v-btn>

      <v-menu
        v-model="showSuggestions"
        offset-y
        :close-on-content-click="false"
        transition="fade-transition"
        max-width="420"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="searchTerm"
            rounded
            dense
            hide-details
            solo
            flat
            prepend-inner-icon="mdi-magnify"
            placeholder="Rechercher dans Uber Eats"
            class="app-search"
            v-bind="attrs"
            @keyup.enter="onSearch"
            @focus="openSuggestions"
            v-on="on"
          />
        </template>

        <v-card v-if="suggestions.items.length" elevation="6">
          <v-list dense>
            <v-subheader>Suggestions</v-subheader>
            <v-list-item
              v-for="item in suggestions.items"
              :key="item"
              @click="selectSuggestion(item)"
            >
              <v-list-item-icon class="mr-2">
                <v-icon small color="grey">mdi-magnify</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
        <v-card v-else class="pa-3 grey--text caption">
          Tape au moins 2 caractères pour afficher des suggestions.
        </v-card>
      </v-menu>

      <v-spacer />

      <v-btn text class="mr-2">
        <v-icon left>mdi-map-marker</v-icon>
        {{ currentCity }}
      </v-btn>
      <v-btn text class="mr-6">
        <v-icon left>mdi-clock-outline</v-icon>
        Maintenant
      </v-btn>
      <v-badge
        :content="cartItemCount"
        color="deep-orange darken-2"
        overlap
        bordered
        :value="cartItemCount > 0"
        class="ml-2"
      >
        <v-btn icon @click="openCart">
          <v-icon>mdi-cart-outline</v-icon>
        </v-btn>
      </v-badge>
      <v-menu
        v-if="isAuthenticated"
        v-model="accountMenu"
        bottom
        right
        offset-y
      >
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-btn>
        </template>
        <v-card min-width="220">
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="subtitle-2 font-weight-bold">
                  {{ currentUser?.name || currentUser?.email || 'Utilisateur' }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="currentUser?.email">
                  {{ currentUser.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider />
          <v-list dense>
            <v-list-item link @click="logout">
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Se d&eacute;connecter</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      <v-btn
        v-else
        text
        color="primary"
        class="text-none"
        @click="goToLogin"
      >
        Connexion
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="py-6">
        <v-skeleton-loader
          v-if="loading"
          type="card-avatar, list-item-two-line, image, actions"
          class="mb-8"
        ></v-skeleton-loader>

        <template v-else>
          <v-alert
            v-if="error"
            type="error"
            prominent
            class="mb-6"
          >
            {{ error }}
          </v-alert>

          <section v-if="hero" class="mb-10">
            <v-sheet rounded elevation="4" class="overflow-hidden hero-section">
              <v-row no-gutters>
                <v-col cols="12" md="7">
                  <v-img
                    :src="hero.heroImage"
                    height="280"
                    gradient="to top, rgba(0,0,0,.35), rgba(0,0,0,.05)"
                    cover
                  >
                    <div class="hero-overlay white--text">
                      <div class="subtitle-2 mb-1">{{ hero.priceRange }}</div>
                      <h2 class="display-1 font-weight-bold mb-2">
                        {{ hero.name }}
                      </h2>
                      <div class="mb-4">
                        <v-chip small color="amber darken-3" text-color="white" class="mr-2">
                          <v-icon left small>mdi-star</v-icon>
                          {{ hero.rating }}
                        </v-chip>
                        <span class="body-2">{{ hero.shortDescription }}</span>
                      </div>
                      <v-btn color="deep-orange darken-2" dark @click="goToRestaurant(hero.slug)">
                        Voir la fiche
                      </v-btn>
                    </div>
                  </v-img>
                </v-col>
                <v-col cols="12" md="5" class="pa-6 d-flex flex-column justify-center">
                  <div class="headline font-weight-bold mb-4">
                    Planifiez votre prochain repas
                  </div>
                  <div class="mb-4">
                    <div class="caption grey--text text--darken-1 mb-1">Adresse</div>
                    <div class="subtitle-1 font-weight-medium">{{ currentCity }}</div>
                  </div>
                  <v-btn color="black" class="mb-3" dark @click="onSearch">
                    <v-icon left>mdi-magnify</v-icon>
                    Rechercher
                  </v-btn>
                  <div class="caption grey--text">
                    Parcourez les catégories, découvrez des nouveautés et accédez à vos restaurants préférés.
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
          </section>

          <section v-if="trendingSearches.length" class="mb-8">
            <div class="d-flex align-center mb-3">
              <h2 class="title font-weight-bold mr-3">Recherches populaires</h2>
              <span class="caption grey--text">Tendances dans votre ville</span>
            </div>
            <div class="d-flex flex-wrap">
              <v-chip
                v-for="trend in trendingSearches"
                :key="trend"
                class="mr-2 mb-2"
                outlined
                @click="launchQuickSearch(trend)"
              >
                <v-icon left small>mdi-fire</v-icon>
                {{ trend }}
              </v-chip>
            </div>
          </section>

          <section v-if="categories.length" class="mb-10">
            <div class="d-flex align-center mb-3">
              <h2 class="title font-weight-bold mr-3">Catégories</h2>
              <span class="caption grey--text">Explorez par envie</span>
            </div>
            <v-slide-group show-arrows>
              <v-slide-item v-for="category in categories" :key="category.id">
                <v-card
                  class="mr-4 category-card"
                  width="180"
                  outlined
                  @click="launchCategorySearch(category)"
                >
                  <v-img :src="category.image" height="110" cover></v-img>
                  <v-card-text class="py-3">
                    <div class="subtitle-2 font-weight-bold">{{ category.name }}</div>
                    <div class="caption grey--text text--darken-1">
                      {{ category.description }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-slide-item>
            </v-slide-group>
          </section>

          <section v-if="promoBanners.length" class="mb-8">
            <div class="d-flex align-center mb-3">
              <h2 class="title font-weight-bold mr-3">Offres à ne pas manquer</h2>
              <span class="caption grey--text">Profitez des promos en cours</span>
            </div>
            <v-slide-group
              show-arrows
              class="promo-slider"
            >
              <v-slide-item
                v-for="banner in promoBanners"
                :key="banner.restaurantSlug"
              >
                <v-sheet
                  class="promo-card mr-4"
                  :style="{ backgroundColor: banner.accent }"
                  rounded
                  dark
                  @click="goToRestaurant(banner.restaurantSlug)"
                >
                  <div class="promo-content">
                    <div class="mb-2 font-weight-bold">{{ banner.title }}</div>
                    <div class="caption mb-4">{{ banner.description }}</div>
                    <v-btn small color="black" class="text-none" outlined>
                      Voir le restaurant
                      <v-icon right small>mdi-arrow-right</v-icon>
                    </v-btn>
                  </div>
                  <v-img
                    :src="banner.heroImage"
                    cover
                    height="160"
                    class="promo-image"
                  ></v-img>
                </v-sheet>
              </v-slide-item>
            </v-slide-group>
          </section>

          <section
            v-for="section in sections"
            :key="section.key"
            class="mb-10"
          >
            <div class="d-flex align-center mb-3">
              <h2 class="title font-weight-bold mr-3">{{ section.title }}</h2>
              <span class="caption grey--text">{{ section.subtitle }}</span>
            </div>
            <v-slide-group show-arrows class="py-2">
              <v-slide-item
                v-for="restaurant in section.items"
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

          <section v-if="hasSearchResults" class="mb-10">
            <div class="d-flex align-center mb-3">
              <h2 class="title font-weight-bold mr-3">
                Résultats pour "{{ searchTerm || searchQuery.search }}"
              </h2>
              <span class="caption grey--text">
                {{ searchResults.length }} restaurants trouvés
              </span>
              <v-spacer />
              <v-btn text small @click="clearSearch">Effacer la recherche</v-btn>
            </div>
            <v-progress-linear
              v-if="searchLoading"
              indeterminate
              color="deep-orange darken-2"
              class="mb-4"
            ></v-progress-linear>
            <v-row>
              <v-col
                v-for="restaurant in searchResults"
                :key="restaurant.id"
                cols="12"
                md="4"
              >
                <restaurant-card
                  :restaurant="restaurant"
                  dense
                  @select="goToRestaurant"
                />
              </v-col>
            </v-row>
          </section>

          <v-alert
            v-else-if="(searchQuery.search || searchQuery.category) && !searchLoading && !searchError"
            type="info"
            dense
            class="mb-6"
          >
            Aucun restaurant ne correspond à votre recherche pour le moment.
          </v-alert>

          <v-alert
            v-if="searchError"
            type="error"
            dense
            border="left"
            colored-border
            color="red lighten-4"
          >
            {{ searchError }}
          </v-alert>
        </template>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import RestaurantCard from '@/components/RestaurantCard.vue'

export default {
  name: 'HomeView',
  components: {
    RestaurantCard,
  },
  data() {
    return {
      drawer: false,
      drawerItems: [
        { icon: 'mdi-home-outline', title: 'Accueil' },
        { icon: 'mdi-star-outline', title: 'Favoris' },
        { icon: 'mdi-history', title: 'Commandes passées' },
        { icon: 'mdi-cog-outline', title: 'Paramètres' },
      ],
      searchTerm: '',
      showSuggestions: false,
      debounceTimer: null,
      currentCity: 'Paris',
      accountMenu: false,
    }
  },
  computed: {
    ...mapState('home', ['loading', 'error', 'data', 'suggestions']),
    ...mapState('restaurants', {
      searchResults: state => state.items,
      searchLoading: state => state.loading,
      searchError: state => state.error,
      searchQuery: state => state.query,
    }),
    ...mapGetters('home', [
      'sections',
      'categories',
      'promoBanners',
      'hero',
      'searchDataset',
    ]),
    ...mapGetters('cart', {
      cartItemCount: 'itemCount',
    }),
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),
    hasSearchResults() {
      return this.$store.getters['restaurants/hasResults']
    },
    trendingSearches() {
      return this.searchDataset?.trendingSearches || []
    },
  },
  watch: {
    data: {
      immediate: true,
      handler(payload) {
        if (payload?.city) {
          this.currentCity = payload.city
        }
      },
    },
    searchTerm(newValue) {
      clearTimeout(this.debounceTimer)
      if (!newValue || newValue.length < 2) {
        this.showSuggestions = false
        this.$store.dispatch('home/fetchSuggestions', '')
        return
      }

      this.debounceTimer = setTimeout(() => {
        this.$store.dispatch('home/fetchSuggestions', newValue)
        this.showSuggestions = true
      }, 250)
    },
  },
  created() {
    this.fetchHomeData()
  },
  beforeDestroy() {
    clearTimeout(this.debounceTimer)
  },
  methods: {
    fetchHomeData() {
      this.$store.dispatch('home/fetch', { city: this.currentCity })
    },
    openSuggestions() {
      if (this.suggestions.items.length) {
        this.showSuggestions = true
      }
    },
    async onSearch() {
      if (!this.searchTerm) {
        this.$store.dispatch('restaurants/clearResults')
        this.showSuggestions = false
        return
      }

      await this.$store.dispatch('restaurants/search', {
        search: this.searchTerm,
        city: this.currentCity,
      })
      this.showSuggestions = false
    },
    async selectSuggestion(value) {
      this.searchTerm = value
      this.showSuggestions = false
      await this.onSearch()
    },
    async launchQuickSearch(term) {
      this.searchTerm = term
      await this.onSearch()
    },
    async launchCategorySearch(category) {
      await this.$store.dispatch('restaurants/search', {
        category: category.slug,
        city: this.currentCity,
      })
      this.searchTerm = ''
      this.showSuggestions = false
    },
    clearSearch() {
      this.searchTerm = ''
      this.$store.dispatch('restaurants/clearResults')
    },
    goToRestaurant(restaurant) {
      const slug = typeof restaurant === 'string' ? restaurant : restaurant.slug
      this.$router.push({ name: 'restaurant', params: { slug } })
    },
    openCart() {
      this.$store.dispatch('cart/open')
    },
    logout() {
      this.$store.dispatch('auth/logout')
      this.accountMenu = false
      this.$router.push({ name: 'login' })
    },
    goToLogin() {
      this.$router.push({
        name: 'login',
        query: { redirect: this.$route.fullPath },
      })
    },
  },
}
</script>

<style scoped>
.home-view {
  background: #f6f6f6;
  min-height: 100vh;
}

.app-search {
  max-width: 380px;
}

.hero-section {
  background: white;
}

.hero-overlay {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.category-card {
  cursor: pointer;
}

.promo-card {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 24px;
  min-height: 200px;
  cursor: pointer;
}

.promo-slider .promo-card {
  width: 360px;
  max-width: 360px;
}

.promo-card .promo-content {
  max-width: 60%;
}

.promo-card .promo-image {
  border-radius: 12px;
  width: 40%;
  margin-left: 16px;
}

@media (max-width: 960px) {
  .promo-card {
    flex-direction: column;
  }

  .promo-card .promo-content {
    max-width: 100%;
    margin-bottom: 16px;
  }

  .promo-card .promo-image {
    width: 100%;
    margin-left: 0;
  }
}
</style>
