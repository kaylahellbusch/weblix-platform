-- Optional content; existing business records are unchanged.
create function public.valid_website_content(document jsonb)
returns boolean
language plpgsql immutable strict
set search_path = ''
as $$
declare
  item jsonb;
  field text;
  trim_chars text := U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
begin
  if jsonb_typeof(document) <> 'object' or
     document - array['headline', 'introduction', 'services', 'serviceAreas'] <> '{}'::jsonb then
    return false;
  end if;
  foreach field in array array['headline', 'introduction'] loop
    if document ? field and (jsonb_typeof(document->field) <> 'string' or
      length(regexp_replace(document->>field, U&'[\+010000-\+10FFFF]', 'xx', 'g')) > (case when field = 'headline' then 160 else 2000 end)) then
      return false;
    end if;
  end loop;
  if document ? 'services' then
    if jsonb_typeof(document->'services') <> 'array' then return false; end if;
    if jsonb_array_length(document->'services') > 20 then return false; end if;
    for item in select value from jsonb_array_elements(document->'services') loop
      if jsonb_typeof(item) <> 'object' or item - array['title', 'description'] <> '{}'::jsonb
        or not (item ?& array['title', 'description']) then return false; end if;
      foreach field in array array['title', 'description'] loop
        if jsonb_typeof(item->field) <> 'string' or length(btrim(item->>field, trim_chars)) = 0 or
          length(regexp_replace(item->>field, U&'[\+010000-\+10FFFF]', 'xx', 'g')) > (case when field = 'title' then 120 else 1000 end) then
          return false;
        end if;
      end loop;
    end loop;
  end if;
  if document ? 'serviceAreas' then
    if jsonb_typeof(document->'serviceAreas') <> 'array' then return false; end if;
    if jsonb_array_length(document->'serviceAreas') > 50 then return false; end if;
    for item in select value from jsonb_array_elements(document->'serviceAreas') loop
      if jsonb_typeof(item) <> 'string' or length(btrim(item #>> '{}', trim_chars)) = 0 or
        length(regexp_replace(item #>> '{}', U&'[\+010000-\+10FFFF]', 'xx', 'g')) > 120 then return false; end if;
    end loop;
  end if;
  return true;
end;
$$;

create table public.website_content (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  content jsonb not null check (public.valid_website_content(content))
);

revoke all on public.website_content from public, anon;
grant select, insert, update, delete on public.website_content to authenticated;
alter table public.website_content enable row level security;
alter table public.website_content force row level security;

-- Both the old and new parent must belong to the authenticated user on UPDATE.
create policy "Owners manage business website content"
on public.website_content for all to authenticated
using (exists (select 1 from public.businesses b
  where b.id = business_id and b.owner_id = (select auth.uid())))
with check (exists (select 1 from public.businesses b
  where b.id = business_id and b.owner_id = (select auth.uid())));
