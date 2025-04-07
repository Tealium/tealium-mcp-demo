// Script to verify Supabase connection and set up database
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local file');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL statements for table creation
const sqlStatements = [
  // Create tealium_visitors table
  `CREATE TABLE IF NOT EXISTS tealium_visitors (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT,
    visitor_data JSONB NOT NULL,
    attribute_id TEXT,
    attribute_value TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_tealium_visitors_visitor_id ON tealium_visitors (visitor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tealium_visitors_attribute ON tealium_visitors (attribute_id, attribute_value)`,
  
  // Create unique constraints
  `ALTER TABLE tealium_visitors DROP CONSTRAINT IF EXISTS unique_visitor_id`,
  `ALTER TABLE tealium_visitors ADD CONSTRAINT unique_visitor_id UNIQUE (visitor_id)`,
  
  `ALTER TABLE tealium_visitors DROP CONSTRAINT IF EXISTS unique_attribute`,
  `ALTER TABLE tealium_visitors ADD CONSTRAINT unique_attribute UNIQUE (attribute_id, attribute_value)`
];

async function testConnection() {
  try {
    // Test connection by trying to get the current timestamp from Supabase
    const { data, error } = await supabase
      .from('tealium_visitors')
      .select('id')
      .limit(1);
    
    // If we get a specific error about the table not existing, that's fine
    // It means the connection is working but the table doesn't exist yet
    if (error && error.code === '42P01') {
      console.log('✅ Successfully connected to Supabase!');
      console.log('   Table does not exist yet - will create it');
      return true;
    } else if (error) {
      // If we got a different error, connection might still be working
      console.log('✅ Connected to Supabase, but got an error:', error.message);
      console.log('   Will attempt to create the table anyway');
      return true;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('   Table exists and is accessible');
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    return false;
  }
}

async function createTables() {
  try {
    console.log('Creating database tables...');
    
    // Check if tables already exist
    const { data: existingTables, error: tableCheckError } = await supabase
      .from('tealium_visitors')
      .select('id')
      .limit(1);
    
    if (!tableCheckError) {
      console.log('ℹ️ The tealium_visitors table already exists.');
      return true;
    }
    
    // Execute each SQL statement directly
    for (const statement of sqlStatements) {
      const { error } = await supabase.rpc(
        'exec_sql', 
        { sql: statement }
      ).catch(e => {
        // If RPC doesn't exist, handle gracefully
        console.warn('ℹ️ RPC exec_sql not available. Creating tables directly...');
        return { error: e };
      });
      
      if (error) {
        // Try direct SQL execution (this works in newer Supabase versions)
        try {
          await supabase.sql(statement);
          console.log('✅ Created table using direct SQL');
        } catch (directError) {
          console.error(`❌ Error creating table: ${directError.message}`);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    // Verify tables were created by checking if we can query tealium_visitors
    const { error: verifyError } = await supabase
      .from('tealium_visitors')
      .select('id')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Failed to verify table creation:', verifyError.message);
      
      // Provide manual SQL instructions
      console.log('\nPlease run these SQL statements in your Supabase SQL Editor:');
      sqlStatements.forEach(stmt => {
        console.log(`\n${stmt};`);
      });
      
      return false;
    }
    
    console.log('✅ Database tables created successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    
    // Provide manual SQL instructions
    console.log('\nPlease run these SQL statements in your Supabase SQL Editor:');
    sqlStatements.forEach(stmt => {
      console.log(`\n${stmt};`);
    });
    
    return false;
  }
}

async function main() {
  console.log('🔄 Testing Supabase connection...');
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('❌ Cannot proceed with setup - connection failed');
    process.exit(1);
  }
  
  console.log('\n🔄 Setting up database tables...');
  const tablesCreated = await createTables();
  
  if (tablesCreated) {
    console.log('\n✅ Supabase setup complete!');
    console.log('\nYou can now use the Tealium integration with Supabase caching.');
    console.log('The tealium_visitors table has been created for caching visitor data.');
  } else {
    console.error('\n⚠️ Some steps in the setup process failed.');
    console.log('Please check the error messages above and try again.');
    process.exit(1);
  }
}

// Run the setup
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
