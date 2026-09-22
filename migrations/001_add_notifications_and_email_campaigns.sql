-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'order', 'stock', 'system'
  link VARCHAR(500), -- Internal route for navigation
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at);

-- ==================== EMAIL CAMPAIGNS TABLES ====================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) NOT NULL, -- 'all', 'active_customers', 'inactive_customers', 'subscribers'
  sent_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'sending', 'completed'
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS campaigns_status_idx ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS recipients_campaign_idx ON email_campaign_recipients(campaign_id);

-- ==================== SAMPLE DATA FOR TESTING ====================
-- Optional: Insert sample notification for admin
INSERT INTO notifications (user_id, title, message, type, link)
VALUES 
  (NULL, 'Welcome to RAVENZA Admin', 'Admin panel setup complete. Start managing your store!', 'system', '/admin/dashboard')
ON CONFLICT DO NOTHING;

-- ==================== VERIFICATION QUERY ====================
-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('notifications', 'email_campaigns', 'email_campaign_recipients');
