<template>
  <v-container fluid class="pa-0 fill-height login-view">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="6" class="d-none d-md-flex visual-column">
        <v-img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop"
          alt="Livraison Uber Eats"
          class="elevation-2"
          gradient="to bottom, rgba(0,0,0,.2), rgba(0,0,0,.6)"
          cover
        >
          <div class="hero-copy white--text">
            <div class="mb-4">
              <v-chip label color="deep-orange darken-2" text-color="white">
                Expérience démonstration
              </v-chip>
            </div>
            <h2 class="display-1 font-weight-bold mb-3">
              Faites-vous livrer en quelques minutes
            </h2>
            <p class="subheading mb-6">
              Connectez-vous pour retrouver vos adresses, vos restos favoris et votre panier en cours.
            </p>
          </div>
        </v-img>
      </v-col>

      <v-col cols="12" md="6" class="d-flex align-center justify-center">
        <v-container class="px-6 px-md-10">
          <v-card class="mx-auto elevation-12" max-width="480" outlined>
            <v-card-text class="pa-8">
              <div class="text-center mb-6">
                <v-avatar size="56" class="mb-3" color="deep-orange lighten-5">
                  <v-icon large color="deep-orange darken-2">mdi-food</v-icon>
                </v-avatar>
                <div class="headline font-weight-bold mb-1">Connexion</div>
                <div class="caption grey--text">
                  Accède à ton espace Uber Eats
                </div>
              </div>

              <v-form ref="form" v-model="isValid" @submit.prevent="onSubmit">
                <v-text-field
                  v-model="email"
                  label="Email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  prepend-inner-icon="mdi-email-outline"
                  autocomplete="email"
                  outlined
                  dense
                  class="mb-4"
                />
                <v-text-field
                  v-model="password"
                  :type="show ? 'text' : 'password'"
                  label="Mot de passe"
                  :append-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append="show = !show"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-lock-outline"
                  autocomplete="current-password"
                  outlined
                  dense
                  class="mb-2"
                />

                <div class="d-flex align-center justify-space-between mb-4">
                  <v-checkbox v-model="remember" label="Se souvenir de moi" dense hide-details />
                  <v-btn text small color="primary">Mot de passe oublié ?</v-btn>
                </div>

                <v-btn
                  type="submit"
                  block
                  color="deep-orange darken-2"
                  class="mb-4"
                  :loading="loading"
                  :disabled="loading"
                  large
                >
                  Se connecter
                </v-btn>

                <v-alert v-if="error" type="error" dense outlined class="mb-4">
                  {{ error }}
                </v-alert>

                <v-divider class="my-6"></v-divider>

                <v-btn block outlined class="mb-2" large>
                  <v-icon left>mdi-google</v-icon>
                  Continuer avec Google
                </v-btn>
                <v-btn block outlined large>
                  <v-icon left>mdi-apple</v-icon>
                  Continuer avec Apple
                </v-btn>
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-center pb-8">
              <span class="body-2 mr-1">Pas de compte ?</span>
              <v-btn text color="primary" small>Créer un compte</v-btn>
            </v-card-actions>
          </v-card>

          <div class="text-center mt-6 grey--text text--darken-1 caption">
            Protégé par reCAPTCHA — Conditions & Confidentialité
          </div>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: 'camille.martin@example.com',
      password: 'demo1234',
      remember: true,
      show: false,
      loading: false,
      error: '',
      isValid: false,
      rules: {
        required: value => (value ? true : 'Champ requis'),
        email: value => (/.+@.+\..+/.test(value) ? true : 'Email invalide'),
      },
    }
  },
  created() {
    if (this.$store.getters['auth/isAuthenticated']) {
      this.$router.replace(this.$route.query.redirect || '/')
    }
  },
  methods: {
    async onSubmit() {
      const valid = this.$refs.form.validate()
      if (!valid) return

      this.loading = true
      this.error = ''
      try {
        await this.$store.dispatch('auth/login', {
          email: this.email,
          password: this.password,
        })
        const redirect = this.$route.query.redirect || '/'
        this.$router.replace(redirect)
      } catch (err) {
        this.error =
          err?.message ||
          this.$store.state.auth.error ||
          'Échec de la connexion, réessaie.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-view {
  background: #fafafa;
}

.visual-column .v-image {
  border-radius: 0 16px 16px 0;
  overflow: hidden;
}

.hero-copy {
  height: 100%;
  padding: 80px 72px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>
