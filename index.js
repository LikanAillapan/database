const JsonServer = require('json-server');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

// Configuración de JSON Server
const server = JsonServer.create();
const router = JsonServer.router('database.json'); // Archivo JSON de datos
const middlewares = JsonServer.defaults();

// Middleware de JSON Server
server.use(middlewares);
server.use(bodyParser.json());
server.use(cors());

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Endpoint personalizado para recuperación de contraseña
server.post('/password-reset', async (req, res) => {
  const { email } = req.body;
  console.log('Solicitud de recuperación recibida para:', email);

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Correo inválido.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tu_correo@gmail.com',
        pass: 'contraseña_de_aplicación',
      },
    });

    const mailOptions = {
      from: 'tu_correo@gmail.com',
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="https://mi-frontend.com/reset-password?token=12345">Restablecer Contraseña</a>
      `,
    };

    console.log('Enviando correo...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente:', info.response);

    // Respuesta JSON válida
    res.status(200).json({ message: 'Correo enviado correctamente.', success: true });
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    res.status(500).json({ message: 'Error al enviar el correo.', error: error.message });
  }
});

// Rutas de JSON Server
server.use(router);

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
