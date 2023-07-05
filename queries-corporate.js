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
  authenticateToken
};