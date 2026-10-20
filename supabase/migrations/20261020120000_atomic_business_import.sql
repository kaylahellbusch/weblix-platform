-- Only the transaction may write receipts. Receipts survive business edits/deletes.
create table public.business_import_receipts (
  owner_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  payload_digest text not null,
  inserted_count integer not null check (inserted_count between 1 and 500),
  primary key (owner_id, request_key)
);
alter table public.business_import_receipts enable row level security;
alter table public.business_import_receipts force row level security;
revoke all on public.business_import_receipts from anon, authenticated;
grant select on public.business_import_receipts to authenticated;
create policy "Owners read import receipts" on public.business_import_receipts
  for select to authenticated using (owner_id = auth.uid());

-- Definer is required only to protect receipts from direct client writes.
-- Identity always comes from auth.uid(); no owner argument or service key.
create function public.confirm_business_import(
  request_key uuid, file_digest text, accepted_rows jsonb,
  invalid_count integer, duplicate_count integer
) returns integer
language plpgsql security definer set search_path = '' as $function$
declare
  owner uuid := auth.uid();
  fingerprint text;
  receipt public.business_import_receipts%rowtype;
  item jsonb;
  field text;
  value text;
  count_rows integer;
  trim_chars text := U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
begin
  if owner is null then raise exception 'Authentication required'; end if;
  if request_key is null or file_digest is null or file_digest !~ '^[0-9a-f]{64}$'
    or accepted_rows is null or jsonb_typeof(accepted_rows) <> 'array'
    or octet_length(accepted_rows::text) > 2097152 then
    raise exception 'Invalid import';
  end if;
  count_rows := jsonb_array_length(accepted_rows);
  if count_rows not between 1 and 500 or invalid_count is null or duplicate_count is null
    or invalid_count < 0 or duplicate_count < 0
    or count_rows + invalid_count::bigint + duplicate_count::bigint > 500 then
    raise exception 'Invalid import size';
  end if;
  for item in select * from jsonb_array_elements(accepted_rows) loop
    if jsonb_typeof(item) <> 'object' or not (item ? 'name' and item ? 'industry') then
      raise exception 'Invalid business';
    end if;
    for field, value in select key, val #>> '{}' from jsonb_each(item) as e(key,val) loop
      if field not in ('name','industry','phone','email','website','city','state')
        or jsonb_typeof(item->field) <> 'string' or value = '' or value <> btrim(value, trim_chars)
        or (field in ('name','industry') and length(regexp_replace(value, U&'[\+010000-\+10FFFF]', 'xx', 'g')) > 120)
        or (field in ('phone','city','state') and length(regexp_replace(value, U&'[\+010000-\+10FFFF]', 'xx', 'g')) > 255)
        or (field = 'email' and value !~ $email$^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$$email$)
        or (field = 'website' and value !~ '^[A-Za-z][A-Za-z0-9+.-]*:[^[:space:]]+$') then
        raise exception 'Invalid business field';
      end if;
    end loop;
  end loop;
  if (select count(distinct row_value) from jsonb_array_elements(accepted_rows) as r(row_value)) <> count_rows then
    raise exception 'Duplicate accepted rows';
  end if;
  fingerprint := encode(extensions.digest(convert_to(jsonb_build_array(file_digest, accepted_rows, invalid_count, duplicate_count)::text, 'UTF8'), 'sha256'), 'hex');
  -- Serialize the same owner/key, including concurrent first attempts.
  perform pg_advisory_xact_lock(hashtextextended(owner::text || request_key::text, 0));
  select * into receipt from public.business_import_receipts r
    where r.owner_id = owner and r.request_key = confirm_business_import.request_key;
  if found then
    if receipt.payload_digest <> fingerprint then raise exception 'Request payload changed'; end if;
    return receipt.inserted_count;
  end if;
  insert into public.businesses(owner_id,name,industry,phone,email,website,city,state)
    select owner, r->>'name',r->>'industry',r->>'phone',r->>'email',r->>'website',r->>'city',r->>'state'
    from jsonb_array_elements(accepted_rows) as rows(r);
  insert into public.business_import_receipts values(owner, request_key, fingerprint, count_rows);
  return count_rows;
end;
$function$;
revoke all on function public.confirm_business_import(uuid,text,jsonb,integer,integer) from public, anon;
grant execute on function public.confirm_business_import(uuid,text,jsonb,integer,integer) to authenticated;
