import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
import axios from 'axios';
import { request, response } from 'express';
moment.locale('ru');
import jwt from 'jsonwebtoken'
import {secret} from "./config.js"
import {v4 as uuidv4} from 'uuid';

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
      pass: 'jxkcvrkchclgewiu'
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
      const mailMessageForSubscribed = `Название курса: ${courseName}.\nДата: ${outputDate}.\nИмя учителя: ${teacherName}.\nИмя пользователя: ${fullname}.\n${email ? "E-mail: " + email + "." : ""}\nТелефон: ${phone}.\n ${connection ? "Предпачитаемый способ связи: " + connection : ""}`;

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

const restorePassword = (request, response) => {
    const {role, relogin, email, code} = request.body;

    console.log(role, relogin, email, code);

    pool.query(
        "SELECT * FROM oc_" +
          role +
          "s WHERE " + (role === "teacher" ? "url" : "nickname") + " = $1",
          [relogin]
        , (error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length === 1) {
            pool.query(
                "SELECT * FROM oc_" +
                  role +
                  "s WHERE email = $1",
                  [email]
                , (error, results) => {
                if (error) {
                    throw error
                }
                if (results.rows.length === 1) {
                    sendEmail([email], `Код для восстановление пароля`, code); 
                    response.status(200).send(results.rows)
                } else {
                    response.status(404).send("Неправильный email, напишите нам на почту oilanedu@gmail.com")
                }
                
            })
            // sendEmail([email], `Код для восстановление пароля`, code); 
            // response.status(200).send(results.rows)
        } else {
            response.status(404).send("Такого пользователя не существует")
        }
        
    })

}

const updatePassword = (request, response) => {
    const { newPassword, nick } = request.body

    pool.query(
        'UPDATE oc_users SET password = $1 WHERE nick = $2',
        [newPassword, nick],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send("Password updated")
        }
    )
}

const registerUser = async (req, res) => {
  const role = req.body.role;
  const name = req.body.name;
  const surname = req.body.surname;
  const phone = req.body.phone;
  const email = req.body.email;
  const login = req.body.login;
  const password = req.body.password;

  try {
    const roleExists = await pool.query(
      "SELECT id, name, value FROM oc_roles WHERE value = $1",
      [role]
    );

    if (!roleExists.rows.length) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const roleId = roleExists.rows[0].id;
    const roleValue = roleExists.rows[0].value;

    const userExists = await pool.query(
      "SELECT id, nick FROM oc_users WHERE nick = $1",
      [login]
    );

    const emailExam = await pool.query(
        "SELECT id, email FROM oc_" + roleValue + "s WHERE email = $1",
        [email]
    );

    if (userExists.rows.length) {
      return res
        .status(400)
        .json({ message: "Login is already in use, try another." });
    }

    if (emailExam.rows.length) {
        return res
          .status(400)
          .json({ message: "Email is already in use " + role + ", try another." });
    }

    const checkRole = await pool.query(
      "SELECT id FROM oc_" + roleValue + "s WHERE " + (roleValue === "teacher" ? "url" : "nickname") + " = $1",
      [login]
    );

    if (checkRole.rows.length) {
      return res
        .status(400)
        .json({ message: "Login is already in use for " + role + ", try another." });
    }

    await pool.query(
      "INSERT INTO oc_" +
        roleValue +
        "s (name, surname, " +
        (roleValue === "teacher" ? "url" : "nickname") +
        ", phone, email) VALUES ($1, $2, $3, $4, $5)",
        [name, surname, login, phone, email]
      );
    const personId = await pool.query("SELECT max(id) as id from oc_" + roleValue + "s");
    await pool.query(
      "INSERT INTO oc_users (nick, password, role_id, person_id) VALUES ($1, $2, $3, $4)",
      [login, password, roleId, personId.rows[0].id],
      async (error, results) => { 
        if (error) { 
          throw error 
        } 
        sendEmail([email], `Добро пожаловать в сообщество преподавателей Oilan-Classroom!`, `Ваш логин "${login}", пароль "${password}"`);
        console.log(results);
        res.status(200).json(results.rows)
      } 
    );
    return { success: true, message: "User registered successfully!" };
  } catch (err) {
    console.log(err)
    return { success: false, message: "Error registering user: " + err };
  }
}

const loginUser = async (req, res) => {
  const { role, login, password } = req.body;
  const roleValue = role.toLowerCase();
  let roleId
  if (!role){
    roleId = 1
  }
  if (role == 'teacher'){
    roleId = 2
  }
  if (role == 'student'){
    roleId = 3
  }
  try {
    const result = await pool.query(
      "SELECT * FROM oc_users WHERE nick=$1 AND password=$2 AND role_id=$3",
      [login, password, roleId]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const person = result.rows[0];
    const token = jwt.sign({ login: login }, secret, { expiresIn: '10000h' });
    return res.json({
      success: true,
      message: 'Authentication successful',
      token: token,
      role: role,
      login: login
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } 
}

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

    pool.query('SELECT * FROM oc_courses WHERE url = $1', [courseUrl], (error, result) => {
        if (error) {
            throw error
        }
        if (result.rows.length > 0) {
            // Если запись уже существует, возвращаем ошибку
            response.status(400).send('Course with this URL already exists')
        } else {
            // Если запись не существует, осуществляем вставку новой записи
            pool.query('INSERT INTO oc_courses (title, description, full_price, monthly_price, start_date, end_date, program, url, translation_link, teacher_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [title, description, fullPrice, monthlyPrice, startDate, endDate, program, courseUrl, translationLink, teacherId, courseCategory], (error, result) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Course added with ID: ${result.insertId}`)
            })
        }
    })
}

const createCourseAndProgram = (request, response) => {
  const { title: courseTitle, description, courseUrl, teacherId, categoryId } = request.body.course
  const { programTitle, programType } = request.body.program

  console.log(request.body.course)
  console.log(request.body.program)

  pool.query('SELECT * FROM oc_courses WHERE url = $1', [courseUrl], (error, result) => {
    if (error) {
        throw error
    }
    if (result.rows.length > 0) {
        // Если запись уже существует, возвращаем ошибку
        response.status(400).send('Course with this URL already exists')
    } else {
        // Если запись не существует, осуществляем вставку новой записи
        pool.query('INSERT INTO oc_courses (title, description, url, teacher_id, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING id', [courseTitle, description, courseUrl, teacherId, categoryId], (error, result) => {
            if (error) {
                throw error
            }
            const courseId = result.rows[0].id
            pool.query('INSERT INTO oc_programs (title, course_id, teacher_id, type) VALUES ($1, $2, $3, $4) RETURNING id', [programTitle, courseId, teacherId, programType], (error, result) => {
                if (error) {
                    throw error
                }
                const programId = result.rows[0].id
                response.status(201).json({ courseId: courseId, programId: programId });
            })
        })
    }
  })
}

const createNewLessonAndExercises = (request, response) => {
  const { title, description, program_id, course_id, exercises } = request.body;
  console.log('request.body', request.body)
  // Add the lesson to the oc_lessons table
  pool.query(
    'INSERT INTO oc_lessons (title, tesis, program_id, course_id, lesson_order) SELECT $1, $2, $3, $4, COALESCE(MAX(lesson_order), 0) + 1 FROM oc_lessons WHERE program_id = $3 RETURNING id;',
    [title, description, program_id, course_id],
    (error, result) => {
      if (error) {
        throw error;
      }
      const lessonId = result.rows[0].id;

      // Add the exercises to the oc_exercises table
      const validExercises = exercises.filter(exercise => exercise !== undefined && exercise !== null);
      let completedQueries = 0;
      validExercises.forEach((exercise) => {
        pool.query(
          'INSERT INTO oc_exercises (lesson_id, exer_order, text, correct_answer) VALUES ($1, $2, $3, $4);',
          [lessonId, exercise.index, exercise.description, exercise.value],
          (error, result) => {
            if (error) {
              throw error;
            }
            completedQueries++;
            if (completedQueries === validExercises.length) {
              response.status(201).send(`Lesson added with ID: ${lessonId}`);
            }
          }
        );
      });
    }
  );
};

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
        response.status(201).send(result)
    })
}

