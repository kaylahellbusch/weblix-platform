begin;
create extension if not exists pgtap with schema extensions;
select plan(15);
insert into auth.users (id) values
 ('71000000-0000-4000-8000-000000000001'),
 ('71000000-0000-4000-8000-000000000002');
insert into public.businesses (id, owner_id, name) values
 ('71000000-0000-4000-8000-000000000011', '71000000-0000-4000-8000-000000000001', 'Publishing Example'),
 ('71000000-0000-4000-8000-000000000012', '71000000-0000-4000-8000-000000000002', 'Other Publishing Example');
select col_type_is('public', 'businesses', 'subdomain', 'text', 'Nullable subdomain is text');
select col_type_is('public', 'businesses', 'published', 'boolean', 'Published is boolean');
select col_not_null('public', 'businesses', 'published', 'Published cannot be null');
select is((select published from public.businesses where id = '71000000-0000-4000-8000-000000000011'), false, 'Defaults to unpublished');
select is((select subdomain from public.businesses where id = '71000000-0000-4000-8000-000000000011'), null::text, 'Defaults to no subdomain');
set local role authenticated;
select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000001', true);
select lives_ok($$update public.businesses set subdomain = 'example-roof', published = true where id = '71000000-0000-4000-8000-000000000011'$$, 'Owner can publish');
select is((select published from public.businesses where id = '71000000-0000-4000-8000-000000000011'), true, 'Publishing persisted');
select throws_ok($$update public.businesses set subdomain = 'bad--name' where id = '71000000-0000-4000-8000-000000000011'$$, '23514', null, 'Reject invalid subdomain');
select throws_ok($$update public.businesses set subdomain = 'www' where id = '71000000-0000-4000-8000-000000000011'$$, '23514', null, 'Reject reserved subdomain');
select throws_ok($$update public.businesses set subdomain = null where id = '71000000-0000-4000-8000-000000000011'$$, '23514', null, 'Publishing requires subdomain');
select is((select count(*)::int from public.businesses where id = '71000000-0000-4000-8000-000000000012'), 0, 'Other owner remains invisible');
select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000002', true);
select throws_ok($$update public.businesses set name = 'Must not save', subdomain = 'example-roof', published = true where id = '71000000-0000-4000-8000-000000000012'$$, '23505', null, 'Uniqueness holds across owners');
select is((select name from public.businesses where id = '71000000-0000-4000-8000-000000000012'), 'Other Publishing Example', 'Duplicate rejects whole update');
update public.businesses set subdomain = 'stolen', published = false where id = '71000000-0000-4000-8000-000000000011';
reset role;
select is((select subdomain from public.businesses where id = '71000000-0000-4000-8000-000000000011'), 'example-roof', 'Cross-owner update blocked');
set local role anon;
select is((select count(*)::int from public.businesses where subdomain = 'example-roof'), 0, 'Published does not grant anonymous access');
select * from finish();
rollback;
