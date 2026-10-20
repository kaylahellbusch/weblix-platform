-- Disposable local database only. Fixtures and induced failure trigger roll back.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);
insert into auth.users(id) values ('23000000-0000-4000-8000-000000000001');
create function public.test_import_failure() returns trigger language plpgsql as $$
begin
  if new.name = 'Induced failure' then raise exception 'Synthetic failure'; end if;
  return new;
end $$;
create trigger test_import_failure before insert on public.businesses for each row execute function public.test_import_failure();
set local role authenticated;
select set_config('request.jwt.claim.sub', '23000000-0000-4000-8000-000000000001', true);
select throws_ok($$select public.confirm_business_import('23000000-0000-4000-8000-000000000011', repeat('a',64), '[{"name":"First row","industry":"roofing"},{"name":"Induced failure","industry":"roofing"}]',0,0)$$, 'P0001', 'Synthetic failure', 'Database failure rejects the entire batch');
select is((select count(*)::int from public.businesses), 0, 'No partial businesses');
select is((select count(*)::int from public.business_import_receipts), 0, 'No success receipt on failure');
reset role;
drop trigger test_import_failure on public.businesses;
set local role authenticated;
select is(public.confirm_business_import('23000000-0000-4000-8000-000000000011',repeat('a',64),'[{"name":"First row","industry":"roofing"},{"name":"Induced failure","industry":"roofing"}]',0,0), 2, 'Same request succeeds after recovery');
select is(public.confirm_business_import('23000000-0000-4000-8000-000000000011',repeat('a',64),'[{"name":"First row","industry":"roofing"},{"name":"Induced failure","industry":"roofing"}]',0,0), 2, 'Retry returns original count');
select is((select count(*)::int from public.businesses), 2, 'Retry inserts nothing');
select throws_ok($$select public.confirm_business_import('23000000-0000-4000-8000-000000000011',repeat('b',64),'[{"name":"First row","industry":"roofing"}]',0,0)$$,'P0001','Request payload changed','Changed payload rejected');
select throws_ok($$select public.confirm_business_import(gen_random_uuid(),repeat('a',64),'[]',0,0)$$,'P0001','Invalid import size','Zero valid rejected');
select throws_ok($$select public.confirm_business_import(gen_random_uuid(),repeat('a',64),'[{"name":"A","industry":"x","owner_id":"forged"}]',0,0)$$,'P0001','Invalid business field','Owner injection rejected');
select throws_ok($$select public.confirm_business_import(gen_random_uuid(),repeat('a',64),'[{"name":"A","industry":"x"},{"name":"A","industry":"x"}]',0,0)$$,'P0001','Duplicate accepted rows','Duplicates rejected at RPC boundary');
select throws_ok($$select public.confirm_business_import(gen_random_uuid(),repeat('a',64),'[{"name":"A","industry":"x"}]',500,0)$$,'P0001','Invalid import size','Total bounded');
select throws_ok($$insert into public.business_import_receipts values(auth.uid(),gen_random_uuid(),'forged',1)$$,'42501',null,'Cannot forge receipt');
select throws_ok($$delete from public.business_import_receipts$$,'42501',null,'Cannot remove receipt');
reset role;
set local role anon;
select throws_ok($$select public.confirm_business_import(gen_random_uuid(),repeat('a',64),'[{"name":"A","industry":"x"}]',0,0)$$,'42501',null,'Anonymous confirmation denied');
reset role;
select * from finish();
rollback;
