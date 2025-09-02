BEGIN;

-- 1) Remove any conflicting definition
DROP FUNCTION IF EXISTS public.current_tenant_ids(uuid);

-- 2) Recreate the parameterized version
CREATE OR REPLACE FUNCTION public.current_tenant_ids(user_uuid uuid)
RETURNS TABLE(tenant_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT s.tenant_id
  FROM public.staff s
  WHERE s.user_id = user_uuid;
$$;

-- 3) (Optional but recommended) Convenience no-arg version for RLS/policies
CREATE OR REPLACE FUNCTION public.current_tenant_ids()
RETURNS TABLE(tenant_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT s.tenant_id
  FROM public.staff s
  WHERE s.user_id = auth.uid();
$$;

-- 4) Permissions (adjust roles if needed)
GRANT EXECUTE ON FUNCTION public.current_tenant_ids(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_tenant_ids()     TO authenticated, anon;

COMMIT;