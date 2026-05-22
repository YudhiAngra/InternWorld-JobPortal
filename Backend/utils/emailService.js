const nodemailer = require("nodemailer");

let transporter;

// Initialize Ethereal transporter
async function initTransporter() {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("Ethereal Email Transporter initialized. User:", testAccount.user);
  }
  return transporter;
}

const sendApplicationStatusEmail = async (userEmail, jobTitle, company, status) => {
  try {
    const tp = await initTransporter();
    
    let subject = `Update on your application for ${jobTitle} at ${company}`;
    let text = `Hello,\n\nYour application for the position of ${jobTitle} at ${company} has been marked as: ${status.toUpperCase()}.\n\nBest Regards,\nCareer Compass Team`;
    let html = `<p>Hello,</p><p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${company}</strong> has been marked as: <strong style="color: ${status === 'accepted' ? 'green' : 'red'}">${status.toUpperCase()}</strong>.</p><p>Best Regards,<br>Career Compass Team</p>`;

    const info = await tp.sendMail({
      from: '"Career Compass" <no-reply@careercompass.com>',
      to: userEmail,
      subject: subject,
      text: text,
      html: html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendApplicationStatusEmail };
