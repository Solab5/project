/*
  # Initial Schema for Emotional Savers

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamp)
    - `savings_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `amount` (numeric)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamp)
    - `loan_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `amount` (numeric)
      - `purpose` (text)
      - `status` (text)
      - `repayment_period` (integer)
      - `interest_rate` (numeric)
      - `created_at` (timestamp)
    - `loan_repayments`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, foreign key)
      - `amount` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now()
);

-- Create savings_requests table
CREATE TABLE IF NOT EXISTS savings_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  notes text,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create loan_requests table
CREATE TABLE IF NOT EXISTS loan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  purpose text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  repayment_period integer NOT NULL CHECK (repayment_period > 0),
  interest_rate numeric NOT NULL CHECK (interest_rate > 0),
  created_at timestamptz DEFAULT now()
);

-- Create loan_repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loan_requests(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Savings requests policies
CREATE POLICY "Users can view their own savings requests"
  ON savings_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own savings requests"
  ON savings_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all savings requests"
  ON savings_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update savings requests"
  ON savings_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Loan requests policies
CREATE POLICY "Users can view their own loan requests"
  ON loan_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own loan requests"
  ON loan_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all loan requests"
  ON loan_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update loan requests"
  ON loan_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Loan repayments policies
CREATE POLICY "Users can view their own loan repayments"
  ON loan_repayments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loan_requests
      WHERE loan_requests.id = loan_repayments.loan_id
      AND loan_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own loan repayments"
  ON loan_repayments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loan_requests
      WHERE loan_requests.id = loan_repayments.loan_id
      AND loan_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all loan repayments"
  ON loan_repayments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );