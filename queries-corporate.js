import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
import axios from 'axios';
import { request, response } from 'express';
moment.locale('ru');
import jwt from 'jsonwebtoken'
import {secret} from "./config.js"
import {v4 as uuidv4} from 'uuid';
import {productionPoolOptions, sendEmail} from './accesses.js';
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
        return response.status(400).json({error: 'Введен неверный пароль'});
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
  const {id} = request.body
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
  const {id} = request.body
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
  const {id} = request.body
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
  const {id} = request.body
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
  const {id} = request.body
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
  const {id} = request.body
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
          sendEmail([emails], `Ваши регистрационные данные`,  `Логин: ${login}.\nПароль: ${password}.`)

          response.status(201).send(`Company added`);
        }
      );
    }
  );
};

const deleteCompany = (request, response) => {
  const {id} = request.body
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
  const { login } = request.body; // Получите login из запроса
  console.log('login', login)
  const query = `
    SELECT co_companies.* 
    FROM co_companies 
    JOIN co_users ON co_companies.id = co_users.user_id 
    WHERE co_users.login = $1 AND co_users.role_id = 2
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
  const { title, bin, location_id, actual_address, bg_color } = request.body
  pool.query('UPDATE co_companies SET title = $1, bin = $2, location_id = $3, actual_address = $4, bg_color = $5 WHERE id = $6', [title, bin, location_id, actual_address, bg_color, id], (error, result) => {
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
  const login = request.params.login
  const { email } = request.body;
  const verificationCode = generateVerificationCode();
  console.log('login', login)
  console.log('request.params', request.params)
  try {
    await pool.query('UPDATE co_users SET verification_code = $1 WHERE login = $2', [verificationCode, login]);

    //sendEmail([email], 'Your verification code', `Your verification code is: ${verificationCode}`);

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
        return response.status(400).json({error: 'Incorrect password'});
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
  const query = `SELECT * FROM co_study_plans WHERE company_id = $1`;

  pool.query(query, [id], (error, results) => {
    if (error) {
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

    response.status(201).send(`Plan added`);
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
      `SELECT study_category_id AS categoryId, price AS budget 
       FROM co_plan_category_middleware 
       WHERE plan_id = $1`,
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
    await pool.query(
      `UPDATE co_study_plans SET price = $1 WHERE id = $2`,
      [totalBudget, planId]
    );

    for (let i = 0; i < categoryBudgets.length; i++) {
      if (categoryBudgets[i].id) {
        await pool.query(
          `UPDATE co_plan_category_middleware SET price = $1 WHERE plan_id = $2 AND study_category_id = $3`,
          [categoryBudgets[i].budget, planId, categoryBudgets[i].id]
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
              sendEmail([emails], `Ваши регистрационные данные`,  `Логин: ${login}.\nПароль: ${password}.`)

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
      SELECT * FROM co_companies WHERE id = $1
      UNION ALL
      SELECT co_companies.* FROM co_companies
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
  console.log('JOB', id)
  const query = `
    SELECT co_job_titles.* FROM co_job_titles
    WHERE co_job_titles.company_id = $1;`;

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
                    sendEmail([email], `Ваши регистрационные данные`,  `Логин: ${login}.\nПароль: ${password}.`)

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
      co_job_titles.name AS job_title_name
    FROM co_persons
    JOIN branch_tree ON co_persons.company_id = branch_tree.id
    LEFT JOIN co_companies ON co_persons.company_id = co_companies.id
    LEFT JOIN co_job_titles ON co_persons.job_title_id = co_job_titles.id
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
  updateAnswerIsCorrectEdu
};