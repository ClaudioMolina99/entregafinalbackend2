import nodemailer from "nodemailer";

export const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error(
      "Faltan variables SMTP en .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)"
    );
  }

  const port = Number(SMTP_PORT);
  const secure = port === 465; // 465 = SSL

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.4;">
      <h2>Restablecer contraseña</h2>
      <p>Hacé click en el botón para restablecer tu contraseña. Este enlace vence en 1 hora.</p>
      <p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no pediste este cambio, ignorá este correo.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Recuperación de contraseña",
    html,
  });
};