-- Keep trigger name resolution independent of the caller's search_path.
alter function public.set_businesses_updated_at() set search_path = '';

-- This dashboard-created helper is absent on fresh repository databases.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
