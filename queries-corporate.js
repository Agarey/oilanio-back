import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
import axios from 'axios';
import { request, response } from 'express';
moment.locale('ru');
import jwt from 'jsonwebtoken'
import { secret } from "./config.js"
import { v4 as uuidv4 } from 'uuid';
import { productionPoolOptions, sendEmail } from './accesses.js';
import bcrypt from 'bcryptjs';

const Pool = pg.Pool
const pool = new Pool(productionPoolOptions);

const stuffEmails = [
  'alexdrumm13@gmail.com'
];

// Авторизация
const loginUser = async (request, response) => {
  const { login, password } = request.body;

  try {
    const user = await pool.query('SELECT * FROM co_users WHERE login = $1', [login]);

    if (user.rows.length > 0) {
      const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

      if (!validPassword) {
        return response.status(400).json({ error: 'Введен неверный пароль' });
      }

      const token = jwt.sign(
        { userId: user.rows[0].id, login: user.rows[0].login, role: user.rows[0].role_id },
        secret,
        { expiresIn: '24h' }
      );

      return response.status(200).json({ token, userId: user.rows[0].id });
    } else {
      return response.status(400).json({ error: 'Пользователь с таким логином не найден' });
    }
  } catch (e) {
    console.log(e);
    return response.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Аутентификация
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const getUser = async (request, response) => {
  const { userId } = request.user;

  try {
    const result = await pool.query('SELECT * FROM co_users WHERE id = $1', [userId]);

    if (result.rows.length > 0) {
      response.status(200).json(result.rows[0]);
    } else {
      response.status(404).json({ error: 'User not found' });
    }
  } catch (e) {
    console.log(e);
    response.status(500).json({ error: 'Server error' });
  }
};

const createLocation = (request, response) => {
  const { name, parent_id } = request.body

  pool.query('INSERT INTO co_locations (name, parent_id) VALUES ($1, $2)', [name, parent_id], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Location added`)
  })
}

const getAllLocations = (request, response) => {
  pool.query('SELECT * FROM co_locations ORDER BY name ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('locations sent');
    response.status(200).json(results.rows)
  })
}

const deleteLocation = (request, response) => {
  const { id } = request.body
  console.log('deleteLocation', id)
  pool.query('DELETE FROM co_locations WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`location deleted with ID: ${id}`)
  })
}

const createDirector = (request, response) => {
  const { name, surname, patronymic, phones, email } = request.body

  pool.query('INSERT INTO co_directors (name, surname, patronymic, phones, email) VALUES ($1, $2, $3, $4, $5)', [name, surname, patronymic, phones, email], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Director added`)
  })
}

const getAllDirectors = (request, response) => {
  pool.query('SELECT * FROM co_directors ORDER BY surname ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('directors sent');
    response.status(200).json(results.rows)
  })
}

const deleteDirector = (request, response) => {
  const { id } = request.body
  console.log('deleteDirector', id)
  pool.query('DELETE FROM co_directors WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`director deleted with ID: ${id}`)
  })
}

const createEnterpriseStatus = (request, response) => {
  const { name } = request.body

  pool.query('INSERT INTO co_enterprise_statuses (name) VALUES ($1)', [name], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Enterprise status added`)
  })
}

const getAllEnterpriseStatuses = (request, response) => {
  pool.query('SELECT * FROM co_enterprise_statuses ORDER BY name ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('Enterprise statuses sent');
    response.status(200).json(results.rows)
  })
}

const deleteEnterpriseStatus = (request, response) => {
  const { id } = request.body
  console.log('deleteEnterpriseStatus', id)
  pool.query('DELETE FROM co_enterprise_statuses WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`Enterprise status deleted with ID: ${id}`)
  })
}

const createLegalForm = (request, response) => {
  const { name, abbreviation } = request.body

  pool.query('INSERT INTO co_legal_forms (name, abbreviation) VALUES ($1, $2)', [name, abbreviation], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`LegalForm status added`)
  })
}

const getAllLegalForms = (request, response) => {
  pool.query('SELECT * FROM co_legal_forms ORDER BY name ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('LegalForms sent');
    response.status(200).json(results.rows)
  })
}

const deleteLegalForm = (request, response) => {
  const { id } = request.body
  console.log('deleteLegalForm', id)
  pool.query('DELETE FROM co_legal_forms WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`LegalForm deleted with ID: ${id}`)
  })
}

const createOwnershipForm = (request, response) => {
  const { name } = request.body

  pool.query('INSERT INTO co_ownership_forms (name) VALUES ($1)', [name], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`OwnershipForm status added`)
  })
}

const getAllOwnershipForms = (request, response) => {
  pool.query('SELECT * FROM co_ownership_forms ORDER BY name ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('OwnershipForms sent');
    response.status(200).json(results.rows)
  })
}

const deleteOwnershipForm = (request, response) => {
  const { id } = request.body
  console.log('deleteOwnershipForm', id)
  pool.query('DELETE FROM co_ownership_forms WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`OwnershipForm deleted with ID: ${id}`)
  })
}

const createActivityType = (request, response) => {
  const { name, parent_id } = request.body

  pool.query('INSERT INTO co_activity_types (name, parent_id) VALUES ($1, $2)', [name, parent_id], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Activity type added`)
  })
}

const getAllActivityTypes = (request, response) => {
  pool.query('SELECT * FROM co_activity_types ORDER BY name ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('Activity types sent');
    response.status(200).json(results.rows)
  })
}

const deleteActivityType = (request, response) => {
  const { id } = request.body
  console.log('deleteActivityType', id)
  pool.query('DELETE FROM co_activity_types WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`Activity type deleted with ID: ${id}`)
  })
}

const getAllExistingCompanies = (request, response) => {
  pool.query('SELECT * FROM co_companies ORDER BY title ASC', (error, results) => {
    if (error) {
      throw error
    }
    console.log('Companies sent');
    response.status(200).json(results.rows)
  })
}

const createCompany = (request, response) => {
  const {
    title,
    short_title,
    region_id,
    district_id,
    settlement_id,
    parent_id,
    activity_type_id,
    industry_id,
    legal_address,
    actual_address,
    legal_form_id,
    ownership_form_id,
    enterprise_status_id,
    foundation_date,
    bin,
    oked,
    krp,
    kato,
    description,
    director_id,
    phones,
    emails,
    sites
  } = request.body;

  // Получение текущей даты и времени
  const registration_date = new Date();

  // Определение значения для location_id
  const location_id = settlement_id || district_id || region_id;

  // Определение значения для activity_type_id
  const activity_type = industry_id || activity_type_id;

  // Вставка данных в таблицу co_companies
  pool.query(
    `INSERT INTO co_companies (
      title,
      short_title,
      location_id,
      parent_id,
      activity_type_id,
      legal_address,
      actual_address,
      legal_form_id,
      ownership_form_id,
      enterprise_status_id,
      foundation_date,
      bin,
      oked,
      krp,
      kato,
      description,
      director_id,
      phones,
      emails,
      sites,
      registration_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::date, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21::timestamp with time zone) RETURNING id`,
    [
      title,
      short_title,
      location_id,
      parent_id,
      activity_type,
      legal_address,
      actual_address,
      legal_form_id,
      ownership_form_id,
      enterprise_status_id,
      foundation_date,
      bin,
      oked,
      krp,
      kato,
      description,
      director_id,
      phones,
      emails,
      sites,
      registration_date
    ],
    (error, result) => {
      if (error) {
        throw error;
      }

      const companyId = result.rows[0].id;

      // Создание записи в таблице co_users
      const login = generateRandomString(7);
      const password = generateRandomString(10);
      const password_hash = hashPassword(password);
      const role_id = 2;
      const user_id = companyId;

      pool.query(
        `INSERT INTO co_users (login, password_hash, role_id, user_id) VALUES ($1, $2, $3, $4)`,
        [login, password_hash, role_id, user_id],
        (error, result) => {
          if (error) {
            throw error;
          }

          // Отправка уведомления о создании компании
          sendEmail([emails], `Ваши регистрационные данные`, `Логин: ${login}.\nПароль: ${password}.`)

          response.status(201).send(`Company added`);
        }
      );
    }
  );
};

const deleteCompany = (request, response) => {
  const { id } = request.body
  console.log('deleteCompany', id)
  pool.query('DELETE FROM co_companies WHERE id = $1', [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error
    }
    response.status(200).send(`Company deleted with ID: ${id}`)
  })
}

// Функция для генерации случайной строки
const generateRandomString = (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

// Функция для хеширования пароля
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

const getCompanyByUserLogin = (request, response) => {
  const { login } = request.body;
  console.log('login', login)
  const query = `
    SELECT co_companies.*, 
           co_themes.title AS theme_title, co_themes.background_color, co_themes.button_color, co_themes.component_color, co_themes.text_color
    FROM co_companies 
    JOIN co_users ON co_companies.id = co_users.user_id 
    JOIN co_themes ON co_companies.theme_id = co_themes.id
    WHERE co_users.login = $1 AND co_users.role_id = 2
  `;

  pool.query(query, [login], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCompanyByPersonLogin = (request, response) => {
  const { login } = request.body;
  console.log('login', login);

  const query = `
    SELECT co_companies.*, 
           co_themes.title AS theme_title, 
           co_themes.background_color, 
           co_themes.button_color, 
           co_themes.component_color, 
           co_themes.text_color,
           co_courses.title AS course_title
    FROM co_companies 
    JOIN co_persons ON co_companies.id = co_persons.company_id
    JOIN co_users ON co_persons.id = co_users.user_id 
    JOIN co_themes ON co_companies.theme_id = co_themes.id
    JOIN co_person_course_middleware ON co_persons.id = co_person_course_middleware.person_id
    JOIN co_courses ON co_person_course_middleware.course_id = co_courses.id
    WHERE co_users.login = $1 AND co_users.role_id = 4
  `;

  pool.query(query, [login], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const updateCompanyLogo = (request, response) => {
  const id = parseInt(request.params.id)
  const { logo } = request.body
  pool.query('UPDATE co_companies SET logo = $1 WHERE id = $2', [logo, id], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Company logo updated`)
  })
}

const updateCompanyData = (request, response) => {
  const id = parseInt(request.params.id)
  const { title, bin, location_id, actual_address, theme_id } = request.body
  pool.query('UPDATE co_companies SET title = $1, bin = $2, location_id = $3, actual_address = $4, theme_id = $5 WHERE id = $6', [title, bin, location_id, actual_address, theme_id, id], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Company data changed`)
  })
}

const generateVerificationCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let verificationCode = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    verificationCode += characters.charAt(randomIndex);
  }
  return verificationCode;
};

const updateUserVerificationCode = async (request, response) => {
  const login = request.params.login;
  const { email } = request.body;
  const verificationCode = generateVerificationCode();
  try {
    await pool.query('UPDATE co_users SET verification_code = $1 WHERE login = $2', [verificationCode, login]);
    await sendEmail([email], 'Your verification code', `Your verification code is: ${verificationCode}`);
    response.status(200).send('Verification code sent');
  } catch (e) {
    console.log(e);
    return response.status(500).json({ error: 'Server error' });
  }
};

const deleteVerificationCode = async (request, response) => {
  const login = request.params.login;
  try {
    await pool.query('UPDATE co_users SET verification_code = NULL WHERE login = $1', [login]);
    response.status(200).send('Verification code deleted');
  } catch (e) {
    console.log(e);
    return response.status(500).json({ error: 'Server error' });
  }
};

const checkVerificationCode = async (request, response) => {
  const { login, verificationCode } = request.body;
  try {
    const result = await pool.query('SELECT verification_code FROM co_users WHERE login = $1', [login]);
    const storedCode = result.rows[0].verification_code;
    console.log(verificationCode, storedCode)
    if (verificationCode === storedCode) {
      response.status(200).send('Verification successful');
    } else {
      response.status(403).send('Invalid verification code');
    }
  } catch (e) {
    console.log(e);
    return response.status(500).json({ error: 'Server error' });
  }
};

const changePassword = async (request, response) => {
  const login = parseInt(request.params.login)
  const { oldPassword, newPassword } = request.body;

  try {
    const user = await pool.query('SELECT password_hash FROM co_users WHERE login = $1', [login]);

    if (user.rows.length > 0) {
      const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password_hash);

      if (!validPassword) {
        return response.status(400).json({ error: 'Incorrect password' });
      }

      const newPasswordHash = hashPassword(newPassword);
      await pool.query('UPDATE co_users SET password_hash = $1 WHERE login = $2', [newPasswordHash, login]);

    } else {
      return response.status(400).json({ error: 'User not found' });
    }
  } catch (e) {
    console.log(e);
    return response.status(500).json({ error: 'Server error' });
  }
};

