import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
moment.locale('ru');

const productionPoolOptions = {
  user: 'postgres',
  host: '91.201.215.148',
  database: 'oilan_db',
  password: 'root',
  port: 5432,
  ssl: false
};

const Pool = pg.Pool
const pool = new Pool(productionPoolOptions);

const stuffEmails = [
  'azat.aliaskar@gmail.com',
  'alexdrumm13@gmail.com',
  'oilanabaz7@gmail.com',
  'zznnznzn3@gmail.com'
];

const sendEmail = async (emailsTo, title, message) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    pool: true,
    auth: {
      user: 'oilanedu@gmail.com',
      pass: 'fvkfoycauxwqpmfz'
    }
  });

  for(let i = 0; i < emailsTo.length; i++){
    let mailOptions = {
      from: 'oilanedu@gmail.com',
      to: emailsTo[i],
      subject: title,
      text: message,
    };
      
    await transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent to: ' + emailsTo[i]);
      }
    });
  }
};

const createTicket = async (request, response) => {
  const {
    fullname,
    email,
    phone,
    course_id,
    connection
  } = request.body;
  

  console.log(request.body);

  await pool.query(`INSERT INTO public.oc_applications(fullname, email, phone, course_id, datetime) VALUES ($1, $2, $3, $4, current_timestamp)`,
    [
      fullname,
      email,
      phone,
      course_id
    ],
    async (error, results) => {
      if (error) {
        throw error
      }
      const mailMessageForSubscribed = `Имя пользователя: ${fullname}.\n${email ? "E-mail: " + email + "." : ""}\nТелефон: ${phone}.\n ${connection ? "Предпачитаемый способ связи: " + connection : ""}`;

      sendEmail(stuffEmails, `На курс "Математика простыми словами" поступила новая заявка.`, mailMessageForSubscribed);

      response.status(200).json(true);
    }
  )
};

export default {
  createTicket
};