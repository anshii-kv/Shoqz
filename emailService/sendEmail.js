const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, text, html }) {
    try {

        console.log("EMAIL:", process.env.GOOGLE_EMAIL);
        console.log("APP PASSWORD:", process.env.GOOGLE_APP_PASSWORD);
                const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Your App Name" <${process.env.GOOGLE_EMAIL}>`,
            to,
            subject,
            text,
            html,
        };
        console.log(mailOptions,"Options")
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = sendEmail;






//  const sendEmail = await  sendVerificationEmail(email,otp);