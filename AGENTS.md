<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (SARTAJ)
- Public catalogue reads go through `src/lib/catalog.functions.ts` server functions using the anon client in `supabase-public.server.ts` (dynamic import inside handlers), so pages SSR with SEO data.
- Enquiries are written only by the `submitEnquiry` server function (validation, honeypot, timing and per-phone rate limit), never directly from the browser; anon has no insert grant on `enquiries`.
- Admin CRUD uses the browser client directly; table RLS (`has_role(auth.uid(),'admin')`) is the security boundary. The first auth user becomes admin via a trigger.
- The `media` bucket is private (workspace blocks public buckets); uploads store a 10-year signed URL in the row.
- Enquiry email notifications are not wired yet: they need a verified sender domain, then a fixed template sent from `submitEnquiry`.
- Product prices must never exist in the schema or UI.
- On phones, contact shortcuts live in a fixed bottom bar (FloatingActions) with a matching spacer after the footer in __root; floating round buttons are md+ only, so nothing covers page content on small screens.
- The homepage 3D machine (`src/components/home/machine3d/scene.ts`) is plain three.js, dynamically imported when its section nears the viewport and paused off-screen; wheel zoom is off so it never hijacks page scroll.
