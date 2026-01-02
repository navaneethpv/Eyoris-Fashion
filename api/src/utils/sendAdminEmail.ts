import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendAdminEmail = async (
    subject: string,
    html: string
) => {
    try {
        const admins = process.env.ADMIN_NOTIFICATION_EMAILS?.split(",");

        if (!admins || admins.length === 0) return;

        await transporter.sendMail({
            from: `"Eyoris Orders" <${process.env.SMTP_USER}>`,
            to: admins,
            subject,
            html,
        });
    } catch (err) {
        console.error("Admin email failed:", err);
    }
};
