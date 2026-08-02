require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

/**
 * Singleton database client for Supabase interactions across repository layers.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.warn('⚠️ Supabase URL or Service Role Key not found in environment variables.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