const getPlanByCompanyId = (request, response) => {
  const { id } = request.body;
  const query = `
    SELECT 
      co_study_plans.*, 
      SUM(co_courses.price) as total_price 
    FROM co_study_plans
    LEFT JOIN co_courses ON co_study_plans.company_id = co_courses.company_id
    WHERE co_study_plans.company_id = $1
    GROUP BY co_study_plans.id
  `;

  pool.query(query, [id], (error, results) => {
    if (error) {
      console.log(error)
      throw error;
    }

    response.status(200).json(results.rows);
  });
};

const getStudyCategoriesByCompanyId = (request, response) => {
  const { id } = request.body;
  const query = `SELECT * FROM co_study_categories WHERE company_id = $1`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPlanCategories = (request, response) => {
  const { id } = request.body; // id плана
  const query = `
    SELECT csc.* 
    FROM co_study_categories csc
    INNER JOIN co_plan_category_middleware cpcm ON csc.id = cpcm.study_category_id
    WHERE cpcm.plan_id = $1
  `;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createCompanyPlan = async (request, response) => {
  const {
    totalBudget,
    companyId,
    existingCategories,
    newCategories
  } = request.body;

  try {
    const planResult = await pool.query(
      `INSERT INTO co_study_plans (company_id, price) VALUES ($1, $2) RETURNING id`,
      [companyId, totalBudget]
    );

    const planId = planResult.rows[0].id;

    for (let i = 0; i < newCategories.length; i++) {
      const categoryResult = await pool.query(
        `INSERT INTO co_study_categories (name, company_id) VALUES ($1, $2) RETURNING id`,
        [newCategories[i].category, companyId]
      );

      const categoryId = categoryResult.rows[0].id;

      await pool.query(
        `INSERT INTO co_plan_category_middleware (plan_id, study_category_id, price) VALUES ($1, $2, $3)`,
        [planId, categoryId, newCategories[i].budget]
      );
    }

    for (let i = 0; i < existingCategories.length; i++) {
      await pool.query(
        `INSERT INTO co_plan_category_middleware (plan_id, study_category_id, price) VALUES ($1, $2, $3)`,
        [planId, existingCategories[i].id, existingCategories[i].budget]
      );
    }

    response.status(201).json({ success: true, message: 'Plan added' });
  } catch (error) {
    console.error('Error:', error);
    response.status(500).send('Error in creating plan');
  }
};

const getPlanData = async (request, response) => {
  const { id } = request.body;

  try {
    const planResult = await pool.query(
      `SELECT id, price AS totalBudget FROM co_study_plans WHERE id = $1`,
      [id]
    );

    if (planResult.rows.length === 0) {
      response.status(404).send('Plan not found');
      return;
    }

    const plan = planResult.rows[0];

    const categoriesResult = await pool.query(
      `SELECT middleware.study_category_id AS categoryId, categories.name AS categoryName, middleware.price AS budget 
      FROM co_plan_category_middleware AS middleware
      JOIN co_study_categories AS categories
      ON middleware.study_category_id = categories.id
      WHERE middleware.plan_id = $1`,
      [id]
    );
    const categoryBudgets = categoriesResult.rows;

    response.status(200).json({
      totalBudget: plan.totalBudget,
      categoryBudgets: categoryBudgets
    });
  } catch (error) {
    console.error('Error:', error);
    response.status(500).send('Error in getting plan data');
  }
};

const updatePlan = async (request, response) => {
  const { planId, totalBudget, categoryBudgets } = request.body;

  try {
    // Получаем companyId для данного planId
    const companyResult = await pool.query(
      `SELECT company_id FROM co_study_plans WHERE id = $1`,
      [planId]
    );

    const companyId = companyResult.rows[0].company_id;

    await pool.query(
      `UPDATE co_study_plans SET price = $1 WHERE id = $2`,
      [totalBudget, planId]
    );

    for (let i = 0; i < categoryBudgets.length; i++) {
      if (!categoryBudgets[i].isNew) {
        await pool.query(
          `UPDATE co_plan_category_middleware SET price = $1 WHERE plan_id = $2 AND study_category_id = $3`,
          [categoryBudgets[i].budget, planId, categoryBudgets[i].categoryid]
        );
      } else {
        const categoryResult = await pool.query(
          `INSERT INTO co_study_categories (name, company_id) VALUES ($1, $2) RETURNING id`,
          [categoryBudgets[i].category, companyId]
        );

        const categoryId = categoryResult.rows[0].id;

        await pool.query(
          `INSERT INTO co_plan_category_middleware (plan_id, study_category_id, price) VALUES ($1, $2, $3)`,
          [planId, categoryId, categoryBudgets[i].budget]
        );
      }
    }

    response.status(200).send(`Plan updated`);
  } catch (error) {
    console.error('Error:', error);
    response.status(500).send('Error in updating plan');
  }
};

const createBranch = (request, response) => {
  const {
    parent_id,
    emails,
    login,
    title
  } = request.body;

  // Получение данных родительской компании
  pool.query(
    `SELECT * FROM co_companies WHERE id = $1`,
    [parent_id],
    (error, result) => {
      if (error) {
        throw error;
      }

      const parentCompanyData = result.rows[0];

      // Вставка данных в таблицу co_companies
      pool.query(
        `INSERT INTO co_companies (
          title,
          short_title,
          location_id,
          parent_id,
          activity_type_id,
          legal_address,
          actual_address,
          legal_form_id,
          ownership_form_id,
          enterprise_status_id,
          foundation_date,
          bin,
          oked,
          krp,
          kato,
          description,
          bg_color,
          director_id,
          phones,
          emails,
          sites,
          logo,
          registration_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::date, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23::timestamp with time zone) RETURNING id`,
        [
          title,
          parentCompanyData.short_title,
          parentCompanyData.location_id,
          parent_id,
          parentCompanyData.activity_type_id,
          parentCompanyData.legal_address,
          parentCompanyData.actual_address,
          parentCompanyData.legal_form_id,
          parentCompanyData.ownership_form_id,
          parentCompanyData.enterprise_status_id,
          parentCompanyData.foundation_date,
          parentCompanyData.bin,
          parentCompanyData.oked,
          parentCompanyData.krp,
          parentCompanyData.kato,
          parentCompanyData.description,
          parentCompanyData.bg_color,
          parentCompanyData.director_id,
          parentCompanyData.phones,
          emails,
          parentCompanyData.sites,
          parentCompanyData.logo,
          parentCompanyData.registration_date
        ],
        (error, result) => {
          if (error) {
            throw error;
          }

          const branchId = result.rows[0].id;

          // Создание записи в таблице co_users
          const password = generateRandomString(10);
          const password_hash = hashPassword(password);
          const role_id = 2;
          const user_id = branchId;

          pool.query(
            `INSERT INTO co_users (login, password_hash, role_id, user_id) VALUES ($1, $2, $3, $4)`,
            [login, password_hash, role_id, user_id],
            (error, result) => {
              if (error) {
                throw error;
              }

              // Отправка уведомления о создании филиала
              sendEmail([emails], `Ваши регистрационные данные`, `Логин: ${login}.\nПароль: ${password}.`)

              response.status(201).send(`Branch added`);
            }
          );
        }
      );
    }
  );
};

const getCompanyBranches = (request, response) => {
  const { id } = request.body;

  const query = `
    WITH RECURSIVE branch_tree AS (
      SELECT 
        *,
        (SELECT SUM(price) FROM co_study_plans WHERE company_id = co_companies.id) AS budget,  /* Заложенный бюджет */
        (SELECT SUM(price) FROM co_courses WHERE company_id = co_companies.id) AS used_budget, /* Освоенный бюджет */
        (SELECT SUM(hours_count) FROM co_courses WHERE company_id = co_companies.id) AS total_hours, /* Количество часов */
        (SELECT COUNT(DISTINCT lesson_id) FROM co_attendance_control WHERE lesson_id IN (SELECT id FROM co_lessons WHERE program_id IN (SELECT id FROM co_programs WHERE course_id IN (SELECT id FROM co_courses WHERE company_id = co_companies.id)))) AS conducted_hours, /* Количество проведенных часов */
        (SELECT COUNT(*) FROM co_persons WHERE company_id = co_companies.id AND status != 'archived') AS employee_count /* Количество сотрудников */
      FROM co_companies WHERE id = $1
      UNION ALL
      SELECT 
        co_companies.*,
        (SELECT SUM(price) FROM co_study_plans WHERE company_id = co_companies.id) AS budget,
        (SELECT SUM(price) FROM co_courses WHERE company_id = co_companies.id) AS used_budget,
        (SELECT SUM(hours_count) FROM co_courses WHERE company_id = co_companies.id) AS total_hours,
        (SELECT COUNT(DISTINCT lesson_id) FROM co_attendance_control WHERE lesson_id IN (SELECT id FROM co_lessons WHERE program_id IN (SELECT id FROM co_programs WHERE course_id IN (SELECT id FROM co_courses WHERE company_id = co_companies.id)))) AS conducted_hours,
        (SELECT COUNT(*) FROM co_persons WHERE company_id = co_companies.id AND status != 'archived') AS employee_count
      FROM co_companies
      JOIN branch_tree ON co_companies.parent_id = branch_tree.id
    )
    SELECT * FROM branch_tree;`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getAllGenders = (request, response) => {
  pool.query('SELECT * FROM co_sex', (error, results) => {
    if (error) {
      throw error
    }
    console.log('genders sent');
    response.status(200).json(results.rows)
  })
}

const getAllFamilyStatuses = (request, response) => {
  pool.query('SELECT * FROM co_family_statuses', (error, results) => {
    if (error) {
      throw error
    }
    console.log('family statuses sent');
    response.status(200).json(results.rows)
  })
}

const getJobTitlesByCompanyId = (request, response) => {
  const { id } = request.body;

  const query = `
    WITH RECURSIVE up_tree AS (
      SELECT * FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.* FROM co_companies
      JOIN up_tree ON co_companies.id = up_tree.parent_id
      WHERE co_companies.parent_id != 0
    ),
    down_tree AS (
      SELECT * FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.* FROM co_companies
      JOIN down_tree ON co_companies.parent_id = down_tree.id
    ),
    company_tree AS (
      SELECT * FROM up_tree
      UNION
      SELECT * FROM down_tree
    )
    SELECT co_job_titles.* FROM co_job_titles
    WHERE co_job_titles.company_id IN (SELECT id FROM company_tree);`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error("SQL Query Error: ", error);
      response.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (results.rows.length === 0) {
      console.warn("No Job Titles Found For Company ID: ", id);
    }
    response.status(200).json(results.rows);
  });
};

const createPerson = (request, response) => {
  const { surname, name, patronymic, jobTitleId, birthdate, sex_id, family_status_id, childsCount, address, email, category, company_id } = request.body;
  console.log(request.body)
  pool.query(
    `INSERT INTO co_persons (surname, name, patronymic, job_title_id, birthdate, sex_id, family_status_id, childs_count, address, company_id, email, category)
        VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
    [surname, name, patronymic, jobTitleId, birthdate, sex_id, family_status_id, childsCount, address, company_id, email, category],
    (error, result) => {
      if (error) {
        throw error;
      }

      const personId = result.rows[0].id;

      // Создаем запись в co_users
      const login = generateRandomString(7);
      const password = generateRandomString(10);
      const password_hash = hashPassword(password);
      const role_id = 4;
      const user_id = personId;

      pool.query(
        `INSERT INTO co_users (login, password_hash, role_id, user_id) VALUES ($1, $2, $3, $4)`,
        [login, password_hash, role_id, user_id],
        (error, result) => {
          if (error) {
            throw error;
          }

          // Отправляем уведомление о создании пользователя
          sendEmail([email], `Ваши регистрационные данные`, `Логин: ${login}.\nПароль: ${password}.`)

          response.status(201).send(`Person added`);
        }
      );
    }
  );
};

const addJobTitle = (request, response) => {
  console.log(request.body)
  const { name, companyId } = request.body;
  pool.query(
    `INSERT INTO co_job_titles (name, company_id) VALUES ($1, $2) RETURNING id`,
    [name, companyId],
    (error, result) => {
      if (error) {
        return response.status(400).json({ error: error.toString() });
      }
      // Измените это, чтобы отправить JSON-объект вместо строки.
      response.status(201).json({ id: result.rows[0].id });
    }
  );
};

const getCompanyEmployees = (request, response) => {
  const { id, status } = request.body;

  const query = `
    WITH RECURSIVE branch_tree AS (
      SELECT id FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.id FROM co_companies
      JOIN branch_tree ON co_companies.parent_id = branch_tree.id
    )
    SELECT 
        co_persons.*,
        co_companies.title AS company_title,
        co_job_titles.name AS job_title_name,
        co_courses.title AS course_title  /* Добавлено */
    FROM co_persons
    JOIN branch_tree ON co_persons.company_id = branch_tree.id
    LEFT JOIN co_companies ON co_persons.company_id = co_companies.id
    LEFT JOIN co_job_titles ON co_persons.job_title_id = co_job_titles.id
    LEFT JOIN co_person_course_middleware ON co_persons.id = co_person_course_middleware.person_id /* Добавлено */
    LEFT JOIN co_courses ON co_person_course_middleware.course_id = co_courses.id
    WHERE co_persons.status = $2;`;

  pool.query(query, [id, status], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const updatePersonData = (request, response) => {
  const id = parseInt(request.params.id)
  const { surname, name, patronymic, jobTitle, category, birthdate, sex, family_status_id, childsCount, address, email } = request.body
  console.log('tut?', request.body)
  pool.query('UPDATE co_persons SET surname = $1, name = $2, patronymic = $3, job_title_id = $4, category = $5, birthdate = $6, sex_id = $7, family_status_id = $8, childs_count = $9, address = $10, email = $11 WHERE id = $12', [surname, name, patronymic, jobTitle, category, birthdate, sex, family_status_id, childsCount, address, email, id], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Person data changed`)
  })
}

