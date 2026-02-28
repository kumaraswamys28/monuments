const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();
// ============================
// SUPABASE CONFIG
// ============================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ============================
// FAKE DATA GENERATOR
// ============================
function generateFakeData() {
  return {
    device_id: "SIM_DEVICE_01",

    temperature: Number(
      (25 + Math.random() * 10).toFixed(2)
    ),

    humidity: Number(
      (50 + Math.random() * 20).toFixed(2)
    ),

    vibration: Number(
      (Math.random()).toFixed(3)
    ),

    visitor_count: Math.floor(
      50 + Math.random() * 200
    ),

    aqi: Math.floor(
      40 + Math.random() * 150
    ),

    rainfall: Number(
      (Math.random() * 10).toFixed(2)
    ),

    timestamp: new Date()
  };
}

// ============================
// INSERT EVERY 3 SECONDS
// ============================
async function startSimulator() {

  console.log("🚀 IoT Simulator Started");

  setInterval(async () => {

    const data = generateFakeData();

    const { error } = await supabase
      .from("iot_data")
      .insert([data]);

    if (error)
      console.log("Insert Error:", error);
    else
      console.log("Inserted:", data);

  }, 3000);
}

startSimulator();
