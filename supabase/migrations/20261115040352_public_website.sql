-- Deliberately narrow anonymous API. Table RLS and grants stay unchanged.
-- A definer is necessary to read published rows without granting table access.
create function public.read_public_website(site_subdomain text)
returns table (
  name text, industry text, phone text, email text, website text, city text, state text,
  content jsonb
)
language sql stable security definer
set search_path = ''
as $$
  select b.name, b.industry, b.phone, b.email, b.website, b.city, b.state,
    coalesce(w.content, '{}'::jsonb)
  from public.businesses b
  left join public.website_content w on w.business_id = b.id
  where b.subdomain = site_subdomain and b.published = true;
$$;
revoke all on function public.read_public_website(text) from public;
grant execute on function public.read_public_website(text) to anon, authenticated;
