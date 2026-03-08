
-- Fix RLS policies: drop RESTRICTIVE ones, recreate as PERMISSIVE

-- attendance_records
DROP POLICY IF EXISTS "Anyone can view attendance " ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can insert attendance " ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can update attendance " ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can delete attendance " ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can insert attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can update attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Anyone can delete attendance" ON public.attendance_records;

CREATE POLICY "allow_select_attendance" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "allow_insert_attendance" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_attendance" ON public.attendance_records FOR UPDATE USING (true);
CREATE POLICY "allow_delete_attendance" ON public.attendance_records FOR DELETE USING (true);

-- monthly_payments
DROP POLICY IF EXISTS "Anyone can view payments " ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can insert payments " ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can update payments " ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can delete payments " ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can update payments" ON public.monthly_payments;
DROP POLICY IF EXISTS "Anyone can delete payments" ON public.monthly_payments;

CREATE POLICY "allow_select_payments" ON public.monthly_payments FOR SELECT USING (true);
CREATE POLICY "allow_insert_payments" ON public.monthly_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_payments" ON public.monthly_payments FOR UPDATE USING (true);
CREATE POLICY "allow_delete_payments" ON public.monthly_payments FOR DELETE USING (true);

-- students
DROP POLICY IF EXISTS "Anyone can view students " ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students " ON public.students;
DROP POLICY IF EXISTS "Anyone can update students " ON public.students;
DROP POLICY IF EXISTS "Anyone can delete students " ON public.students;
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;
DROP POLICY IF EXISTS "Anyone can update students" ON public.students;
DROP POLICY IF EXISTS "Anyone can delete students" ON public.students;

CREATE POLICY "allow_select_students" ON public.students FOR SELECT USING (true);
CREATE POLICY "allow_insert_students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "allow_delete_students" ON public.students FOR DELETE USING (true);
