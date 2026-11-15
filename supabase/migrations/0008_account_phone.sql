-- Private contact number (never shown on profiles). Format: + country code and digits.
alter table public.profiles add column if not exists phone text check (phone ~ '^\+[1-9][0-9]{6,14}$');
