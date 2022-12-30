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
  'zznnznzn3@gmail.com',
  'Anara2607@mail.ru'
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
        "createDealIfExistsClient": false,
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
    teacherName,
    outputDate
  } = request.body;
  

  console.log(request.body);

  await pool.query(`INSERT INTO public.oc_applications(fullname, email, phone, course_id, datetime, trial_lesson_datetime) VALUES ($1, $2, $3, $4, current_timestamp, $5)`,
    [
      fullname,
      email,
      phone,
      course_id,
      outputDate
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

const createMarathoneTicket = async (request, response) => { 
    const { 
      fullname, 
      phone, 
      connection, 
      marathone_id, 
      marathone_name 
    } = request.body; 
   
    console.log(request.body); 
   
    await pool.query(`INSERT INTO public.oc_marathon_applications (fullname, phone, marathone_id, datetime) VALUES ($1, $2, $3, current_timestamp)`, 
      [ 
        fullname, 
        phone, 
        marathone_id 
      ], 
      async (error, results) => { 
        if (error) { 
          throw error 
        } 
        const mailMessageForSubscribed = `Название марафона: ${marathone_name}.\nИмя пользователя: ${fullname}.\nТелефон: ${phone}.\n ${"Предпочитаемый способ связи: " + connection}`; 
   
        sendEmail(stuffEmails, `На марафон "${marathone_name}" поступила новая заявка.`, mailMessageForSubscribed); 
   
        const nameForMindsales = `Заявка на марафон "${marathone_name}". Имя пользователя: ${fullname}`; 
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
    const { surname, name, patronymic, skills, experience, avatar, url, teacherDescription } = request.body

    pool.query('INSERT INTO oc_teachers (surname, name, patronymic, skills, experience, avatar, url, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [surname, name, patronymic, skills, experience, avatar, url, teacherDescription], (error, result) => {
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

const createAnswer = (request, response) => {
    const { answerText, lessonId, exerciseId, studentId, status } = request.body
    console.log(answerText, lessonId, exerciseId, studentId, status)
    pool.query('INSERT INTO oc_answers (text, lesson_id, exercise_id, student_id, status) VALUES ($1, $2, $3, $4, $5)', [answerText, lessonId, exerciseId, studentId, status], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Answer added with ID: ${result.insertId}`)
    })
}

const createExercise = (request, response) => {
    const { exerciseText, exerciseLessonId, correctlyAnswer, status } = request.body

    pool.query('INSERT INTO oc_exercises (text, lesson_id, correct_answer, status) VALUES ($1, $2, $3, $4)', [exerciseText, exerciseLessonId, correctlyAnswer, status], (error, result) => {
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
    console.log(programTitle, programCourseId, programTeacherId)
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

const getMarathoneSkills = (request, response) => {
    const id = parseInt(request.params.id);
  

    pool.query('SELECT * FROM oc_marathon_skills where marathon_id=$1', [id], (error, results) => {
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

const getCurrentProgram = (request, response) => {
    // console.log(request)
    const id = parseInt(request.params.id);
  

    pool.query('SELECT * FROM oc_programs where id=$1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

const getTeacherByCourse = (request, response) => {
  const id = request.params.id;

  console.log(request);

  pool.query('SELECT * FROM oc_teachers where id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getTeacherByUrl = (request, response) => {
  const url = request.params.url;

  pool.query('SELECT * FROM oc_teachers where url=$1', [url], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}


const getProgramsByTeacherId = (request, response) => {
  const id = request.params.id;
  console.log('ID',id)
  pool.query('SELECT oc_programs.id, oc_programs.title, oc_programs.teacher_id, oc_programs.course_id, oc_courses.title as "course_title", oc_courses.start_date, oc_courses.end_date, (select count(id) from oc_lessons where oc_programs.id = oc_lessons.program_id) as "lessons_count" FROM oc_programs INNER JOIN oc_courses on oc_programs.course_id = oc_courses.id where oc_programs.teacher_id=$1 order by oc_programs.course_id desc, oc_programs.id asc', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getProgramsByStudentId = (request, response) => {
  const id = request.params.id;
  console.log('ID',id)
  pool.query('SELECT oc_programs.id, oc_programs.title, oc_programs.teacher_id, oc_programs.course_id, oc_courses.title as "course_title", oc_courses.start_date, oc_courses.end_date, oc_student_course_middleware.student_id, (select count(id) from oc_lessons where oc_programs.id = oc_lessons.program_id) as "lessons_count" FROM oc_programs INNER JOIN oc_courses on oc_programs.course_id = oc_courses.id INNER JOIN oc_student_course_middleware on oc_programs.id = oc_student_course_middleware.program_id where oc_student_course_middleware.student_id=$1 order by oc_programs.id asc', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getProgramsByCourseId = (request, response) => {
  const id = request.params.id;
  pool.query('SELECT * FROM oc_programs WHERE course_id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getLessonsByProgramId = (request, response) => {
  const id = request.params.id;
  console.log('ID',id)
  pool.query('SELECT * from oc_lessons where program_id=$1 order by lesson_order asc', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getStudentLessonsByProgramId = (request, response) => {
    const { studentId, programId } = request.body;
    const answer_status = 'correct'
    pool.query('SELECT oc_lessons.id, oc_lessons.title, oc_lessons.course_id, oc_lessons.tesis, oc_lessons.start_time, oc_lessons.lesson_order, oc_lessons.program_id, oc_lessons.translation_link as default_lesson_link, (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,  (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1) AS done_exer, FLOOR(COALESCE(NULLIF((SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1 AND oc_answers.status = $3), 0) * 100, 0) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)) AS score, oc_student_course_middleware.student_id, oc_student_course_middleware.paid, oc_schedule.start_time as "personal_time", oc_schedule.translation_link as "personal_lesson_link", oc_schedule.status from oc_lessons FULL OUTER JOIN oc_student_course_middleware on oc_lessons.program_id = oc_student_course_middleware.program_id FULL OUTER JOIN oc_schedule on oc_lessons.id = oc_schedule.lesson_id WHERE oc_lessons.program_id = $2 and oc_student_course_middleware.program_id = $2 and oc_student_course_middleware.student_id = $1 order by lesson_order asc', [studentId, programId, answer_status], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
              response.status(200).json(results.rows);
            
        }
    })
  }

const createEmptyProgram = (request, response) => {
    const { emptyProgramTitle, emptyProgramCourseId, emptyProgramTeacherId } = request.body
    console.log(emptyProgramTitle, emptyProgramCourseId, emptyProgramTeacherId)
    pool.query('INSERT INTO oc_programs (title, course_id, teacher_id) VALUES ($1, $2, $3)', [emptyProgramTitle, emptyProgramCourseId, emptyProgramTeacherId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Program added with ID: ${result.insertId}`)
    })
}

const getStudentsByTeacherId = (request, response) => {
  const {id, sort} = request.body;

  console.log('ID',id)
  pool.query('SELECT oc_student_course_middleware.student_id, oc_student_course_middleware.course_id, oc_student_course_middleware.program_id, oc_courses.title as "course_title", oc_courses.url as "course_url", oc_students.surname, oc_students.name, oc_students.patronymic, (select count(id) from oc_lessons where oc_student_course_middleware.program_id = oc_lessons.program_id) as "lessons_count", oc_programs.title as "program_title" from oc_student_course_middleware INNER JOIN oc_courses on oc_student_course_middleware.course_id = oc_courses.id INNER JOIN oc_programs on oc_student_course_middleware.program_id = oc_programs.id INNER JOIN oc_students on oc_student_course_middleware.student_id = oc_students.id where oc_courses.teacher_id=$1 ORDER BY $2', [id, sort], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getExercisesByLessonId = (request, response) => {
  const id = request.params.id;
  console.log('ID',id)
  pool.query('SELECT * from oc_exercises where lesson_id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getAnswersByStudExId = (request, response) => {
  const { studentId, exerciseId } = request.body
  // console.log('ID',id)
  pool.query('SELECT * from oc_answers where student_id=$1 and exercise_id=$2', [studentId, exerciseId], (error, results) => {
    if (error) {
        response.status(500).json('error');
        console.error(error);
          
    } else {
        response.status(200).json(results.rows);  
    }
  })
}

const updateStudentProgram = (request, response) => {
    const { studentId, courseId, programId } = request.body

    pool.query(
        'UPDATE oc_student_course_middleware SET program_id = $3 WHERE student_id = $1 and course_id = $2',
        [studentId, courseId, programId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Student program modified`)
        }
    )
}

const createPersonalRoom = (request, response) => {
    const { lessonId, lessonKey, studentId } = request.body
    console.log('createPersonalRoom', lessonId, lessonKey, studentId)
    pool.query(
        'UPDATE oc_schedule SET translation_link = $2 WHERE student_id = $3 and lesson_id = $1',
        [lessonId, lessonKey, studentId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Room is created`)
        }
    )
}

const createDefaultRoom = (request, response) => {
    const { lessonId, lessonKey } = request.body

    pool.query(
        'UPDATE oc_lessons SET translation_link = $2 WHERE id = $1',
        [lessonId, lessonKey],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Room is created`)
        }
    )
}

const updateProgramCourseAndTitle = (request, response) => {
    const { programId, programTitle, courseId } = request.body

    pool.query(
        'UPDATE oc_programs SET title = $2, course_id = $3 WHERE id = $1',
        [programId, programTitle, courseId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Program updated`)
        }
    )
}

const updateLesson = (request, response) => {
    const { lessonId, lessonTitle, lessonDate, lessonTesis } = request.body

    pool.query(
        'UPDATE oc_lessons SET title = $2, start_time = $3, tesis = $4 WHERE id = $1',
        [lessonId, lessonTitle, lessonDate, lessonTesis],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Lesson updated`)
        }
    )
}

const deleteLesson = (request, response) => {
    const {id} = request.body

    pool.query('DELETE FROM oc_lessons WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`lesson deleted with ID: ${id}`)
    })
}

const updateExercise = (request, response) => {
    const { exerciseId, exerciseText, exerciseAnswer } = request.body

    pool.query(
        'UPDATE oc_exercises SET text = $2, correct_answer = $3 WHERE id = $1',
        [exerciseId, exerciseText, exerciseAnswer],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Exercise updated`)
        }
    )
}

const deleteExercise = (request, response) => {
    const {id} = request.body

    pool.query('DELETE FROM oc_exercises WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`exercise deleted with ID: ${id}`)
    })
}

const updateAnswerStatus = (request, response) => {
    const { id, status } = request.body

    pool.query('UPDATE oc_answers SET status = $2 WHERE id = $1', [id, status], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`answer status updated`)
    })
}