const createStudentAndProgram = async (request, response) => {
  const { studentSurname, studentName, studentPatronymic, nickname, programId } = request.body;

  try {
    const { rows } = await pool.query('SELECT nickname FROM oc_students WHERE nickname = $1', [nickname]);
    if (rows.length > 0) {
        return response.status(400).send("Данный логин уже зарегистрирован, необходимо попробовать другой");
    }
    const studentResult = await pool.query('INSERT INTO oc_students (surname, name, patronymic, nickname) VALUES ($1, $2, $3, $4) RETURNING id', [studentSurname, studentName, studentPatronymic, nickname]);
    const studentId = studentResult.rows[0].id;
    const programResult = await pool.query('SELECT course_id, start_time, id FROM oc_lessons WHERE program_id = $1', [programId]);

    const lessonsToSchedule = programResult.rows.filter(row => row.course_id);

    const scheduleQueries = lessonsToSchedule.map(async row => {
        const existing = await pool.query('SELECT id FROM oc_schedule WHERE student_id = $1 AND lesson_id = $2', [studentId, row.id]);
        if (existing.rows.length === 0) {
            const startTime = row.start_time || null;
            await pool.query('INSERT INTO oc_schedule (student_id, course_id, lesson_id, start_time) VALUES ($1, $2, $3, $4)', [studentId, row.course_id, row.id, startTime]);
        }
    });

    await Promise.all(scheduleQueries);

    await pool.query('INSERT INTO oc_student_course_middleware (student_id, course_id, program_id) VALUES ($1, (SELECT course_id FROM oc_programs WHERE id = $2), $2)', [studentId, programId]);
    
    return response.status(201).send();
  } catch (error) {
      console.error(error);
      return response.status(500).send();
  }
};

const createGroup = (request, response) => {
    const { teacherId, title, programId } = request.body;
    
    pool.query('INSERT INTO oc_groups (title, teacher_id, program_id) VALUES ($2, $1, $3)', [teacherId, title, programId], (error, result) => {
        if (error) {
            throw error;
        }
        pool.query("SELECT max(id) as id from oc_groups", (error, result) => {
            if (error) {
                throw error;
            }
            response.status(200).json(result.rows[0])
        });
    });
  
};

