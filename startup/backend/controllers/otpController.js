const transporter = require("../config/emailConfig");
const generateOtp = require("../utils/generateOtp");

async function sendOtpEmail(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOtp();

  const mailOptions = {
    from: `"OTP Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
    html: `<p>Your OTP is: <b>${otp}</b></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP", details: err });
  }
}

module.exports = { sendOtpEmail };
