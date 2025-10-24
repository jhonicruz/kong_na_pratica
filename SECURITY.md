# Security Policy

- Keep this repository private unless you’ve reviewed all content for secrets.
- Never commit .env files or secrets; use .env.example as a template.
- Admin API of Kong is not exposed publicly; access it only from inside the Docker network:
  - Example: `docker compose exec kong curl -s http://localhost:8001/status | jq`
- To change Kong configuration, prefer editing `kong-config.sh` and running:
  - `docker compose up --no-deps --build kong-config`
- Update dependencies regularly (Dependabot enabled via `.github/dependabot.yml`).
- Use HTTPS in production and restrict access to admin interfaces.
- Review and rotate any credentials used in local development before publishing code.
