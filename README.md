# TeamBrain

AI knowledge assistant for teams: employees ask questions, TeamBrain answers from the company's documents with clickable sources and says honestly when the answer is not in the documents. Details: [docs/APP_IDEA.md](docs/APP_IDEA.md), [docs/TECH_STACK.md](docs/TECH_STACK.md).

## Getting Started

```bash
cp backend/.env.example backend/.env      # add API keys (ANTHROPIC_API_KEY, TEST_ANTHROPIC_API_KEY, VOYAGE_API_KEY)
cp frontend/.env.example frontend/.env
docker compose build
docker compose run --rm app composer install
docker compose run --rm app php artisan key:generate
docker compose up -d
docker compose exec app php artisan migrate --seed
```

| Service | URL |
| --- | --- |
| SPA (via nginx) | http://localhost |
| API | http://localhost/api/v1 |
| API docs (Scramble) | http://localhost/docs/api |
| Horizon | http://localhost/horizon |
| Reverb (WebSockets) | ws://localhost:8080 |
| Vite directly | http://localhost:5173 |
| PostgreSQL / Redis | localhost:5432 / localhost:6379 |

## Demo Accounts

`migrate --seed` creates one account per role, all with the password `password`. New registrations always get the role `employee`.

| Email | Role |
| --- | --- |
| admin@teambrain.test | admin |
| hr@teambrain.test | collection_admin |
| employee@teambrain.test | employee |

## Models

| Task | Model | Effort |
| --- | --- | --- |
| Chat and simple questions | Claude Haiku 5.5 | low |
| Multi-step search (agent) | Claude Sonnet 5.5 | high |
| Eval judge | GLM 5.3 via z.ai (Anthropic-compatible API) | high |

The eval judge is deliberately a different model than the agent, so the agent never grades its own answers. All models are configured in `backend/.env` and `backend/config/services.php`.

## Containers

`app` (php-fpm), `horizon` (queue worker) and `reverb` (WebSockets) share the image from `docker/php/Dockerfile` (PHP 8.4). `frontend` runs the Vite dev server; `nginx` routes `/api`, `/broadcasting`, `/horizon` and `/docs` to Laravel and everything else to Vite. `postgres` uses the pgvector image; on first start it also creates the `teambrain_testing` database for Pest. With an existing volume, create it once: `docker compose exec -T postgres psql -U teambrain -d teambrain < docker/postgres/create-testing-database.sql`.

The PHP containers run as UID/GID 1000; if your host user differs, build with `UID=$(id -u) GID=$(id -g) docker compose build`.

## Tooling

```bash
docker compose exec app ./vendor/bin/pest       # backend tests (database teambrain_testing)
docker compose exec app ./vendor/bin/pint       # code style
docker compose exec app ./vendor/bin/phpstan    # Larastan
docker compose exec frontend npm run test:unit  # Vitest
docker compose exec frontend npm run lint       # ESLint + Oxlint
```

## Security

The bearer token is stored in `localStorage` and can be read via XSS. Mitigations: short expiry (`SANCTUM_EXPIRATION`), logout revokes the token, and model answers are never rendered unsanitized via `v-html`. API keys live only in `backend/.env`, which is not committed.