const updatePersonStatus = (request, response) => {
  const id = parseInt(request.params.id)
  const { status } = request.body
  console.log('tut?', id, status, request.body)
  pool.query('UPDATE co_persons SET status = $1 WHERE id = $2', [status, id], (error, result) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Person status changed`)
  })
}

const getFilteredCompanyEmployees = (request, response) => {
  const { id, status, selectGroupType, allStaffFilter, jobTitleFilter, genderFilter, branchFilter, sortType } = request.body;

  let conditions = `co_persons.status = '${status}'`;
  let orderCondition = "";
  if (selectGroupType === 'person') {
    if (allStaffFilter === 'appointed') {
      conditions += ` AND EXISTS (SELECT 1 FROM co_person_course_middleware WHERE person_id = co_persons.id)`;
    }
  } else if (selectGroupType === 'group') {
    if (jobTitleFilter) {
      conditions += ` AND co_persons.job_title_id = ${jobTitleFilter}`;
    }
    if (genderFilter) {
      conditions += ` AND co_persons.sex_id = '${genderFilter}'`;
    }
    if (branchFilter) {
      conditions += ` AND co_persons.company_id = ${branchFilter}`;
    }
  } else if (selectGroupType === 'staff_page') {
    if (branchFilter) {
      conditions += ` AND co_persons.company_id = ${branchFilter}`;
    }
  } else if (selectGroupType === 'plan_page') {
    conditions += ` AND EXISTS (SELECT 1 FROM co_person_course_middleware WHERE person_id = co_persons.id AND course_id IN (SELECT id FROM co_courses WHERE status = 'in_state'))`;
    orderCondition = " ORDER BY co_persons.surname"; // Сортировка по фамилии
  }

  if (selectGroupType === 'person' || selectGroupType === 'staff_page') {
    if (sortType === 'surname') {
      orderCondition = " ORDER BY surname";
    } else if (sortType === 'branch') {
      orderCondition = " ORDER BY company_title";
    } else if (sortType === 'job_title') {
      orderCondition = " ORDER BY job_title_name";
    }
  }

  const branchTreeQuery = selectGroupType === 'plan_page'
    ? `SELECT id FROM co_companies WHERE id = $1`
    : `SELECT id FROM co_companies WHERE id = $1
          UNION ALL
          SELECT co_companies.id FROM co_companies
          JOIN branch_tree ON co_companies.parent_id = branch_tree.id`;

  const query = `
      WITH RECURSIVE branch_tree AS (
          ${branchTreeQuery}
      ),
      completed_lessons AS (
          SELECT 
              ac.person_id, 
              c.id as course_id,
              COUNT(ac.lesson_id) as completed_count 
          FROM co_attendance_control ac 
          JOIN co_lessons l ON ac.lesson_id = l.id
          JOIN co_programs p ON l.program_id = p.id
          JOIN co_courses c ON p.course_id = c.id
          GROUP BY ac.person_id, c.id
      ),
      person_courses AS (
          SELECT
              co_persons.id as person_id,
              json_agg(
                  json_build_object(
                      'course_title', co_courses.title,
                      'course_progress', ROUND(
                          (completed_lessons.completed_count::decimal / NULLIF(co_courses.hours_count, 0)) * 100
                      )
                  )
              ) as courses
          FROM co_persons
          JOIN co_person_course_middleware ON co_persons.id = co_person_course_middleware.person_id
          JOIN co_courses ON co_person_course_middleware.course_id = co_courses.id
          LEFT JOIN completed_lessons ON co_persons.id = completed_lessons.person_id AND co_courses.id = completed_lessons.course_id
          GROUP BY co_persons.id
      )
      SELECT 
          co_persons.*,
          co_companies.title AS company_title,
          co_job_titles.name AS job_title_name,
          person_courses.courses,
          (
              SELECT COUNT(*)
              FROM co_person_course_middleware pcm
              WHERE pcm.person_id = co_persons.id
          ) AS course_count,
          (
              SELECT COUNT(*)
              FROM co_person_course_middleware pcm
              JOIN co_courses c ON pcm.course_id = c.id
              LEFT JOIN completed_lessons cl ON pcm.person_id = cl.person_id AND c.id = cl.course_id
              WHERE pcm.person_id = co_persons.id AND ROUND((cl.completed_count::decimal / NULLIF(c.hours_count, 0)) * 100) = 100
          ) AS completed_course_count
      FROM co_persons
      JOIN branch_tree ON co_persons.company_id = branch_tree.id
      LEFT JOIN co_companies ON co_persons.company_id = co_companies.id
      LEFT JOIN co_job_titles ON co_persons.job_title_id = co_job_titles.id
      LEFT JOIN person_courses ON co_persons.id = person_courses.person_id
      WHERE ${conditions} ${orderCondition};`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getEdu = (request, response) => {
  const { login } = request.body;
  pool.query(
    'SELECT co_edu_orgs.* ' +
    'FROM co_users ' +
    'JOIN co_edu_orgs ON co_users.user_id = co_edu_orgs.id ' +
    'WHERE co_users.login = $1',
    [login],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log('organizations', results.rows);
      }
    }
  );
};

const getEduCourse = (request, response) => {
  const { login } = request.body;
  pool.query(
    'SELECT co_courses.* ' +
    'FROM co_users ' +
    'JOIN co_courses ON co_users.user_id = co_courses.edu_org_id ' +
    'WHERE co_users.login = $1',
    [login],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log('courses', results.rows);
      }
    }
  );
};

const getEduProgram = (request, response) => {
  const { login } = request.body;
  pool.query(
    'SELECT co_programs.* ' +
    'FROM co_users ' +
    'JOIN co_courses ON co_users.user_id = co_courses.edu_org_id ' +
    'JOIN co_programs ON co_courses.id = co_programs.course_id ' +
    'WHERE co_users.login = $1',
    [login],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log('programs', results.rows);
      }
    }
  );
};

const getEduCompany = (request, response) => {
  const { login } = request.body;
  pool.query(
    'SELECT co_companies.* ' +
    'FROM co_users ' +
    'JOIN co_courses ON co_users.user_id = co_courses.edu_org_id ' +
    'JOIN co_companies ON co_courses.company_id = co_companies.id ' +
    'WHERE co_users.login = $1',
    [login],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log('companies', results.rows);
      }
    }
  );
};

const getEduLessons = (request, response) => {
  const { login } = request.body;
  pool.query(
    'SELECT co_lessons.* ' +
    'FROM co_users ' +
    'JOIN co_courses ON co_users.user_id = co_courses.edu_org_id ' +
    'JOIN co_programs ON co_courses.id = co_programs.course_id ' +
    'JOIN co_lessons ON co_programs.id = co_lessons.program_id ' +
    'WHERE co_users.login = $1',
    [login],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json(results.rows);
        console.log('lessons', results.rows);
      }
    }
  );
};

const createLessonEdu = (request, response) => {
  const { title, program_id, tesis, lesson_order, lessonStartTime } = request.body;
  const queryParams = [title, program_id, tesis, lesson_order];
  let query = 'INSERT INTO co_lessons (title, program_id, tesis, lesson_order) VALUES ($1, $2, $3, $4) RETURNING id';

  if (lessonStartTime) {
    queryParams.push(lessonStartTime);
    query = 'INSERT INTO co_lessons (title, program_id, tesis, lesson_order, start_time) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  }

  pool.query(
    query,
    queryParams,
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const lessonId = results.rows[0].id;
        response.status(200).json({ message: 'Lesson created successfully', lessonId });
        console.log('Lesson created successfully. Lesson ID:', lessonId);
      }
    }
  );
};

const updateLessonEdu = (request, response) => {
  const { title, program_id, tesis, lesson_order, start_time, id } = request.body;
  pool.query(
    'UPDATE co_lessons SET title = $1, program_id = $2, tesis = $3, lesson_order = $4, start_time = $5 WHERE id = $6',
    [title, program_id, tesis, lesson_order, start_time, id],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json('Lesson updated successfully');
        console.log('Lesson updated successfully');
      }
    }
  );
};

const deleteLessonEdu = (request, response) => {
  const { id } = request.body;
  pool.query(
    'DELETE FROM co_lessons WHERE id = $1',
    [id],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(200).json('Lesson deleted successfully');
        console.log('Lesson deleted successfully');
      }
    }
  );
};

const addLessonMaterialEdu = (request, response) => {
  const { title, description, file_type, link, is_lesson_link, lesson_id } = request.body;
  const query = `
      INSERT INTO co_lesson_materials (title, description, file_type, link, is_lesson_link, lesson_id)
      VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [title, description, file_type, link, is_lesson_link, lesson_id];

  pool.query(query, values, (error, results) => {
    if (error) {
      response.status(500).json('error');
      console.error(error);
    } else {
      response.status(200).json('Lesson material inserted successfully');
      console.log('Lesson material inserted successfully');
    }
  });
};

const getUsersWithPersonsByLoginEdu = (request, response) => {
  const { login } = request.body;
  const query = `
    SELECT co_persons.*
    FROM co_users
    JOIN co_edu_orgs ON co_users.user_id = co_edu_orgs.id
    JOIN co_courses ON co_edu_orgs.id = co_courses.edu_org_id
    JOIN co_person_course_middleware ON co_courses.id = co_person_course_middleware.course_id
    JOIN co_persons ON co_person_course_middleware.person_id = co_persons.id
    WHERE co_users.login = $1
  `;

  pool.query(query, [login], (error, results) => {
    if (error) {
      response.status(500).json('error');
      console.error(error);
    } else {
      response.status(200).json(results.rows);
      console.log('persons', results.rows);
    }
  });
};

const getAttendanceControlByLoginEdu = (request, response) => {
  const { login } = request.body;
  const query = `
    SELECT co_attendance_control.*
    FROM co_users
    JOIN co_edu_orgs ON co_users.user_id = co_edu_orgs.id
    JOIN co_courses ON co_edu_orgs.id = co_courses.edu_org_id
    JOIN co_programs ON co_courses.id = co_programs.course_id
    JOIN co_lessons ON co_programs.id = co_lessons.program_id
    JOIN co_attendance_control ON co_lessons.id = co_attendance_control.lesson_id
    WHERE co_users.login = $1
  `;

  pool.query(query, [login], (error, results) => {
    if (error) {
      response.status(500).json('error');
      console.error(error);
    } else {
      response.status(200).json(results.rows);
      console.log('attendance control', results.rows);
    }
  });
};

const createAttendanceControlEdu = (request, response) => {
  const { person_id, lesson_id } = request.body;
  const query = `
    INSERT INTO co_attendance_control (person_id, lesson_id)
    VALUES ($1, $2)
    RETURNING id
  `;

  pool.query(query, [person_id, lesson_id], (error, results) => {
    if (error) {
      response.status(500).json('error');
      console.error(error);
    } else {
      const newId = results.rows[0].id;
      response.status(200).json({ id: newId, message: 'Attendance control created successfully' });
      console.log('Attendance control created successfully. New ID:', newId);
    }
  });
};


const createProgramEdu = (request, response) => {
  const { title, course_id, lesson_duration } = request.body;
  pool.query(
    'INSERT INTO co_programs (title, course_id, lesson_duration) VALUES ($1, $2, $3) RETURNING id',
    [title, course_id, lesson_duration],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const programId = results.rows[0].id;
        response.status(200).json({ message: 'Program created successfully', programId });
        console.log('Program created successfully. Program ID:', programId);
      }
    }
  );
};

