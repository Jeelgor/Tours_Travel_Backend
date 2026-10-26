const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "https://zshqdircyopqrzsaoobh.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_TGo2n6EyZs43tgCjmwrXSw_J5K1tCCH";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