const createStudentGroup = (request, response) => {
    const { groupId, studentId, courseId, programId } = request.body;
    
    pool.query('INSERT INTO oc_student_group_middleware (group_id, student_id, course_id, program_id) VALUES ($1, $2, $3, $4)', [groupId, studentId, courseId, programId], (error, result) => {
        if (error) {
            throw error;
        }
        response.status(201).send();
    });
  
};

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
    const { answerText, lessonId, exerciseId, studentId, status, comment } = request.body
    console.log(request.body);
    pool.query('INSERT INTO oc_answers (text, lesson_id, exercise_id, student_id, status, student_comment) VALUES ($1, $2, $3, $4, $5, $6)', [answerText, lessonId, exerciseId, studentId, status, comment], (error, result) => {
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
    pool.query('INSERT INTO oc_programs (title, course_id, teacher_id) VALUES ($1, $2, $3)', [programTitle, programCourseId, programTeacherId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Program added with ID: ${result.insertId}`)
    })
}

const createNewProgram = (request, response) => {
    const { programTitle, programCourseId, programTeacherId, programType } = request.body
    pool.query('INSERT INTO oc_programs (title, course_id, teacher_id, type) VALUES ($1, $2, $3, $4) RETURNING id', [programTitle, programCourseId, programTeacherId, programType], (error, result) => {
        if (error) {
            throw error
        }
        const programId = result.rows[0].id;
        response.status(201).json({ programId });
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
    const id = parseInt(request.params.id);
  
    pool.query(`
      SELECT p.*, COUNT(DISTINCT l.id) AS lessons_count, COUNT(DISTINCT scm.student_id) AS students_count
      FROM oc_programs p
      LEFT JOIN oc_lessons l ON p.id = l.program_id
      LEFT JOIN oc_student_course_middleware scm ON p.id = scm.program_id
      WHERE p.course_id = $1
      GROUP BY p.id;
    `, [id], (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
      }
    })
  }

const getCurrentProgram = (request, response) => {
    const id = parseInt(request.params.id);
  

    pool.query('SELECT oc_programs.*, oc_courses.description course_description FROM oc_programs INNER JOIN oc_courses ON oc_courses.id = oc_programs.course_id WHERE oc_programs.id=$1', [id], (error, results) => {
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
//   console.log("getTeacherByUrl");

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
  pool.query('SELECT oc_programs.id, oc_programs.lesson_duration, oc_programs.title, oc_programs.teacher_id, oc_programs.course_id, oc_courses.title as "course_title", oc_courses.start_date, oc_courses.end_date, (select count(id) from oc_lessons where oc_programs.id = oc_lessons.program_id) as "lessons_count", (SELECT COUNT(id) FROM oc_student_course_middleware WHERE program_id=oc_programs.id) as studentQty FROM oc_programs INNER JOIN oc_courses on oc_programs.course_id = oc_courses.id where oc_programs.teacher_id=$1 order by oc_programs.course_id desc, oc_programs.id asc', [id], (error, results) => {
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
  pool.query('SELECT oc_programs.id, oc_programs.lesson_duration, oc_programs.title, oc_programs.teacher_id, oc_programs.course_id, oc_courses.url as "course_url", oc_courses.title as "course_title", oc_courses.start_date, oc_courses.end_date, oc_student_course_middleware.*, (select count(id) from oc_lessons where oc_programs.id = oc_lessons.program_id) as "lessons_count" FROM oc_programs INNER JOIN oc_courses on oc_programs.course_id = oc_courses.id INNER JOIN oc_student_course_middleware on oc_programs.id = oc_student_course_middleware.program_id where oc_student_course_middleware.student_id=$1 order by oc_programs.id asc', [id], (error, results) => {
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
  pool.query('SELECT * from oc_lessons where program_id=$1 order by lesson_order asc', [id], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getStudentLessonsByProgramId_old = (request, response) => {
    const { studentId, programId } = request.body;
    // const answer_status = 'correct'
    pool.query('SELECT DISTINCT oc_lessons.id, oc_lessons.title, oc_lessons.course_id, oc_lessons.tesis, oc_lessons.start_time, oc_lessons.lesson_order, oc_lessons.program_id, oc_lessons.translation_link as default_lesson_link, (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,  (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1) AS done_exer, FLOOR(COALESCE(NULLIF((SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1), 0) * 100, 0) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)) AS score, oc_student_course_middleware.student_id, oc_student_course_middleware.paid, oc_schedule.start_time as "personal_time", oc_schedule.translation_link as "personal_lesson_link", oc_schedule.status     FROM oc_lessons     INNER JOIN oc_student_course_middleware ON oc_lessons.program_id = oc_student_course_middleware.program_id     INNER JOIN oc_schedule ON oc_lessons.id = oc_schedule.lesson_id WHERE oc_lessons.program_id = $2     AND oc_student_course_middleware.program_id = $2     AND oc_student_course_middleware.student_id = $1     AND oc_student_course_middleware.student_id = oc_schedule.student_id    ORDER BY lesson_order ASC', [studentId, programId], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
              response.status(200).json(results.rows);
        }
    })
  }

  const getLessonInfo_new = (request, response) => {
    const {course_url, program_id, student_id} = request.query;
    // const answer_status = 'correct'

    pool.query('SELECT oc_courses.id FROM oc_courses WHERE oc_courses.url=$1', [
        course_url
      ], (error, results) => {
        if (error) {
          throw error
        }
        if (results.rows.length) {
            pool.query('SELECT DISTINCT *, (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,  (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1) AS done_exer, FLOOR(COALESCE(NULLIF((SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1), 0) * 100, 0) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)) AS score, oc_student_course_middleware.student_id, oc_student_course_middleware.paid, oc_schedule.start_time as "personal_time", oc_schedule.translation_link as "personal_lesson_link", oc_schedule.status FROM oc_lessons  INNER JOIN oc_student_course_middleware ON oc_student_course_middleware.program_id = oc_lessons.program_id LEFT JOIN oc_schedule ON oc_lessons.id = oc_schedule.lesson_id AND oc_student_course_middleware.student_id=oc_schedule.student_id WHERE oc_lessons.program_id = $1 AND oc_student_course_middleware.student_id = $2', [
                program_id,
                student_id,
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

const getStudentLessonsByProgramId = (request, response) => {
    const { studentId, programId } = request.body;
    const answer_status = 'correct'
    // console.log('getStudentLessonsByProgramId', request.body)
    pool.query('SELECT oc_lessons.id, oc_lessons.title, oc_lessons.course_id, oc_lessons.tesis, oc_lessons.start_time, oc_lessons.lesson_order, oc_lessons.program_id, oc_lessons.translation_link as default_lesson_link, (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,  (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1) AS done_exer, FLOOR(COALESCE(NULLIF((SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$1 AND oc_answers.status=$3), 0) * 100, 0) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)) AS score, oc_student_course_middleware.student_id, oc_student_course_middleware.paid, oc_schedule.start_time as "personal_time", oc_schedule.translation_link as "personal_lesson_link", oc_schedule.status FROM oc_lessons INNER JOIN oc_student_course_middleware ON oc_student_course_middleware.program_id = oc_lessons.program_id LEFT JOIN oc_schedule ON oc_lessons.id = oc_schedule.lesson_id AND oc_student_course_middleware.student_id=oc_schedule.student_id WHERE oc_lessons.program_id = $2     AND oc_student_course_middleware.program_id = $2     AND oc_student_course_middleware.student_id = $1 ORDER BY oc_lessons.lesson_order', [studentId, programId, answer_status], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.log('getStudentLessonsByProgramId', error)
        }else {
            response.status(200).json(results.rows);
            // console.log('getStudentLessonsByProgramId', results.rows)
        }
    })
}


const createEmptyProgram = (request, response) => {
    const { emptyProgramTitle, emptyProgramCourseId, emptyProgramTeacherId } = request.body
    pool.query('INSERT INTO oc_programs (title, course_id, teacher_id) VALUES ($1, $2, $3)', [emptyProgramTitle, emptyProgramCourseId, emptyProgramTeacherId], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Program added with ID: ${result.insertId}`)
    })
}

