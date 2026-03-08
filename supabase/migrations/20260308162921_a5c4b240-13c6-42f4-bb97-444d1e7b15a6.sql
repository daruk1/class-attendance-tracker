
-- Add email column to students
ALTER TABLE public.students ADD COLUMN email text;

-- Create monthly_payments table
CREATE TABLE public.monthly_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL, -- format: '2026-03'
  amount numeric NOT NULL DEFAULT 1200,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(student_id, month_year)
);

ALTER TABLE public.monthly_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payments" ON public.monthly_payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON public.monthly_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON public.monthly_payments FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete payments" ON public.monthly_payments FOR DELETE USING (true);
