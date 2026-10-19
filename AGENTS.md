<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Data access goes through the browser Supabase client under the `_authenticated` (ssr:false) layout; ownership is enforced only by existing RLS/triggers — why: the schema is user-managed and must not be changed from the app.
- Never send `user_id` or scenario snapshot fields when inserting explorations — why: DB defaults and trigger own them.

- Localization uses a shared translation dictionary and root language context; keep browser preference changes separate from form state and database writes to preserve user content.
- Render scenario and historical snapshot text through language-specific field selection; never replace missing historical text with live library content.
