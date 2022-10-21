import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
import axios from 'axios';
import { request, response } from 'express';
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
    connection,
    courseName,
    teacherName
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
      const mailMessageForSubscribed = `Название курса: ${courseName}.\nИмя учителя: ${teacherName}.\nИмя пользователя: ${fullname}.\n${email ? "E-mail: " + email + "." : ""}\nТелефон: ${phone}.\n ${connection ? "Предпачитаемый способ связи: " + connection : ""}`;

      sendEmail(stuffEmails, `На курс "${courseName}" поступила новая заявка.`, mailMessageForSubscribed);

      const nameForMindsales = `Заявка на курс "${courseName}". Имя учителя: ${teacherName}. Имя пользователя: ${fullname}`;
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

const getAllCaptchaId = async (request, response) => {
  pool.query('SELECT id FROM oc_captcha', (error, results) => {
       if (error) {
           throw error
       }
       console.log('captcha sent');
       response.status(200).json(results.rows)
   })
}

const getCaptchaWithId = (request, response) => {
  const id = parseInt(request.params.id);
  console.log(id)

  pool.query('SELECT * FROM oc_captcha where id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
      }else {
          response.status(200).json(results.rows);
      }
  })
}

const createTeacher = (request, response) => {
    const { surname, name, patronymic, skills, experience, avatar, url } = request.body

    pool.query('INSERT INTO oc_teachers (surname, name, patronymic, skills, experience, avatar, url) VALUES ($1, $2, $3, $4, $5, $6, $7)', [surname, name, patronymic, skills, experience, avatar, url], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Teacher added with ID: ${result.insertId}`)
    })
}

const createCourse = (request, response) => {
    const { title, description, fullPrice, monthlyPrice, startDate, endDate, program, courseUrl, translationLink, teacherId, courseCategory } = request.body

    pool.query('INSERT INTO oc_courses (title, description, full_price, monthly_price, start_date, end_date, program, url, translation_link, teacher_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [title, description, fullPrice, monthlyPrice, startDate, endDate, program, courseUrl, translationLink, teacherId, courseCategory], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Course added with ID: ${result.insertId}`)
    })
}

const createCourseTarget = (request, response) => {
    const { targetTitle, targetImg, targetText, targetCourseId } = request.body

    pool.query('INSERT INTO oc_course_targets (title, img, text, course_id) VALUES ($1, $2, $3, $4)', [targetTitle, targetImg, targetText, targetCourseId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Course target added with ID: ${result.insertId}`)
    })
}

const createCourseInfoBlock = (request, response) => {
    const { infoBlockTitle, infoBlockText, infoBlockOrder, infoBlockCourseId } = request.body
    
    pool.query('INSERT INTO oc_course_info_blocks (title, text, block_order, course_id) VALUES ($1, $2, $3, $4)', [infoBlockTitle, infoBlockText, infoBlockOrder, infoBlockCourseId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Course info block added with ID: ${result.insertId}`)
    })
}

const createSertificate = (request, response) => {
    const { sertificateTitle, sertificateImg, sertificateTeacherId } = request.body

    pool.query('INSERT INTO oc_sertificates (title, img, teacher_id) VALUES ($1, $2, $3)', [sertificateTitle, sertificateImg, sertificateTeacherId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Sertificate added with ID: ${result.insertId}`)
    })
}

const createCourseSkill = (request, response) => {
    const { skillImg, skillText, skillCourseId } = request.body

    pool.query('INSERT INTO oc_course_skills (img, text, course_id) VALUES ($1, $2, $3)', [skillImg, skillText, skillCourseId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Course skill added with ID: ${result.insertId}`)
    })
}

const createCourseStage = (request, response) => {
    const { stageTitle, stageText, stageOrder, stageCourseId } = request.body

    pool.query('INSERT INTO oc_course_stages (title, text, stage_order, course_id) VALUES ($1, $2, $3, $4)', [stageTitle, stageText, stageOrder, stageCourseId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Course stage added with ID: ${result.insertId}`)
    })
}

const createUser = (request, response) => {
    const { nick, password, roleId, personId } = request.body

    pool.query('INSERT INTO oc_users (nick, password, role_id, person_id) VALUES ($1, $2, $3, $4)', [nick, password, roleId, personId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with ID: ${result.insertId}`)
    })
}

const createStudent = (request, response) => {
    const { studentSurname, studentName, studentPatronymic, nickname } = request.body

    pool.query('INSERT INTO oc_students (surname, name, patronymic, nickname) VALUES ($1, $2, $3, $4)', [studentSurname, studentName, studentPatronymic, nickname], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Student added with ID: ${result.insertId}`)
    })
}

const createLesson = (request, response) => {
    const { lessonTitle, lessonOrder, lessonCourseId, lessonTesis, lessonStartTime, lessonProgramId } = request.body

    pool.query('INSERT INTO oc_lessons (title, lesson_order, course_id, tesis, start_time, program_id) VALUES ($1, $2, $3, $4, $5, $6)', [lessonTitle, lessonOrder, lessonCourseId, lessonTesis, lessonStartTime, lessonProgramId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Lesson added with ID: ${result.insertId}`)
    })
}