const getStudentsByTeacherId = (request, response) => {
  const {id, sort} = request.body;

  pool.query('SELECT oc_student_course_middleware.student_id, oc_student_course_middleware.course_id, oc_student_course_middleware.program_id, oc_courses.title as "course_title", oc_courses.url as "course_url", oc_students.surname, oc_students.name, oc_students.patronymic, oc_students.nickname, oc_students.img, (select count(id) from oc_lessons where oc_student_course_middleware.program_id = oc_lessons.program_id) as "lessons_count", oc_programs.title as "program_title" from oc_student_course_middleware INNER JOIN oc_courses on oc_student_course_middleware.course_id = oc_courses.id INNER JOIN oc_programs on oc_student_course_middleware.program_id = oc_programs.id INNER JOIN oc_students on oc_student_course_middleware.student_id = oc_students.id where oc_courses.teacher_id=$1 ORDER BY $2', [id, sort], (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
      }else {
          response.status(200).json(results.rows);
          console.log("students", results.rows);
          
      }
  })
}

const getStudentsGroupsByTeacherId = (request, response) => {
    const {id, sort} = request.body;
  
    pool.query('SELECT oc_student_group_middleware.student_id, oc_student_group_middleware.course_id, oc_student_group_middleware.program_id, oc_groups.*, oc_courses.title as "course_title", oc_courses.url as "course_url", oc_students.surname, oc_students.name, oc_students.patronymic, oc_students.nickname, oc_students.img, (select count(id) from oc_lessons where oc_student_group_middleware.program_id = oc_lessons.program_id) as "lessons_count", oc_programs.title as "program_title" from oc_student_group_middleware INNER JOIN oc_courses on oc_student_group_middleware.course_id = oc_courses.id INNER JOIN oc_groups on oc_student_group_middleware.group_id = oc_groups.id INNER JOIN oc_programs on oc_student_group_middleware.program_id = oc_programs.id INNER JOIN oc_students on oc_student_group_middleware.student_id = oc_students.id where oc_courses.teacher_id=$1 ORDER BY $2', [id, sort], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
        }else {
            response.status(200).json(results.rows);
            console.log("groups", results.rows);
            
        }
    })
  }

  const getAnswersStatistics = (request, response) => {
    const { id, sort, studentId, programId, ansState } = request.body;

    let query = `SELECT DISTINCT 
                  oc_students.id AS student_id,
                  oc_students.surname,
                  oc_students.name,
                  oc_courses.id AS course_id,
                  oc_courses.title AS course_title,
                  oc_programs.id AS program_id,
                  oc_programs.title AS program_title,
                  oc_lessons.start_time AS lesson_start_time,
                  oc_lessons.id AS lesson_id,
                  oc_schedule.start_time AS student_lesson_start_time,
                  oc_lessons.title AS lesson_title,
                  oc_lessons.lesson_order,
                  oc_answers.student_comment,
                  (COUNT(oc_exercises.id) * 5) AS total_possible_mark,
                  SUM(oc_answers.teacher_mark) AS total_obtained_mark,
                  COUNT(oc_answers.id) = COUNT(oc_exercises.id) AS is_checked,
                  100 / (COUNT(oc_exercises.id) * 5) * SUM(oc_answers.teacher_mark) AS percent_completed,
                  CASE 
                    WHEN COUNT(oc_answers.id) = 0 THEN 'Not started'
                    WHEN COUNT(oc_answers.id) = COUNT(oc_exercises.id) THEN 'Checked'
                    ELSE 'In progress' 
                  END AS status,
                  CASE 
                    WHEN COUNT(oc_answers.id) = 0 THEN NULL
                    ELSE SUM(oc_answers.teacher_mark) / COUNT(DISTINCT oc_exercises.id) 
                  END AS average_mark
                FROM
                  oc_students
                  INNER JOIN oc_answers ON oc_students.id = oc_answers.student_id
                  INNER JOIN oc_lessons ON oc_answers.lesson_id = oc_lessons.id
                  INNER JOIN oc_schedule ON oc_lessons.id = oc_schedule.lesson_id AND oc_students.id = oc_schedule.student_id
                  INNER JOIN oc_courses ON oc_lessons.course_id = oc_courses.id
                  INNER JOIN oc_programs ON oc_courses.id = oc_programs.course_id
                  INNER JOIN oc_exercises ON oc_lessons.id = oc_exercises.lesson_id
                WHERE
                  oc_courses.teacher_id = $1`;

    let values = [id];

    if (studentId) {
      query += ` AND oc_students.id = $2`;
      values.push(studentId);
    }

    if (programId) {
      query += ` AND oc_programs.id = $${values.length + 1}`;
      values.push(programId);
    }

    query += ` GROUP BY 
                  oc_students.id, 
                  oc_courses.id, 
                  oc_programs.id, 
                  oc_lessons.id, 
                  oc_schedule.id, 
                  oc_answers.student_comment 
              HAVING 
                COUNT(oc_exercises.id) > 0`;

    if (ansState !== undefined) {
      if (ansState === true) {
        query += ` AND COUNT(oc_answers.id) = COUNT(DISTINCT oc_exercises.id)`;
      } else {
        query += ` AND COUNT(oc_answers.id) < COUNT(DISTINCT oc_exercises.id)`;
      }
    }

    if (sort) {
      query += ` ORDER BY ${sort}`;
    }

    pool.query(query, values, (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log("students groups", results.rows);
      }
    });
  };

  const getAssignmentsByTeacherId = (request, response) => {
    const { id } = request.body;

    pool.query('SELECT DISTINCT oc_answers.id as "answer_id", oc_exercises.id as "exercise_id", oc_exercises.exer_order as "exercise_order", oc_lessons.id as "lesson_id", oc_students.id as "student_id", oc_students.name as "student_name", oc_exercises.text as "exercise_text", oc_answers.text as "answer_text", oc_answers.student_comment as "student_comment", oc_answers.comment as "teacher_comment", oc_answers.teacher_mark as "teacher_mark" ' +
      'FROM oc_students ' +
      'INNER JOIN oc_answers ON oc_students.id = oc_answers.student_id ' +
      'INNER JOIN oc_lessons ON oc_answers.lesson_id = oc_lessons.id ' +
      'INNER JOIN oc_courses ON oc_lessons.course_id = oc_courses.id ' +
      'INNER JOIN oc_programs ON oc_courses.id = oc_programs.course_id ' +
      'INNER JOIN oc_exercises ON oc_lessons.id = oc_exercises.lesson_id ' +
      'WHERE oc_programs.teacher_id = $1 ' +
      'ORDER BY oc_answers.id', [id], (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log("assignments", results.rows);
      }
    })
  }

  const getGroupsByTeacherId = (request, response) => {
    const {id} = request.body;
  
    pool.query('SELECT DISTINCT oc_student_group_middleware.course_id, oc_student_group_middleware.program_id, oc_groups.*, oc_courses.title as "course_title", oc_courses.url as "course_url", oc_programs.title as "program_title" from oc_student_group_middleware INNER JOIN oc_courses on oc_student_group_middleware.course_id = oc_courses.id INNER JOIN oc_groups on oc_student_group_middleware.group_id = oc_groups.id INNER JOIN oc_programs on oc_student_group_middleware.program_id = oc_programs.id where oc_courses.teacher_id=$1 ORDER BY oc_groups.id', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
        }else {
            response.status(200).json(results.rows);
            console.log("groups", results.rows);
            
        }
    })
  }

