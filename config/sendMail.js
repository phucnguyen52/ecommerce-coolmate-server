const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Xác thực tài khoản email của bạn <noreply@bookingroom.id.vn>",
      to: options.email,
      subject: options.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
          <h2 style="color: #4CAF50; text-align: center;">Xác nhận đăng ký tài khoản</h2>
          <p>Xin chào 👋,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Đây là mã xác nhận của bạn:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 28px; font-weight: bold; background: #4CAF50; color: #fff; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px;">
              ${options.message}
            </span>
          </div>

          <p style="color: #555;">Mã này có hiệu lực trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>

          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.<br>
            &copy; ${new Date().getFullYear()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Email send failed:", error);
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = sendMail;
