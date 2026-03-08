
-- Drop policies (with and without trailing spaces)
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can insert attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can update attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can delete attendance" ON public.attendance_records;

DROP POLICY IF EXISTS "Anyone can view payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can update payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can delete payments" ON public.monthly_payments;

DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;
DROP POLICY IF EXISTS "Anyone can update students" ON public.students;
DROP POLICY IF EXISTS "Anyone can delete students" ON public.students;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Anyone can view attendance" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attendance" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update attendance" ON public.attendance_records FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete attendance" ON public.attendance_records FOR DELETE USING (true);

CREATE POLICY "Anyone can view payments" ON public.monthly_payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON public.monthly_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON public.monthly_payments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete payments" ON public.monthly_payments FOR DELETE USING (true);

CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete students" ON public.students FOR DELETE USING (true);
