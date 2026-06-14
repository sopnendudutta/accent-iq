# AccentIQ V2 Merge Checklist

## Branches

- Source branch: dev
- Target branch: main

## Required checks before merge

- [ ] `git status` clean on dev
- [ ] Backend build passes
- [ ] Frontend build passes
- [ ] Prisma schema validates
- [ ] Production secrets are not committed
- [ ] `.env` is not committed
- [ ] V1 guest pronunciation still works
- [ ] V1 auth still works
- [ ] V1 history still works
- [ ] V1 favorites still work
- [ ] V1 preferences still work
- [ ] V1 light/dark mode still works
- [ ] V2 AI works locally
- [ ] V2 AI fallback works locally
- [ ] V2 AI works on Render
- [ ] More accents work
- [ ] Dashboard works
- [ ] Home UI works
- [ ] Pronunciation UI works
- [ ] Mobile layout works
- [ ] Dark mode works
- [ ] Vercel deployment/preview works
- [ ] Render backend works

## Production environment requirements

Render backend must include:

```env
PRONUNCIATION_ENGINE=ai
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=<real key>
```

If Prisma migrations exist, production must run:

```txt
npx prisma migrate deploy
```

## Merge rule

Do not merge if:

- backend build fails
- frontend build fails
- Prisma validation fails
- secrets are exposed
- production AI fails without fallback
- V1 core features are broken
- mobile layout is broken

## Post-merge steps

After PR merge from dev to main:

```powershell
git checkout main
git pull origin main
git checkout dev
git pull origin dev
git merge main
git push origin dev
```

Then verify:

- Vercel production deploy succeeds
- Render backend deploy succeeds
- live site works