const updateStudentAnswer = (request, response) => {
    const { answerText, answerId, status } = request.body

    pool.query('UPDATE oc_answers SET text=$1, status=$3 WHERE id = $2', [answerText, answerId, status], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`student answer updated`)
    })
}

const updateAnswerComment = (request, response) => {
    const { id, comment } = request.body

    pool.query('UPDATE oc_answers SET comment = $2 WHERE id = $1', [id, comment], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`answer status updated`)
    })
}

const getCoursesByTeacherId = (request, response) => {
  const id = request.params.id;
  console.log('ID',id)
  pool.query('SELECT * from oc_courses where teacher_id=$1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getStudentCourseInfo = (request, response) => {
  const {student_nick, course_url} = request.query;
//   console.log('lol',student_nick, course_url)
  // console.log(response);
  pool.query('SELECT oc_students.*, oc_student_course_middleware.program_id, oc_courses.title, oc_courses.description, oc_courses.translation_link, oc_teachers.name AS teach_name, oc_teachers.surname AS teach_surname, oc_teachers.patronymic AS teach_patronymic FROM oc_students INNER JOIN oc_student_course_middleware ON oc_student_course_middleware.student_id = oc_students.id INNER JOIN oc_courses ON oc_courses.id = oc_student_course_middleware.course_id INNER JOIN oc_teachers ON oc_courses.teacher_id = oc_teachers.id WHERE oc_students.nickname=$1 AND oc_courses.url=$2', [
    student_nick,
    course_url
  ], (error, results) => {
    if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getLessonInfo = (request, response) => {
    const {course_url, program_id, student_id} = request.query;
    // console.log(course_url, program_id, student_id)
    const answer_status = 'correct'

    pool.query('SELECT oc_courses.id FROM oc_courses WHERE oc_courses.url=$1', [
        course_url
      ], (error, results) => {
        if (error) {
          throw error
        }
        if (results.rows.length) {
            pool.query('SELECT oc_lessons.id, oc_lessons.*, (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,  (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$3) AS done_exer, FLOOR(COALESCE(NULLIF((SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$3 AND oc_answers.status = $4), 0) * 100, 0) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)) AS score, oc_student_course_middleware.student_id, oc_student_course_middleware.paid, oc_schedule.start_time as "personal_time", oc_schedule.status, oc_lessons.translation_link as default_lesson_link, oc_schedule.translation_link as "personal_lesson_link" FROM public.oc_lessons FULL OUTER JOIN oc_student_course_middleware on oc_lessons.program_id = oc_student_course_middleware.program_id FULL OUTER JOIN oc_schedule on oc_lessons.id = oc_schedule.lesson_id INNER JOIN oc_courses ON oc_courses.id=oc_lessons.course_id WHERE oc_courses.url=$1 AND oc_lessons.program_id=$2 AND oc_student_course_middleware.program_id = $2 AND oc_student_course_middleware.student_id = $3 ORDER BY oc_lessons.lesson_order ASC', [
                course_url,
                program_id,
                student_id,
                answer_status
            ], (error, results) => {
                if (error) {
                throw error
                }
                response.status(200).json(results.rows)
            });
        } else {
            console.log("error");
        }
      });
  };

const getStudentScores = (request, response) => {
  const {student_nick} = request.query;
  pool.query('SELECT * FROM oc_answers INNER JOIN oc_students ON  oc_answers.student_id = oc_students.id WHERE oc_answers.student_id = oc_students.id AND oc_students.nickname=$1', [
    student_nick
  ], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  });
};

const getLessonExercises = (request, response) => {
  const {lesson_id, student_id} = request.query;
  pool.query('SELECT DISTINCT oc_exercises.*, oc_answers.student_id, oc_answers.id as answer_id, oc_answers.text as answer_text, oc_answers.status as answer_status FROM oc_exercises LEFT JOIN oc_answers ON oc_exercises.id=oc_answers.exercise_id AND oc_answers.student_id=$2 WHERE oc_exercises.lesson_id=$1 ORDER BY oc_exercises.exer_order ASC', [
    lesson_id,
    student_id
  ], (error, results) => {
    if (error) {
      throw error
    }
    console.log(results.rows);
    response.status(200).json(results.rows)
  });
};

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

  const getScheduleByLessonIdAndCourseIdAndStudentId = (request, response) => {
    const { lesson_id, course_id, student_id } = request.body;
    console.log("lesson_id, course_id, student_id", lesson_id, course_id, student_id)
    pool.query('SELECT * FROM oc_schedule WHERE oc_schedule.lesson_id = $1 and oc_schedule.course_id = $2 and oc_schedule.student_id = $3', [lesson_id, course_id, student_id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
  }

  const createSchedule = (request, response) => {
    const { dateAndTimeMerger, lesson_id, course_id, student_id } = request.body
    console.log("dateAndTimeMerger, lesson_id, course_id, student_id", dateAndTimeMerger, lesson_id, course_id, student_id)
    pool.query('INSERT INTO oc_schedule (start_time, lesson_id, course_id, student_id) VALUES ($1, $2, $3, $4)', [dateAndTimeMerger, lesson_id, course_id, student_id], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Schedule added with ID: ${result.insertId}`)
    })
}

const updateSchedule = (request, response) => {
    const { dateAndTimeMerger, lesson_id, course_id, student_id } = request.body

    pool.query('UPDATE oc_schedule SET start_time = $1 WHERE lesson_id = $2 and course_id = $3 and student_id = $4', [dateAndTimeMerger, lesson_id, course_id, student_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Schedule updated`)
    })
}

const getLessonByRoomKey = (request, response) => {
    const room = request.params.key;
  
    pool.query('SELECT * FROM oc_lessons INNER JOIN oc_schedule on oc_lessons.id = oc_schedule.lesson_id where oc_schedule.translation_link=$1', [room], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
  }
  
  const getStudentByLessonKey = (request, response) => {
    const room = request.params.key;
    console.log('ROOM', room)
    pool.query('SELECT * FROM oc_students INNER JOIN oc_schedule on oc_students.id = oc_schedule.student_id where oc_schedule.translation_link=$1', [room], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
  }
  
  const getTeacherByLessonKey = (request, response) => {
    const room = request.params.key;
    console.log('ROOM', room)
    pool.query('SELECT * FROM oc_teachers INNER JOIN oc_courses on oc_teachers.id = oc_courses.teacher_id INNER JOIN oc_schedule on oc_courses.id = oc_schedule.course_id where oc_schedule.translation_link=$1', [room], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

const getCoursePrices =  (request, response) => {
    const id = request.params.id;
    pool.query('SELECT * FROM oc_course_prices WHERE oc_course_prices.course_id=$1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        } else {
            response.status(200).json(results.rows);
        }
    })
}


const createTeacherComment = (request, response) => {
    const { studentId, exerciseId, text, date } = request.body
    console.log("COMMENT studentId, exerciseId, text, date", studentId, exerciseId, text, date);

    pool.query('INSERT INTO oc_teacher_comments (student_id, exercise_id, text, date) VALUES ($1, $2, $3, $4)', [studentId, exerciseId, text, date], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Comment added with ID: ${result.insertId}`)
    })
}

const getTeacherCommentsByStudExId = (request, response) => {
    const { studentId, exerciseId } = request.body
    // console.log('ID',id)
    pool.query('SELECT * from oc_teacher_comments where student_id=$1 and exercise_id=$2', [studentId, exerciseId], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
  }

  const getMarathone = (request, response) => {
    const title = request.params.title;
    console.log("title", title)
    console.log("request.params", request.params.title)
  
    pool.query('SELECT * FROM oc_marathons where url=$1', [title], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
        } else {
            response.status(200).json(results.rows);
        }
    })
}

const getCourseCommentsWithCourseId = (request, response) => {
    const { courseId } = request.body
    console.log("HEEEY, courseId ", courseId );
    pool.query('SELECT * from oc_course_comments where course_id=$1', [courseId], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

const getStudentById = (request, response) => {
    const { studentId } = request.body
    console.log("HEEEY 1");
    pool.query('SELECT * FROM oc_students where id=$1', [studentId], (error, results) => {
         if (error) {
             throw error
         }
         console.log('student sent');
         response.status(200).json(results.rows)
     })
 }

const getCourseById = (request, response) => {
    console.log("HEEEY 2");
    const { courseId } = request.body
    pool.query('SELECT * FROM oc_courses where id=$1', [courseId], (error, results) => {
         if (error) {
             throw error
         }
         console.log('course sent');
         response.status(200).json(results.rows)
     })
 }

const getDatesForApplication = (request, response) => {
  const id = request.params.id;
  pool.query('SELECT a.id, a.trial_lesson_datetime AS lesson_time FROM oc_applications a JOIN oc_courses c ON a.course_id = c.id WHERE c.id = $1 UNION ALL SELECT l.id, l.start_time AS lesson_time FROM oc_lessons l JOIN oc_courses c ON l.course_id = c.id WHERE c.id = $1 UNION ALL SELECT s.id, s.start_time AS lesson_time FROM oc_schedule s JOIN oc_courses c ON s.course_id = c.id WHERE c.id = $1', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          console.log(results.rows)
          
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
  createAnswer,
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
  getTeacherByCourse,
  getTeacherByUrl,
  getLessonByRoomKey,
  getStudentByLessonKey,
  getTeacherByLessonKey,
  getProgramsByTeacherId,
  getProgramsByStudentId,
  getProgramsByCourseId,
  getLessonsByProgramId,
  createEmptyProgram,
  getStudentsByTeacherId,
  getExercisesByLessonId,
  getAnswersByStudExId,
  updateStudentProgram,
  getCoursesByTeacherId,
  getCurrentProgram,
  getStudentCourseInfo,
  updateProgramCourseAndTitle,
  updateLesson,
  deleteLesson,
  updateExercise,
  deleteExercise,
  getLessonInfo,
  getStudentScores,
  getSertificateByTeacherId,
  getStudentLessonsByProgramId,
  updateAnswerStatus,
  updateStudentAnswer,
  getLessonExercises,
  updateAnswerComment,
  getScheduleByLessonIdAndCourseIdAndStudentId,
  createSchedule,
  updateSchedule,
  createPersonalRoom,
  createDefaultRoom,
  getLessonByRoomKey,
  getStudentByLessonKey,
  getTeacherByLessonKey,
  getCoursePrices,
  createTeacherComment,
  getTeacherCommentsByStudExId,
  getMarathone,
  createMarathoneTicket,
  getMarathoneSkills,
  getCourseCommentsWithCourseId,
  getStudentById,
  getCourseById,
  getDatesForApplication
};