const getExercisesByLessonId = (request, response) => {
  const id = request.params.id;
  pool.query('SELECT * from oc_exercises where lesson_id=$1 order by id', [id], (error, results) => {
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

const updateStudentProgramStatus = (request, response) => {
    const { studentId, programId, status } = request.body

    pool.query(
        'UPDATE oc_student_course_middleware SET status = $3 WHERE student_id = $1 and program_id = $2',
        [studentId, programId, status],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Student program modified`)
        }
    )
}

const addStudentProgram = (request, response) => {
    const { nickname, programId } = request.body

    pool.query("SELECT * from oc_students WHERE nickname = $1", [nickname], (error, result) => {
        if (error) {
            throw error;
        }
        if (result.rows.length > 0) {
            const studentId = result.rows[0].id;
            pool.query("SELECT course_id as id from oc_programs WHERE id = $1", [programId], (error, result2) => {
                if (error) {
                    throw error;
                }
                const courseId = result2.rows[0].id;
                pool.query('INSERT INTO oc_student_course_middleware (student_id, course_id, program_id) VALUES ($1, $2, $3)', [studentId, courseId, programId], (error, result) => {
                    if (error) {
                        throw error;
                    }
                    response.status(201).send(`Program added with ID: ${result.insertId}`)
                });
            });
        } else {
            response.status(400).send("Логин не найден");
        }
    })
}

const updateStudentData = (request, response) => {
    const { name, surname, patronymic, nickname, id } = request.body

    pool.query(
        'UPDATE oc_students SET name = $1, surname = $2, patronymic = $3, nickname = $4  WHERE id = $5',
        [name, surname, patronymic, nickname, id],
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
    const { programId, programTitle, courseId, programDesc } = request.body

    pool.query(
        'UPDATE oc_programs SET title = $2, course_id = $3, description = $4 WHERE id = $1',
        [programId, programTitle, courseId, programDesc],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Program updated`)
        }
    )
}

const updateNewProgram = (request, response) => {
    const { programId, title, type, courseId, teacherId } = request.body

    pool.query(
        'UPDATE oc_programs SET title = $2, type=$3, course_id = $4 WHERE id = $1',
        [programId, title, type, courseId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Program updated`)
        }
    )
}

const updateProgramDuration = (request, response) => {
    const { programId, duration } = request.body

    pool.query(
        'UPDATE oc_programs SET lesson_duration = $2 WHERE id = $1',
        [programId, duration],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Program updated`)
        }
    )
}

const updateCourse = (request, response) => {
    const { 
        courseId,
        title, 
        courseUrl,
        courseCategory 
    } = request.body;

    pool.query(
        'UPDATE oc_courses SET title = $2, url = $3, category_id = $4 WHERE id = $1',
        [
            courseId,
            title,
            courseUrl,
            courseCategory 
        ],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Course updated`)
        }
    )
}

const updateNewCourse = (request, response) => {
    const { 
        courseId,
        title, 
        description,
        courseCategory 
    } = request.body;

    pool.query(
        'UPDATE oc_courses SET title = $2, description = $3, category_id = $4 WHERE id = $1',
        [
            courseId,
            title,
            description,
            courseCategory 
        ],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Course updated`)
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

const updateNewLesson = (request, response) => {
    const { lessonId, lessonTitle, lessonDesc, exerciseId, exerciseText, exerciseAnswer } = request.body;

    // Обновляем таблицу oc_lessons
    pool.query(
        'UPDATE oc_lessons SET title = $2, tesis = $3 WHERE id = $1',
        [lessonId, lessonTitle, lessonDesc],
        (error, results) => {
            if (error) {
                throw error
            }
            
            // Обновляем таблицу oc_exercises
            pool.query(
                'UPDATE oc_exercises SET text = $2, correct_answer = $3 WHERE id = $1',
                [exerciseId, exerciseText, exerciseAnswer],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).send(`Lesson updated`)
                }
            )
        }
    )
}

const deleteLesson = (request, response) => {
  const { id } = request.body;

  pool.query('DELETE FROM oc_lessons WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    pool.query('DELETE FROM oc_answers WHERE lesson_id = $1', [id], (error, results) => {
      if (error) {
        throw error;
      }
    });
    pool.query('DELETE FROM oc_exercises WHERE lesson_id = $1', [id], (error, results) => {
      if (error) {
        throw error;
      }
      pool.query('DELETE FROM oc_teacher_comments WHERE exercise_id IN (SELECT id FROM oc_exercises WHERE lesson_id = $1)', [id], (error, results) => {
        if (error) {
          throw error;
        }
      });
      
      response.status(200).send(`lesson deleted with ID: ${id}`);
    });
  });
};

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
        pool.query('DELETE FROM oc_teacher_comments WHERE exercise_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });

        response.status(200).send(`exercise deleted with ID: ${id}`)
    })
}

const updateAnswerStatus = (request, response) => {
    const { id, status, mark } = request.body
    console.log("mark",id, status, mark);

    pool.query('UPDATE oc_answers SET status = $2, teacher_mark = $3 WHERE id = $1', [id, status, mark], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`answer status updated`)
    })
}

