const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/password-reset', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('El correo electrónico es requerido.');
    }

    try {
        // Configuración de Nodemailer con Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tu_correo@gmail.com',
                pass: 'tu_contraseña_de_aplicación', // Usa una contraseña de aplicación
            },
        });

        // Configuración del correo
        const mailOptions = {
            from: '"Tu App" <tu_correo@gmail.com>',
            to: email,
            subject: 'Recuperación de contraseña',
            html: `
                <p>Hola,</p>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="https://tu-frontend.com/reset-password?token=TOKEN_GENERADO">Restablecer Contraseña</a>
                <p>Si no solicitaste esta acción, puedes ignorar este mensaje.</p>
            `,
        };

        // Envía el correo
        await transporter.sendMail(mailOptions);
        res.status(200).send('Correo enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).send('Error al enviar el correo.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
