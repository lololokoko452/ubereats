# Déploiement – UberEats Clone

Ce document décrit le pipeline d’intégration et de déploiement continu, les secrets nécessaires, les opérations manuelles éventuelles et la marche à suivre pour déclencher ou annuler un déploiement.

## 1. Processus de déploiement automatisé

### 1.1 Intégration continue (`.github/workflows/ci.yml`)
- **Déclencheurs** : `push` et `pull_request` sur `master` et `develop`.
- **Jobs** :
  - `lint` : installe les dépendances client/server, lance les linters.
  - `test-backend` : provisionne MongoDB (service Docker), exécute `npm test` dans `server/`.
  - `test-frontend` : exécute les tests du client Vue.
  - `security-audit` : lance `npm audit` (client + server, en warning-only).
  - `build-frontend` : construit le front (`npm run build`) après réussite des tests.

### 1.2 Déploiement staging (`.github/workflows/staging.yml`)
- **Déclencheur** : `push` sur `develop`.
- **Environnement** : `staging`.
- **Étapes clés** :
  1. Validation : lint, tests (backend/frontend) et build front avec `VUE_APP_API_URL` staging.
  2. Déploiement : réinstallation des dépendances, export des secrets (`STAGING_JWT_SECRET`, `STAGING_MONGO_URI`, etc.), exécution des migrations (`npm run migrate`) en mode dry-run par défaut.
  3. Health check optionnel via `STAGING_HEALTHCHECK_URL`.
  4. Notification Slack si `SLACK_WEBHOOK_URL` est défini.

### 1.3 Déploiement production (`.github/workflows/deploy.yml`)
- **Déclencheur** : `push` sur `master`.
- **Environnement** : `production`.
- **Étapes clés** :
  1. Job `validate` identique à celui de staging.
  2. Job `deploy` : export des secrets prod, migrations (mode dry-run par défaut si le secret n’est pas positionné), health check via `PROD_HEALTHCHECK_URL`, notification Slack.

### 1.4 Plateforme Railway
- Le backend est hébergé dans un service Railway configuré avec **Builder : Nixpacks (Auto)** et **Root Directory : `server`**.
- Les variables d’environnement Railway doivent refléter celles décrites ci-dessous (`MONGODB_URI`, `JWT_SECRET`, etc.).
- Le serveur démarre via `npm run start` dans `server/`.

## 2. Secrets et variables d’environnement

| Secret | Utilisation | Où le définir |
| --- | --- | --- |
| `STAGING_API_URL` | URL de l’API utilisée par le build front staging | GitHub env `staging` |
| `STAGING_JWT_SECRET` | Secret JWT backend staging | GitHub env `staging` + Railway staging |
| `STAGING_MONGO_URI` | URI MongoDB staging (également `MONGODB_URI` côté Railway) | GitHub env `staging` + Railway staging |
| `MIGRATION_DRY_RUN_STAGING` | Mettre `false` pour exécuter réellement les migrations en staging | GitHub env `staging` |
| `STAGING_HEALTHCHECK_URL` | URL de health check staging | GitHub env `staging` |
| `PROD_API_URL` | URL API injectée dans le build front production | GitHub env `production` |
| `JWT_SECRET_PROD` | Secret JWT backend production | GitHub env `production` + Railway production |
| `MONGO_URI_PROD` | URI MongoDB production (dupliquer en `MONGODB_URI` sur Railway) | GitHub env `production` + Railway production |
| `MIGRATION_DRY_RUN_PROD` | Mettre `false` pour exécuter réellement les migrations en production | GitHub env `production` |
| `PROD_HEALTHCHECK_URL` | URL de health check production | GitHub env `production` |
| `SLACK_WEBHOOK_URL` | (Optionnel) Webhook Slack pour notifications | GitHub env `staging` & `production` |

> ⚠️ GitHub Actions : ajouter les secrets dans **Settings → Environments → staging/production** (ou au niveau global si pas d’environnement).  
> ⚠️ Railway : dupliquer `MONGODB_URI` et `MONGO_URI` si le code lit les deux, et vérifier `JWT_SECRET`, `PORT`, `DEFAULT_CITY`.

## 3. Étapes manuelles

- **Railway** : vérifier après chaque déploiement que le service est sur la bonne branche, que le build est “Healthy” et que les logs ne contiennent pas d’erreur.  
- **Migrations** : si `MIGRATION_DRY_RUN_*` est à `true`, lancer manuellement `npm run migrate` via `railway run` ou via un shell connecté au service quand on veut appliquer réellement les migrations.  
- **Secrets** : tenir à jour les secrets dès qu’un nouveau besoin apparaît (ex : nouvelle variable d’environnement backend).

## 4. Déclencher un déploiement manuel

1. **Via GitHub** : effectuer un push sur `develop` (staging) ou `master` (production).  
2. **Relancer un workflow** : GitHub Actions → sélectionner le workflow (`Staging Deploy` ou `Deploy`) → `Re-run job`.  
3. **Railway** : si besoin d’un restart sans nouveau build, utiliser `railway redeploy` ou le bouton “Restart” dans l’UI (ne reconstruit pas, relance uniquement le dernier build).

## 5. Rollback

1. Identifier le commit sain (via GitHub Actions logs ou GitHub Releases si présents).  
2. **Revert Git** : `git revert <commit>` puis push sur la branche concernée (`develop` pour staging, `master` pour prod) afin de déclencher un nouveau déploiement avec l’ancien état.  
3. **Railway** : en cas d’urgence, redéployer un build précédent depuis l’onglet “Deployments” (sélectionner un déploiement “Healthy” → `Redeploy`).  
4. Vérifier les logs et health checks, puis mettre à jour ce document si la procédure évolue.

---

Pour toute nouvelle exigence (nouveau service, changement de variable), mettre à jour ce `DEPLOYMENT.md` ainsi que les workflows GitHub et la configuration Railway correspondante.
