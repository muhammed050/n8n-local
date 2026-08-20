# WHO ARE YOU? — Viral Character Battle

Social-first, serverless monster battle MVP on `game-test`.

## Core loop

1. Create a ridiculous monster in seconds.
2. Get deterministic stats, rarity and lore.
3. Create a live Supabase Realtime battle.
4. Share a challenge URL.
5. Friend opens the dedicated challenge screen and accepts.
6. Battle result is computed and integrity-checked by a Postgres trigger.
7. Win streak + leaderboard + fusion + collection create the replay loop.

## Serverless architecture

- Static frontend: HTML/CSS/vanilla JavaScript.
- Database + Realtime: Supabase.
- No VPS, Node server, Railway or custom backend.
- Only the Supabase publishable/anon key belongs in runtime configuration; never commit `service_role` credentials.
- Local player identity is a UUID stored in `localStorage` until authentication is intentionally added.

## Current features

- Live friend battles
- Dedicated challenge links
- Deterministic battle calculation
- Postgres trigger hardening for finished battle winners
- RLS on battle/stat tables
- Daily + all-time leaderboard
- Local monster collection
- Win streaks
- Fusion
- Share flow
- PWA manifest + offline app shell
- Responsive mobile UI

## Launch checklist

1. Add the Supabase publishable key to runtime config/hosting.
2. Enable Realtime for `public.game_battles` if it is not already enabled.
3. Open the site on two devices and test create → share → accept → battle → save.
4. Verify the leaderboard after a finished battle.
5. Install the PWA on mobile and test reload/offline shell.

## Security note

Battle winner selection is recalculated in PostgreSQL on transition to `finished`; the client cannot choose an arbitrary winner through the normal update path. Player stats are intentionally lightweight because the current product has no accounts. If competitive rankings become monetized, add authenticated player identities and server-side stat aggregation before launch.