const createExercise = (request, response) => {
    const { exerciseText, exerciseLessonId, correctlyAnswer } = request.body

    pool.query('INSERT INTO oc_exercises (text, lesson_id, correct_answer) VALUES ($1, $2, $3)', [exerciseText, exerciseLessonId, correctlyAnswer], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Exercise added with ID: ${result.insertId}`)
    })
}

const createCategory = (request, response) => {
    const { categoryName, categoryUrl } = request.body

    pool.query('INSERT INTO oc_course_categories (name, url) VALUES ($1, $2)', [categoryName, categoryUrl], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Category added with ID: ${result.insertId}`)
    })
}

const createSCM = (request, response) => {
    const { SCMStudentId, SCMCourseId, SCMProgramId } = request.body

    pool.query('INSERT INTO oc_student_course_middleware (student_id, course_id, program_id) VALUES ($1, $2, $3)', [SCMStudentId, SCMCourseId, SCMProgramId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Middleware added with ID: ${result.insertId}`)
    })
}

const createProgram = (request, response) => {
    const { programTitle, programCourseId, programTeacherId } = request.body

    pool.query('INSERT INTO oc_programs (title, course_id, teacher_id) VALUES ($1, $2, $3)', [programTitle, programCourseId, programTeacherId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Program added with ID: ${result.insertId}`)
    })
}

const getTeachers = async (request, response) => {
   pool.query('SELECT * FROM oc_teachers', (error, results) => {
        if (error) {
            throw error
        }
        console.log('teachers sent');
        response.status(200).json(results.rows)
    })
}

const getCategories = async (request, response) => {
   pool.query('SELECT * FROM oc_course_categories', (error, results) => {
        if (error) {
            throw error
        }
        console.log('categories sent');
        response.status(200).json(results.rows)
    })
}

const getCourses = async (request, response) => {
   pool.query('SELECT * FROM oc_courses', (error, results) => {
        if (error) {
            throw error
        }
        console.log('courses sent');
        response.status(200).json(results.rows)
    })
}

const getPrograms = async (request, response) => {
   pool.query('SELECT * FROM oc_programs', (error, results) => {
        if (error) {
            throw error
        }
        console.log('programs sent');
        response.status(200).json(results.rows)
    })
}

const getLessons = async (request, response) => {
   pool.query('SELECT * FROM oc_lessons', (error, results) => {
        if (error) {
            throw error
        }
        console.log('lessons sent');
        response.status(200).json(results.rows)
    })
}

const getStudents = async (request, response) => {
   pool.query('SELECT * FROM oc_students', (error, results) => {
        if (error) {
            throw error
        }
        console.log('students sent');
        response.status(200).json(results.rows)
    })
}

const getRoles = async (request, response) => {
   pool.query('SELECT * FROM oc_roles', (error, results) => {
        if (error) {
            throw error
        }
        console.log('roles sent');
        response.status(200).json(results.rows)
    })
}

const getCourseOC = (request, response) => {
  // console.log(request)
  const title = request.params.title;
  console.log("title", title)
  console.log("request.params", request.params.title)
  

  pool.query('SELECT * FROM oc_courses where url=$1', [title], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getCourseTargets = (request, response) => {
  // console.log(request)
  const id = parseInt(request.params.id);
  

  pool.query('SELECT * FROM oc_course_targets where course_id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getCourseInfoBlocks = (request, response) => {
  // console.log(request)
  const id = parseInt(request.params.id);
  

  pool.query('SELECT * FROM oc_course_info_blocks where course_id=$1 order by id asc', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getCourseSkills = (request, response) => {
    // console.log(request)
    const id = parseInt(request.params.id);
  

    pool.query('SELECT * FROM oc_course_skills where course_id=$1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

const getCourseStages = (request, response) => {
  const id = parseInt(request.params.id);
  
    pool.query('SELECT * FROM oc_course_stages where course_id=$1 order by id asc', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

const getProgramsById = (request, response) => {
    // console.log(request)
    const id = parseInt(request.params.id);
  

    pool.query('SELECT * FROM oc_programs where course_id=$1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

const getTeacherByCourse = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM oc_teachers where id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getSertificateByTeacherId = (request, response) => {
    const id = parseInt(request.params.id);
  
    pool.query('SELECT * FROM oc_sertificates where teacher_id=$1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
  }

export default {
  createTicket,
  getCaptcha,
  getAllCaptchaId,
  getCaptchaWithId,
  createTeacher,
  createCourse,
  createCourseTarget,
  createCourseInfoBlock,
  createSertificate,
  createCourseSkill,
  createCourseStage,
  createUser,
  createStudent,
  createLesson,
  createExercise,
  createCategory,
  createSCM,
  createProgram,
  getTeachers,
  getCategories,
  getCourses,
  getPrograms,
  getProgramsById,
  getLessons,
  getStudents,
  getRoles,
  getCourseOC,
  getCourseTargets,
  getCourseInfoBlocks,
  getCourseSkills,
  getCourseStages,
  getPrograms,
  getTeacherByCourse,
  getSertificateByTeacherId
};