/*
 * Script to create the calculate_financial_summary function in Supabase
 * 
 * This function needs to be run with admin privileges in Supabase.
 * You can run this in the Supabase SQL Editor or via the Supabase CLI.
 */

console.log(`
To create the calculate_financial_summary function in Supabase:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Paste and run the following SQL:

CREATE OR REPLACE FUNCTION calculate_financial_summary()
RETURNS TABLE (
    total_balance NUMERIC,
    available_for_settle NUMERIC,
    pending_clearance NUMERIC,
    tax_provision NUMERIC,
    target_payout NUMERIC,
    funded_percentage INTEGER,
    customer_prepaid NUMERIC,
    disputed_funds NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(t.gross_amount), 0)::NUMERIC AS total_balance,
        COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.driver_amount ELSE 0 END), 0)::NUMERIC AS available_for_settle,
        COALESCE(SUM(CASE WHEN t.status = 'pending' THEN t.gross_amount ELSE 0 END), 0)::NUMERIC AS pending_clearance,
        COALESCE(SUM(t.company_fee), 0)::NUMERIC AS tax_provision,
        50000::NUMERIC AS target_payout, -- Placeholder - would need specific business logic
        LEAST(100, GREATEST(0, ROUND((COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.gross_amount ELSE 0 END), 0) / 50000.0) * 100)))::INTEGER AS funded_percentage,
        0::NUMERIC AS customer_prepaid, -- Placeholder - would need specific business logic
        0::NUMERIC AS disputed_funds -- Placeholder - would need specific business logic
    FROM transactions t;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION calculate_financial_summary() TO authenticated;

`);