const createCertificateEdu = (request, response) => {
  const { title, program_id, link } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'INSERT INTO co_sertificates (title, program_id, link) VALUES ($1, $2, $3) RETURNING id',
    [title, program_id, link],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const certificateId = results.rows[0].id;
        response.status(200).json({ message: 'Certificate created successfully', certificateId });
        console.log('Certificate created successfully. Certificate ID:', certificateId);
      }
    }
  );
};

const issueCertificateEdu = (request, response) => {
  const { person_id, sertificate_id } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'INSERT INTO co_issued_sertificates (person_id, sertificate_id) VALUES ($1, $2) RETURNING id',
    [person_id, sertificate_id],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const issuedCertificateId = results.rows[0].id;
        response.status(200).json({ message: 'Certificate issued successfully', issuedCertificateId });
        console.log('Certificate issued successfully. Issued Certificate ID:', issuedCertificateId);
      }
    }
  );
};

const createExerciseEdu = async (request, response) => {
  const { lesson_id, text, correct_answer, exer_order } = request.body;

  try {
    const result = await pool.query(
      'INSERT INTO co_exercises (lesson_id, text, correct_answer, exer_order) VALUES ($1, $2, $3, $4) RETURNING id',
      [lesson_id, text, correct_answer, exer_order]
    );

    const exerciseId = result.rows[0].id;

    response.status(200).json({ message: 'Exercise created successfully', exerciseId });
    console.log('Exercise created successfully. Exercise ID:', exerciseId);
  } catch (error) {
    response.status(500).json('error');
    console.error(error);
  }
};



const getExercisesByLessonIdEdu = (request, response) => {
  const { lesson_id } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'SELECT * FROM co_exercises WHERE lesson_id = $1',
    [lesson_id],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const exercises = results.rows;
        response.status(200).json(exercises);
        console.log('Exercises retrieved successfully:', exercises);
      }
    }
  );
};

const updateExerciseByIdEdu = async (request, response) => {
  const { id, text, correct_answer, exer_order } = request.body;

  try {
    await pool.query(
      'UPDATE co_exercises SET text = $1, correct_answer = $2, exer_order = $3 WHERE id = $4',
      [text, correct_answer, exer_order, id]
    );

    response.status(200).json({ message: 'Exercise updated successfully' });
    console.log('Exercise updated successfully');
  } catch (error) {
    response.status(500).json('error');
    console.error(error);
  }
};


const deleteExerciseByIdEdu = async (request, response) => {
  const { id } = request.body;

  try {
    await pool.query('DELETE FROM co_exercises WHERE id = $1', [id]);

    response.status(200).json({ message: 'Exercise deleted successfully' });
    console.log('Exercise deleted successfully');
  } catch (error) {
    response.status(500).json('error');
    console.error(error);
  }
};

const getAnswersByLessonIdsEdu = async (request, response) => {
  const { id } = request.body;

  try {
    const result = await pool.query(
      'SELECT * FROM co_answers WHERE lesson_id = $1',
      [id]
    );

    const answers = result.rows;
    response.status(200).json(answers);
    console.log('Answers retrieved successfully:', answers);
  } catch (error) {
    response.status(500).json('error');
    console.error(error);
  }
};

const updateAnswerIsCorrectEdu = async (request, response) => {
  const { id, is_correct } = request.body;

  try {
    await pool.query(
      'UPDATE co_answers SET is_correct = $1 WHERE id = $2',
      [is_correct, id]
    );

    response.status(200).json({ message: 'Answer is_correct updated successfully' });
    console.log('Answer is_correct updated successfully');
  } catch (error) {
    response.status(500).json('error');
    console.error(error);
  }
};

