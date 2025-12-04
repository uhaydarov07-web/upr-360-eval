-- Allow authenticated users to insert their own role
-- Admin role can only be claimed if no admins exist yet
CREATE POLICY "Users can claim initial admin or be assigned by admin"
ON public.user_roles
FOR INSERT
WITH CHECK (
  (user_id = auth.uid() AND (
    role != 'admin'::app_role 
    OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role)
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);