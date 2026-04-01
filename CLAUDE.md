# CLAUDE.md

## Package Manager

- This project uses `npm`.
- Use `npm ci --ignore-scripts` for installs that should respect the committed lockfile.
- Add dependencies with exact versions: `npm install --save-exact --ignore-scripts <package>`.
- Keep `package-lock.json` committed whenever dependencies change.

## Verification

- Run `npm run check` before committing changes that affect the app or dependencies.

## Secret Handling

- Do not read `.env` files or ask tools to print environment variables.
- Treat `.env.example` as the only safe template for configuration examples.
- If a secret value is needed, ask the user to provide or confirm it manually.

## Git Safety

- Do not use destructive git commands like `git reset --hard` or `git checkout --`.
- Do not force-push.
- Commit and push as separate deliberate steps.
