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

const corsOptions = {
  origin: ['http://localhost:8100', 'https://database-8tvq.onrender.com/'],
  optionsSuccessStatus: 200,
};


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
        user: 'armandocubillos6@gmail.com', // Tu correo emisor
        pass: 'bwrx crpq wtvm wmdd',
      },
    });

    const mailOptions = {
      from: 'armandocubillos6@gmail.com',
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="http://localhost:8100/reset-password?token=TOKEN_GENERADO">Restablecer Contraseña</a>
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
// Endpoint para restablecer la contraseña
server.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token y contraseña son requeridos.' });
  }

  try {
    // Cargar la base de datos
    const database = JSON.parse(fs.readFileSync('database.json', 'utf-8'));

    // Buscar el token en "tokens"
    const tokenEntry = database.tokens.find((t) => t.token === token);
    if (!tokenEntry) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }
 // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.pass = hashedPassword; // Actualizar la contraseña

    // Eliminar el token usado
    database.tokens = database.tokens.filter((t) => t.token !== token);

    // Guardar los cambios en la base de datos
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));

    console.log('Contraseña restablecida para:', user.email);
    res.status(200).json({ message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});
// Rutas de JSON Server
server.use(router);

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
