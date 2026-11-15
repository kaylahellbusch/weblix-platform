-- Existing rows receive NULL / false; owner policies remain unchanged.
alter table public.businesses
  add column subdomain text unique,
  add column published boolean not null default false,
  add constraint businesses_subdomain_format check (
    subdomain is null or (
      char_length(subdomain) between 3 and 40
      and subdomain ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and subdomain not in ('www', 'admin', 'app', 'api', 'mail', 'preview')
    )
  ),
  add constraint businesses_published_subdomain check (not published or subdomain is not null);
