-- Migration: Fix Client Statistics Trigger Logic to include 'archived' status
-- This script updates the trigger function to exclude orders with status 'archived'.

CREATE OR REPLACE FUNCTION update_client_stats_from_orders()
RETURNS TRIGGER AS $$
DECLARE
    target_client_id UUID;
    cur_client_id UUID;
BEGIN
    -- 1. Identify which clients need updates
    IF TG_OP = 'DELETE' THEN
        target_client_id := OLD.client_id;
    ELSE
        target_client_id := NEW.client_id;
    END IF;

    -- 2. Create a temporary set of IDs to update (max 2 if client_id changed in UPDATE)
    FOR cur_client_id IN 
        SELECT DISTINCT u_id FROM (
            SELECT target_client_id as u_id
            UNION ALL
            SELECT OLD.client_id WHERE TG_OP = 'UPDATE' AND OLD.client_id IS DISTINCT FROM NEW.client_id
        ) sub WHERE u_id IS NOT NULL
    LOOP
        -- 3. Perform recalculation for each client
        WITH stats AS (
            SELECT 
                COUNT(id) as cnt,
                COALESCE(SUM(total_amount), 0) as amt,
                MIN(created_at) as first_at,
                MAX(created_at) as last_at,
                -- Days since last order
                EXTRACT(DAY FROM (NOW() - MAX(created_at)))::INTEGER as days_since
            FROM orders
            WHERE client_id = cur_client_id 
              AND is_archived = false 
              AND status NOT IN ('cancelled', 'archived')
        ),
        scores AS (
            SELECT 
                s.*,
                -- Recency Score (R): [30, 60, 90, 180] -> 1-5 (Inverted)
                CASE 
                    WHEN s.days_since IS NULL THEN 1
                    WHEN s.days_since <= 30 THEN 5
                    WHEN s.days_since <= 60 THEN 4
                    WHEN s.days_since <= 90 THEN 3
                    WHEN s.days_since <= 180 THEN 2
                    ELSE 1
                END as r_score,
                -- Frequency Score (F): [1, 3, 5, 10] -> 1-5
                CASE 
                    WHEN s.cnt <= 1 THEN 1
                    WHEN s.cnt <= 3 THEN 2
                    WHEN s.cnt <= 5 THEN 3
                    WHEN s.cnt <= 10 THEN 4
                    ELSE 5
                END as f_score,
                -- Monetary Score (M): [5000, 15000, 50000, 150000] -> 1-5
                CASE 
                    WHEN s.amt <= 5000 THEN 1
                    WHEN s.amt <= 15000 THEN 2
                    WHEN s.amt <= 50000 THEN 3
                    WHEN s.amt <= 150000 THEN 4
                    ELSE 5
                END as m_score
            FROM stats s
        ),
        final_stats AS (
            SELECT 
                sc.*,
                (sc.r_score::TEXT || sc.f_score::TEXT || sc.m_score::TEXT) as f_score_str,
                -- Segment logic matching rfm.actions.ts
                CASE
                    WHEN sc.r_score = 5 AND sc.f_score >= 4 AND sc.m_score >= 4 THEN 'champions'
                    WHEN sc.r_score >= 4 AND sc.f_score >= 3 AND sc.m_score >= 3 THEN 'loyal'
                    WHEN sc.r_score >= 4 AND sc.f_score >= 2 AND sc.m_score >= 2 THEN 'potential'
                    WHEN sc.r_score = 5 AND sc.f_score = 1 THEN 'new'
                    WHEN sc.r_score >= 4 AND sc.f_score = 1 THEN 'promising'
                    WHEN sc.r_score = 3 AND sc.f_score >= 3 AND sc.m_score >= 3 THEN 'need_attention'
                    WHEN sc.r_score = 3 AND sc.f_score < 3 THEN 'about_to_sleep'
                    WHEN sc.r_score <= 2 AND sc.f_score >= 3 AND sc.m_score >= 3 THEN 'at_risk'
                    WHEN sc.r_score <= 2 AND sc.f_score >= 2 THEN 'hibernating'
                    ELSE 'lost'
                END as f_segment
            FROM scores sc
        )
        UPDATE clients c
        SET 
            total_orders_count = fs.cnt,
            total_orders_amount = fs.amt,
            average_check = CASE WHEN fs.cnt > 0 THEN fs.amt / fs.cnt ELSE 0 END,
            first_order_at = fs.first_at,
            last_order_at = fs.last_at,
            days_since_last_order = fs.days_since,
            rfm_recency = fs.r_score,
            rfm_frequency = fs.f_score,
            rfm_monetary = fs.m_score,
            rfm_score = fs.f_score_str,
            rfm_segment = fs.f_segment,
            rfm_calculated_at = NOW(),
            updated_at = NOW()
        FROM final_stats fs
        WHERE c.id = cur_client_id;
    END LOOP;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
