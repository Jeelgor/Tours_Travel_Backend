const sgMail = require("@sendgrid/mail");

// Load API Key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content for the email
 */
const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: "jeelgor10@gmail.com",
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.response.body.errors);
  }
};

/**
 * Send Booking Confirmation Email
 * @param {string} toEmail - User's email
 * @param {object} booking - Booking details
 */
const sendBookingConfirmation = async (toEmail, booking) => {
  const html = `
    <h2>🎉 Booking Confirmed!</h2>
    <p>Hello <strong>${booking.name}</strong>,</p>
    <p>Email <strong>${booking.email}</strong>,</p>
    <p>Your booking for <strong>${booking.packageId}</strong> is confirmed.</p>
    <p><strong>Booking ID:</strong> ${booking._id}</p>
    <p><strong>Travel Date From:</strong> ${booking.fromDate}</p>
    <p><strong>Travel Date To:</strong> ${booking.toDate}</p>
    <p><strong>Your Booking Status is:</strong> ${booking.status}</p>
    <p>Thank you for choosing us! 🚀</p>
    `;
  await sendEmail(toEmail, "Booking Confirmation ✅", html);
  console.log(html,88888)
};

module.exports = {
  sendBookingConfirmation,
};
