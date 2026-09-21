alter table public.messages
add column if not exists sender_name text;

alter table public.messages
add column if not exists recipient_email text;

drop policy if exists "Allow public recipient email updates" on public.messages;

create policy "Allow public recipient email updates"
on public.messages
for update
to anon, authenticated
using (true)
with check (true);

grant update (recipient_email) on public.messages to anon, authenticated;