begin;
create extension if not exists pgtap with schema extensions;
select plan(9);
insert into auth.users (id, email) values ('72000000-0000-4000-8000-000000000001', 'private-account@example.test');
insert into public.businesses (id, owner_id, name, subdomain, published, email) values
 ('72000000-0000-4000-8000-000000000011', '72000000-0000-4000-8000-000000000001', 'Public Roofing', 'public-roof', true, 'contact@example.test'),
 ('72000000-0000-4000-8000-000000000012', '72000000-0000-4000-8000-000000000001', 'Private Roofing', 'private-roof', false, 'hidden@example.test');
insert into public.website_content values
 ('72000000-0000-4000-8000-000000000011', '{"headline":"Public headline"}'),
 ('72000000-0000-4000-8000-000000000012', '{"headline":"Private headline"}');
set local role anon;
select is((select count(*)::int from public.read_public_website('public-roof')), 1, 'Anon can read published site');
select is((select email from public.read_public_website('public-roof')), 'contact@example.test', 'Business contact email is public');
select is((select content from public.read_public_website('public-roof')), '{"headline":"Public headline"}'::jsonb, 'Preview content is public');
select is((select array_agg(key order by key) from public.read_public_website('public-roof') r, jsonb_object_keys(to_jsonb(r)) key), array['city','content','email','industry','name','phone','state','website']::text[], 'Exactly preview fields; no IDs, account email, timestamps or publishing metadata');
select is((select count(*)::int from public.read_public_website('private-roof')), 0, 'Unpublished data hidden');
select is((select count(*)::int from public.read_public_website('unknown-roof')), 0, 'Unknown site empty');
select is((select count(*)::int from public.businesses), 0, 'Direct business reads still blocked');
select throws_ok($$select * from public.website_content$$, '42501', null, 'Direct content reads still blocked');
reset role;
update public.businesses set published = false where subdomain = 'public-roof';
set local role anon;
select is((select count(*)::int from public.read_public_website('public-roof')), 0, 'Unpublishing takes effect immediately');
select * from finish();
rollback;