const createEduOrgTotal = async (request, response) => {
  const { company, courseName, categoryId, cost, organizer, email, studyFormat, hoursCount, selectedIds } = request.body;

  const login = generateRandomString(7);
  const password = generateRandomString(10);
  const password_hash = hashPassword(password);

  try {
    await pool.query('BEGIN');

    // Шаг 1
    const orgRes = await pool.query(
      `INSERT INTO co_edu_orgs (title, email)
            VALUES ($1, $2) RETURNING id`,
      [organizer, email]
    );
    const orgId = orgRes.rows[0].id;

    // Шаг 2
    await pool.query(
      `INSERT INTO co_users (login, password_hash, role_id, user_id)
            VALUES ($1, $2, $3, $4)`,
      [login, password_hash, 3, orgId]
    );

    // Шаг 3
    const courseRes = await pool.query(
      `INSERT INTO co_courses (title, price, format, hours_count, edu_org_id, study_category_id, company_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [courseName, cost, studyFormat, hoursCount, orgId, categoryId, company]
    );
    const courseId = courseRes.rows[0].id;

    // Шаг 4
    for (let id of selectedIds) {
      await pool.query(
        `INSERT INTO co_person_course_middleware (person_id, course_id)
                VALUES ($1, $2)`,
        [id, courseId]
      );
    }

    await pool.query('COMMIT');
    sendEmail([email], `Ваши регистрационные данные`, `Логин: ${login}.\nПароль: ${password}.`);
    response.json({ status: 'success' });
  } catch (error) {
    await pool.query('ROLLBACK');
    response.json({ status: 'error', message: error.toString() });
  }
};

const getCompanyCourses = (request, response) => {
  const { id } = request.body;

  const query = `
    WITH RECURSIVE branch_tree AS (
    SELECT id FROM co_companies WHERE id = $1
    UNION ALL
    SELECT co_companies.id FROM co_companies
    JOIN branch_tree ON co_companies.parent_id = branch_tree.id
  )
  SELECT 
    co_courses.*, 
    co_edu_orgs.title AS edu_org_title,
    co_companies.title AS company_title,
    (SELECT COUNT(*) FROM co_person_course_middleware WHERE course_id = co_courses.id) AS employee_count,
    json_agg(co_lessons.* ORDER BY co_lessons.lesson_order) AS lessons
  FROM co_courses
  INNER JOIN co_edu_orgs ON co_courses.edu_org_id = co_edu_orgs.id
  INNER JOIN branch_tree ON co_courses.company_id = branch_tree.id
  INNER JOIN co_companies ON co_courses.company_id = co_companies.id
  LEFT JOIN co_programs ON co_programs.course_id = co_courses.id
  LEFT JOIN co_lessons ON co_lessons.program_id = co_programs.id
  GROUP BY co_courses.id, co_edu_orgs.title, co_companies.title;`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getTotalDashboardInfo = (request, response) => {
  const { id } = request.body;

  const query = `
    WITH RECURSIVE branch_tree AS (
      SELECT id FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.id FROM co_companies
      JOIN branch_tree ON co_companies.parent_id = branch_tree.id
    ),
    lessons_stats AS (
      SELECT 
        co_programs.course_id, 
        COUNT(*) AS total_lessons, 
        COUNT(DISTINCT co_attendance_control.lesson_id) AS attended_lessons 
      FROM co_attendance_control 
      JOIN co_lessons ON co_lessons.id = co_attendance_control.lesson_id
      JOIN co_programs ON co_programs.id = co_lessons.program_id
      WHERE co_programs.course_id IN (
            SELECT id FROM co_courses 
            WHERE company_id IN (
              SELECT id FROM branch_tree
            )
      )
      GROUP BY co_programs.course_id
    ),
    courses_info AS (
      SELECT 
        co_courses.id, 
        co_courses.hours_count, 
        co_courses.price, 
        co_courses.company_id, 
        lessons_stats.total_lessons, 
        lessons_stats.attended_lessons 
      FROM co_courses 
      LEFT JOIN lessons_stats ON co_courses.id = lessons_stats.course_id
    ),
    budget_info AS (
      SELECT 
        SUM(price) AS total_budget
      FROM co_study_plans
      WHERE company_id = $1
    ),
    budget_info_branch AS (
      SELECT 
        SUM(price) AS total_budget_branch
      FROM co_study_plans
      WHERE company_id IN (
        SELECT id FROM branch_tree
      )
    ),
    employee_attendance AS (
      SELECT 
        AVG(completed_lessons.completed_count::decimal / NULLIF(courses_info.total_lessons, 0)) * 100 AS employee_attendance
      FROM co_persons
      JOIN co_person_course_middleware ON co_persons.id = co_person_course_middleware.person_id
      JOIN courses_info ON co_person_course_middleware.course_id = courses_info.id
      LEFT JOIN (
        SELECT 
          ac.person_id, 
          c.id as course_id,
          COUNT(ac.lesson_id) as completed_count 
        FROM co_attendance_control ac 
        JOIN co_lessons l ON ac.lesson_id = l.id
        JOIN co_programs p ON l.program_id = p.id
        JOIN co_courses c ON p.course_id = c.id
        GROUP BY ac.person_id, c.id
      ) completed_lessons ON co_persons.id = completed_lessons.person_id AND courses_info.id = completed_lessons.course_id
      WHERE co_persons.company_id = $1
    ),
    free_courses_hours AS (
      SELECT 
        SUM(courses_info.hours_count) AS free_courses_hours
      FROM courses_info
      WHERE courses_info.attended_lessons IS NULL
    )
    SELECT 
      SUM(hours_count) AS total_hours, 
      SUM(CASE WHEN attended_lessons > 0 AND attended_lessons < total_lessons THEN hours_count ELSE 0 END) AS in_process_hours, 
      SUM(CASE WHEN attended_lessons = total_lessons THEN hours_count ELSE 0 END) AS complieted_couses_hours, 
      (SELECT total_budget FROM budget_info) AS main_branch_budget,
      SUM(price) AS in_process_main_branch_budget,
      (SELECT total_budget FROM budget_info) - SUM(price) AS free_main_branch_budget,
      (SELECT employee_attendance FROM employee_attendance) AS employee_attendance,
      (SELECT total_budget_branch FROM budget_info_branch) AS total_budget,
      SUM(price) AS total_in_process_budget,
      (SELECT total_budget_branch FROM budget_info_branch) - SUM(price) AS total_free_budget,
      COUNT(*) AS courses_count, 
      COUNT(CASE WHEN attended_lessons IS NULL THEN 1 END) AS free_courses_count, 
      COUNT(CASE WHEN attended_lessons > 0 AND attended_lessons < total_lessons THEN 1 END) AS in_process_courses_count, 
      COUNT(CASE WHEN attended_lessons = total_lessons THEN 1 END) AS complieted_courses_count,
      (SELECT free_courses_hours FROM free_courses_hours) AS free_courses_hours
    FROM courses_info 
    WHERE courses_info.company_id = $1;
  `;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows[0]);
  });
};

const getCompanyExpenses = (request, response) => {
  const { id } = request.body;

  const query = `
    SELECT
      co_courses.title AS course_name,
      co_courses.price AS course_price,
      (SELECT price FROM co_study_plans WHERE company_id = $1) AS plan_price
    FROM co_courses
    WHERE co_courses.company_id = $1;`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }

    // Transform the result to include the budget_percentage
    const transformedResults = results.rows.map(row => {
      const budget_percentage = ((row.course_price / row.plan_price) * 100).toFixed(2);
      return { ...row, budget_percentage };
    });

    response.status(200).json(transformedResults);
  });
};

const getCompanyData = (request, response) => {
  const { id } = request.body;

  const query1 = `WITH RECURSIVE 
      company_tree AS (
        SELECT id, parent_id FROM co_companies WHERE id = $1
        UNION ALL
        SELECT c.id, c.parent_id FROM co_companies c JOIN company_tree ct ON c.parent_id = ct.id
      ),
      branch_tree AS (
        SELECT 
          *,
          (SELECT CEIL(SUM(co_courses.hours_count * 60 / COALESCE(co_programs.lesson_duration, 60))) FROM co_courses LEFT JOIN co_programs ON co_courses.id = co_programs.course_id WHERE co_courses.company_id = co_companies.id) AS all_lessons_total,
          (SELECT SUM(co_courses.hours_count) FROM co_courses WHERE co_courses.company_id = co_companies.id) AS all_hours_branch
        FROM co_companies WHERE id = $1
        UNION ALL
        SELECT 
          co_companies.*,
          (SELECT CEIL(SUM(co_courses.hours_count * 60 / COALESCE(co_programs.lesson_duration, 60))) FROM co_courses LEFT JOIN co_programs ON co_courses.id = co_programs.course_id WHERE co_courses.company_id = co_companies.id) AS all_lessons_total,
          (SELECT SUM(co_courses.hours_count) FROM co_courses WHERE co_courses.company_id = co_companies.id) AS all_hours_branch
        FROM co_companies
        JOIN branch_tree ON co_companies.parent_id = branch_tree.id
      ),
      course_data AS (
        SELECT 
          p.course_id,
          COUNT(DISTINCT ac.lesson_id) AS attended_lessons,
          COUNT(DISTINCT ac.person_id) AS attended_persons
        FROM co_attendance_control ac
        JOIN co_lessons l ON ac.lesson_id = l.id
        JOIN co_programs p ON l.program_id = p.id
        GROUP BY p.course_id
      ),
      in_process_courses AS (
        SELECT 
          c.id as course_id,
          c.company_id,
          c.hours_count,
          c.price,
          MAX(p.lesson_duration) AS max_lesson_duration,
          COUNT(DISTINCT l.id) AS course_lessons,
          COALESCE(cd.attended_lessons, 0) AS attended_lessons
        FROM co_courses c
        LEFT JOIN co_programs p ON c.id = p.course_id
        LEFT JOIN co_lessons l ON p.id = l.program_id
        LEFT JOIN course_data cd ON c.id = cd.course_id
        WHERE c.company_id IN (SELECT id FROM company_tree)
        GROUP BY c.id, c.company_id, c.hours_count, c.price, cd.attended_lessons
        HAVING COUNT(DISTINCT l.id) < CEIL(c.hours_count * 60 / COALESCE(MAX(p.lesson_duration), 60)) AND attended_lessons > 0
      ),
      completed_courses AS (
        SELECT cpm.course_id
        FROM co_person_course_middleware cpm
        INNER JOIN co_courses cc ON cc.id = cpm.course_id
        INNER JOIN co_programs cp ON cp.course_id = cc.id
        WHERE EXISTS (
          SELECT 1
          FROM co_lessons l
          WHERE l.program_id = cp.id
          GROUP BY cp.course_id
          HAVING COUNT(l.id) = CEIL(cc.hours_count * 60 / COALESCE(cp.lesson_duration, 60)) 
          AND COUNT(l.id) = (
            SELECT COUNT(*) 
            FROM co_attendance_control ac 
            WHERE ac.person_id = cpm.person_id 
            AND ac.lesson_id IN (SELECT id FROM co_lessons WHERE program_id = cp.id)
          )
        )
      )
    SELECT 
      (SELECT SUM(hours_count) FROM in_process_courses) AS in_process_hours_total,
      (SELECT SUM(hours_count) FROM in_process_courses WHERE company_id = $1) AS in_process_hours_branch,
      (SELECT COUNT(*) FROM co_courses WHERE company_id IN (SELECT id FROM company_tree)) AS all_courses_count_total,
      (SELECT COUNT(*) FROM co_courses WHERE company_id = $1) AS all_courses_count_branch,
      (SELECT COUNT(*) FROM co_persons WHERE company_id IN (SELECT id FROM company_tree) AND status != 'archived') AS all_employees_total,
      (SELECT COUNT(*) FROM co_persons WHERE company_id = $1 AND status != 'archived') AS all_employees_branch,
      (SELECT COUNT(*) FROM in_process_courses) AS in_process_courses_total,
      (SELECT COUNT(*) FROM in_process_courses WHERE company_id = $1) AS in_process_courses_branch,
      (SELECT SUM(all_lessons_total) FROM branch_tree WHERE id = $1) AS all_lessons_branch,
      (SELECT SUM(all_hours_branch) FROM branch_tree WHERE id = $1) AS all_hours_branch,
      SUM(branch_tree.all_lessons_total) AS all_lessons_total,
      SUM(branch_tree.all_hours_branch) AS all_hours_total,
      (SELECT COUNT(*) FROM completed_courses WHERE course_id IN (SELECT id FROM co_courses WHERE company_id IN (SELECT id FROM branch_tree))) AS completed_courses_total,
      (SELECT SUM(hours_count) FROM co_courses WHERE id IN (SELECT course_id FROM completed_courses WHERE course_id IN (SELECT id FROM co_courses WHERE company_id IN (SELECT id FROM branch_tree)))) AS completed_hours_total,
      (SELECT COUNT(*) FROM completed_courses WHERE course_id IN (SELECT id FROM co_courses WHERE company_id = $1)) AS completed_courses_branch,
      (SELECT SUM(hours_count) FROM co_courses WHERE id IN (SELECT course_id FROM completed_courses WHERE course_id IN (SELECT id FROM co_courses WHERE company_id = $1))) AS completed_hours_branch,
      CASE WHEN (SELECT COUNT(*) FROM co_courses WHERE company_id = $1) > 0 THEN CAST((SELECT COUNT(*) FROM completed_courses WHERE course_id IN (SELECT id FROM co_courses WHERE company_id = $1)) AS FLOAT) / (SELECT COUNT(*) FROM co_courses WHERE company_id = $1) ELSE 0 END AS progress_courses_branch,
      CASE WHEN (SELECT COUNT(*) FROM co_courses WHERE company_id IN (SELECT id FROM company_tree)) > 0 THEN CAST((SELECT COUNT(*) FROM completed_courses WHERE course_id IN (SELECT id FROM co_courses WHERE company_id IN (SELECT id FROM branch_tree))) AS FLOAT) / (SELECT COUNT(*) FROM co_courses WHERE company_id IN (SELECT id FROM company_tree)) ELSE 0 END AS progress_courses_total
    FROM branch_tree`;  // первый запрос
  const query2 = `WITH RECURSIVE branch_tree AS (
      SELECT id FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.id FROM co_companies
      JOIN branch_tree ON co_companies.parent_id = branch_tree.id
    ),
    course_data AS (
      SELECT 
        co_courses.id AS course_id, 
        co_courses.company_id AS company_id,
        co_courses.hours_count AS hours_count,
        CASE 
          WHEN co_programs.lesson_duration IS NULL THEN co_courses.hours_count
          ELSE CEIL((co_courses.hours_count * 60) / co_programs.lesson_duration)
        END AS required_lessons,
        COUNT(DISTINCT co_lessons.id) AS actual_lessons,
        COUNT(DISTINCT co_attendance_control.person_id) FILTER (WHERE co_attendance_control.lesson_id = co_lessons.id) AS attended_lessons
      FROM co_courses
      LEFT JOIN co_programs ON co_courses.id = co_programs.course_id
      LEFT JOIN co_lessons ON co_programs.id = co_lessons.program_id
      LEFT JOIN co_attendance_control ON co_lessons.id = co_attendance_control.lesson_id
      GROUP BY co_courses.id, co_courses.company_id, co_courses.hours_count, co_programs.lesson_duration
    ),
    course_status AS (
      SELECT 
        course_id,
        CASE
          WHEN required_lessons = 0 OR actual_lessons = 0 OR attended_lessons = 0 THEN 'free'
          WHEN attended_lessons < required_lessons THEN 'in_progress'
          WHEN attended_lessons = required_lessons THEN 'completed'
          ELSE 'free'
        END AS course_status
      FROM course_data
    ),
    company_name AS (
      SELECT title FROM co_companies WHERE id = $1
    )
    SELECT 
      (SELECT title FROM company_name) AS company_title,
      COUNT(case when course_status = 'free' and co_courses.company_id = $1 then 1 end) AS free_courses_branch,
      COUNT(case when course_status = 'free' then 1 end) AS free_courses_total,
      SUM(case when course_status = 'free' and co_courses.company_id = $1 then co_courses.hours_count else 0 end) AS free_hours_branch,
      SUM(case when course_status = 'free' then co_courses.hours_count else 0 end) AS free_hours_total
    FROM branch_tree
    LEFT JOIN co_courses ON branch_tree.id = co_courses.company_id
    LEFT JOIN course_status ON co_courses.id = course_status.course_id;`;  // второй запрос

  const query3 = `WITH RECURSIVE branch_tree AS (
  SELECT id FROM co_companies WHERE id = $1
  UNION ALL
  SELECT co_companies.id FROM co_companies
  JOIN branch_tree ON co_companies.parent_id = branch_tree.id
),
branch_courses AS (
  SELECT co_courses.id FROM co_courses
  JOIN branch_tree ON co_courses.company_id = branch_tree.id
),
total_lessons AS (
  SELECT 
    co_courses.id AS course_id, 
    COUNT(DISTINCT co_lessons.id) AS lessons_count
  FROM co_courses
  LEFT JOIN co_programs ON co_courses.id = co_programs.course_id
  LEFT JOIN co_lessons ON co_programs.id = co_lessons.program_id
  WHERE co_courses.id IN (SELECT id FROM branch_courses)
  GROUP BY co_courses.id
),
completed_lessons AS (
  SELECT 
    co_courses.id AS course_id, 
    COUNT(DISTINCT co_lessons.id) AS lessons_count
  FROM co_courses
  LEFT JOIN co_programs ON co_courses.id = co_programs.course_id
  LEFT JOIN co_lessons ON co_programs.id = co_lessons.program_id
  LEFT JOIN co_person_course_middleware ON co_courses.id = co_person_course_middleware.course_id
  WHERE co_courses.id IN (SELECT id FROM branch_courses)
    AND co_lessons.id IN (
      SELECT co_lessons.id
      FROM co_lessons
      JOIN co_programs ON co_programs.id = co_lessons.program_id
      JOIN co_courses ON co_courses.id = co_programs.course_id
      WHERE (
        SELECT COUNT(DISTINCT co_person_course_middleware.person_id)
        FROM co_person_course_middleware
        WHERE co_person_course_middleware.course_id = co_courses.id
      ) = (
        SELECT COUNT(DISTINCT co_attendance_control.person_id)
        FROM co_attendance_control
        WHERE co_attendance_control.lesson_id = co_lessons.id
      )
    )
  GROUP BY co_courses.id
),
required_lessons AS (
  SELECT 
    co_courses.id AS course_id,
    CEIL((co_courses.hours_count * 60) / COALESCE(co_programs.lesson_duration, 60)) AS required_lessons_count
  FROM co_courses
  LEFT JOIN co_programs ON co_courses.id = co_programs.course_id
  WHERE co_courses.id IN (SELECT id FROM branch_courses)
),
course_status AS (
  SELECT 
    co_courses.id AS course_id,
    CASE
      WHEN co_courses.id NOT IN (SELECT course_id FROM required_lessons) OR 
           co_courses.id NOT IN (SELECT course_id FROM total_lessons) OR 
           co_courses.id NOT IN (SELECT course_id FROM completed_lessons) THEN 'free'
      WHEN completed_lessons.lessons_count < required_lessons.required_lessons_count THEN 'in_progress'
      WHEN completed_lessons.lessons_count = required_lessons.required_lessons_count THEN 'completed'
      ELSE 'free'
    END AS course_status
  FROM co_courses
  LEFT JOIN required_lessons ON co_courses.id = required_lessons.course_id
  LEFT JOIN total_lessons ON co_courses.id = total_lessons.course_id
  LEFT JOIN completed_lessons ON co_courses.id = completed_lessons.course_id
)
SELECT 
  SUM(completed_lessons.lessons_count) AS completed_lessons_total,
  SUM(CASE WHEN co_courses.company_id = $1 THEN completed_lessons.lessons_count ELSE 0 END) AS completed_lessons_branch
FROM branch_tree
LEFT JOIN co_courses ON branch_tree.id = co_courses.company_id
LEFT JOIN total_lessons ON co_courses.id = total_lessons.course_id
LEFT JOIN completed_lessons ON co_courses.id = completed_lessons.course_id
LEFT JOIN course_status ON co_courses.id = course_status.course_id;`;

  const query4 = `WITH RECURSIVE branch_tree AS (
      SELECT id FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.id FROM co_companies
      JOIN branch_tree ON co_companies.parent_id = branch_tree.id
    ),
    lessons_stats AS (
      SELECT 
        co_programs.course_id, 
        COUNT(*) AS total_lessons, 
        COUNT(DISTINCT co_attendance_control.lesson_id) AS attended_lessons 
      FROM co_attendance_control 
      JOIN co_lessons ON co_lessons.id = co_attendance_control.lesson_id
      JOIN co_programs ON co_programs.id = co_lessons.program_id
      WHERE co_programs.course_id IN (
            SELECT id FROM co_courses 
            WHERE company_id IN (
              SELECT id FROM branch_tree
            )
      )
      GROUP BY co_programs.course_id
    ),
    courses_info AS (
      SELECT 
        co_courses.id, 
        co_courses.price, 
        co_courses.company_id, 
        lessons_stats.total_lessons, 
        lessons_stats.attended_lessons 
      FROM co_courses 
      LEFT JOIN lessons_stats ON co_courses.id = lessons_stats.course_id
    ),
    employee_attendance AS (
      SELECT 
        AVG(completed_lessons.completed_count::decimal / NULLIF(courses_info.total_lessons, 0)) * 100 AS employee_attendance
      FROM co_persons
      JOIN co_person_course_middleware ON co_persons.id = co_person_course_middleware.person_id
      JOIN courses_info ON co_person_course_middleware.course_id = courses_info.id
      LEFT JOIN (
        SELECT 
          ac.person_id, 
          c.id as course_id,
          COUNT(ac.lesson_id) as completed_count 
        FROM co_attendance_control ac 
        JOIN co_lessons l ON ac.lesson_id = l.id
        JOIN co_programs p ON l.program_id = p.id
        JOIN co_courses c ON p.course_id = c.id
        GROUP BY ac.person_id, c.id
      ) completed_lessons ON co_persons.id = completed_lessons.person_id AND courses_info.id = completed_lessons.course_id
      WHERE co_persons.company_id = $1
    )
SELECT 
  (SELECT employee_attendance FROM employee_attendance) AS employee_attendance
FROM courses_info 
WHERE courses_info.company_id = $1;`

  const query5 = `WITH RECURSIVE branch_tree AS (
    SELECT id, parent_id FROM co_companies WHERE id = $1
    UNION ALL
    SELECT co_companies.id, co_companies.parent_id FROM co_companies
    JOIN branch_tree ON co_companies.parent_id = branch_tree.id
),
completed_lessons AS (
    SELECT 
        ac.person_id, 
        c.id as course_id,
        COUNT(ac.lesson_id) as completed_count 
    FROM co_attendance_control ac 
    JOIN co_lessons l ON ac.lesson_id = l.id
    JOIN co_programs p ON l.program_id = p.id
    JOIN co_courses c ON p.course_id = c.id
    GROUP BY ac.person_id, c.id
),
person_courses AS (
    SELECT
        co_persons.id as person_id,
        co_persons.company_id as company_id,
        co_courses.id as course_id,
        ROUND(
            AVG(
                COALESCE((SELECT completed_count FROM completed_lessons WHERE co_persons.id = completed_lessons.person_id AND co_courses.id = completed_lessons.course_id), 0)::decimal / NULLIF(co_courses.hours_count, 0) * 100
            )
        ) as course_progress
    FROM co_persons
    JOIN co_person_course_middleware ON co_persons.id = co_person_course_middleware.person_id
    JOIN co_courses ON co_person_course_middleware.course_id = co_courses.id
    GROUP BY co_persons.id, co_persons.company_id, co_courses.id
),
branch_person_courses AS (
    SELECT 
        person_courses.*,
        MAX(course_progress) OVER (PARTITION BY company_id) as max_branch_progress,
        MAX(course_progress) OVER () as max_total_progress
    FROM person_courses
    WHERE company_id IN (SELECT id FROM branch_tree)
)
SELECT
    AVG(course_progress) FILTER (WHERE company_id = $1) OVER () as progress_study_branch,
    COUNT(person_id) FILTER (WHERE course_progress = 100 AND company_id = $1) OVER () as completed_study_branch,
    MAX(person_id) FILTER (WHERE course_progress = max_branch_progress AND company_id = $1) OVER () as best_branch_employee_id,
    AVG(course_progress) OVER () as progress_study_total,
    COUNT(person_id) FILTER (WHERE course_progress = 100) OVER () as completed_study_total,
    MAX(person_id) FILTER (WHERE course_progress = max_total_progress) OVER () as best_total_employee_id
FROM branch_person_courses
LIMIT 1;`

  const query6 = `WITH RECURSIVE 
      company_tree AS (
        SELECT id, parent_id FROM co_companies WHERE id = $1
        UNION ALL
        SELECT c.id, c.parent_id FROM co_companies c JOIN company_tree ct ON c.parent_id = ct.id
      ),
      branch_tree AS (
        SELECT 
          *,
          (SELECT CEIL(SUM(co_courses.hours_count * 60 / COALESCE(co_programs.lesson_duration, 60))) FROM co_courses LEFT JOIN co_programs ON co_courses.id = co_programs.course_id WHERE co_courses.company_id = co_companies.id) AS all_lessons_total,
          (SELECT SUM(co_courses.hours_count) FROM co_courses WHERE co_courses.company_id = co_companies.id) AS all_hours_branch
        FROM co_companies WHERE id = $1
        UNION ALL
        SELECT 
          co_companies.*,
          (SELECT CEIL(SUM(co_courses.hours_count * 60 / COALESCE(co_programs.lesson_duration, 60))) FROM co_courses LEFT JOIN co_programs ON co_courses.id = co_programs.course_id WHERE co_courses.company_id = co_companies.id) AS all_lessons_total,
          (SELECT SUM(co_courses.hours_count) FROM co_courses WHERE co_courses.company_id = co_companies.id) AS all_hours_branch
        FROM co_companies
        JOIN branch_tree ON co_companies.parent_id = branch_tree.id
      ),
      course_data AS (
        SELECT 
          p.course_id,
          COUNT(DISTINCT ac.lesson_id) AS attended_lessons,
          COUNT(DISTINCT ac.person_id) AS attended_persons
        FROM co_attendance_control ac
        JOIN co_lessons l ON ac.lesson_id = l.id
        JOIN co_programs p ON l.program_id = p.id
        GROUP BY p.course_id
      ),
      in_process_courses AS (
        SELECT 
          c.id as course_id,
          c.company_id,
          c.hours_count,
          c.price,
          MAX(p.lesson_duration) AS max_lesson_duration,
          COUNT(DISTINCT l.id) AS course_lessons,
          COALESCE(cd.attended_lessons, 0) AS attended_lessons
        FROM co_courses c
        LEFT JOIN co_programs p ON c.id = p.course_id
        LEFT JOIN co_lessons l ON p.id = l.program_id
        LEFT JOIN course_data cd ON c.id = cd.course_id
        WHERE c.company_id IN (SELECT id FROM company_tree)
        GROUP BY c.id, c.company_id, c.hours_count, c.price, cd.attended_lessons
        HAVING COUNT(DISTINCT l.id) < CEIL(c.hours_count * 60 / COALESCE(MAX(p.lesson_duration), 60)) AND attended_lessons > 0
      ),
      full_budget_courses AS (
          SELECT 
            sp.company_id,
            SUM(sp.price) AS total_price
          FROM co_study_plans sp
          WHERE sp.company_id IN (SELECT id FROM company_tree)
          GROUP BY sp.company_id
      ),
      purchased_courses AS (
        SELECT 
          c.id as course_id,
          c.company_id,
          c.hours_count,
          SUM(c.price) as price
        FROM co_courses c
        WHERE c.company_id IN (SELECT id FROM company_tree)
        GROUP BY c.id, c.company_id, c.hours_count
      ),
      total_budget AS (
        SELECT SUM(co_study_plans.price) AS full_budget_total
        FROM co_study_plans
        WHERE co_study_plans.company_id IN (SELECT id FROM branch_tree)
      ),
      branch_budget AS (
        SELECT SUM(co_study_plans.price) AS full_budget_branch
        FROM co_study_plans
        WHERE co_study_plans.company_id = $1
      )

SELECT 
  tb.full_budget_total,
  bb.full_budget_branch,
  
  (SELECT SUM(price) FROM in_process_courses WHERE company_id = $1) AS in_process_budget_branch,
  (SELECT SUM(price) FROM in_process_courses) AS in_process_budget_total,
  
  (SELECT SUM(price) FROM purchased_courses WHERE company_id = $1) AS purchased_budget_branch,
  (SELECT SUM(price) FROM purchased_courses) AS purchased_budget_total,
  
  (bb.full_budget_branch - (SELECT SUM(price) FROM purchased_courses WHERE company_id = $1)) AS free_budget_branch,
  (tb.full_budget_total - (SELECT SUM(price) FROM purchased_courses)) AS free_budget_total,
  
  (bb.full_budget_branch - (SELECT SUM(price) FROM in_process_courses WHERE company_id = $1)) AS residual_budget_branch,
  (tb.full_budget_total - (SELECT SUM(price) FROM in_process_courses)) AS residual_budget_total
FROM total_budget tb, branch_budget bb;`

  pool.query(query1, [id], (error, results1) => {
    if (error) {
      throw error;
    }

    pool.query(query2, [id], (error, results2) => {
      if (error) {
        throw error;
      }

      pool.query(query3, [id], (error, results3) => {
        if (error) {
          throw error;
        }

        pool.query(query4, [id], (error, results4) => {
          if (error) {
            throw error;
          }

          pool.query(query5, [id], (error, results5) => {
            if (error) {
              throw error;
            }

            pool.query(query6, [id], (error, results6) => {
              if (error) {
                throw error;
              }

              response.status(200).json({ ...results1.rows[0], ...results2.rows[0], ...results3.rows[0], ...results4.rows[0], ...results5.rows[0], ...results6.rows[0] });
            });
          });
        });
      });
    });
  });
};

const checkBudgets = (request, response) => {
  const { id } = request.body;

  const query = `
    WITH RECURSIVE 
      company_tree AS (
        SELECT id, parent_id FROM co_companies WHERE id = $1
        UNION ALL
        SELECT c.id, c.parent_id FROM co_companies c JOIN company_tree ct ON c.parent_id = ct.id
      ),
      branch_tree AS (
        SELECT 
          *,
          (SELECT CEIL(SUM(co_courses.hours_count * 60 / COALESCE(co_programs.lesson_duration, 60))) FROM co_courses LEFT JOIN co_programs ON co_courses.id = co_programs.course_id WHERE co_courses.company_id = co_companies.id) AS all_lessons_total,
          (SELECT SUM(co_courses.hours_count) FROM co_courses WHERE co_courses.company_id = co_companies.id) AS all_hours_branch
        FROM co_companies WHERE id = $1
        UNION ALL
        SELECT 
          co_companies.*,
          (SELECT CEIL(SUM(co_courses.hours_count * 60 / COALESCE(co_programs.lesson_duration, 60))) FROM co_courses LEFT JOIN co_programs ON co_courses.id = co_programs.course_id WHERE co_courses.company_id = co_companies.id) AS all_lessons_total,
          (SELECT SUM(co_courses.hours_count) FROM co_courses WHERE co_courses.company_id = co_companies.id) AS all_hours_branch
        FROM co_companies
        JOIN branch_tree ON co_companies.parent_id = branch_tree.id
      ),
      course_data AS (
        SELECT 
          p.course_id,
          COUNT(DISTINCT ac.lesson_id) AS attended_lessons,
          COUNT(DISTINCT ac.person_id) AS attended_persons
        FROM co_attendance_control ac
        JOIN co_lessons l ON ac.lesson_id = l.id
        JOIN co_programs p ON l.program_id = p.id
        GROUP BY p.course_id
      ),
      in_process_courses AS (
        SELECT 
          c.id as course_id,
          c.company_id,
          c.hours_count,
          c.price,
          MAX(p.lesson_duration) AS max_lesson_duration,
          COUNT(DISTINCT l.id) AS course_lessons,
          COALESCE(cd.attended_lessons, 0) AS attended_lessons
        FROM co_courses c
        LEFT JOIN co_programs p ON c.id = p.course_id
        LEFT JOIN co_lessons l ON p.id = l.program_id
        LEFT JOIN course_data cd ON c.id = cd.course_id
        WHERE c.company_id IN (SELECT id FROM company_tree)
        GROUP BY c.id, c.company_id, c.hours_count, c.price, cd.attended_lessons
        HAVING COUNT(DISTINCT l.id) < CEIL(c.hours_count * 60 / COALESCE(MAX(p.lesson_duration), 60)) AND attended_lessons > 0
      ),
      full_budget_courses AS (
          SELECT 
            sp.company_id,
            SUM(sp.price) AS total_price
          FROM co_study_plans sp
          WHERE sp.company_id IN (SELECT id FROM company_tree)
          GROUP BY sp.company_id
      ),
      purchased_courses AS (
        SELECT 
          c.id as course_id,
          c.company_id,
          c.hours_count,
          SUM(c.price) as price
        FROM co_courses c
        WHERE c.company_id IN (SELECT id FROM company_tree)
        GROUP BY c.id, c.company_id, c.hours_count
      ),
      total_budget AS (
        SELECT SUM(co_study_plans.price) AS full_budget_total
        FROM co_study_plans
        WHERE co_study_plans.company_id IN (SELECT id FROM branch_tree)
      ),
      branch_budget AS (
        SELECT SUM(co_study_plans.price) AS full_budget_branch
        FROM co_study_plans
        WHERE co_study_plans.company_id = $1
      )

SELECT 
  tb.full_budget_total,
  bb.full_budget_branch,
  
  (SELECT SUM(price) FROM in_process_courses WHERE company_id = $1) AS in_process_budget_branch,
  (SELECT SUM(price) FROM in_process_courses) AS in_process_budget_total,
  
  (SELECT SUM(price) FROM purchased_courses WHERE company_id = $1) AS purchased_budget_branch,
  (SELECT SUM(price) FROM purchased_courses) AS purchased_budget_total,
  
  (bb.full_budget_branch - (SELECT SUM(price) FROM purchased_courses WHERE company_id = $1)) AS free_budget_branch,
  (tb.full_budget_total - (SELECT SUM(price) FROM purchased_courses)) AS free_budget_total,
  
  (bb.full_budget_branch - (SELECT SUM(price) FROM in_process_courses WHERE company_id = $1)) AS residual_budget_branch,
  (tb.full_budget_total - (SELECT SUM(price) FROM in_process_courses)) AS residual_budget_total
FROM total_budget tb, branch_budget bb;`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCourseAssignments = (request, response) => {
  const { id } = request.body;

  const query = `
    WITH RECURSIVE company_tree AS (
      SELECT 
        *
      FROM co_companies 
      WHERE id = $1
      UNION ALL
      SELECT 
        co_companies.*
      FROM co_companies
      JOIN company_tree ON co_companies.parent_id = company_tree.id
    ),
    assignments AS (
      SELECT 
        co_person_course_middleware.*,
        co_courses.title as course_title,
        co_courses.company_id as course_company_id,
        co_persons.company_id as person_company_id
      FROM co_person_course_middleware
      JOIN co_courses ON co_courses.id = co_person_course_middleware.course_id
      JOIN co_persons ON co_persons.id = co_person_course_middleware.person_id
    )
    SELECT * 
    FROM assignments
    WHERE course_company_id IN (SELECT id FROM company_tree) 
      AND person_company_id IN (SELECT id FROM company_tree);`;

  pool.query(query, [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getSelectedCourseInfo = (request, response) => {
  const { id } = request.body;

  const courseInfoQuery = `
    SELECT 
      co_courses.*, 
      co_companies.id AS company_id,
      co_companies.title AS company_name,
      co_edu_orgs.*
    FROM 
      co_courses
    INNER JOIN 
      co_companies ON co_courses.company_id = co_companies.id
    LEFT JOIN
      co_edu_orgs ON co_courses.edu_org_id = co_edu_orgs.id
    WHERE co_courses.id = $1`;

  const categoryInfoQuery = `
    SELECT 
      co_study_categories.name AS category_name,
      co_plan_category_middleware.price AS category_price
    FROM 
      co_plan_category_middleware
    INNER JOIN 
      co_study_categories ON co_plan_category_middleware.study_category_id = co_study_categories.id
    WHERE co_plan_category_middleware.plan_id = $1`;

  const programInfoQuery = `
    SELECT 
      co_programs.*
    FROM 
      co_programs
    WHERE co_programs.course_id = $1`;

  const countsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM co_person_course_middleware WHERE course_id = $1) AS student_count,
      (SELECT COUNT(*) FROM co_programs WHERE course_id = $1) AS lesson_count`;

  pool
    .query(courseInfoQuery, [id])
    .then(results => {
      const courseInfo = results.rows[0];

      pool
        .query(categoryInfoQuery, [id])
        .then(categoryResults => {
          const categoryInfo = categoryResults.rows[0];

          pool
            .query(programInfoQuery, [id])
            .then(programResults => {
              const programInfo = programResults.rows[0];

              pool
                .query(countsQuery, [id])
                .then(countResults => {
                  const counts = countResults.rows[0];

                  response.status(200).json({
                    ...courseInfo,
                    ...categoryInfo,
                    ...programInfo,
                    ...counts
                  });
                });
            });
        });
    })
    .catch(error => {
      throw error;
    });
};

const editSelectedCourseInfo = async (request, response) => {
  const { courseId, courseName, categoryId, cost, organizerId, organizer, email, studyFormat, hoursCount, selectedIds } = request.body;

  try {
    await pool.query('BEGIN');

    // Шаг 1: Обновление курса
    await pool.query(
      `UPDATE co_courses
            SET title = $1, study_category_id = $2, price = $3, format = $4, hours_count = $5
            WHERE id = $6`,
      [courseName, categoryId, cost, studyFormat, hoursCount, courseId]
    );

    // Шаг 2: Обновление организатора
    await pool.query(
      `UPDATE co_edu_orgs
            SET title = $1, email = $2
            WHERE id = $3`,
      [organizer, email, organizerId]
    );

    // Шаг 3: Удаление и добавление связей
    const existingRecords = await pool.query(
      `SELECT person_id FROM co_person_course_middleware WHERE course_id = $1`,
      [courseId]
    );

    const existingIds = existingRecords.rows.map(row => row.person_id);

    const toAdd = selectedIds.filter(id => !existingIds.includes(id));
    const toRemove = existingIds.filter(id => !selectedIds.includes(id));

    for (let id of toAdd) {
      await pool.query(
        `INSERT INTO co_person_course_middleware (person_id, course_id)
                VALUES ($1, $2)`,
        [id, courseId]
      );
    }

    for (let id of toRemove) {
      await pool.query(
        `DELETE FROM co_person_course_middleware
                WHERE person_id = $1 AND course_id = $2`,
        [id, courseId]
      );

      await pool.query(
        `DELETE FROM co_attendance_control 
                WHERE person_id = $1 AND lesson_id IN (
                    SELECT l.id FROM co_lessons l 
                    JOIN co_programs p ON l.program_id = p.id 
                    WHERE p.course_id = $2
                )`,
        [id, courseId]
      );
    }

    await pool.query('COMMIT');
    response.json({ status: 'success' });
  } catch (error) {
    await pool.query('ROLLBACK');
    response.json({ status: 'error', message: error.toString() });
  }
};

const getLessonMaterials = async (request, response) => {
  const { lessonId } = request.body;
  console.log('lessonId', lessonId)
  try {
    const materials = await pool.query(
      `SELECT * FROM co_lesson_materials WHERE lesson_id = $1`,
      [lessonId]
    );

    response.json({ status: 'success', data: materials.rows });
  } catch (error) {
    response.json({ status: 'error', message: error.toString() });
  }
};

const updateCompanyEmail = (request, response) => {
  const id = parseInt(request.params.id);
  const { email } = request.body;
  pool.query('UPDATE co_companies SET emails = $1 WHERE id = $2', [email, id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Company email updated`);
  });
};

const updateCompanyPhone = (request, response) => {
  const id = parseInt(request.params.id);
  const { phone } = request.body;
  pool.query('UPDATE co_companies SET phones = $1 WHERE id = $2', [phone, id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Company phone updated`);
  });
};

const updateCompanyLogin = (request, response) => {
  const id = parseInt(request.params.id);
  const { oldLogin, newLogin } = request.body;

  // сначала проверьте, существует ли уже новый логин
  pool.query('SELECT * FROM co_users WHERE login = $1', [newLogin], (error, results) => {
    if (error) {
      throw error;
    }

    if (results.rows.length > 0) {
      // новый логин уже занят
      response.status(409).send('This login is already taken');
    } else {
      // новый логин свободен, так что мы можем обновить его
      pool.query('UPDATE co_users SET login = $1 WHERE login = $2', [newLogin, oldLogin], (error, results) => {
        if (error) {
          throw error;
        }
        response.status(201).send('Company login updated');
      });
    }
  });
};

const updateUserPassword = async (request, response) => {
  const { oldPassword, newPassword } = request.body;
  const { login } = request.params;

  try {
    // Ищем пользователя по логину
    const user = await pool.query('SELECT * FROM co_users WHERE login = $1', [login]);

    if (user.rows.length > 0) {
      // Проверяем старый пароль
      const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password_hash);

      if (!validPassword) {
        return response.status(400).json({ error: 'Введен неверный старый пароль' });
      }

      // Если старый пароль верный, хешируем и обновляем новый пароль
      const newHashedPassword = hashPassword(newPassword);
      await pool.query('UPDATE co_users SET password_hash = $1 WHERE login = $2', [newHashedPassword, login]);

      return response.status(200).json({ message: 'Пароль успешно изменен' });

    } else {
      return response.status(400).json({ error: 'Пользователь с таким логином не найден' });
    }

  } catch (e) {
    console.log(e);
    return response.status(500).json({ error: 'Ошибка сервера' });
  }
};



