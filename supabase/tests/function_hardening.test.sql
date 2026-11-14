-- Disposable local database only; synthetic business fixtures roll back.
begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

-- search_path and trigger behavior
select ok(
  (select proconfig @> array['search_path=""']
   from pg_proc where oid = 'public.set_businesses_updated_at()'::regprocedure),
  'Trigger function has an explicitly empty search_path'
);
insert into auth.users(id) values ('67000000-0000-4000-8000-000000000001');
insert into public.businesses(id, owner_id, name, updated_at)
values ('67000000-0000-4000-8000-000000000002',
        '67000000-0000-4000-8000-000000000001', 'Synthetic hardening fixture', '2000-01-01');
set local role authenticated;
select set_config('request.jwt.claim.sub', '67000000-0000-4000-8000-000000000001', true);
update public.businesses set name = 'Updated synthetic fixture'
where id = '67000000-0000-4000-8000-000000000002';
select is(
  (select updated_at from public.businesses where id = '67000000-0000-4000-8000-000000000002'),
  timezone('utc', now())::timestamptz,
  'Owner update still sets updated_at through the hardened trigger'
);
reset role;

-- rls_auto_enable privileges (the dashboard helper is optional).
select skip('Optional helper is absent on a fresh database', 4)
where to_regprocedure('public.rls_auto_enable()') is null;
select to_regprocedure('public.rls_auto_enable()') is not null as helper_exists \gset
\if :helper_exists
select ok(not exists (
  select 1 from pg_proc p,
  lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
  where p.oid = to_regprocedure('public.rls_auto_enable()')
    and acl.grantee = 0 and acl.privilege_type = 'EXECUTE'
), 'PUBLIC has no helper EXECUTE grant');
select ok(not has_function_privilege('anon', to_regprocedure('public.rls_auto_enable()'), 'EXECUTE'),
          'Anonymous users cannot execute the helper');
select ok(not has_function_privilege('authenticated', to_regprocedure('public.rls_auto_enable()'), 'EXECUTE'),
          'Authenticated users cannot execute the helper');
select ok(has_function_privilege(current_user, to_regprocedure('public.rls_auto_enable()'), 'EXECUTE'),
          'Helper owner retains execution privileges');
\endif

select ok(has_function_privilege('authenticated',
  'public.confirm_business_import(uuid,text,jsonb,integer,integer)', 'EXECUTE'),
  'Authenticated import execution remains granted');
select ok(not has_function_privilege('anon',
  'public.confirm_business_import(uuid,text,jsonb,integer,integer)', 'EXECUTE'),
  'Anonymous import execution remains denied');
select * from finish();
rollback;
