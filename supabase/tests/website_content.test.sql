-- Run only against a disposable local Supabase database. All fixtures roll back.
begin;
create extension if not exists pgtap with schema extensions;
select plan(29);
insert into auth.users (id) values
  ('22000000-0000-4000-8000-000000000001'),
  ('22000000-0000-4000-8000-000000000002');
insert into public.businesses (id, owner_id, name) values
  ('22000000-0000-4000-8000-000000000011', '22000000-0000-4000-8000-000000000001', 'Example Owner Roofing'),
  ('22000000-0000-4000-8000-000000000012', '22000000-0000-4000-8000-000000000002', 'Example Other Roofing');
set local role authenticated;
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000001', true);
select is((select count(*)::int from public.website_content), 0, 'Existing businesses need no content');
select lives_ok($$insert into public.website_content values ('22000000-0000-4000-8000-000000000011', '{"headline":"Example","introduction":"Local synthetic content","services":[{"title":"B","description":"Repair"},{"title":"A","description":"Replace"}],"serviceAreas":["B","A"]}')$$, 'Owner inserts all sections');
select is((select content->'serviceAreas' from public.website_content), '["B","A"]'::jsonb, 'Area order persists');
select is((select content->'services'->0->>'title' from public.website_content), 'B', 'Service order persists');
select lives_ok($$insert into public.website_content values ('22000000-0000-4000-8000-000000000011', '{"headline":"Updated"}') on conflict (business_id) do update set content = excluded.content$$, 'Repeated save replaces the document');
select is((select count(*)::int from public.website_content), 1, 'One content record per business');
select is((select content from public.website_content), '{"headline":"Updated"}'::jsonb, 'Whole-document replacement clears old lists');
select throws_ok($$update public.website_content set content = '{"theme":"unknown"}'$$, '23514', null, 'Unknown fields rejected');
select throws_ok($$update public.website_content set content = '{"services":[{"title":"X","description":"Y","price":1}]}'$$, '23514', null, 'Unknown service fields rejected');
select throws_ok($$update public.website_content set content = jsonb_build_object('headline', repeat('x',161))$$, '23514', null, 'Oversized headline rejected');
select throws_ok($$update public.website_content set content = jsonb_build_object('headline', repeat('😀',81))$$, '23514', null, 'UTF-16 headline bound matches contract');
select throws_ok($$update public.website_content set content = jsonb_build_object('introduction', repeat('x',2001))$$, '23514', null, 'Oversized introduction rejected');
select throws_ok($$update public.website_content set content = jsonb_build_object('services', (select jsonb_agg(jsonb_build_object('title','X','description','Y')) from generate_series(1,21)))$$, '23514', null, 'Oversized service list rejected');
select throws_ok($$update public.website_content set content = jsonb_build_object('serviceAreas', (select jsonb_agg('X'::text) from generate_series(1,51)))$$, '23514', null, 'Oversized area list rejected');
select throws_ok($$update public.website_content set content = '{"services":[{"title":"\t","description":"Y"}]}'$$, '23514', null, 'Whitespace-only required text rejected');
select throws_ok($$update public.website_content set content = '{"serviceAreas":[null]}'$$, '23514', null, 'Null areas rejected');
select throws_ok($$update public.website_content set content = '{"services":{}}'$$, '23514', null, 'Wrong list type rejected');
select throws_ok($$update public.website_content set business_id = '22000000-0000-4000-8000-000000000012'$$, '42501', null, 'Reassignment to other owner denied');
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000002', true);
select is((select count(*)::int from public.website_content), 0, 'Other owner cannot select content');
select throws_ok($$insert into public.website_content values ('22000000-0000-4000-8000-000000000011', '{}')$$, '42501', null, 'Other owner cannot insert content');
with updated as (update public.website_content set content = '{}' returning business_id) select is((select count(*)::int from updated), 0, 'Other owner cannot update');
with deleted as (delete from public.website_content returning business_id) select is((select count(*)::int from deleted), 0, 'Other owner cannot delete');
select set_config('request.jwt.claim.sub', '22000000-0000-4000-8000-000000000001', true);
select is((select content from public.website_content), '{"headline":"Updated"}'::jsonb, 'Denied mutations leave owner content unchanged');
select lives_ok($$update public.website_content set content = '{}'$$, 'Owner can clear every optional section');
select lives_ok($$delete from public.website_content$$, 'Owner can delete content');
insert into public.website_content values ('22000000-0000-4000-8000-000000000011', '{}');
delete from public.businesses where id = '22000000-0000-4000-8000-000000000011';
reset role;
select is((select count(*)::int from public.website_content), 0, 'Business deletion cascades (checked without RLS filtering)');
select is((select name from public.businesses where id = '22000000-0000-4000-8000-000000000012'), 'Example Other Roofing', 'Unrelated business remains unchanged');
set local role anon;
select throws_ok($$select * from public.website_content$$, '42501', null, 'Anonymous read denied');
select throws_ok($$insert into public.website_content values ('22000000-0000-4000-8000-000000000012', '{}')$$, '42501', null, 'Anonymous write denied');
reset role;
select * from finish();
rollback;