const getStudentCommentsByStudentIdAndExerciseIdEdu = (request, response) => {
  const { user_id, exercise_id } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'SELECT * FROM co_student_comments WHERE user_id = $1 AND exercise_id = $2',
    [user_id, exercise_id],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const studentComments = results.rows;
        response.status(200).json(studentComments);
        console.log('Student comments retrieved successfully:', studentComments);
      }
    }
  );
};

const getEduCommentsByStudentIdAndExerciseIdEdu = (request, response) => {
  const { user_id, exercise_id } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'SELECT * FROM co_edu_comments WHERE user_id = $1 AND exercise_id = $2',
    [user_id, exercise_id],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const eduComments = results.rows;
        response.status(200).json(eduComments);
        console.log('Educational comments retrieved successfully:', eduComments);
      }
    }
  );
};

const createStudentCommentEdu = (request, response) => {
  const { user_id, exercise_id, text, date } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'INSERT INTO co_student_comments (user_id, exercise_id, text, date) VALUES ($1, $2, $3, $4)',
    [user_id, exercise_id, text, date],
    (error, result) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(201).json('Comment added successfully');
        console.log('New comment added successfully');
      }
    }
  );
};

const createEduCommentEdu = (request, response) => {
  const { user_id, exercise_id, text, date } = request.body;

  // Здесь используется pool.query() вашей библиотеки для работы с базой данных
  pool.query(
    'INSERT INTO co_edu_comments (user_id, exercise_id, text, date) VALUES ($1, $2, $3, $4)',
    [user_id, exercise_id, text, date],
    (error, result) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        response.status(201).json('Comment added successfully');
        console.log('New comment added successfully');
      }
    }
  );
};

