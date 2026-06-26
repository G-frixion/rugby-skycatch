# Rugby SkyCatch

> Jeu 2D d'attrape-ballons de rugby avec pipeline DevOps complet (CI/CD, Docker, tests, lint, stats).

---

## Regles du jeu

Attrape les ballons qui tombent du ciel avant qu'ils touchent le sol !

| Objet | Effet |
|---|---|
| Ballon normal | +1 point |
| Ballon dore | +5 points |
| Carton rouge | -1 vie si attrape, inoffensif si rate |
| Ballon normal rate | -1 vie |

- **Duree** : 60 secondes
- **Controles** : fleches gauche/droite ou Q/D
- **Difficulte** : augmente automatiquement toutes les 15 secondes

---

## Lancer le jeu

### Option 1 - Dans le navigateur (sans rien installer)

```
Ouvrir index.html directement dans le navigateur
```

### Option 2 - Via Docker (recommande)

```bash
git clone https://github.com/G-frixion/rugby-skycatch.git
cd rugby-skycatch
docker compose up --build
```

Puis ouvrir : http://localhost:8080

---

## Structure du projet

```
rugby-skycatch/
├── index.html                 # Jeu complet
├── src/game.js                # Logique pure du jeu (testable)
├── tests/game.test.js         # 40 tests unitaires Jest
├── stats/index.html           # Page de statistiques
├── Dockerfile                 # Image Nginx
├── docker-compose.yml         # Orchestration
├── package.json               # Dependances npm
├── .eslintrc.json             # Config ESLint
├── README.md
└── .github/workflows/ci.yml  # Pipeline CI/CD
```

---

## Tests et qualite

```bash
npm install
npm test       # 40 tests Jest, couverture 92%
npm run lint   # ESLint
```

---

## Pipeline CI/CD

Le pipeline GitHub Actions se declenche a chaque push :

1. **Lint + Tests unitaires** : ESLint + Jest (40 tests)
2. **Build Docker + Integration** : construction image + tests HTTP

---

## Page de statistiques

Accessible a http://localhost:8080/stats

- Nombre de parties jouees
- Meilleur score
- Score moyen
- Taux de reussite
- Historique des 10 dernieres parties

---

## Logs applicatifs

```
GAME_START
GAME_END score=14 caught=14 missed=3
```

Accessibles via : `docker logs rugby-skycatch -f`
