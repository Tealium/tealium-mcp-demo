// One-time Supabase setup script using service role key
// This script will create the necessary table for Tealium visitor caching
// After running this script, please delete it for security

import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const supabaseUrl = 'https://xgheuiwjietrrybwqsvc.supabase.co';
// Using service role API key for schema creation
// WARNING: This key has admin privileges - it will be removed after use
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY environment variable');
  console.error('Please run this script with: SUPABASE_SERVICE_KEY=your_key node scripts/one-time-supabase-setup.js');
  process.exit(1);
}

// Create client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL statements for creating the tealium_visitors table
const setupStatements = [
  // Create table for caching Tealium visitor data
  `CREATE TABLE IF NOT EXISTS tealium_visitors (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT,
    visitor_data JSONB NOT NULL,
    attribute_id TEXT,
    attribute_value TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  // Create indexes for faster lookups
  `CREATE INDEX IF NOT EXISTS idx_tealium_visitors_visitor_id
    ON tealium_visitors (visitor_id)`,
    
  `CREATE INDEX IF NOT EXISTS idx_tealium_visitors_attribute
    ON tealium_visitors (attribute_id, attribute_value)`,

  // Create unique constraints
  `ALTER TABLE tealium_visitors DROP CONSTRAINT IF EXISTS unique_visitor_id`,
  `ALTER TABLE tealium_visitors ADD CONSTRAINT unique_visitor_id
    UNIQUE (visitor_id)`,

  `ALTER TABLE tealium_visitors DROP CONSTRAINT IF EXISTS unique_attribute`,
  `ALTER TABLE tealium_visitors ADD CONSTRAINT unique_attribute
    UNIQUE (attribute_id, attribute_value)`,
    
  // Enable Row Level Security (RLS)
  `ALTER TABLE tealium_visitors ENABLE ROW LEVEL SECURITY`,
  
  // Create security policies
  `CREATE POLICY "Allow all users to select from tealium_visitors"
    ON tealium_visitors FOR SELECT
    USING (true)`,
    
  `CREATE POLICY "Allow all users to insert into tealium_visitors"
    ON tealium_visitors FOR INSERT
    WITH CHECK (true)`,
    
  `CREATE POLICY "Allow all users to update tealium_visitors"
    ON tealium_visitors FOR UPDATE
    USING (true)`
];

// Function to execute SQL statements
async function executeSQL(statement) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(() => {
      // If RPC method doesn't exist, try direct SQL
      return { error: { message: 'RPC method not available' } };
    });
    
    if (error) {
      // Try direct SQL method (available in newer Supabase versions)
      return supabase.sql(statement);
    }
    
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

// Main function
async function setupSupabase() {
  console.log('🔄 Setting up Supabase database for Tealium integration...');
  
  try {
    // First check if the exec_sql RPC function exists, if not create it
    try {
      const createRpcSql = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;
      
      await supabase.sql(createRpcSql);
      console.log('✅ Created exec_sql RPC function');
    } catch (rpcError) {
      console.log('ℹ️ Unable to create RPC function, will use direct SQL');
    }
    
    // Execute each setup statement
    for (const statement of setupStatements) {
      console.log(`🔄 Executing: ${statement.substring(0, 60)}...`);
      
      const { error } = await executeSQL(statement);
      
      if (error) {
        console.error(`❌ Error executing SQL: ${error.message}`);
        console.error(`   Statement: ${statement.substring(0, 100)}...`);
      } else {
        console.log('✅ Success');
      }
    }
    
    // Verify table exists
    const { data, error } = await supabase
      .from('tealium_visitors')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('❌ Failed to verify table creation:', error.message);
      return false;
    }
    
    console.log('\n✅ Supabase setup complete!');
    console.log('The tealium_visitors table has been created for caching visitor data.');
    
    // Add a warning to delete this script
    console.log('\n⚠️ IMPORTANT: For security, please delete this script after use.');
    console.log('The service role key used in this script has admin privileges.');
    
    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Run the setup
setupSupabase()
  .then(success => {
    if (success) {
      console.log('✅ Setup completed successfully');
    } else {
      console.error('❌ Setup failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
