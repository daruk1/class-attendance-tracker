
-- Add unique constraint on attendance_records to prevent duplicate entries per student per date
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_student_date_unique UNIQUE (student_id, date);
