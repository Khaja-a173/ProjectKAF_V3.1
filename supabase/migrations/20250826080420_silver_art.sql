/*
  # Fix Staff Self Select Policy

  1. Policy Updates
    - Drop existing staff_self_select policy if it exists
    - Create new staff_self_select policy with proper auth.uid() check

  2. Security
    - Ensures staff can select their own records
    - Uses auth.uid() for user identification
*/

DROP POLICY IF EXISTS "staff_self_select" ON public.staff;

CREATE POLICY "staff_self_select"
ON public.staff
FOR SELECT
TO authenticated
USING (user_id = auth.uid());