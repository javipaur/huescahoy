const nodemailer = require("nodemailer");

async function main() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.NOTIFY_EMAIL;
  if (!user || !pass || !to) {
    console.log("FALTAN VARIABLES");
    process.exit(1);
  }
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  try {
    await transport.verify();
    console.log("SMTP OK");
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM ?? `Huesca Hoy <${user}>`,
      to,
      subject: "Prueba de Huesca Hoy",
      text: "Si lees esto, los avisos de sugerencias y eventos ya llegan a tu correo.",
    });
    console.log("ENVIADO:", info.messageId);
  } catch (err) {
    console.log("ERROR:", err && err.message ? err.message : String(err));
    process.exit(1);
  }
}

main();
