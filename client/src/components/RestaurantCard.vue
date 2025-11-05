<template>
  <v-card
    class="restaurant-card"
    :class="{ dense }"
    outlined
    elevation="2"
    @click="emitSelection"
  >
    <v-img
      :src="restaurant.heroImage"
      :height="dense ? 140 : 180"
      class="rounded-t"
      cover
      gradient="to top, rgba(0,0,0,.15), rgba(0,0,0,.0)"
    >
      <div v-if="restaurant.promo" class="promo-chip">
        {{ restaurant.promo }}
      </div>
    </v-img>
    <v-card-text class="py-3">
      <div class="d-flex align-start justify-space-between">
        <div>
          <div class="subtitle-1 font-weight-bold mb-1">
            {{ restaurant.name }}
          </div>
          <div class="caption grey--text text--darken-1">
            {{ restaurant.shortDescription || restaurant.tagline }}
          </div>
        </div>
        <v-chip
          v-if="restaurant.rating"
          x-small
          color="amber lighten-4"
          text-color="amber darken-4"
          class="font-weight-medium"
        >
          <v-icon left small color="amber darken-3">mdi-star</v-icon>
          {{ restaurant.rating }}
        </v-chip>
      </div>
      <div class="caption mt-3">
        {{ etaText }} · {{ feeText }}
      </div>
      <div class="mt-2">
        <v-chip
          v-for="tag in (restaurant.tags || []).slice(0, 2)"
          :key="tag"
          x-small
          class="mr-1 text-uppercase"
          color="grey lighten-4"
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'RestaurantCard',
  props: {
    restaurant: {
      type: Object,
      required: true,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    etaText() {
      const min = this.restaurant.deliveryTimeMin
      const max = this.restaurant.deliveryTimeMax
      if (!min || !max) {
        return 'Temps estimé'
      }
      return `${min}-${max} min`
    },
    feeText() {
      if (this.restaurant.deliveryFeeDescription) {
        return this.restaurant.deliveryFeeDescription
      }
      if (typeof this.restaurant.deliveryFee === 'number') {
        return `Frais ${this.restaurant.deliveryFee.toFixed(2)} €`
      }
      return 'Frais variables'
    },
  },
  methods: {
    emitSelection() {
      this.$emit('select', this.restaurant)
    },
  },
}
</script>

<style scoped>
.restaurant-card {
  cursor: pointer;
  border-radius: 16px;
  width: 320px;
}

.restaurant-card.dense {
  width: 100%;
}

.promo-chip {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
}
</style>
