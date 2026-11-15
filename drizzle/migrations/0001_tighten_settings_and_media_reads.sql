DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read published settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (key IN ('contact', 'content') OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Admins read media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));