import nodemailer from "nodemailer";
import { User } from "../models/User";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendAdminEmail = async (subject: string, html: string) => {
    try {
        console.log("📧 Admin email trigger started");

        // Fetch all admins & super admins
        const admins = await User.find({
            role: { $in: ["admin", "super_admin"] }
        }).select("email");

        console.log("👤 Admins found:", admins);

        if (!admins.length) {
            console.log("❌ No admins found in DB");
            return;
        }

        const emails = admins.map(a => a.email);
        console.log("📨 Sending email to:", emails);

        await transporter.sendMail({
            from: `"Eyoris Orders" <${process.env.SMTP_USER}>`,
            to: emails,
            subject,
            html,
        });

        console.log("✅ Email sent successfully");
    } catch (error) {
        console.error("❌ Admin email error:", error);
    }
};
