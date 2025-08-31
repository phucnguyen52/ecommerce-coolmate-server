const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (options) => {
  try {
    console.log("sendMail options:", options);

    const { data, error } = await resend.emails.send({
      from: "Authentication email <noreply@bookingroom.id.vn>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    if (error) {
      console.error("❌ Email send failed:", error);
      return false;
    }

    console.log("✅ Email sent:", data);
    return true;
  } catch (err) {
    console.error("❌ Exception when sending email:", err);
    return false;
  }
};

module.exports = sendMail;
