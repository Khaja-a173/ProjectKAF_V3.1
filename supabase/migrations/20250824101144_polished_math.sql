/*
  # Clean duplicate active orders

  1. Purpose
    - Remove duplicate active orders that might prevent unique index creation
    - Ensures only one active order per table before applying constraints

  2. Safety
    - Only affects orders with status 'pending' or 'processing'
    - Keeps the most recent order (highest ctid) for each table
    - Does not affect completed or cancelled orders
*/

-- Clean up any duplicate active orders per table before creating unique index
delete from public.orders o
using public.orders o2
where o.ctid < o2.ctid
  and o.tenant_id = o2.tenant_id
  and o.table_id = o2.table_id
  and o.table_id is not null
  and o.status in ('pending','processing')
  and o2.status in ('pending','processing');