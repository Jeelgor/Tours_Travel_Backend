const { supabase } = require("../config/supabase");

/**
 * Broadcast real-time seat update to all connected clients via Supabase Realtime
 * @param {Object} booking - { Seatleft, packageId }
 */
const sendBookingUpdate = async (booking) => {
  try {
    if (!supabase) {
      console.warn("Supabase client not available for realtime broadcast.");
      return;
    }

    const channel = supabase.channel("tour-seat-updates");
    await channel.send({
      type: "broadcast",
      event: "bookingConfirmed",
      payload: booking,
    });

    console.log("📡 Supabase Realtime broadcast sent successfully:", booking);
  } catch (error) {
    console.error("❌ Failed to broadcast seat update via Supabase:", error);
  }
};

module.exports = {
  sendBookingUpdate,
};
