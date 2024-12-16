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
    return res.status(400).send('Correo inválido.');
  }

  try {
    // Configuración del transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Usando Gmail
      auth: {
        user: 'armandocubillos6@gmail.com', // Tu correo emisor
        pass: 'bwrx crpq wtvm wmdd', // Contraseña de aplicación
      },
    });

    // Configuración del correo
    const mailOptions = {
      from: 'armandocubillos6@gmail.com',
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

// Rutas de JSON Server
server.use(router);

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
