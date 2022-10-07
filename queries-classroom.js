import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
import axios from 'axios';
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

const createTicketInMindsales = (clientName, clientPhone) => {
  let data = {
    "data": [
      {
        "clientSourceId": 1,
        "clientManagerId": null,
        "phones": [
          clientPhone
        ],
        "clientFields": [
          {
            "id": 1,
            "value": clientName
          },
        ],
        "createDealIfExistsClient": true,
        "deals": [
          {
            "dealFunnelStepId": 22,
            "dealStatusId": 1,
            "dealFields": [
              {
                "id": 1,
                "value": "Сумма"
              }
            ]
          }
        ]
      }
    ]
  }

  axios.post('https://ms5ct.mindsales.kz/api/abaz/492f8134663308d9347fe6bceabb6ae0/addclientsdeals', data)
    .then(response => console.log('Deal created in Mindsales. ' + clientName))
    .catch(response => console.log('Deal was not created in Mindsales. ' + clientPhone));
}

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

      const nameForMindsales = `Заявка на курс "Математика простыми словами". ${fullname}`;
      const phoneForMindsales = phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '');

      createTicketInMindsales(nameForMindsales, phoneForMindsales);
      response.status(200).json(true);

    }
  )
};

const getCaptcha = async (request, response) => {
   pool.query('SELECT * FROM oc_captcha', (error, results) => {
        if (error) {
            throw error
        }
        console.log('captcha sent');
        response.status(200).json(results.rows)
    })
}

export default {
  createTicket,
  getCaptcha
};