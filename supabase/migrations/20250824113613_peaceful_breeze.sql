-- Clean up any duplicate active orders before creating unique index
delete from public.orders o
using public.orders o2
where o.ctid < o2.ctid
  and o.tenant_id = o2.tenant_id
  and o.table_id = o2.table_id
  and o.status in ('pending','processing')
  and o2.status in ('pending','processing');