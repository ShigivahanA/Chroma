const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Save to database
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Prepare Nodemailer Transporter
    const mailUser = process.env.MAIL_USER || process.env.EMAIL_USER;
    const mailPass = process.env.MAIL_PASS || process.env.EMAIL_PASS;

    let transporterConfig = {};
    if (process.env.SMTP_HOST) {
      transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: mailUser, pass: mailPass }
      };
    } else {
      transporterConfig = {
        service: 'gmail',
        auth: { user: mailUser, pass: mailPass }
      };
    }
    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `"Chroma" <${mailUser}>`,
      to: mailUser,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; background-color: #f9fafb; color: #111827; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 25px; font-size: 20px;">
            New Message Received
          </h2>
          
          <div style="margin-bottom: 20px;">
            <span style="color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase;">Name</span>
            <p style="font-size: 16px; margin: 5px 0;">${name}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <span style="color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase;">Email Address</span>
            <p style="font-size: 16px; margin: 5px 0;"><a href="mailto:${email}" style="color: #00c2cb; text-decoration: none;">${email}</a></p>
          </div>

          <div style="margin-bottom: 30px;">
            <span style="color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase;">Message</span>
            <p style="font-size: 15px; line-height: 1.6; margin: 8px 0; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
            Sent from Chroma Contact Form
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Contact submitted successfully.' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ 
      message: 'Server error processing transmission.', 
      error: error.message 
    });
  }
};
