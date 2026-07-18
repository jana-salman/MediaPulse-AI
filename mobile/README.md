# MediaPulse AI — Mobile App (Phase 2, Person B)

React Native + Expo app that talks to Person A's FastAPI backend and to
Supabase Auth directly.

## What's built

- **Login** — Supabase Auth (sign up / sign in)
- **Business Setup** — create a new business profile or connect to an
  existing one by ID (not in the original screen list, but needed as a
  bridge since the backend has no "list my businesses" endpoint — see note
  below)
- **Add Comments** — paste one comment per line (analyzed one at a time
  against `POST /comments/analyze`), plus optional CSV upload
- **Comments List** — cards labeled with sentiment · category · urgency
- **Comment Detail** — full analysis, suggested reply, "Generate grounded
  reply" (RAG), sources shown, copy-to-clipboard
- **Business Knowledge** — add/view policy documents (`POST /documents`)
- **Dashboard** — sentiment/urgency stats computed from live comments, plus
  AI insight generation and history

## 1. Install dependencies

From inside `mobile/`:

```powershell
npm install
```

## 2. Configure environment variables

```powershell
copy .env.example .env
```

Fill in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` — same
  Supabase project as the backend. Get these from Supabase Dashboard >
  Project Settings > API. **Use the `anon` `public` key, never the
  secret/service-role key** — anything in the mobile app can be extracted
  from the device, so the secret key must stay only in `backend/.env`.
- `EXPO_PUBLIC_API_URL` — the FastAPI backend:
  - iOS Simulator: `http://127.0.0.1:8000`
  - Physical phone on the same Wi-Fi: `http://<your-computer-IPv4>:8000`
    (run the backend with `--host 0.0.0.0`, get your IP with `ipconfig`)

## 3. Run the backend (Person A's part) alongside this

```powershell
cd ../backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0
```

## 4. Start the app

```powershell
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator.

## Design note: Business Setup screen

The API reference only has `POST /businesses` and `GET /businesses/{id}` —
there's no endpoint to list businesses for a logged-in user, and Supabase
Auth is separate from the `businesses` table in the schema Person A built.
So after login, the app needs *some* business to attach comments to.

I added a lightweight **Business Setup** screen: create a new business
(stores the returned `id` on-device) or paste in an existing business ID a
teammate already created (e.g. the "Sweet Corner Bakery" demo business).
Once set, the ID is remembered on that device via `AsyncStorage`, so this
only appears once per install. If Person C is seeding the real demo data,
they should share that business's ID with whoever else needs to see the
same data on their phone.

If a proper "my businesses" flow turns out to be needed, that's a small
backend addition (`GET /businesses` filtered by an auth user id) — flagging
it rather than changing backend code without checking in first, per the
"don't modify the backend" rule.

## Testing checklist before merging to `main`

- [ ] Sign up, sign in, sign out
- [ ] Create a business, confirm it persists across app restarts
- [ ] Paste 2–3 comments, confirm each gets sentiment/category/urgency
- [ ] Open a comment, generate a grounded reply, confirm source shows,
      confirm copy button works
- [ ] Add a policy document, confirm it appears in the list
- [ ] Dashboard stats update after adding comments
- [ ] Generate an insight, confirm it appears in insight history
