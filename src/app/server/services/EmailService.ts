'use server';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com', //  Zoho SMTP server
    port: 465,             // Use 465 for secure connection
    secure: true,          // True for port 465 (SSL)
    auth: {
        user: 'no-reply@tasknet.tech', // Tasknet mail
        pass: 'no-reply@TaskNet1'//process.env.ZOHO_MAIL_PASS    - maybe do this to be safe
    }
});
  
const sendEmail = (to: string, subject: string, text: string) => {
const mailOptions = {
    from: '"TaskNet" <no-reply@tasknet.tech>', // sender name + email
    to: to,
    subject: subject,
    text: text
};

return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error: Error | null, info: { response: string }) {
    if (error) {
        console.error('Email send error:', error);
        reject(error);
    } else {
        console.log('Email sent:', info.response);
        resolve(info.response);
    }
    });
});
};

export { sendEmail };