const updateStudentAnswer = (request, response) => {
    const { answerText, answerId, status, comment } = request.body

    pool.query('UPDATE oc_answers SET text=$1, status=$3, student_comment=$4 WHERE id = $2', [answerText, answerId, status, comment], (error, results) => {
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
    pool.query('SELECT oc_courses.*, count(oc_programs.id) AS program_count, oc_course_categories.name AS category_name FROM oc_courses LEFT JOIN oc_programs ON oc_programs.course_id = oc_courses.id LEFT JOIN oc_course_categories ON oc_course_categories.id = oc_courses.category_id WHERE oc_courses.teacher_id=$1 GROUP BY oc_courses.id, oc_course_categories.name', [id], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
        } else {
            response.status(200).json(results.rows);
        }
    })
}

const getPassedStudents = (request, response) => {
    const id = request.params.id;
    const status = 'complieted'
    pool.query('SELECT count(DISTINCT oc_student_course_middleware.student_id) AS passed_students '
    + 'FROM oc_student_course_middleware '
    + 'WHERE oc_student_course_middleware.course_id = $1 AND oc_student_course_middleware.status=$2', [id, status], (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
            response.status(200).json(results.rows);
      }
    });
}

const getAllStudents = (request, response) => {
    const id = request.params.id;
    pool.query('SELECT count(DISTINCT oc_schedule.student_id) AS all_students FROM oc_schedule WHERE oc_schedule.course_id = $1 ', [id], (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
            response.status(200).json(results.rows);
      }
    })
}

