const JsonServer = require('json-server');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Para encriptar contraseñas

// Configuración de JSON Server
const server = JsonServer.create();
const router = JsonServer.router('database.json'); // Archivo JSON de datos
const middlewares = JsonServer.defaults();

// Middlewares de JSON Server
server.use(middlewares);
server.use(bodyParser.json());
server.use(cors());

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Endpoint para solicitar recuperación de contraseña
server.post('/password-reset', async (req, res) => {
  const { email } = req.body;
  console.log('Solicitud de recuperación recibida para:', email);

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Correo inválido.' });
  }

  try {
    // Generar token aleatorio
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');

    // Guardar el token en la base de datos
    const database = JSON.parse(fs.readFileSync('database.json', 'utf-8'));
    database.tokens = database.tokens || [];
    database.tokens.push({ email, token });
    fs.writeFileSync('database.json', JSON.stringify(database));

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'armandocubillos6@gmail.com', // Correo emisor
        pass: 'bwrx crpq wtvm wmdd', // Contraseña de aplicación
      },
    });

    const resetLink = `http://localhost:8100/reset-password?token=${token}`;
    const mailOptions = {
      from: 'armandocubillos6@gmail.com',
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">Restablecer Contraseña</a>
      `,
    };

    console.log('Enviando correo...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente:', info.response);

    res.status(200).json({ message: 'Correo enviado correctamente.', success: true });
  } catch (error) {
    console.error('Error al enviar el correo:', error.message);
    res.status(500).json({ message: 'Error al enviar el correo.', error: error.message });
  }
});

// Endpoint para restablecer la contraseña
server.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    // Cargar la base de datos
    const database = JSON.parse(fs.readFileSync('database.json', 'utf-8'));

    // Buscar el token
    const tokenEntry = database.tokens.find((t) => t.token === token);
    if (!tokenEntry) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Nueva contraseña cifrada: ${hashedPassword}`);

    // Buscar el usuario por el correo asociado al token
    const user = database.users.find((u) => u.email === tokenEntry.email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar la contraseña
    user.password = hashedPassword;

    // Eliminar el token usado
    database.tokens = database.tokens.filter((t) => t.token !== token);
    fs.writeFileSync('database.json', JSON.stringify(database));

    res.status(200).json({ message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Rutas de JSON Server
server.use(router);

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

