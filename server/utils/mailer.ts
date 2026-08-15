// Отправка почты. Пока — мок: письмо только логируется в консоль сервера.
// Для реальной отправки: заполнить SMTP_* в .env и раскомментировать транспорт + sendMail ниже.

// import nodemailer from 'nodemailer';
//
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT) || 587,
//     // true для 465, false для остальных портов (STARTTLS)
//     secure: Number(process.env.SMTP_PORT) === 465,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });

interface IMailOptions {
    to: string;
    subject: string;
    text: string;
}

export async function sendMail({ to, subject, text }: IMailOptions) {
    // await transporter.sendMail({
    //     from: process.env.MAIL_FROM || 'AV Dashboard <no-reply@example.com>',
    //     to,
    //     subject,
    //     text,
    // });

    logger.info(
        ['[mailer mock] email not sent, log only:', `To: ${to}`, `Subject: ${subject}`, '---', text, '---'].join('\n')
    );
}