const getStudentCourseInfo = (request, response) => {
  const {student_nick, course_url} = request.query;
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
    const answer_status = 'correct'

    pool.query('SELECT oc_courses.id FROM oc_courses WHERE oc_courses.url=$1', [
        course_url
      ], (error, results) => {
        if (error) {
          throw error
        }
        if (results.rows.length) {
            pool.query('SELECT DISTINCT oc_lessons.id, oc_lessons.*, oc_answers.teacher_mark, (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,  (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$3) AS done_exer, FLOOR(COALESCE(NULLIF((SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$3 AND oc_answers.status=$4), 0) * 100, 0) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)) AS score, oc_student_course_middleware.student_id, oc_student_course_middleware.paid, oc_schedule.start_time as "personal_time", oc_schedule.status, oc_lessons.translation_link as default_lesson_link, oc_schedule.translation_link as "personal_lesson_link" FROM public.oc_lessons INNER JOIN oc_student_course_middleware on oc_lessons.program_id = oc_student_course_middleware.program_id INNER JOIN oc_schedule on oc_lessons.id = oc_schedule.lesson_id INNER JOIN oc_courses ON oc_courses.id=oc_lessons.course_id INNER JOIN oc_answers ON oc_answers.lesson_id=oc_lessons.id WHERE oc_courses.url=$1 AND oc_lessons.program_id=$2 AND oc_student_course_middleware.program_id = $2 AND oc_student_course_middleware.student_id = $3 AND oc_student_course_middleware.student_id = oc_schedule.student_id ORDER BY oc_lessons.lesson_order ASC', [
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

const getLessonInfo_v2 = (request, response) => {
    const { course_url, program_id, student_id } = request.query;
    const answer_status = 'correct';

    pool.query(
      'SELECT oc_courses.id FROM oc_courses WHERE oc_courses.url=$1',
      [course_url],
      (error, results) => {
        if (error) {
          throw error;
        }
        if (results.rows.length) {
          pool.query(
            `
            SELECT DISTINCT oc_lessons.id,
              oc_lessons.*,
              oc_answers.teacher_mark,
              (SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id) AS all_exer,
              (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$3) AS done_exer,
              FLOOR(
                COALESCE(
                  NULLIF(
                    (SELECT COUNT(id) FROM oc_answers WHERE oc_lessons.id=oc_answers.lesson_id AND oc_answers.student_id=$3 AND oc_answers.status=$4), 0
                  ) * 100, 0
                ) / NULLIF((SELECT COUNT(id) FROM oc_exercises WHERE oc_lessons.id=oc_exercises.lesson_id), 0)
              ) AS score,
              oc_student_course_middleware.student_id,
              oc_student_course_middleware.paid,
              oc_schedule.start_time as "personal_time",
              oc_schedule.status,
              oc_lessons.translation_link as default_lesson_link,
              oc_schedule.translation_link as "personal_lesson_link"
            FROM public.oc_lessons
            INNER JOIN oc_student_course_middleware on oc_lessons.program_id = oc_student_course_middleware.program_id
            INNER JOIN oc_schedule on oc_lessons.id = oc_schedule.lesson_id
            INNER JOIN oc_courses ON oc_courses.id=oc_lessons.course_id
            LEFT JOIN oc_answers ON oc_answers.lesson_id=oc_lessons.id AND oc_answers.student_id=$3
            WHERE oc_courses.url=$1
              AND oc_lessons.program_id=$2
              AND oc_student_course_middleware.program_id = $2
              AND oc_student_course_middleware.student_id = $3
              AND oc_student_course_middleware.student_id = oc_schedule.student_id
            ORDER BY oc_lessons.lesson_order ASC
            `,
            [course_url, program_id, student_id, answer_status],
            (error, results) => {
              if (error) {
                throw error;
              }
              response.status(200).json(results.rows);
            }
          );
        } else {
          console.log('error');
        }
      }
    );
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
    pool.query('INSERT INTO oc_schedule (start_time, lesson_id, course_id, student_id) VALUES ($1, $2, $3, $4)', [dateAndTimeMerger.trim(), lesson_id, course_id, student_id], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Schedule added with ID: ${result.insertId}`)
    })
}

const updateSchedule = (request, response) => {
    const { dateAndTimeMerger, lesson_id, course_id, student_id } = request.body

    pool.query('UPDATE oc_schedule SET start_time = $1 WHERE lesson_id = $2 and course_id = $3 and student_id = $4', [dateAndTimeMerger.trim(), lesson_id, course_id, student_id], (error, results) => {
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

  const getStudentByIdForLesson = (request, response) => {
    const studentId = request.body.studentId;

    pool.query('SELECT * FROM oc_students INNER JOIN oc_schedule on oc_students.id = oc_schedule.student_id INNER JOIN oc_courses on oc_schedule.course_id = oc_courses.id where oc_students.id=$1', [studentId], (error, results) => {
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
    pool.query('SELECT *, oc_teachers.url as url, oc_courses.url as course_url FROM oc_teachers INNER JOIN oc_courses on oc_teachers.id = oc_courses.teacher_id INNER JOIN oc_schedule on oc_courses.id = oc_schedule.course_id where oc_schedule.translation_link=$1', [room], (error, results) => {
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

    pool.query('INSERT INTO oc_teacher_comments (student_id, exercise_id, text, date) VALUES ($1, $2, $3, $4)', [studentId, exerciseId, text, date], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Comment added with ID: ${result.insertId}`)
    })
}

const getTeacherCommentsByStudExId = (request, response) => {
    const { studentId, exerciseId } = request.body
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
    const studentId = request.body['student_id']
    console.log("getStudentById", request.body);
    pool.query('SELECT * FROM oc_students where id=$1', [studentId], (error, results) => {
         if (error) {
             throw error
         }
         console.log('student sent');
         response.status(200).json(results.rows)
     })
 }

const getCourseById = (request, response) => {
    const { courseId } = request.body
    pool.query('SELECT * FROM oc_courses where id=$1', [courseId], (error, results) => {
         if (error) {
             throw error
         }
         console.log('course sent');
         response.status(200).json(results.rows)
     })
 }

const getCourseByProgramId = (request, response) => {
    const { programId } = request.body
    pool.query('SELECT c.* FROM oc_programs p JOIN oc_courses c ON p.course_id = c.id WHERE p.id = $1' , [programId], (error, results) => {
      if (error) {
        throw error
      }
      console.log('course sent');
      response.status(200).json(results.rows[0])
    })
}

const getDatesForApplication = (request, response) => {
  const id = request.params.id;
  pool.query('SELECT a.id, a.trial_lesson_datetime AS lesson_time FROM oc_applications a JOIN oc_courses c ON a.course_id = c.id WHERE c.id in(' + id + ') ' +
 ' UNION ALL SELECT l.id, l.start_time AS lesson_time FROM oc_lessons l JOIN oc_courses c ON l.course_id = c.id WHERE c.id in(' + id + ') ' +
 ' UNION ALL SELECT s.id, s.start_time AS lesson_time FROM oc_schedule s JOIN oc_courses c ON s.course_id = c.id WHERE c.id in(' + id + ')', (error, results) => {
      if (error) {
          response.status(500).json('error');
          console.error(error);
          
      }else {
          response.status(200).json(results.rows);
          
      }
  })
}

const getDatesForApplicationSecond = (request, response) => {
    const {coursesId, teacherId} = request.body;
    pool.query(
        'SELECT a.id, a.trial_lesson_datetime AS lesson_time FROM oc_applications a JOIN oc_courses c ON a.course_id = c.id WHERE c.id in(' + coursesId + ') ' +
        ' UNION ALL SELECT l.id, l.start_time AS lesson_time FROM oc_lessons l JOIN oc_courses c ON l.course_id = c.id WHERE c.id in(' + coursesId + ') ' +
        ' UNION ALL SELECT s.id, s.start_time AS lesson_time FROM oc_schedule s JOIN oc_courses c ON s.course_id = c.id WHERE c.id in(' + coursesId + ')'+
        ' UNION ALL SELECT o.id, o.start_time AS lesson_time FROM oc_other_lessons o WHERE o.teacher_id = $1', [teacherId],
    (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
}

// const getAnswersByStudExId = (request, response) => {
//     const { studentId, exerciseId } = request.body
//     // console.log('ID',id)
//     pool.query('SELECT * from oc_answers where student_id=$1 and exercise_id=$2', [studentId, exerciseId], (error, results) => {
//       if (error) {
//           response.status(500).json('error');
//           console.error(error);
            
//       } else {
//           response.status(200).json(results.rows);  
//       }
//     })
//   }

const deleteProgram = (request, response) => {
    const { id } = request.body;

    pool.query('SELECT id FROM oc_lessons WHERE program_id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }

        const lessonIds = results.rows.map(row => row.id);

        pool.query('DELETE FROM oc_exercises WHERE lesson_id = ANY($1)', [lessonIds], (error, results) => {
            if (error) {
                throw error;
            }

            pool.query('DELETE FROM oc_answers WHERE lesson_id = ANY($1)', [lessonIds], (error, results) => {
                if (error) {
                    throw error;
                }

                pool.query('DELETE FROM oc_lessons WHERE program_id = $1', [id], (error, results) => {
                    if (error) {
                        throw error;
                    }

                    pool.query('DELETE FROM oc_student_course_middleware WHERE program_id = $1', [id], (error, results) => {
                        if (error) {
                            throw error;
                        }

                        pool.query('DELETE FROM oc_programs WHERE id = $1', [id], (error, results) => {
                            if (error) {
                                throw error;
                            }

                            pool.query('DELETE FROM oc_teacher_comments WHERE exercise_id IN (SELECT id FROM oc_exercises WHERE lesson_id = ANY($1))', [lessonIds], (error, results) => {
                                if (error) {
                                    throw error;
                                }

                                response.status(200).send(`Program deleted with ID: ${id}`);
                            });
                        });
                    });
                });
            });
        });
    });
};

const deleteCourse = (request, response) => {
    const { id } = request.body;

    pool.query('DELETE FROM oc_courses WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        pool.query('DELETE FROM oc_course_info_blocks WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_course_prices WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_course_skills WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_course_stages WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_course_targets WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_course_comments WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_schedule WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('DELETE FROM oc_student_course_middleware WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }
        });
        pool.query('SELECT id FROM oc_lessons WHERE course_id = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }

            const lessonIds = results.rows.map(row => row.id);

            pool.query('DELETE FROM oc_exercises WHERE lesson_id = ANY($1)', [lessonIds], (error, results) => {
                if (error) {
                    throw error;
                }
            });
            pool.query('DELETE FROM oc_answers WHERE lesson_id = ANY($1)', [lessonIds], (error, results) => {
                if (error) {
                    throw error;
                }
            });
            pool.query('DELETE FROM oc_lessons WHERE course_id = $1', [id], (error, results) => {
                if (error) {
                    throw error;
                }
            });
            pool.query('DELETE FROM oc_programs WHERE course_id = $1', [id], (error, results) => {
                if (error) {
                    throw error;
                }
            });
            pool.query('DELETE FROM oc_teacher_comments WHERE exercise_id IN (SELECT id FROM oc_exercises WHERE lesson_id = ANY($1))', [lessonIds], (error, results) => {
                if (error) {
                    throw error;
                }

                response.status(200).send(`Course deleted with ID: ${id}`);
            });
        });
    });
};

const updateLessonNumber = (request, response) => {
    const { new_number, lesson_id } = request.body

    pool.query('UPDATE oc_lessons SET lesson_order = $1 WHERE id = $2', [new_number, lesson_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Lesson Number updated`)
    })
}

const updateExerNumber = (request, response) => {
    const { new_order, exercise_id } = request.body

    pool.query('UPDATE oc_exercises SET exer_order = $1 WHERE id = $2', [new_order, exercise_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`Exer Number updated`)

    })
}

const deleteStudentOneProgram = (request, response) => {
    const {studentId, programId} = request.body

    pool.query('DELETE FROM oc_student_course_middleware WHERE student_id = $1 and program_id = $2', [studentId, programId], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`program deleted with ID: ${studentId}`)
    })
}

const deleteStudent = (request, response) => {
    const {id} = request.body

    pool.query('DELETE FROM oc_students WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`lesson deleted with ID: ${id}`)
    })
}

const getServerTime = (request, response) => {
    response.status(200).json(new Date())
}

const getCourseUrl = (request, response) => {
    const { url } = request.body
    pool.query('SELECT * FROM oc_courses WHERE url = $1' , [url], (error, results) => {
        if (error) {
            throw error
          }
          console.log('course sent');
          response.status(200).json(results.rows)
        })
    }

const updateTeacherData = (request, response) => {
    const id = parseInt(request.params.id)
    const { surname, name, patronymic, skills, experience, avatar, url, teacherDescription, email, phone } = request.body
    // console.log(surname, name, patronymic, skills, experience, avatar, url, teacherDescription, email, phone, "surname, name, patronymic, skills, experience, avatar, url, teacherDescription, email, phone");

    pool.query('UPDATE oc_teachers SET surname = $1, name = $2, patronymic = $3, skills = $4, experience = $5, avatar = $6, url = $7, description = $8, email = $10, phone = $11 WHERE id = $9', [surname, name, patronymic, skills, experience, avatar, url, teacherDescription, id, email, phone], (error, result) => {
        if (error) {
            throw error
        }
        // response.status(201).send(`Teacher added with ID: ${result.insertId}`)
        // updateTeacher
        // fullname = $1
    })
}

const getStudentByUrl = (request, response) => {
    // console.log("getStudentByUrl");
    const studentUrl = request.body['studentUrl']
    // console.log(studentUrl, "getStudentByUrl", request.body);
    pool.query('SELECT * FROM oc_students where nickname=$1', [studentUrl], (error, results) => {
         if (error) {
             throw error
         }
         console.log('student sent');
         response.status(200).json(results.rows)
     })
 }

const updateStudentDataFromProfile = (request, response) => {
    const { name, surname, patronymic, id, img, phone, email, nickname } = request.body
    // console.log(name, surname, patronymic, id, img, phone, email, nickname, "name, surname, patronymic, id, img, phone, email, nickname");

    pool.query(
        'UPDATE oc_students SET name = $1, surname = $2, patronymic = $3, img = $5, phone = $6, email = $7, nickname = $8  WHERE id = $4',
        [name, surname, patronymic, id, img, phone, email, nickname],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Student program modified`)
        }
    )
}

const getAllCoursesAndProgramsOfStudent = (request, response) => {
    const {studentId} = request.query;
    pool.query('SELECT * FROM oc_student_course_middleware where student_id=$1', [
        studentId
    ], (error, results) => {
      if (error) {
            response.status(500).json('error');
            console.error(error);
            
        }else {
            response.status(200).json(results.rows);
            
        }
    })
  }

const updateUserLogin = (request, response) => {
    const { nick, id, roleId } = request.body

    pool.query(
        'UPDATE oc_users SET nick = $1 WHERE person_id = $2 AND role_id = $3',
        [nick, id, roleId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Student program modified`)
        }
    )
}

const updateUserPassword = (request, response) => {
    const { password, id, roleId } = request.body

    pool.query(
        'UPDATE oc_users SET password = $1 WHERE person_id = $2 AND role_id = $3',
        [password, id, roleId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Student program modified`)
        }
    )
}

