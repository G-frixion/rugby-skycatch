# 🏉 Rugby SkyCatch

> Jeu 2D d'attrape-ballons de rugby avec pipeline DevOps complet.

![CI/CD](https://img.shields.io/github/actions/workflow/status/VOTRE_USER/rugby-skycatch/ci.yml?label=CI%2FCD)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎮 Le jeu

Attrape les ballons de rugby qui tombent du ciel avant qu'ils touchent le sol !

| Objet | Effet |
|---|---|
| 🏉 Ballon normal | +1 point |
| 🥇 Ballon doré | +5 points |
| 🟥 Carton rouge | -1 vie si attrapé |
| 💨 Ballon raté | -1 vie |

- **Durée** : 60 secondes par partie
- **Contrôles** : `←` `→` ou `Q` `D`
- **Difficulté** : augmente toutes les 15 secondes
- **Statistiques** : score, meilleur score, historique des parties (stockés en local)

---

## 🚀 Lancer le jeu

### Option 1 – Directement dans le navigateur

```bash
# Ouvrir simplement le fichier
open index.html
# ou double-cliquer dessus dans votre explorateur
```

### Option 2 – Via Docker (recommandé)

**Prérequis :** Docker + Docker Compose installés.

```bash
# Cloner le projet
git clone https://github.com/VOTRE_USER/rugby-skycatch.git
cd rugby-skycatch

# Lancer le conteneur
docker compose up --build

# Accéder au jeu
open http://localhost:8080
```

**Variables d'environnement disponibles :**

```bash
PORT=8080   # Port d'écoute (défaut : 8080)
DEBUG=false # Mode debug (défaut : false)
```

Exemple avec port personnalisé :

```bash
PORT=3000 docker compose up --build
```

### Option 3 – Image Docker Hub

```bash
docker pull VOTRE_USER/rugby-skycatch:latest
docker run -d -p 8080:80 VOTRE_USER/rugby-skycatch:latest
```

---

## 🔧 Développement

### Structure du projet

```
rugby-skycatch/
├── index.html                  # Jeu complet (HTML + CSS + JS en un fichier)
├── Dockerfile                  # Image Docker Nginx
├── nginx.conf                  # Configuration Nginx
├── docker-compose.yml          # Orchestration locale
├── README.md                   # Cette documentation
└── .github/
    └── workflows/
        └── ci.yml              # Pipeline CI/CD GitHub Actions
```

### Lancer en local sans Docker

```bash
# Python (si installé)
python3 -m http.server 8080
# puis ouvrir http://localhost:8080

# Node (si installé)
npx serve .
```

---

## 🔄 Pipeline CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute automatiquement à chaque push ou Pull Request.

### Schéma du pipeline

```
Push / PR
    │
    ▼
┌─────────────────────────┐
│  JOB 1 : Qualité        │
│  • Fichiers présents    │
│  • Syntaxe HTML         │
│  • Dockerfile valide    │
│  • docker-compose valide│
└────────────┬────────────┘
             │ ✅
             ▼
┌─────────────────────────┐
│  JOB 2 : Build Docker   │
│  • docker build         │
│  • démarrage conteneur  │
│  • test /health         │
│  • test page principale │
└────────────┬────────────┘
             │ ✅ (sur main uniquement)
             ▼
┌─────────────────────────┐
│  JOB 3 : Déploiement    │
│  • push Docker Hub      │
│  • SSH → serveur        │
│  • docker compose up    │
└─────────────────────────┘
```

### Branches et workflow Git

```
main          ← branche protégée, déploiement auto
develop       ← intégration
feature/xxx   ← nouvelles fonctionnalités
```

Workflow recommandé :
1. Créer une branche `feature/ma-fonctionnalite`
2. Développer + committer
3. Ouvrir une Pull Request vers `main`
4. La CI doit passer ✅ avant le merge
5. Après merge → déploiement automatique

---

## 🐳 Docker

### Build manuel

```bash
docker build -t rugby-skycatch .
docker run -p 8080:80 rugby-skycatch
```

### Commandes utiles

```bash
# Voir les logs
docker logs rugby-skycatch -f

# Inspecter l'état
docker ps

# Arrêter
docker compose down

# Rebuilder après modification
docker compose up --build
```

### Logs applicatifs

Le jeu émet des logs dans la console du navigateur (DevTools) :

```
GAME_START
GAME_END score=14 caught=14 missed=3
```

Nginx redirige ses logs vers `stdout`/`stderr` → accessibles via `docker logs rugby-skycatch`.

---

## 📊 Endpoint de stats

Accessible via le bouton **📊 Stats** dans l'interface du jeu.

Données stockées localement (localStorage) :
- Nombre de parties jouées
- Meilleur score
- Total ballons attrapés / ratés
- Taux de réussite
- Historique des 10 dernières parties

---

## 🔐 Secrets GitHub requis (pour le déploiement)

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Votre identifiant Docker Hub |
| `DOCKERHUB_TOKEN` | Token d'accès Docker Hub |
| `SERVER_IP` | IP du serveur de déploiement |
| `SERVER_USER` | Utilisateur SSH du serveur |
| `SSH_KEY` | Clé privée SSH (RSA ou Ed25519) |

À configurer dans : **GitHub → Settings → Secrets and variables → Actions**

---

## 📋 Checklist DevOps

- [x] Git workflow (branches feature/develop/main)
- [x] CI : validation qualité + tests
- [x] CI : build Docker + tests d'intégration
- [x] CD : push Docker Hub + déploiement SSH
- [x] Dockerfile avec healthcheck
- [x] docker-compose.yml avec variables d'environnement
- [x] Logs applicatifs (GAME_START / GAME_END)
- [x] Page de statistiques
- [x] Documentation complète

---

## 📝 Licence

MIT — Projet pédagogique DevOps M1.
