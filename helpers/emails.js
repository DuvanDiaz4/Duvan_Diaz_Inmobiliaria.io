import nodemailer from 'nodemailer';

const emailRegistro = async(datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

    const { email, nombre, token } = datos;

    //Enviar el email de confirmación 
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.io',
        text: 'Confirma tu cuenta en BienesRaices.io',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>

            <p>Para confirmar tu cuenta haz click en el siguiente enlace:</p>
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a>

            <p>Si no has solicitado una cuenta, puedes ignorar este correo</p>
        `
    });
};

export {
    emailRegistro
}