const StudentAllInfo = (request, response) => {
  const { login, course_id } = request.body;

  // Шаг 1
  pool.query(
    'SELECT user_id FROM co_users WHERE login = $1',
    [login],
    (error, result) => {
      if (error) {
        // return error.message;
      }

      const user_id = result.rows[0].user_id;


      // Шаг 2
      pool.query(
        'SELECT * FROM co_persons WHERE id = $1',
        [user_id],
        (error, result) => {
          if (error) {
            // return error.message;
          }

          const co_persons_data = result.rows;


          // Шаг 3
          pool.query(
            'SELECT course_id FROM co_person_course_middleware WHERE person_id = $1',
            [user_id],
            (error, result) => {
              if (error) {
                // return;
              }

              if (result.rows.length === 0) {
                // Course not found
                // response.send('Course not found.');
                // return;
              }

              const course_ids = result.rows.map(row => row.course_id);


              // Шаг 4
              const fetchCourses = (course_id, callback) => {
                pool.query(
                  'SELECT * FROM co_courses WHERE id = $1',
                  [course_id],
                  (error, result) => {
                    if (error) {
                      // return;
                    }

                    callback(result.rows[0]);
                  }
                );
              };

              // Fetch data for each course_id
              const co_courses_data = [];
              let fetchedCoursesCount = 0;

              for (const course_id of course_ids) {
                fetchCourses(course_id, (courseData) => {
                  co_courses_data.push(courseData);

                  fetchedCoursesCount++;

                  if (fetchedCoursesCount === course_ids.length) {
                    // All courses data fetched, continue to Шаг 5

                    continueToStep5();
                  }
                });
              }


              const continueToStep5 = () => {
                // Шаг 5
                let selected_course = co_courses_data.filter(el => +el.id === +course_id)
                const edu_org_id = selected_course[0].edu_org_id;
                // console.log(co_courses_data, selected_course, edu_org_id, "co_courses_data")


                // Шаг 6
                pool.query(
                  'SELECT title FROM co_edu_orgs WHERE id = $1',
                  [edu_org_id],
                  (error, result) => {
                    if (error) {
                      console.log(error.message)
                      // return;
                    }

                    const co_edu_orgs_title = result.rows[0].title;

                    // Шаг 7
                    pool.query(
                      'SELECT * FROM co_programs WHERE course_id = $1',
                      [selected_course[0].id],
                      (error, result) => {
                        if (error) {
                          // return;
                        }

                        const co_programs_data = result.rows;

                        // Шаг 8
                        pool.query(
                          'SELECT * FROM co_lessons WHERE program_id IN (SELECT id FROM co_programs WHERE course_id = $1)',
                          [selected_course[0].id],
                          (error, result) => {
                            if (error) {
                              // return;
                            }

                            const co_lessons_data = result.rows;


                            // Шаг 9
                            pool.query(
                              'SELECT id FROM co_lessons WHERE program_id IN (SELECT id FROM co_programs WHERE course_id = $1)',
                              [selected_course[0].id],
                              (error, result) => {
                                if (error) {
                                  console.log(error.message)
                                  // return;
                                }

                                const lesson_ids = result.rows.map(row => row.id);
                                const lesson_ids_str = lesson_ids.join(',');
                                if (!lesson_ids_str) {
                                  // Handle the error case here, e.g., send an empty response or an error message
                                  // response.send({ error: 'No lessons found for provided course.' });
                                  // return;
                                }


                                // Step 10 - Use the comma-separated string in the query
                                pool.query(
                                  'SELECT * FROM co_answers WHERE lesson_id IN (' + lesson_ids_str + ') AND user_id = $1',
                                  [user_id],
                                  (error, result) => {
                                    if (error) {
                                      // return;
                                    }

                                    const co_answers_data = result.rows;

                                    // Шаг 11
                                    pool.query(
                                      'SELECT * FROM co_edu_comments WHERE user_id = $1',
                                      [user_id],
                                      (error, result) => {
                                        if (error) {
                                          // return;
                                        }

                                        const co_edu_comments_data = result.rows;

                                        // Шаг 12
                                        pool.query(
                                          'SELECT * FROM co_student_comments WHERE user_id = $1',
                                          [user_id],
                                          (error, result) => {
                                            if (error) {
                                              // return;
                                            }

                                            const co_student_comments_data = result.rows;

                                            // Шаг 13
                                            pool.query(
                                              'SELECT * FROM co_attendance_control WHERE person_id = $1 AND lesson_id IN (' + lesson_ids_str + ')',
                                              [user_id],
                                              (error, result) => {
                                                if (error) {
                                                  // return;
                                                }

                                                const co_attendance_control_data = result.rows;


                                                // Additional Step for co_issued_sertificates
                                                pool.query(
                                                  'SELECT * FROM co_issued_sertificates WHERE person_id = $1',
                                                  [user_id],
                                                  (error, result) => {
                                                    if (error) {
                                                      // return;
                                                    }

                                                    const co_issued_sertificates_data = result.rows;
                                                    const sertificate_ids = co_issued_sertificates_data.map(row => row.sertificate_id);

                                                    if (lesson_ids.length === 0) {
                                                      // Handle the error case here, e.g., send an empty response or an error message
                                                      // response.send({ error: 'No lessons found.' });
                                                      // return;
                                                    }
                                                    const sertificate_ids_str = sertificate_ids.join(',');
                                                    if (!sertificate_ids_str) {
                                                      // Handle the error case here, e.g., send an empty response or an error message
                                                      // response.send({ error: 'No lessons found for provided course.' });
                                                      // return;
                                                    }

                                                    // Final Step - Fetch co_sertificates data using sertificate_ids_str
                                                    if (sertificate_ids_str) {
                                                      pool.query(
                                                        'SELECT * FROM co_sertificates WHERE id IN (' + sertificate_ids_str + ')',
                                                        (error, result) => {
                                                          if (error) {
                                                            // return;
                                                          }

                                                          const co_sertificates_data = result.rows;

                                                          // Prepare and send the response
                                                          const finalResponse = {
                                                            co_persons_data,
                                                            co_courses_data,
                                                            co_edu_orgs_title,
                                                            co_programs_data,
                                                            co_lessons_data,
                                                            co_answers_data,
                                                            co_edu_comments_data,
                                                            co_student_comments_data,
                                                            co_attendance_control_data,
                                                            co_issued_sertificates_data,
                                                            co_sertificates_data,
                                                          };

                                                          response.send(finalResponse);
                                                        }
                                                      );
                                                    } else {
                                                      // Final Step - Fetch co_sertificates data using sertificate_ids_str
                                                    
                                                          // Prepare and send the response
                                                          
                                                          const finalResponse = {
                                                            co_persons_data,
                                                            co_courses_data,
                                                            co_edu_orgs_title,
                                                            co_programs_data,
                                                            co_lessons_data,
                                                            co_answers_data,
                                                            co_edu_comments_data,
                                                            co_student_comments_data,
                                                            co_attendance_control_data,
                                                            co_issued_sertificates_data,
                                                            
                                                          };
                                                          
                                                          response.send(finalResponse);
                                                        
                                                    
                                                    }

                                                  }
                                                );
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              };
            }
          );
        }
      );
    }
  );
};

const getUserCoursesByLoginStudent = (request, response) => {
  const { login } = request.body;

  pool.query(
    'SELECT user_id FROM co_users WHERE login = $1',
    [login],
    (error, results) => {
      if (error) {
        response.status(500).json('error');
        console.error(error);
      } else {
        const user_id = results.rows[0].user_id;

        pool.query(
          'SELECT * FROM co_person_course_middleware WHERE person_id = $1',
          [user_id],
          (error, results) => {
            if (error) {
              response.status(500).json('error');
              console.error(error);
            } else {
              response.status(200).json(results.rows);
            }
          }
        );
      }
    }
  );
};

const updatePersonData2 = (request, response) => {
  const {
    id,
    avatar,
    surname,
    name,
    patronymic,
    birthdate,
    address,
    experience,
    family_status_id,
    childs_count
  } = request.body;

  // Преобразуем id в числовой тип, предполагая, что он является числом
  const parsedId = parseInt(id);

  pool.query(
    'UPDATE co_persons SET avatar = $1, surname = $2, name = $3, patronymic = $4, birthdate = $5, address = $6, experience = $7, family_status_id = $8, childs_count = $9 WHERE id = $10',
    [avatar, surname, name, patronymic, birthdate, address, experience, family_status_id, childs_count, parsedId],
    (error, result) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Person data changed`);
    }
  );
};

/////////
const updatePersonEmail = (request, response) => {
  const id = parseInt(request.params.id);
  const { email } = request.body;
  pool.query('UPDATE co_persons SET email = $1 WHERE id = $2', [email, id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Company email updated`);
  });
};

const updatePersonPhone = (request, response) => {
  const id = parseInt(request.params.id);
  const { phone } = request.body;
  pool.query('UPDATE co_persons SET phone = $1 WHERE id = $2', [phone, id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Company phone updated`);
  });
};

const updatePersonLogin = (request, response) => {
  const id = parseInt(request.params.id);
  const { oldLogin, newLogin } = request.body;

  // сначала проверьте, существует ли уже новый логин
  pool.query('SELECT * FROM co_users WHERE login = $1', [newLogin], (error, results) => {
    if (error) {
      throw error;
    }

    if (results.rows.length > 0) {
      // новый логин уже занят
      response.status(409).send('This login is already taken');
    } else {
      // новый логин свободен, так что мы можем обновить его
      pool.query('UPDATE co_users SET login = $1 WHERE login = $2', [newLogin, oldLogin], (error, results) => {
        if (error) {
          throw error;
        }
        response.status(201).send('Person login updated');
      });
    }
  });
};

const createAnswerStudent = async (request, response) => {
  const { text, exercise_id, is_correct, lesson_id, user_id } = request.body;

  try {
    // Проверяем существует ли запись с заданными exercise_id, lesson_id и user_id
    const existingRecord = await pool.query(
      'SELECT * FROM co_answers WHERE exercise_id = $1 AND lesson_id = $2 AND user_id = $3',
      [exercise_id, lesson_id, user_id]
    );
    
    if (existingRecord.rows.length > 0) {
      // Если запись существует, обновляем ее
      const result = await pool.query(
        'UPDATE co_answers SET text = $1, is_correct = $2 WHERE id = $3',
        [text, is_correct, existingRecord.rows[0].id]
      );

      response.status(200).json({ message: 'CoAnswer updated successfully', coAnswerId: existingRecord.rows[0].id });
      console.log('CoAnswer updated successfully. CoAnswer ID:', existingRecord.rows[0].id);
    } else {
      // Если запись не существует, вставляем новую запись
      const result = await pool.query(
        'INSERT INTO co_answers (text, exercise_id, is_correct, lesson_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [text, exercise_id, is_correct, lesson_id, user_id]
      );

      const coAnswerId = result.rows[0].id;

      response.status(200).json({ message: 'CoAnswer created successfully', coAnswerId });
      console.log('CoAnswer created successfully. CoAnswer ID:', coAnswerId);
    }
  } catch (error) {
    response.status(500).json('error');
    console.error(error);
  }
};


export default {
  createLocation,
  getAllLocations,
  deleteLocation,
  createDirector,
  getAllDirectors,
  deleteDirector,
  createEnterpriseStatus,
  getAllEnterpriseStatuses,
  deleteEnterpriseStatus,
  createLegalForm,
  getAllLegalForms,
  deleteLegalForm,
  createOwnershipForm,
  getAllOwnershipForms,
  deleteOwnershipForm,
  createActivityType,
  getAllActivityTypes,
  deleteActivityType,
  getAllExistingCompanies,
  createCompany,
  deleteCompany,
  loginUser,
  getUser,
  authenticateToken,
  getCompanyByUserLogin,
  getCompanyByPersonLogin,
  updateCompanyLogo,
  updateCompanyData,
  changePassword,
  updateUserVerificationCode,
  getPlanByCompanyId,
  getStudyCategoriesByCompanyId,
  createCompanyPlan,
  getPlanData,
  updatePlan,
  getPlanCategories,
  createBranch,
  getCompanyBranches,
  getAllGenders,
  getAllFamilyStatuses,
  getJobTitlesByCompanyId,
  createPerson,
  addJobTitle,
  getCompanyEmployees,
  updatePersonData,
  updatePersonStatus,
  getFilteredCompanyEmployees,
  getEdu,
  getEduCourse,
  getEduProgram,
  getEduCompany,
  getEduLessons,
  createLessonEdu,
  updateLessonEdu,
  deleteLessonEdu,
  addLessonMaterialEdu,
  getUsersWithPersonsByLoginEdu,
  getAttendanceControlByLoginEdu,
  createAttendanceControlEdu,
  createProgramEdu,
  createCertificateEdu,
  issueCertificateEdu,
  createExerciseEdu,
  getExercisesByLessonIdEdu,
  updateExerciseByIdEdu,
  deleteExerciseByIdEdu,
  getAnswersByLessonIdsEdu,
  updateAnswerIsCorrectEdu,
  createEduOrgTotal,
  getCompanyCourses,
  getTotalDashboardInfo,
  getCompanyExpenses,
  getCompanyData,
  checkBudgets,
  getCourseAssignments,
  getSelectedCourseInfo,
  editSelectedCourseInfo,
  getLessonMaterials,
  deleteVerificationCode,
  updateCompanyEmail,
  updateCompanyPhone,
  updateCompanyLogin,
  checkVerificationCode,
  updateUserPassword,
  getStudentCommentsByStudentIdAndExerciseIdEdu,
  getEduCommentsByStudentIdAndExerciseIdEdu,
  createStudentCommentEdu,
  createEduCommentEdu,
  StudentAllInfo,
  getUserCoursesByLoginStudent,
  updatePersonData2,
  updatePersonEmail,
  updatePersonPhone,
  updatePersonLogin,
  createAnswerStudent
};