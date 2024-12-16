const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

// Configura el servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Endpoint para recuperación de contraseña
app.post('/password-reset', async (req, res) => {
  const { email } = req.body;
  console.log('Solicitud de recuperación recibida para:', email);

  // Validación opcional: restringir a un dominio específico
  if (!email || !email.includes('@')) {
    return res.status(400).send('Correo inválido.');
  }

  try {
    // Configuración del transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Usando Gmail
      auth: {
        user: 'tu_correo@gmail.com', // Tu correo emisor
        pass: 'contraseña_de_aplicación', // Contraseña de aplicación
      },
    });

    // Configuración del correo
    const mailOptions = {
      from: 'tu_correo@gmail.com',
      to: email, // Dirección del destinatario
      subject: 'Recuperación de Contraseña',
      html: `
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="https://mi-frontend.com/reset-password?token=12345">Restablecer Contraseña</a>
        <p>Si no solicitaste este correo, ignóralo.</p>
      `,
    };

    console.log('Enviando correo...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response);

    res.status(200).send('Correo enviado correctamente.');
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    res.status(500).send('Error al enviar el correo.');
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