const getProgramById = (request, response) => {
    const { programId } = request.body
    console.log('programId', programId)
    pool.query('SELECT p.*, c.title as course_title FROM oc_programs p JOIN oc_courses c ON p.course_id = c.id WHERE p.id = $1', [programId], (error, results) => {
         if (error) {
             throw error
         }
         console.log('course sent');
         response.status(200).json(results.rows)
     })
 }

const getLessonById = (request, response) => {
    const { lessonId } = request.body
    console.log('lessonId', lessonId)
    pool.query('SELECT oc_lessons.*, oc_programs.title as "program_title" FROM oc_lessons INNER JOIN oc_programs ON oc_lessons.program_id = oc_programs.id WHERE oc_lessons.id = $1', [lessonId], (error, results) => {
         if (error) {
             throw error
         }
         console.log('lesson sent');
         response.status(200).json(results.rows)
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
  createNewProgram,
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
  updateNewProgram,
  updateProgramDuration,
  updateLesson,
  updateNewLesson,
  deleteLesson,
  updateExercise,
  deleteExercise,
  getLessonInfo,
  getLessonInfo_v2,
  getLessonInfo_new,
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
  getDatesForApplication,
  deleteProgram,
  deleteCourse,
  getDatesForApplicationSecond,
  updateLessonNumber,
  updateExerNumber,
  getStudentByIdForLesson,
  getPassedStudents,
  getAllStudents,
  updateCourse,
  updateNewCourse,
  updateStudentData,
  deleteStudentOneProgram,
  deleteStudent,
  updateStudentProgramStatus,
  addStudentProgram,
  createStudentAndProgram,
  registerUser,
  loginUser,
  getCourseByProgramId,
  getServerTime,
  restorePassword,
  updatePassword,
  getCourseUrl,
  updateTeacherData,
  getStudentByUrl,
  updateStudentDataFromProfile,
  getAllCoursesAndProgramsOfStudent,
  updateUserLogin,
  updateUserPassword,
  getGroupsByTeacherId,
  getStudentsGroupsByTeacherId,
  createGroup,
  createStudentGroup,
  getProgramById,
  createCourseAndProgram,
  createNewLessonAndExercises,
  getLessonById,
  getAnswersStatistics,
  getAssignmentsByTeacherId
};