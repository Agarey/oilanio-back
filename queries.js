import pg from 'pg';
import nodemailer from 'nodemailer';
import moment from 'moment'
import jwt from 'jsonwebtoken'
import {secret} from "./config.js"
import {v4 as uuidv4} from 'uuid';
import {Telegraf} from 'telegraf'
import axios from 'axios';
moment.locale('ru');


const TELEGRAM_NGROK_HOST = "0b84-198-89-92-162.ngrok.io";

const devPoolOptions = {
    user: 'hyhdsfgcsfgtko',
    host: 'ec2-54-229-68-88.eu-west-1.compute.amazonaws.com',
    database: 'dfjq5clee4ahv4',
    password: 'bf322de92e8333896e987ab29ee34ae0b57ffdd145ee11e91b825e6b6de530df',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
};

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

let stuffEmails = [
    'zane.css34@gmail.com',
    'azat.aliaskar@gmail.com',
    'alexdrumm13@gmail.com',
    'zhaksybaev0107@gmail.com',
    'oilanabaz7@gmail.com',
    'ardakova97@inbox.ru',
    'zznnznzn3@gmail.com'
]

const setNumbersToCenters = () => {
    let centerIds = [
        8,
        10,
        11,
        12,
        13,
        14,
        15,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        43,
        44,
        45,
        47,
        48,
        49,
        50,
        51,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        74,
        75,
        78,
        79,
        80,
        82,
        83,
        84,
        85,
        86,
        87,
        89,
        91,
        92,
        93,
        95,
        96,
        97,
        98,
        99,
        102,
        103,
        105,
        106,
        107,
        108,
        109,
        110,
        111,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        124,
        125,
        126,
        127,
        128,
        129,
        130,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        139,
        140,
        141,
        142,
        143,
        144,
        145,
        146,
        147,
        148,
        149,
        151,
        152,
        153,
        154,
        155,
        156,
        157,
        158,
        159,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        173,
        174,
        175,
        177,
        178,
        180,
        183,
        184,
        185,
        186,
        187,
        189,
        191,
        192,
        193,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
    ];

    let phonerNumbers = [
        77085695257,
        77077230808,
        77081503031,
        77051131740,
        77087520397,
        77074847095,
        77755750426,
        77769981433,
        77014230455,
        77719972947,
        77712867223,
        77077013038,
        77021272887,
        77017872914,
        77785984247,
        77051148228,
        77752277747,
        77018343982,
        77761012665,
        77022817414,
        77017987339,
        77760084433,
        77471418738,
        77476969733,
        77474441715,
        77082825716,
        77471090165,
        77751001198,
        77075974759,
        77078087119,
        77015090344,
        77089372119,
        77772052720,
        77015273217,
        77018737555,
        77770285015,
        77078643094,
        77767990554,
        77089162627,
        77713127121,
        77786431740,
        77475177639,
        77472214369,
        77075427522,
        77079557402,
        77023678962,
        77759838698,
        77027744802,
        77006047070,
        77074105846,
        77006668734,
        77759855555,
        77082095742,
        77007431015,
        77025082761,
        77078543845,
        77019822073,
        77019822073,
        77078923225,
        77782609300,
        77711627747,
        77071918888,
        77476403776,
        77081253348,
        77022131985,
        77071454779,
        77716805000,
        77058009909,
        77761012665,
        77751188679,
        77778431970,
        77758914748,
        77756157427,
        77084953639,
        77074810871,
        77478248512,
        77751305815,
        77479692372,
        77019935151,
        77088646734,
        77019930218,
        77019820490,
        77013399557,
        77779109345,
        77763053823,
        77767100801,
        77078495996,
        77781479641,
        77713737601,
        77761180806,
        85256396258,
        77772237237,
        77716417700,
        77786862288,
        77004442834,
        7759760768,
        77022413203,
        77777704399,
        77475139629,
        79299469513,
        77787366368,
        77761316859,
        77027779855,
        77051904246,
        77081049461,
        971565373083,
        13463758303,
        77072005006,
        77000208010,
        736203626458,
        77010558777,
        77476694249,
        77080706298,
        77473526418,
        77477775454,
        77019890181,
        77474459202,
        77787350157,
        77074644455,
        77078523400,
        77005961888,
        77083604725,
        77075126089,
        77760030373,
        77717630319,
        77779922878,
        77710228209,
        77716134607,
        77753318010,
        77474249105,
        77767317717,
        77078102268,
        77758226122,
        77071514301,
        77077272346,
        87755865752,
        77770234547,
        77079963981,
        77055571909,
        77088496590,
        77028882779,
        77774850787,
        77088496610,
        77753627508,
        77074983918,
        77057731179,
        77071771063,
        77002511438,
        77011051066,
        77757488409,
        77088043403,
        77052387372,
        77772102193,
        77789305757,
        77076784321,
        87082742871,
        77779952002,
        77074010408,
        77774732769,
        77059647078,
        77081963606,
        77086822309,
        77751916477,
        77713737601,
        77776632960,
        77029820169,
        77767456777,
        77089085922,
        77754416822,
        77066051281,
    ];

    for(let i = 0; i < centerIds.length; i++){
        pool.query('update tutors set phone_number=$1 where id=$2', [phonerNumbers[i].toString(), centerIds[i]], (e, r) => {
            if(e){
                console.log(e);
            }else{
                console.log(`tutor ${centerIds[i]} phone updated to ${phonerNumbers[i].toString()}`);
            }
        });
    }
}
//setNumbersToCenters();

const createDealInMindsales = (clientName, clientPhone) => {
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
                    }
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

const foo = () => {

    let applications = [
`Новая заявка на поиск курса!
Имя студента: Дина.
Номер телефона: 8-708-414-48-58.
Направление: Английский язык`,
`Новая заявка на поиск курса!
Имя студента: Нагимаш.
Номер телефона: 8-776-710-08-01.
Направление: Английский язык`,
`Новая заявка на поиск курса!
Имя студента: Арлан.
Номер телефона: 8-708-615-74-39.
Направление: Английский язык`,
`Новая заявка на поиск курса!
Имя студента: Кирилл.
Номер телефона: 8-705-516-66-90.
Направление: Английский язык`,
    ];

    let ids = [
        1077829677,
        2126123936,
        551837815,
        5032606485,
        193580800,
        833767436,
        1099757457,
        636477841,
        732102731,
        1076514683,
        772449462,
        1038207595,
        381800496,
        562485248,
        1225863296,
        467393522,
        810765430,
        5134116649,
        1820021948,
        1400897908,
        929594108,
        681937074,
        1274959541,
        2070927402,
        219968341,
        496758987,
        763710167,
        1020442438,
        671789699,
        189883030,
        2110495762,
        358637572,
        517828320,
        5045218800,
        1130404438,
        1397624222,
        247195985,
        411975845,
        1906678682,
        1814221763,
        777982139,
        876819782,
        543534691,
        5021629854,
        1118078387,
        888734809,
        431732530,
        578145699,
        593400322,
        418287916,
        1411857294,
        567414370,
    ];

    for(let chatId of ids){

    }
}

const getClients = (request, response) => {
    pool.query('SELECT * FROM clients', (error, results) => {
        if (error) {
            throw error
        }
        console.log('clients sent');
        response.status(200).json(results.rows)
    })
}

const getClientById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM clients WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createClient = (request, response) => {
    const { fullname, subcourse_id, email, date, phone, pay_sum, payment_reference_id, paid, promocode } = request.body

    pool.query('INSERT INTO clients (fullname, subcourse_id, email, date, phone, pay_sum, payment_reference_id, paid, promocode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [fullname, subcourse_id, email,  date, phone, pay_sum, payment_reference_id, paid, promocode], (error, result) => {
        if (error) {
            console.log(error)
            throw error
        }
        response.status(201).send(`Client added with ID: ${result.id}`)
    })
}

const updateClient = (request, response) => {
    const id = parseInt(request.params.id)
    const { fullname, subcourse_id, date, phone } = request.body

    pool.query(
        'UPDATE clients SET fullname = $1, subcourse_id = $2, date = $3, phone = $4 WHERE id = $5',
        [fullname, subcourse_id, date, phone, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}

const deleteClient = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM clients WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}

const setClientStatusOk = (reference_id, code) => {
    console.log("USER WITH REFERENCE ID " + reference_id + " PAY");
    pool.query(
        'UPDATE clients SET paid=true, code=$1 WHERE payment_reference_id=$2',
        [code, reference_id],
        (error, results) => {
            if (error) {
                throw error
            }
        }
    )
}

//---------------------------------------------------------------------------------

const getSubcourses = (request, response) => {
    pool.query('SELECT * FROM subcourses order by order_coefficient desc', (error, results) => {
        if (error) {
            throw error
        }
        console.log('subcourses sent');
        response.status(200).json(results.rows)
    })
}

const getSubcourseById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM subcourses WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCourseSubcourses = (request, response) => {
    const courseId = parseInt(request.params.courseId)

    console.log("course id: " + courseId);

    pool.query('SELECT subcourses.id, course_id, subcourses.title as "title", courses.title as "course_title", courses.website_url, courses.instagram, courses.img_src, courses.background_image_url, courses.phones, courses.url, subcourses.description as "subcourse_description", price, schedule, duration, subcourses.rating as "subcourses_rating", category_id, ages, format, expected_result, start_requirements, type, isonline, approved, declined, currency, unit_of_time, order_coefficient, published_date, courses.id as "course_id" FROM subcourses join courses on subcourses.course_id = courses.id WHERE course_id = $1 and approved=true and subcourses.title!=$2', [courseId, 'test'], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createSubcourse = (request, response) => {
    const { course_id, title, description, price } = request.body

    pool.query('INSERT INTO subcourses (course_id, title, description, price) VALUES ($1, $2, $3, $4)', [course_id, title, description, price], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Subcourse added with ID: ${result.insertId}`)
    })
}

const updateSubcourse = (request, response) => {
    const id = parseInt(request.params.id)
    const { course_id, title, description, price } = request.body

    pool.query(
        'UPDATE subcourses SET course_id = $1, title = $2, description = $3, price = $4 WHERE id = $5',
        [course_id, title, description, price, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Subcourse modified with ID: ${id}`)
        }
    )
}

const deleteSubcourse = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM subcourses WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`subcourse deleted with ID: ${id}`)
    })
}

//---------------------------------------------------------------------------------

const getCourses = (request, response) => {
    pool.query('SELECT * FROM courses where title NOT IN (\'test\') order by title asc', (error, results) => {
        if (error) {
            throw error
        }
        console.log('courses sent');
        response.status(200).json(results.rows)
    })
}

const getSertificates = (request, response) => {
    pool.query('SELECT * FROM tutor_sertificates', (error, results) => {
        if (error) {
            throw error
        }
        console.log('sertificates sent');
        response.status(200).json(results.rows)
    })
}

const getCourseById = (request, response) => {
    const id = parseInt(request.params.id);
    console.log("course id: " + id);
    pool.query('SELECT * FROM courses WHERE id = $1 and title NOT IN (\'test\')', [id], (error, results) => {
        if (error) {
            response.status(500).json('Не указан id курса')
        }else{
            response.status(200).json(results.rows)
        }
    })
}

const getCoursesByCategory = (request, response) => {
    const categoryId = parseInt(request.params.id);
    console.log("category id: " + categoryId);
    pool.query('SELECT * FROM courses WHERE category_id = $1 and title NOT IN (\'test\')', [categoryId], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createCourse = (request, response) => {
    const { title, website_url, addresses, phones, login, password, city_id } = request.body

    pool.query('INSERT INTO courses (title, website_url, addresses, phones, login, password, city_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [title, website_url, addresses, phones, login, password, Number(city_id)], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`course added with ID: ${result.insertId}`)
    })
}

const updateCourse = (request, response) => {
    const id = parseInt(request.params.id)
    const { title, img_src, rating, subtitle, website_url, addresses, phones, description } = request.body

    pool.query(
        'UPDATE courses SET title = $1, img_src = $2, rating = $3, subtitle = $4, website_url = $1, addresses = $2, phones = $3, description = $4 WHERE id = $5',
        [title, img_src, rating, subtitle, website_url, addresses, phones, description, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Course modified with ID: ${id}`)
        }
    )
}

const updateCourseInfo = (request, response) => {
    const {
        title,
        subtitle,
        description,
        phones,
        email,
        website_url,
        instagram,
        addresses,
        city_id,
        id
    } = request.body;

    pool.query('UPDATE public.courses SET title=$1, subtitle=$2, description=$3, phones=$4, email=$5, website_url=$6, instagram=$7, addresses=$8, city_id=$9 WHERE id=$10',
        [
            title,
            subtitle,
            description,
            phones,
            email,
            website_url,
            instagram,
            addresses,
            city_id,
            id
        ],
        (error, results) => {
            console.log(error);
            console.log(results);
            if (error) {
                response.status(500).json('error');
            } else {
                response.status(200).json(results.rows[0]);
            };
        }
    );
};

const deleteCourse = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM courses WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`course deleted with ID: ${id}`)
    })
}

//---------------------------------------------------------------------------------

const getFeedbacks = (request, response) => {
    const subcourseId = parseInt(request.params.subcourseId)
    pool.query('SELECT * FROM feedbacks where subcourse_id = $1 ORDER BY id DESC', [subcourseId], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getFeedbackById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM feedbacks WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCurrentDate = (monthOffset = 0) => {
    let currentDate = new Date();

    let dd = currentDate.getDate();
    if(dd < 10) dd = '0' + dd;

    let mm = currentDate.getMonth() + monthOffset + 1;
    if(mm < 10) mm = '0' + mm;

    let yy = currentDate.getFullYear();

    return yy + "-" + mm + "-" + dd;
}

const createFeedback = (request, response) => {
    const { fullname, message, rating, subcourse_id } = request.body

    pool.query('INSERT INTO feedbacks (fullname, date, message, rating, subcourse_id) VALUES ($1, $2, $3, $4, $5)', [fullname, getCurrentDate(), message, rating, subcourse_id], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`feedback added with ID: ${result.insertId}`)
    })
}

const updateFeedback = (request, response) => {
    const id = parseInt(request.params.id)
    const { fullname, text, datetime } = request.body

    pool.query(
        'UPDATE feedbacks SET fullname = $1, text = $2, datetime = $3 WHERE id = $4',
        [fullname, text, datetime, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}

const deleteFeedback = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM feedbacks WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}

//---------------------------------------------------------------------------------

const getPartnershipRequests = (request, response) => {
    pool.query('SELECT * FROM partnership_requests', (error, results) => {
        if (error) {
            throw error
        }
        console.log('partnership_requests sent');
        response.status(200).json(results.rows)
    })
}

const getPartnershipRequestById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM partnership_requests WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const sendPartnershipRequestNotification = (partner) => {
    let message = `Название компании: ${partner.company_name}\nИмя: ${partner.fullname}\nEmail: ${partner.email}\nТелефон: ${partner.phone}`;
    sendEmail(stuffEmails, 'Новый партнер!', message);
}

const createPartnershipRequest = (request, response) => {
    const { company_name, fullname, email, phone } = request.body

    let partner = {
        company_name: company_name,
        fullname: fullname,
        email: email,
        phone: phone
    };

    sendPartnershipRequestNotification(partner);

    pool.query('INSERT INTO partnership_requests (company_name, fullname, email, phone) VALUES ($1, $2, $3, $4)', [company_name, fullname, email, phone], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`partnership_requests added with ID: ${result.id}`);

        let nameForMindsales = `Заявка на партнерство. Название компании - ${company_name}. ФИО - ${fullname}.`;
        let phoneForMindsales = phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '');

        createDealInMindsales(nameForMindsales, phoneForMindsales);
    })
}

const updatePartnershipRequest = (request, response) => {
    const id = parseInt(request.params.id)
    const { company_name, fullname, email, phone } = request.body

    pool.query(
        'UPDATE partnership_requests SET company_name = $1, fullname = $2, email = $3, phone = $4 WHERE id = $5',
        [company_name, fullname, email, phone, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`partnership_requests modified with ID: ${id}`)
        }
    )
}

const deletePartnershipRequest = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM partnership_requests WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`partnership_requests deleted with ID: ${id}`)
    })
}


//---------------------------------------------------------------------------------

const getTeachers = (request, response) => {
    pool.query('SELECT * FROM teachers', (error, results) => {
        if (error) {
            throw error
        }
        console.log('partnership_requests sent');
        response.status(200).json(results.rows)
    })
}

const getCourseTeachers = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query(`SELECT * FROM teachers where course_id = $1 and approved=true and fullname!='test'`, [id], (error, results) => {
        if (error) {
            throw error
        }
        console.log('partnership_requests sent');
        response.status(200).json(results.rows)
    })
}

const getTeacherById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM teachers WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createTeacher = (request, response) => {
    const { fullname, description, img_url, course_id } = request.body

    pool.query('INSERT INTO teachers (fullname, description, img_url, course_id) VALUES ($1, $2, $3, $4)', [fullname, description, img_url, course_id], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`teacher added with ID: ${result.id}`)
    })
}

const newSession = (request, response) => {
    const { user_id, user_role, log_date } = request.body

    pool.query('INSERT INTO session_control (user_id, user_role, log_date) VALUES ($1, $2, $3)', [user_id, user_role, log_date], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`session added`)
    })
}

const updateTeacher = (request, response) => {
    const id = parseInt(request.params.id)
    const { fullname, description, img_url, course_id } = request.body

    pool.query(
        'UPDATE teachers SET fullname = $1, description = $2, img_url = $3, course_id = $4 WHERE id = $5',
        [fullname, description, img_url, course_id, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`teacher modified with ID: ${id}`)
        }
    )
}

const deleteTeacher = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM teachers WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`teacher deleted with ID: ${id}`)
    })
}


//---------------------------------------------------------------------------------

const getCourseCards = (request, response) => {
    pool.query('SELECT subcourses.id, course_categories.name as "category", subcourses.isonline, subcourses.title,\n' +
        '        courses.website_url, cities.name as "city", subcourses.currency, subcourses.unit_of_time,\n' +
        '        subcourses.description, subcourses.category_id as "direction_id", subcourses.ages, subcourses.type,\n' +
        '        subcourses.format, subcourses.price, subcourses.schedule,\n' +
        '        subcourses.expected_result, subcourses.start_requirements,\n' +
        '        subcourses.duration, subcourses.rating, subcourses.verificated, courses.id as "course_id",\n' +
        '        courses.title as "course_title", courses.phones, courses.promocode, courses.instagram,\n' +
        '        courses.latitude, courses.description as "course_desc", courses.longitude, courses.addresses, courses.city_id, courses.url, courses.img_src,\n' +
        '        courses.background_image_url from subcourses\n' +
        '        inner join courses on subcourses.course_id = courses.id\n' +
        '        inner join cities on courses.city_id = cities.id\n' +
        '        inner join course_categories on subcourses.category_id = course_categories.id\n' +
        '        where subcourses.approved=true and subcourses.is_archived=false and\n' +
        '        subcourses.declined=false and city_id is not null\n' +
        '        and category_id is not null\n' +
        '        order by subcourses.verificated desc, order_coefficient asc', [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getVerificatedCourseCards = (request, response) => {
    pool.query('SELECT subcourses.id, course_categories.name as "category", subcourses.isonline, subcourses.title,\n' +
    '        courses.website_url, subcourses.currency, subcourses.unit_of_time,\n' +
    '        subcourses.description, subcourses.category_id as "direction_id", subcourses.ages, subcourses.type,\n' +
    '        subcourses.format, subcourses.price, subcourses.schedule,\n' +
    '        subcourses.expected_result, subcourses.start_requirements,\n' +
    '        subcourses.duration, subcourses.rating, subcourses.verificated, courses.id as "course_id",\n' +
    '        courses.title as "course_title", courses.phones, courses.promocode, courses.instagram,\n' +
    '        courses.latitude, courses.description as "course_desc", courses.longitude, courses.addresses, courses.city_id, courses.url, courses.img_src,\n' +
    '        courses.background_image_url from subcourses\n' +
    '        inner join courses on subcourses.course_id = courses.id\n' +
    '        inner join course_categories on subcourses.category_id = course_categories.id\n' +
    '        where subcourses.approved=true and subcourses.verificated=true and subcourses.is_archived=false and\n' +
    '        subcourses.declined=false and city_id is not null\n' +
    '        and category_id is not null\n' +
    '        order by subcourses.verificated desc, order_coefficient asc', [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getNotVerificatedCourseCards = (request, response) => {
    pool.query('SELECT subcourses.id, course_categories.name as "category", subcourses.isonline, subcourses.title,\n' +
    '        courses.website_url, subcourses.currency, subcourses.unit_of_time,\n' +
    '        subcourses.description, subcourses.category_id as "direction_id", subcourses.ages, subcourses.type,\n' +
    '        subcourses.format, subcourses.price, subcourses.schedule,\n' +
    '        subcourses.expected_result, subcourses.start_requirements,\n' +
    '        subcourses.duration, subcourses.rating, subcourses.verificated, courses.id as "course_id",\n' +
    '        courses.title as "course_title", courses.phones, courses.promocode, courses.instagram,\n' +
    '        courses.latitude, courses.description as "course_desc", courses.longitude, courses.addresses, courses.city_id, courses.url, courses.img_src,\n' +
    '        courses.background_image_url from subcourses\n' +
    '        inner join courses on subcourses.course_id = courses.id\n' +
    '        inner join course_categories on subcourses.category_id = course_categories.id\n' +
    '        where subcourses.approved=true and subcourses.verificated=false and subcourses.is_archived=false and\n' +
    '        subcourses.declined=false and city_id is not null\n' +
    '        and category_id is not null\n' +
    '        order by subcourses.verificated desc, order_coefficient asc', [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCourseCardsByCenterId = (request, response) => {
    const centerId = parseInt(request.params.centerId)
    
    pool.query('SELECT subcourses.id, course_categories.name as "category", subcourses.isonline, subcourses.title,\n' +
        '        courses.website_url, subcourses.currency, subcourses.unit_of_time,\n' +
        '        subcourses.description, subcourses.category_id as "direction_id", subcourses.ages, subcourses.type,\n' +
        '        subcourses.format, subcourses.price, subcourses.schedule,\n' +
        '        subcourses.expected_result, subcourses.start_requirements,\n' +
        '        subcourses.duration, subcourses.rating, subcourses.verificated, courses.id as "course_id",\n' +
        '        courses.title as "course_title", courses.phones, courses.promocode, courses.instagram,\n' +
        '        courses.latitude, courses.description as "course_desc", courses.longitude, courses.addresses, courses.city_id, courses.url, courses.img_src,\n' +
        '        courses.background_image_url from subcourses\n' +
        '        inner join courses on subcourses.course_id = courses.id\n' +
        '        inner join course_categories on subcourses.category_id = course_categories.id\n' +
        '        where subcourses.approved=true and subcourses.is_archived=false and\n' +
        '        subcourses.declined=false and course_id=$1 and city_id is not null\n' +
        '        and category_id is not null\n' +
        '        order by subcourses.verificated desc, order_coefficient asc', [centerId], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getTutorCoursecards = (request, response) => {

    const query = 'SELECT tutor_coursecards.id, tutors.fullname as "tutorsName", tutor_coursecards.tutor_id as "tutorsId", tutors.img_src, \n' + 
                  'tutor_coursecards.schedule, tutor_coursecards.price, tutor_coursecards.currency, tutor_coursecards.unit_of_time, \n' +
                  'tutor_coursecards.title, course_categories.name as "courseCategory", tutor_coursecards.is_online, \n' +
                  'tutors.teaching_language, tutor_coursecards.min_age, tutor_coursecards.max_age, tutors.description as "tutorDescription", \n' +
                  'tutor_coursecards.start_requirements, tutor_coursecards.expecting_results, tutor_coursecards.verificated, \n' + 
                  'tutor_coursecards.category_id from tutor_coursecards \n' +
                  'inner join tutors on tutor_coursecards.tutor_id = tutors.id \n' +
                  'inner join course_categories on tutor_coursecards.category_id = course_categories.id'

    pool.query(query, [], (error, results) => {
        if (error) {
            console.log(error)
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getVerificatedTutorCoursecards = (request, response) => {

    const query = 'SELECT tutor_coursecards.id, tutors.fullname as "tutorsName", tutor_coursecards.tutor_id as "tutorsId", tutors.img_src, \n' + 
                  'tutor_coursecards.schedule, tutor_coursecards.price, tutor_coursecards.currency, tutor_coursecards.unit_of_time, \n' +
                  'tutor_coursecards.title, course_categories.name as "courseCategory", tutor_coursecards.is_online, \n' +
                  'tutors.teaching_language, tutor_coursecards.min_age, tutor_coursecards.max_age, tutors.description as "tutorDescription", \n' +
                  'tutor_coursecards.start_requirements, tutor_coursecards.expecting_results, tutor_coursecards.verificated, \n' + 
                  'tutor_coursecards.category_id from tutor_coursecards \n' +
                  'inner join tutors on tutor_coursecards.tutor_id = tutors.id \n' +
                  'inner join course_categories on tutor_coursecards.category_id = course_categories.id \n' +
                  'where verificated=true'

    pool.query(query, [], (error, results) => {
        if (error) {
            console.log(error)
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getNotVerificatedTutorCoursecards = (request, response) => {

    const query = 'SELECT tutor_coursecards.id, tutors.fullname as "tutorsName", tutor_coursecards.tutor_id as "tutorsId", tutors.img_src, \n' + 
                  'tutor_coursecards.schedule, tutor_coursecards.price, tutor_coursecards.currency, tutor_coursecards.unit_of_time, \n' +
                  'tutor_coursecards.title, course_categories.name as "courseCategory", tutor_coursecards.is_online, \n' +
                  'tutors.teaching_language, tutor_coursecards.min_age, tutor_coursecards.max_age, tutors.description as "tutorDescription", \n' +
                  'tutor_coursecards.start_requirements, tutor_coursecards.expecting_results, tutor_coursecards.verificated, \n' + 
                  'tutor_coursecards.category_id from tutor_coursecards \n' +
                  'inner join tutors on tutor_coursecards.tutor_id = tutors.id \n' +
                  'inner join course_categories on tutor_coursecards.category_id = course_categories.id \n' +
                  'where verificated=false'

    pool.query(query, [], (error, results) => {
        if (error) {
            console.log(error)
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getTutorCourseCardsByTutorId = (request, response) => {

    const tutorId = parseInt(request.params.tutorId)

    const query = 'SELECT tutor_coursecards.id, tutors.fullname as "tutorsName", tutor_coursecards.tutor_id as "tutorsId", tutors.img_src, \n' + 
                  'tutor_coursecards.schedule, tutor_coursecards.price, tutor_coursecards.currency, tutor_coursecards.unit_of_time, \n' +
                  'tutor_coursecards.title, course_categories.name as "courseCategory", tutor_coursecards.is_online, \n' +
                  'tutors.teaching_language, tutor_coursecards.min_age, tutor_coursecards.max_age, tutors.description as "tutorDescription", \n' +
                  'tutor_coursecards.start_requirements, tutor_coursecards.expecting_results, tutor_coursecards.verificated, \n' + 
                  'tutor_coursecards.category_id from tutor_coursecards \n' +
                  'inner join tutors on tutor_coursecards.tutor_id = tutors.id \n' +
                  'inner join course_categories on tutor_coursecards.category_id = course_categories.id \n' +
                  'WHERE tutor_id=$1'

    pool.query(query, [tutorId], (error, results) => {
        if (error) {
            console.log(error)
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const setTutorCourseCardVerificated = (request, response) => {
    let {id, verificated} = request.body;
    pool.query(`UPDATE tutor_coursecards SET verificated=${verificated} WHERE id=${id}`,
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const setTutorCourseTitle = (request, respopnse) => {
    let { id, title } = request.body
    pool.query('update tutor_coursecards set title=$2 where id=$1', [id, title],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorCourseSchedule = (request, respopnse) => {
    let { id, schedule } = request.body
    pool.query(`UPDATE tutor_coursecards SET schedule=${schedule} WHERE id=${id}`,
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorCoursePrice = (request, response) => {
    let {id, price, currency, unitOfTime} = request.body;
    pool.query('update tutor_coursecards set price=$2, currency=$3, unit_of_time=$4 where id=$1', [id, price, currency, unitOfTime],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorCourseCategory = (request, response) => {
    let {id, courseCategoryId} = request.body;
    pool.query('update tutor_coursecards set category_id=$2 where id=$1', [id, courseCategoryId],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorsTeachingLanguage = (request, response) => {
    let {id, teachingLanguage} = request.body;
    pool.query('update tutors set teaching_language=$2 where id=$1', [id, teachingLanguage],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorCourseMinMaxAges = (request, response) => {
    let {id, minAge, maxAge} = request.body;
    pool.query('update tutor_coursecards set min_age=$2, max_age=$3 where id=$1', [id, minAge, maxAge],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const setTutorCourseIsOnline = (request, response) => {
    let {id, isOnline} = request.body;
    pool.query('update tutor_coursecards set is_online=$2 where id=$1', [id, isOnline],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorsStartRequirements = (request, response) => {
    let {id, startRequirements} = request.body;
    pool.query('update tutor_coursecards set start_requirements=$2 where id=$1', [id, startRequirements],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorCourseExpectingResults = (request, response) => {
    let {id, expectingResults} = request.body;
    pool.query('update tutor_coursecards set expecting_results=$2 where id=$1', [id, expectingResults],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateTutorDescription = (request, response) => {
    let {id, tutorDescription} = request.body;
    pool.query('update tutors set description=$2 where id=$1', [id, tutorDescription],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const getCourseCardById = (request, response) => {
    const subcourseId = parseInt(request.params.subcourseId)

    pool.query('SELECT subcourses.id, subcourses.category_id as "direction_id", courses.city_id, subcourses.isonline, courses.website_url, subcourses.currency, subcourses.unit_of_time, subcourses.title, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, courses.id as "course_id", courses.title as "course_title", courses.phones, courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id where subcourses.id=$1 and subcourses.approved=true order by subcourses.title', [subcourseId], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCourseCardsByCategoryId = (request, response) => {
    const categoryId = parseInt(request.params.categoryId)

    if(categoryId === 0){
        pool.query('SELECT subcourses.id, subcourses.title, subcourses.currency, subcourses.unit_of_time, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.category_id, subcourses.rating, courses.id as "course_id", courses.title as "course_title", courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id where subcourses.approved=true', [], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    }else{
        pool.query('SELECT subcourses.id, subcourses.title, subcourses.currency, subcourses.unit_of_time, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, courses.id as "course_id", courses.title as "course_title", courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id where subcourses.category_id = $1 and subcourses.approved=true order by order_coefficient desc', [categoryId], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    }
}

//---------------------------------------------------------------------------------

const handlePayment = (request, response) => {
    console.log("handlePayment get:");
    console.log(request.body);
    response.redirect('https://www.oilan.io/');
}

const sendEmailByReferenceId = (reference_id, verificationCode) => {
    pool.query('SELECT clients.id, clients.fullname, clients.subcourse_id, clients.date, clients.phone, clients.email, clients.pay_sum, clients.payment_reference_id, clients.paid, subcourses.id as "subcourse_id", subcourses.title as "subcourse_title", subcourses.schedule, subcourses.description, courses.email as "course_email", courses.title as "course_title" FROM clients inner join subcourses on clients.subcourse_id = subcourses.id inner join courses on subcourses.course_id = courses.id where payment_reference_id=$1', [reference_id], async (error, results) => {
        if (error) {
            throw error
        }
        let clientEmail = results.rows[0]['email'];
        let clientFullname = results.rows[0]['fullname'];
        let clientPhone = results.rows[0]['phone'];
        let clientPaySum = results.rows[0]['pay_sum'];
        let subcourseId = results.rows[0]['subcourse_id'];
        let subcourseTitle = results.rows[0]['subcourse_title'];
        let subcourseSchedule = results.rows[0]['schedule'];
        let subcourseDescription = results.rows[0]['description'];
        let centerName = results.rows[0]['course_title'];
        let centerEmail = results.rows[0]['course_email'];

        sendClientInfoNotification(subcourseId, {
            center_name: centerName,
            subcourse_title: subcourseTitle,
            fullname: clientFullname,
            email: clientEmail,
            phone: clientPhone,
            pay_sum: clientPaySum,
            subcourse_schedule: subcourseSchedule,
            code: verificationCode,
            date: moment().add(4, 'hours').format('LLL')
        });

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'oilanedu@gmail.com',
                pass: 'dyvldkxooosevhon'
            }
        });


        let mailTextForClient = `
            Уважаемый(-ая) ${clientFullname}, благодарим вас за то, что записались на курс от образовательного центра ${centerName} через Oilan!


            Ваш код студента: ${verificationCode}.
            
            Укажите данный код у ресепшена ${centerName}, чтобы подтвердить, что вы уже купили курс.
            
            
            Курс, на который вы записались: ${subcourseTitle}.
            
            Описание курса: ${subcourseDescription}.
            
            Расписание: ${subcourseSchedule}.
            
            Образовательный центр: ${centerName}.
            
            
            Желаем вам удачи в обучении!
            
            С уважением, команда Oilan.
            
            
            Если возникли вопросы, можете позвонить по номеру: +7 (708) 800-71-77
            Или написать письмо по адресу: oilanedu@gmail.com
        `;

        let mailTextForCenter = `
            Уважаемые ${centerName}, к вам только что записался новый студент на пробный урок!

            Код студента: ${verificationCode}.
            
            Курс, на который записались: ${subcourseTitle}.
            
            Описание курса: ${subcourseDescription}.
            
            Расписание: ${subcourseSchedule}.  
            
            
            
            Данные о студенте:
            
            ФИО: ${clientFullname}.
            Номер телефона: ${clientPhone}.
            Email: ${clientEmail}.
        
            Свяжитесь с вашим новым студентом, и обсудите детали курса :)
            
            
            Желаем вам плодотворной работы!
            С уважением, команда Oilan.
            
            
            Если возникли вопросы, можете позвонить по номеру: +7 (708) 800-71-77
            Или написать письмо по адресу: oilanedu@gmail.com
        `;

        let mailOptionsForClient = {
            from: 'oilanedu@gmail.com',
            to: clientEmail,
            subject: 'Вы записались на курс!',
            text: mailTextForClient,
            // html:
            //     `
            //         <body>
            //             <h1>html test</h1>
            //         </body>
            //     `
        };

        let mailOptionsForCenter = {
            from: 'oilanedu@gmail.com',
            to: centerEmail,
            subject: 'У вас новый клиент!',
            text: mailTextForCenter,
            // html:
            //     `
            //         <body>
            //             <h1>html test</h1>
            //         </body>
            //     `
        };

        await transporter.sendMail(mailOptionsForClient, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        await transporter.sendMail(mailOptionsForCenter, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    })
}

const sendEmailByEmail = (studentData, verificationCode) => {

}

const handlePaymentPost = async (request, response) => {
    console.log("handle payment POST:");

    console.log(request.body)

    if(request.body.status === 1){
        let paymentPayload = JSON.parse(request.body.description);
        let centerId = paymentPayload.centerId;
        let cardsCount = paymentPayload.cardsCount;
        let monthCount = Number(paymentPayload.monthCount);

        console.log("payment payload")
        console.log(paymentPayload)

        await pool.query(`UPDATE public.courses\n` +
                    `\tSET permitted_cards_count=${cardsCount}, \n` +
                    `\tlast_payment_date=current_date, \n` +
                    `\tnext_payment_date=current_date + interval \'${monthCount} month\'\n` +
                    `\tWHERE id=${centerId}`,
            async (error, results) => {
                if (error) {
                    throw error
                }

                pool.query('INSERT INTO center_account_notifications (center_id, message, checked, datetime) VALUES ($1, $2, $3, current_timestamp)',
                    [
                        centerId,
                        `Вы успешно продлили подписку для ${cardsCount} карточек на ${monthCount} месяцев!
                        Все ваши карточки были переведены в архив. Пожалуйста, активируйте заново нужные карточки.
                        Напоминаем, что вы можете активировать только ${cardsCount} карточек!`,
                        false],
                    (error, result) => {
                    if (error) {
                        throw error
                    }

                        pool.query(`select title from courses where id=${centerId}`,
                            (error, result) => {
                                if (error) {
                                    throw error
                                }
                                let centerTitle = result.rows[0].title;
                                let emailMessage = `Центр '${centerTitle}' купил подписку на ${monthCount} месяцев. Дата покупки: ${getCurrentDate()}`;
                                sendEmail(stuffEmails, `Oilan. Оплата подписки - ${centerTitle}.`, emailMessage);
                            })
                })
        })

        await pool.query(`update subcourses set is_archived=true where course_id=${centerId}`,
            (error, result) => {
                if (error) {
                    throw error
                }
        })
    }

    return response.redirect('https://www.oilan.io/cabinet');
}

const setVerificated = (request, response) => {
    let {id, verificated} = request.body;
    pool.query(`update subcourses set verificated=${verificated} where id=${id}`,
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseTitle = (request, response) => {
    let {id, title} = request.body;
    pool.query('update subcourses set title=$2 where id=$1', [id, title],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseDescription = (request, response) => {
    let {id, description} = request.body;
    pool.query('update subcourses set description=$2 where id=$1', [id, description],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateCourseDescription = (request, response) => {
    let {id, description} = request.body;
    pool.query('update courses set description=$2 where id=$1', [id, description],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseLogo = (request, response) => {
    let {id, img_src} = request.body;
    pool.query('update courses set img_src=$2 where id=$1', [id, img_src],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateCourseAddresses = (request, response) => {
    let {id, addresses} = request.body;
    pool.query('update courses set addresses=$2 where id=$1', [id, addresses],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseSchedule = (request, response) => {
    let {id, schedule} = request.body;
    pool.query('update subcourses set schedule=$2 where id=$1', [id, schedule],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcoursePrice = (request, response) => {
    let {id, price, currency, unit_of_time} = request.body;
    pool.query('update subcourses set price=$2, currency=$3, unit_of_time=$4 where id=$1', [id, price, currency, unit_of_time],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseCategory = (request, response) => {
    let {id, category_id} = request.body;
    pool.query('update subcourses set category_id=$2 where id=$1', [id, category_id],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseType = (request, response) => {
    let {id, type} = request.body;
    pool.query('update subcourses set type=$2 where id=$1', [id, type],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseFormat = (request, response) => {
    let {id, format} = request.body;
    pool.query('update subcourses set format=$2 where id=$1', [id, format],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const updateSubcourseAges = (request, response) => {
    let {id, ages} = request.body;
    pool.query('update subcourses set ages=$2 where id=$1', [id, ages],
        (error, result) => {
            if (error) {
                throw error
            }
        })
}

const handleNewStudent = (request, response) => {
    let studentData = request.body;
    let verificationCode = (Math.floor(Math.random() * 999999) + 100000).toString();

    pool.query('SELECT subcourses.id, subcourses.course_id, subcourses.title as "subcourse_title", courses.title as "course_title", courses.email as "course_email", subcourses.description, subcourses.price, subcourses.schedule, subcourses.duration, subcourses.rating, subcourses.category_id, subcourses.ages, subcourses.format, subcourses.expected_result, subcourses.start_requirements, subcourses.type, subcourses.isonline FROM subcourses JOIN courses ON subcourses.course_id = courses.id WHERE subcourses.id = $1', [studentData.subcourse_id], async (error, results) => {
        if (error) {
            throw error
        }
        let clientEmail = studentData['email'];
        let clientFullname = studentData['fullname'];
        let clientPhone = studentData['phone'];
        let clientPaySum = studentData['pay_sum'];
        let clientPromocode = studentData['promocode'];
        let subcourseId = studentData['subcourse_id'];
        let subcourseTitle = results.rows[0]['subcourse_title'];
        let subcourseSchedule = results.rows[0]['schedule'];
        let subcourseDescription = results.rows[0]['description'];
        let centerName = results.rows[0]['course_title'];
        let centerEmail = results.rows[0]['course_email'];

        sendClientInfoNotification(subcourseId, {
            center_name: centerName,
            subcourse_title: subcourseTitle,
            fullname: clientFullname,
            email: clientEmail,
            phone: clientPhone,
            pay_sum: clientPaySum,
            subcourse_schedule: subcourseSchedule,
            code: verificationCode,
            date: moment().add(4, 'hours').format('LLL')
        });

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'oilanedu@gmail.com',
                pass: 'dyvldkxooosevhon'
            }
        });


        let mailTextForClient = `
        Уважаемый(-ая) ${clientFullname}, благодарим вас за то, что записались на курс от образовательного центра ${centerName} через Oilan!


        Ваш код студента: ${verificationCode}.
        
        Укажите данный код у ресепшена ${centerName}, чтобы подтвердить, что вы уже купили курс.
        
        
        Курс, на который вы записались: ${subcourseTitle}.
        
        Описание курса: ${subcourseDescription}.
        
        Расписание: ${subcourseSchedule}.
        
        Образовательный центр: ${centerName}.
        
        
        Желаем вам удачи в обучении!
        
        С уважением, команда Oilan.
        
        
        Если возникли вопросы, можете позвонить по номеру: +7 (708) 800-71-77
        Или написать письмо по адресу: oilanedu@gmail.com
        `;

        let mailTextForCenter = `
        Уважаемые ${centerName}, к вам только что записался новый студент на пробный урок!

        Код студента: ${verificationCode}.
        
        Курс, на который записались: ${subcourseTitle}.
        
        Описание курса: ${subcourseDescription}.
        
        Расписание: ${subcourseSchedule}.  
        
        

        Данные о студенте:
        
        ФИО: ${clientFullname}.
        Номер телефона: ${clientPhone}.
        Email: ${clientEmail}.
        Введенный промокод: ${clientPromocode}.
    
        Свяжитесь с вашим новым студентом, и обсудите детали курса :)
        
        
        Желаем вам плодотворной работы!
        С уважением, команда Oilan.
        
        
        Если возникли вопросы, можете позвонить по номеру: +7 (708) 800-71-77
        Или написать письмо по адресу: oilanedu@gmail.com
        `;

        let mailOptionsForClient = {
            from: 'oilanedu@gmail.com',
            to: clientEmail,
            subject: 'Вы записались на курс!',
            text: mailTextForClient,
            // html:
            //     `
            //         <body>
            //             <h1>html test</h1>
            //         </body>
            //     `
        };

        let mailOptionsForCenter = {
            from: 'oilanedu@gmail.com',
            to: centerEmail,
            subject: 'У вас новый клиент!',
            text: mailTextForCenter,
            // html:
            //     `
            //         <body>
            //             <h1>html test</h1>
            //         </body>
            //     `
        };

        await transporter.sendMail(mailOptionsForClient, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        await transporter.sendMail(mailOptionsForCenter, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        let emailNotificationMessage =`
        Название центра: ${centerName}.
        
        Курс, на который записались: ${subcourseTitle}.
        
        Описание курса: ${subcourseDescription}.
        
        Расписание: ${subcourseSchedule}.  
        
        

        Данные о студенте:
        
        ФИО: ${clientFullname}.
        Номер телефона: ${clientPhone}.
        Email: ${clientEmail}.
        Введенный промокод: ${clientPromocode}.
    
        Свяжитесь с вашим новым студентом, и обсудите детали курса :)
        `;

        await sendEmail(
            stuffEmails,
            'Новый студент!',
            emailNotificationMessage
        )
    })


}

//----------------------------------------------------------

const createCallRequest = (request, response) => {
    const { phone } = request.body;
    let currentDate = moment().format();

    //sendCallRequestNotification({phone: phone, currentDate: moment().format('LLLL')});

    pool.query('INSERT INTO call_requests (phone, date) VALUES ($1, $2)', [phone, currentDate], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`call_requests created`);

        let nameForMindsales = `У клиента появился вопрос.`;
        let phoneForMindsales = phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '');

        createDealInMindsales(nameForMindsales, phoneForMindsales);
    });

    sendEmail(stuffEmails, 'У клиента появился вопрос!', 'Номер клиента: ' + phone);
}

//----------------------------------------------------------

const createHelpRequest = async (request, response) => {
    const { name, phone, email, message } = request.body;
    let currentDate = moment().format();
    console.log(request.body)
    //sendCallRequestNotification({phone: phone, currentDate: moment().format('LLLL')});

    pool.query('INSERT INTO help_requests (name, phone, email, message, date) VALUES ($1, $2, $3, $4, $5)', [name, phone, email, message, currentDate], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`help_requests created`);

        let nameForMindsales = `Клиенту необходима консультация!`;
        let phoneForMindsales = phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '');
        createDealInMindsales(nameForMindsales, phoneForMindsales);
    });

    sendEmail(stuffEmails, 'Клиенту необходима консультация!', 'Имя клиента: ' + name + '\nНомер клиента: ' + phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '') + '\nЭлектронный адрес клиента:' + email + '\nКомментарий:' + message);
}

//----------------------------------------------------------

const courseCardsFilter = (request, response) => {
    const { centerName, city, direction, price, center, isOnline, sortType} = request.body;

    console.log("sort type: " + sortType);

    let whereAdded = false;

    let queryText = "SELECT subcourses.id, subcourses.category_id, courses.city_id, courses.promocode, subcourses.title, subcourses.currency, subcourses.unit_of_time, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.verificated, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, courses.id as \"course_id\", courses.title as \"course_title\", courses.url, courses.addresses, courses.phones, courses.instagram, courses.website_url, courses.latitude, courses.longitude, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id";
    if(city !== '0'){
        whereAdded = true;
        queryText += " where courses.city_id=" + city;
    }

    if(whereAdded){
        queryText += " and ";
    }else{
        whereAdded = true;
        queryText += " where ";
    }
    queryText += "subcourses.approved=true";

    if(direction !== '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            whereAdded = true;
            queryText += " where ";
        }

        queryText += "subcourses.category_id=" + direction;
    }

    if(center !== '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            queryText += " where ";
        }

        queryText += "subcourses.course_id=" + center;
    }

    if(centerName.replace(/ /g, '').length > 0){
        if(whereAdded){
            queryText += " and ";
        }else{
            queryText += " where ";
        }

        queryText += `(lower(courses.title) like '%${centerName.toLowerCase()}%' or lower(courses.title) like '${centerName.toLowerCase()}%' or lower(courses.title) like '%${centerName.toLowerCase()}' or lower(courses.title) like '${centerName.toLowerCase()}')`;
    }

    if(price !== '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            whereAdded = true;
            queryText += " where ";
        }

        switch(price){
            case "0-20000":
                queryText += "(subcourses.price >= 0 and subcourses.price <= 20000)";
                break;
            case "20000-40000":
                queryText += "(subcourses.price >= 20000 and subcourses.price <= 40000)";
                break;
            case "40000-60000":
                queryText += "(subcourses.price >= 40000 and subcourses.price <= 60000)";
                break;
            case "60000-80000":
                queryText += "(subcourses.price >= 60000 and subcourses.price <= 80000)";
                break;
            case "80000-100000":
                queryText += "(subcourses.price >= 80000 and subcourses.price <= 100000)";
                break;
            case "100000":
                queryText += "subcourses.price >= 100000";
                break;
        }
    }

    if(whereAdded){
        queryText += " and ";
    }else{
        whereAdded = true;
        queryText += " where ";
    }

    if(isOnline === '1'){
        queryText += "subcourses.isOnline=true";
    }else{
        queryText += "subcourses.isOnline=false";
    }

    if(whereAdded){
        queryText += " and ";
    }else{
        whereAdded = true;
        queryText += " where ";
    }
    queryText += 'subcourses.is_archived=false'

    if(whereAdded){
        queryText += " and ";
    }else{
        whereAdded = true;
        queryText += " where ";
    }
    queryText += 'next_payment_date != current_date'

    if(whereAdded){
        queryText += " and ";
    }else{
        whereAdded = true;
        queryText += " where ";
    }
    queryText += 'subcourses.title != \'test\''

    queryText += ` order by subcourses.verificated desc, order_coefficient`;


    console.log("QUERY TEXT: " + queryText);

    pool.query(queryText, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const tutorCourseCardsFilter = (request, response) => {
    const { centerName, city, direction, price, center, isOnline} = request.body;

    console.log(request.body);

    let whereAdded = false;

    let queryText = "SELECT tutor_coursecards.id, tutors.description as \"tutor_description\", course_categories.img_src as \"category_img\", course_categories.name as \"category_name\", tutors.phone_number, tutors.city_id, tutors.teaching_language, cities.name as \"city_name\", tutor_coursecards.title, tutor_coursecards.currency,\n" +
        "        tutor_coursecards.unit_of_time, tutor_coursecards.min_age, tutor_coursecards.max_age,\n" +
        "        tutors.can_work_online, tutors.can_work_online, tutor_coursecards.price, tutor_coursecards.schedule,\n" +
        "        tutor_coursecards.expecting_results, tutor_coursecards.start_requirements,\n" +
        "        tutor_coursecards.duration_word, tutor_coursecards.category_id, tutor_coursecards.duration_value,\n" +
        "        tutors.id as \"tutor_id\", tutors.fullname,\n" +
        "        tutors.url, tutors.phone_number, tutors.img_src, tutors.address\n" +
        "        from tutor_coursecards\n" +
        "        inner join tutors on tutor_coursecards.tutor_id = tutors.id\n" +
        "        join cities on cities.id = tutors.city_id\n" +
        "        join course_categories on course_categories.id=tutor_coursecards.category_id";

    if(city !== '0'){
        whereAdded = true;
        queryText += " where tutors.city_id=" + city;
    }

    if(direction !== '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            whereAdded = true;
            queryText += " where ";
        }

        queryText += "tutor_coursecards.category_id=" + direction;
    }

    if(centerName.replace(/ /g, '').length > 0){
        if(whereAdded){
            queryText += " and ";
        }else{
            queryText += " where ";
        }

        queryText += `(lower(tutors.fullname) like '%${centerName.toLowerCase()}%' or lower(tutors.fullname) like '${centerName.toLowerCase()}%' or lower(tutors.fullname) like '%${centerName.toLowerCase()}' or lower(tutors.fullname) like '${centerName.toLowerCase()}')`;
    }

    if(center !== '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            queryText += " where ";
        }

        queryText += "tutor_coursecards.tutor_id=" + center;
    }

    if(price !== '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            whereAdded = true;
            queryText += " where ";
        }

        switch(price){
            case "0-20000":
                queryText += "(tutor_coursecards.price >= 0 and tutor_coursecards.price <= 20000)";
                break;
            case "20000-40000":
                queryText += "(tutor_coursecards.price >= 20000 and tutor_coursecards.price <= 40000)";
                break;
            case "40000-60000":
                queryText += "(tutor_coursecards.price >= 40000 and tutor_coursecards.price <= 60000)";
                break;
            case "60000-80000":
                queryText += "(tutor_coursecards.price >= 60000 and tutor_coursecards.price <= 80000)";
                break;
            case "80000-100000":
                queryText += "(tutor_coursecards.price >= 80000 and tutor_coursecards.price <= 100000)";
                break;
            case "100000":
                queryText += "tutor_coursecards.price >= 100000";
                break;
        }
    }

    if(isOnline != '0'){
        if(whereAdded){
            queryText += " and ";
        }else{
            whereAdded = true;
            queryText += " where ";
        }

        if(isOnline === '1'){
            queryText += "tutors.can_work_online=true";
        }else{
            queryText += "tutors.can_work_offline=true";
        }
    }

    queryText += " order by img_src asc, fullname asc"

    console.log("QUERY TEXT: " + queryText);

    pool.query(queryText, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const getTutorCourseCardsFilter = (request, response) => {
    let queryText = "SELECT tutor_coursecards.id, tutors.description as \"tutor_description\", course_categories.img_src as \"category_img\", course_categories.name as \"category_name\", tutors.phone_number, tutors.city_id, tutors.teaching_language, cities.name as \"city_name\", tutor_coursecards.title, tutor_coursecards.currency,\n" +
        "        tutor_coursecards.unit_of_time, tutor_coursecards.min_age, tutor_coursecards.max_age,\n" +
        "        tutors.can_work_online, tutors.can_work_online, tutor_coursecards.price, tutor_coursecards.schedule,\n" +
        "        tutor_coursecards.expecting_results, tutor_coursecards.start_requirements,\n" +
        "        tutor_coursecards.duration_word, tutor_coursecards.duration_value,\n" +
        "        tutors.id as \"tutor_id\", tutors.fullname,\n" +
        "        tutors.url, tutors.phone_number, tutors.img_src, tutors.address\n" +
        "        from tutor_coursecards\n" +
        "        inner join tutors on tutor_coursecards.tutor_id = tutors.id\n" +
        "        join cities on cities.id = tutors.city_id\n" +
        "        join course_categories on course_categories.id=tutor_coursecards.category_id";

    pool.query(queryText, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}
const logUserClick = (request, response) => {
    const { course_id, card_id, event_name, is_tutor_card } = request.body

    pool.query('INSERT INTO clicks_log (datetime, course_id, card_id, event_name, is_tutor_card) VALUES (current_timestamp, $1, $2, $3, $4)', [course_id, card_id, event_name, is_tutor_card], (error, result) => {
        if (error) {
            throw error
        }
        //response.status(201).send('ok')
    })

    if(!is_tutor_card) {
        let viewsQuery = `select subcourses.views from subcourses where subcourses.id=${card_id}`;
        console.log(viewsQuery);

        pool.query(viewsQuery, (error, result) => {
            if (error) {
                throw error
            }
            let viewsCount = result.rows[0].views;
            if ((viewsCount + 1) % 3 === 0) {
                let maxOrderCoefficientQuery = `select max(order_coefficient) as "max" from subcourses`;
                console.log(maxOrderCoefficientQuery);
                pool.query(maxOrderCoefficientQuery, (error, orderResult) => {
                    if (error) {
                        throw error
                    }
                    let maxOrderCoefficient = orderResult.rows[0].max;
                    console.log('maxOrderCoefficient: ' + maxOrderCoefficient);

                    let updateViewsAndOrderCoefficientQuery = `update subcourses set views=${viewsCount+1}, order_coefficient=${maxOrderCoefficient+0.1} where id=${card_id}`;
                    console.log(updateViewsAndOrderCoefficientQuery);
                    pool.query(updateViewsAndOrderCoefficientQuery, (error, updateResult) => {
                        if (error) {
                            throw error
                        }
                        response.status(200).json({order_coefficient: maxOrderCoefficient + 0.1});
                    })
                })
            } else {
                let updateViewsAndOrderCoefficientQuery = `update subcourses set views=${viewsCount+1} where id=${card_id}`;
                console.log(updateViewsAndOrderCoefficientQuery);
                pool.query(updateViewsAndOrderCoefficientQuery, (error, updateResult) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).json();
                })
            }
        })
    }
}

//----------------------------------------------------------

const generateAccessToken = (userId, roleId, centerId) => {
    const payload = {
        userId,
        roleId,
        centerId
    }
    return jwt.sign(payload, secret, {expiresIn: "365d"} )
}

const saveLastLoginTime = (centerId) => {
    pool.query(`update courses set last_login_datetime=current_timestamp where id=${centerId}`, (error, results) => {
        if (error) {
            throw error
        }
        console.log('center id ' + centerId + ' just logged in');
    })
}

const login = (request, response) => {
    console.log("login handler");
    const { login, password } = request.body
    pool.query('SELECT * from users where login=$1 and password=$2', [login, password], (error, results) => {
        if (error) {
            throw error
        }
        if(results.rows[0] !== undefined){
            let user = results.rows[0];
            const token = generateAccessToken(user.id, user.role_id, user.center_id);
            saveLastLoginTime(user.center_id);
            return response.status(200).json({token, centerId: user.center_id, roleId: user.role_id, userId: user.id});
        }
        else{
            return response.status(400).json({message: `Пользователь ${login} не найден`})
        }
    })
}

//----------------------------------------------------------

const getCabinetInfo = (request, response) => {
    console.log("getCabinetInfo handler");
    const id = parseInt(request.params.id)

    pool.query('SELECT id from courses where login=$1 and password=$2', [login, password], (error, results) => {
        if (error) {
            throw error
        }
        if(results.rows[0] !== undefined){
            response.status(200).send(results.rows[0]);
        }
        else{
            response.sendStatus(401)
        }
    })
}

//----------------------------------------------------------

const getAdminCards = (request, response) => {
    pool.query('SELECT subcourses.id, subcourses.isonline, subcourses.title, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, subcourses.currency, subcourses.unit_of_time, subcourses.approved, subcourses.declined, courses.id as "course_id", courses.title as "course_title", courses.phones, courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id where approved=false and declined=false', [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getAdminTeachers = (request, response) => {
    pool.query('SELECT * FROM teachers where approved=false and declined=false', (error, results) => {
        if (error) {
            throw error
        }
        console.log('partnership_requests sent');
        response.status(200).json(results.rows)
    })
}

//------------------------------------------------------------------

const approveCard = (request, response) => {
    const { cardId } = request.body
    pool.query(
        'UPDATE subcourses SET approved = true, declined = false WHERE id = $1',
        [cardId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Card modified with ID: ${cardId}`)
        }
    )
}

const declineCard = (request, response) => {
    const { cardId } = request.body
    pool.query(
        'delete from editing_coursecards where subcourse_id=$1',
        [cardId],
        (error, results) => {
            if (error) {
                console.log(error);
                response.status(500).send(`error`);
            }else{
                response.status(200).send(`ok`);
            }
        }
    )
}

const approveTeacher = (request, response) => {
    const { cardId } = request.body
    pool.query(
        'UPDATE teachers SET approved = true, declined = false WHERE id = $1',
        [cardId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`teacher modified with ID: ${cardId}`)
        }
    )
}

const declineTeacher = (request, response) => {
    const { cardId } = request.body
    pool.query(
        'UPDATE teachers SET approved = false, declined = true WHERE id = $1',
        [cardId],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`teacher modified with ID: ${cardId}`)
        }
    )
}

//---------------------------------------------------------------------------

const getCabinetCourseCards = (request, response) => {
    const { courseId } = request.body
    pool.query(`SELECT subcourses.is_archived, subcourses.id, subcourses.category_id as "card_category_id", course_categories.name as "category_name", subcourses.isonline, subcourses.title, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, subcourses.approved, subcourses.declined, courses.id as "course_id", courses.title as "course_title", courses.phones, courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url, currency, unit_of_time, subcourses.rating, published_date from subcourses join courses on subcourses.course_id = courses.id join course_categories on subcourses.category_id = course_categories.id where subcourses.course_id=$1 and subcourses.title!='test' and subcourses.declined=false`, [courseId], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })

    console.log(`center id ${courseId} loading cabinet cards`)
}

//---------------------------------------------------------------

const createCourseCard = (request, response) => {
    const {
        courseId,
        title,
        description,
        expectedResult,
        startRequirements,
        duration,
        ages,
        type,
        isonline,
        price,
        currency,
        unitOfTime,
        schedule,
        categoryId
    } = request.body;

    pool.query('INSERT INTO subcourses (course_id, title, description, price, schedule, duration, ages, expected_result, start_requirements, type, isonline, approved, declined, currency, unit_of_time, category_id, format, order_coefficient, published_date, is_archived, views) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, current_date, $19, $20)', [courseId, title, description, price, schedule, duration, ages, expectedResult, startRequirements, type, isonline === "true", false, false, currency, unitOfTime, categoryId, isonline === "true" ? "Online" : "Offline", 0, false, 0], (error, result) => {
        if (error) {
            response.status(500).send("error");
        }else{
            response.status(200).send(`Subcourse added`)
        }
    })
}

const createCourseTeacher = (request, response) => {
    const {
        fullname,
        description,
        img_url,
        course_id
    } = request.body

    pool.query('INSERT INTO teachers (fullname, description, img_url, course_id, approved, declined) VALUES ($1, $2, $3, $4, $5, $6)', [fullname, description, img_url, course_id, false, false], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`teacher added with ID: ${result.id}`)
    })
}

const getCabinetCourseTeachers = (request, response) => {
    const { courseId } = request.body
    pool.query(`SELECT * FROM teachers where course_id=$1 and declined=false and teachers.fullname != 'test'`, [ courseId ],  (error, results) => {
        if (error) {
            throw error
        }
        console.log('partnership_requests sent');
        response.status(200).json(results.rows)
    })
}

const getFilteredCategories = (request, response) => {
    const {
        searchingCenter,
        cityId
    } = request.body;

    let query = ``;

    if(searchingCenter){
        query = `
        select course_categories.id, name from subcourses
        join course_categories on course_categories.id=category_id
        join courses on courses.id = subcourses.course_id
        where subcourses.approved=true and declined=false and is_archived=false
        group by course_categories.id, name
    `
    }else{
        query = `
        select course_categories.id, name from tutor_coursecards
        join course_categories on course_categories.id=category_id
        join tutors on tutors.id = tutor_coursecards.id
        group by course_categories.id, name
    `
    }

    console.log(query);

    pool.query(query, (error, result) => {
        if (error) {
            throw error
        }else{
            response.json(result.rows);
        }
    });
}

const getFilters = (request, response) => {
    let filtersArray = [];
    pool.query('SELECT * FROM cities',  (error, citiesResult) => {
        if (error) {
            throw error
        }
        pool.query('SELECT * FROM course_categories order by id asc',  (error, categoriesResult) => {
            if (error) {
                throw error
            }
            pool.query('SELECT * FROM courses',  (error, coursesResult) => {
                if (error) {
                    throw error
                }
                filtersArray.push(citiesResult.rows.sort(function ( a, b ) {
                    if ( a.name < b.name ){
                        return -1;
                    }
                    if ( a.name > b.name ){
                        return 1;
                    }
                    return 0;
                }));
                filtersArray.push(categoriesResult.rows.sort(function ( a, b ) {
                    if ( a.name < b.name ){
                        return -1;
                    }
                    if ( a.name > b.name ){
                        return 1;
                    }
                    return 0;
                }));
                filtersArray.push(coursesResult.rows.sort(function ( a, b ) {
                    if ( a.title < b.title ){
                        return -1;
                    }
                    if ( a.title > b.title ){
                        return 1;
                    }
                    return 0;
                }));

                response.status(200).json(filtersArray)
            })
        })
    })
}

//--------------------------------------------------------

const registerTelegramUser = (request, response) => {
    const { code, chat_id } = request.body;
    const responseMessage = `Сервер принял code=${code}, chat_id=${chat_id}`;
    sendTelegramMessage(chat_id, "lolo");
    response.status(200).send(responseMessage);
}

const getCourseCategories = (request, response) => {
    pool.query('SELECT * FROM course_categories',  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getCourseCategory = (request, response) => {
    const { id } = request.body;

    pool.query('SELECT * FROM course_categories where id=$1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0])
    })
}

const sendEditCard = async (request, response) => {
    const {
        id,
        course_id,
        title,
        description,
        price,
        schedule,
        duration,
        category_id,
        ages,
        format,
        expected_result,
        start_requirements,
        type,
        currency,
        unit_of_time
    } = request.body;

    // await pool.query('INSERT INTO editing_coursecards (subcourse_id, course_id, title, description, price, schedule, duration, category_id, ages, format, expected_result, start_requirements, type, isonline, currency, unit_of_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)', [id, course_id, title, description, price, schedule, duration, category_id, ages, format, expected_result, start_requirements, type, format === "Online", currency, unit_of_time], (error, result) => {
    //     if (error) {
    //         throw error
    //     }
    // })

    await pool.query('update subcourses set title=$1, description=$2, price=$3, category_id=$4, format=$5, type=$6, isonline=$7, currency=$8, unit_of_time=$9 where id=$10', [
        title,
        description,
        price,
        category_id,
        format,
        type,
        format === "Online",
        currency,
        unit_of_time,
        id
    ], (error, result) => {
        if (error) {
            throw error
        }else{
            console.log(`subcourse ${id} changed`);
        }
    })

    let message = `Вы внесли изменения по карточке "${title}". Изменения вступят в силу сразу после того, как карточка пройдет модерацию. Обычно это занимает не больше 1 дня.`
    await pool.query('INSERT INTO center_account_notifications (center_id, message, checked, datetime) VALUES ($1, $2, $3, current_timestamp)', [course_id, message, false], (error, result) => {
        if (error) {
            throw error
        }
    })

    response.status(201).send('ok');
}

const getEditCards = (request, response) => {
    pool.query('SELECT editing_coursecards.id as "edit_card_id", editing_coursecards.subcourse_id, editing_coursecards.title as "course_title", editing_coursecards.description, editing_coursecards.price, editing_coursecards.schedule, editing_coursecards.duration, editing_coursecards.rating, editing_coursecards.category_id, editing_coursecards.ages, editing_coursecards.format, editing_coursecards.expected_result, editing_coursecards.start_requirements, editing_coursecards.type, editing_coursecards.isonline, editing_coursecards.approved, editing_coursecards.declined, editing_coursecards.currency, editing_coursecards.unit_of_time, editing_coursecards.course_id, courses.img_src, courses.title, courses.website_url, courses.phones, courses.background_image_url, courses.instagram FROM editing_coursecards join courses on courses.id = editing_coursecards.course_id',  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getClickStatistics = (request, response) => {
    let { centerId } = request.body;

    pool.query('SELECT clicks_log.id, datetime, clicks_log.course_id, card_id, subcourses.title, \n' +
        '\t\tcourse_categories.name, subcourses.isonline, subcourses.price, \n' +
        '\t\tsubcourses.currency, subcourses.unit_of_time\n' +
        '        FROM public.clicks_log\n' +
        '        join subcourses on subcourses.id=clicks_log.card_id\n' +
        '        join course_categories on course_categories.id = subcourses.category_id\n' +
        '        where clicks_log.course_id=$1 and subcourses.title != \'test\'', [centerId],  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const cardCreationPermission = (request, response) => {
    const centerId = parseInt(request.params.centerId)

    pool.query(`select count(id) from subcourses where approved=true and is_archived=false and title!='test' and course_id=$1`, [centerId],  (error, results) => {
        if (error)  {
            throw error
        }
        let currentCountOfCards = results.rows[0].count;

        pool.query('select permitted_cards_count from courses where id=$1', [centerId],  (error, results) => {
            if (error) {
                throw error
            }
            let permittedCardsCount = results.rows[0].permitted_cards_count === null ? 0 : results.rows[0].permitted_cards_count;

            let permitted = false;

            if(currentCountOfCards < permittedCardsCount){
                permitted = true;
            }

            response.status(200).json({
                permittedCardsCount: permittedCardsCount,
                //permitted: permitted,
                permitted: true
            });
        })
    })
}

//-----------------------------------------------------------------

const loadCallCenterInfo = (request, response) => {
    // let { rowStartNum, rowEndNum } = request.body;
    // rowStartNum = Number(rowStartNum);
    // rowEndNum = Number(rowEndNum);
    //let query = `SELECT id, center_category_id, call_center_user_id, center_name, contact_name, center_phone, center_email, to_char( first_call_date , 'YYYY-mm-dd') as "first_call_date", first_call_time, first_call_comment, to_char( kp_send_date , 'YYYY-mm-dd') as "kp_send_date", to_char( second_call_date , 'YYYY-mm-dd') as "second_call_date", second_call_time, second_call_comment, to_char( meeting_date , 'YYYY-mm-dd') as "meeting_date", meeting_time, saller_user_id, meeting_comitted, meeting_comment, will_conclude_contract, to_char( contract_signing_start_date , 'YYYY-mm-dd') as "contract_signing_start_date", to_char( data_collection_start_date , 'YYYY-mm-dd') as "data_collection_start_date", contract_send_status, contract_send_comment, contract_agreed, contract_agreement_comment, contract_signed, contract_signed_comment, to_char( contract_sign_date , 'YYYY-mm-dd') as "contract_sign_date", operation_personal_user_id  FROM public.crm  where center_name is not null ORDER BY id offset ${rowStartNum-1} rows FETCH NEXT ${rowEndNum-rowStartNum} ROWS ONLY`;
    let query = `SELECT id, center_category_id, call_center_user_id, center_name, contact_name, center_phone, center_email, to_char( first_call_date , 'YYYY-mm-dd') as "first_call_date", first_call_time, first_call_comment, to_char( kp_send_date , 'YYYY-mm-dd') as "kp_send_date", to_char( second_call_date , 'YYYY-mm-dd') as "second_call_date", second_call_time, second_call_comment, to_char( meeting_date , 'YYYY-mm-dd') as "meeting_date", meeting_time, saller_user_id, meeting_comitted, meeting_comment, will_conclude_contract, to_char( contract_signing_start_date , 'YYYY-mm-dd') as "contract_signing_start_date", to_char( data_collection_start_date , 'YYYY-mm-dd') as "data_collection_start_date", contract_send_status, contract_send_comment, contract_agreed, contract_agreement_comment, contract_signed, contract_signed_comment, to_char( contract_sign_date , 'YYYY-mm-dd') as "contract_sign_date", operation_personal_user_id  FROM public.crm  where center_name is not null ORDER BY id`;
    console.log(query);
    pool.query(query, (error, results) => {
        if (error) {
            throw error
        }

        response.status(200).json({rows: results.rows, length: results.rows.length});
    })
}

const loadSallerInfo = (request, response) => {
    pool.query('SELECT id, center_category_id, call_center_user_id, center_name, contact_name, center_phone, center_email, to_char( first_call_date , \'YYYY-mm-dd\') as "first_call_date", first_call_time, first_call_comment, to_char( kp_send_date , \'YYYY-mm-dd\') as "kp_send_date", to_char( second_call_date , \'YYYY-mm-dd\') as "second_call_date", second_call_time, second_call_comment, to_char( meeting_date , \'YYYY-mm-dd\') as "meeting_date", meeting_time, saller_user_id, meeting_comitted, meeting_comment, will_conclude_contract, to_char( contract_signing_start_date , \'YYYY-mm-dd\') as "contract_signing_start_date", to_char( data_collection_start_date , \'YYYY-mm-dd\') as "data_collection_start_date", contract_send_status, contract_send_comment, contract_agreed, contract_agreement_comment, contract_signed, contract_signed_comment, to_char( contract_sign_date , \'YYYY-mm-dd\') as "contract_sign_date", operation_personal_user_id FROM public.crm where meeting_date is not null', (error, results) => {
        if (error) {
            throw error
        }

        response.status(200).json(results.rows);
    })
}

const updateCallCenterRow = (request, response) => {
    const {
        id,
        companyName,
        phone,
        contactPerson,
        mail,
        sendKPDate,
        firstCallComment,
        secondCallComment,
        meetingDate,
        meetingTime,
        firstCall,
        firstCallTime,
        secondCallTime,
        secondCall,
        categoryId,
        userId
    } = request.body;



    if (meetingDate !== null && meetingTime !== null) {

        let query = `SELECT count(id) FROM public.crm where meeting_date='${meetingDate}' and (time '${meetingTime}') - '01:00' < meeting_time and (time '${meetingTime}') + '1 hour' > meeting_time and id!=${id}`;
        console.log(query);

        pool.query(query, (error, results) => {
            if (error) {
                throw error
            }

            if(results.rows[0].count > 0){
                response.status(409).json(false);
                console.log("нельзя назначить встречу в это время");
            }else{
                console.log("update c указанием встречи");
                pool.query('UPDATE public.crm SET call_center_user_id=$16, center_name=$2, center_category_id=$15, contact_name=$4, center_phone=$3, center_email=$5, first_call_date=$11, first_call_time=$12, first_call_comment=$7, kp_send_date=$6, second_call_date=$14, second_call_time=$13, second_call_comment=$8, meeting_date=$9, meeting_time=$10 WHERE id=$1', [
                    id,
                    companyName,
                    phone,
                    contactPerson,
                    mail,
                    sendKPDate,
                    firstCallComment,
                    secondCallComment,
                    meetingDate === "" ? null : meetingDate,
                    meetingTime === "" ? null : meetingTime,
                    firstCall,
                    firstCallTime,
                    secondCallTime,
                    secondCall,
                    categoryId,
                    userId
                ], (error, results) => {
                    if (error) {
                        throw error
                    }

                    response.status(200).json(true);
                })
            }
        })
    } else {
        console.log("update без указания встречи");
        let query = `UPDATE public.crm SET call_center_user_id=${userId}, center_name='${companyName}', center_category_id=${categoryId}, contact_name='${contactPerson}', center_phone='${phone}', center_email='${mail}', first_call_date=${firstCall === null ? null : `'${firstCall}'`}, first_call_time=${firstCallTime === null ? null : `'${firstCallTime}'`}, first_call_comment='${firstCallComment}', kp_send_date=${sendKPDate === null ? null : `'${sendKPDate}'`}, second_call_date=${secondCall === null ? null : `'${secondCall}'`}, second_call_time=${secondCallTime === null ? null : `'${secondCallTime}'`}, second_call_comment='${secondCallComment}' WHERE id=${id}`;
        console.log(query)
        pool.query(query, (error, results) => {
            if (error) {
                throw error
            }

            response.status(200).json(true);
        })
    }
}

const callCenterAddCenter = (request, response) => {
    const {
        companyName,
        categoryId,
        phone,
        contactPerson,
        mail,
    } = request.body;

    pool.query('insert into crm(center_name, contact_name, center_phone, center_email, center_category_id) values($1, $2, $3, $4, $5)', [companyName, contactPerson, phone, mail, categoryId], (error, results) => {
        if (error) {
            throw error
        }

        response.status(200).json(true);
    })
}

const getCrmCourseCategories = (request, response) => {
    console.log("getCrmCourseCategories handler");
    pool.query('SELECT * FROM crm_course_categories',  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const loadOperationPersonal1Info = (request, response) => {
    pool.query('SELECT * FROM crm where will_conclude_contract=true and contract_signing_start_date is not null',  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const loadOperationPersonal2Info = (request, response) => {
    pool.query('SELECT * FROM crm where contract_sign_date is not null',  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const loadOperationPersonal3Info = (request, response) => {
    pool.query('SELECT * FROM crm where placement_date is not null',  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const updateSellerRow = (request, response) => {
    const {
        id,
        companyName,
        contactPerson,
        phone,
        mail,
        meetingDate,
        meetingTime,
        meetingComitted,
        meetingComment,
        contractStatus,
        contractConclusionDate,
        categoryId
    } = request.body;

    pool.query('update crm set center_name=$2, contact_name=$3, center_phone=$4, center_email=$5, meeting_date=$6, meeting_time=$7, meeting_comitted=$8, meeting_comment=$9, will_conclude_contract=$10, contract_signing_start_date=$11, center_category_id=$12 where id=$1', [
        id,
        companyName,
        contactPerson,
        phone,
        mail,
        meetingDate,
        meetingTime,
        meetingComitted,
        meetingComment,
        contractStatus,
        contractConclusionDate,
        categoryId
    ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const updateOperationPersonal1Row = (request, response) => {
    const {
        id,
        companyName,
        categoryId,
        contactPerson,
        phone,
        mail,
        infoCollectionDate,
        sendContractStatus,
        sendContractComments,
        contractAgreedStatus,
        contractAgreedComments,
        contractSignedStatus,
        contractSignedComments,
        contractSignedDate,
    } = request.body;

    pool.query('update crm set center_name=$2, center_category_id=$3, contact_name=$4, center_phone=$5, center_email=$6, data_collection_start_date=$7, contract_send_status=$8, contract_send_comment=$9, contract_agreed=$10, contract_agreement_comment=$11, contract_signed=$12, contract_signed_comment=$13, contract_sign_date=$14 where id=$1', [
        id,
        companyName,
        categoryId,
        contactPerson,
        phone,
        mail,
        infoCollectionDate,
        sendContractStatus,
        sendContractComments,
        contractAgreedStatus,
        contractAgreedComments,
        contractSignedStatus,
        contractSignedComments,
        contractSignedDate,
    ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const updateOperationPersonal2Row = (request, response) => {
    const {
        id,
        companyName,
        categoryId,
        contactPerson,
        phone,
        mail,

        infoCollectionDate,
        expectedResult,
        startRequirements,
        courseDuration,
        courseAges,
        courseType,
        courseFormat,
        courseDesc,
        coursePrice,
        courseSchedule,
        courseTitle,
        centerDesc,
        centerAddress,
        centerInst,
        centerFacebook,
        centerWebsite,
        centerPhone,
        //centerMail,
        centerLogo,
        placementDate
    } = request.body;

    pool.query('update crm set center_name=$2, center_category_id=$3, contact_name=$4, center_phone=$5, center_email=$6, data_collection_date=$7, expected_result=$8, start_requirements=$9, duration=$10, ages=$11, type=$12, format=$13, course_description=$14, price=$15, schedule=$16, title=$17, center_description=$18, address=$19, instagram=$20, facebook=$21, website=$22, phone=$23, img_src=$24, placement_date=$25 where id=$1', [
        id,
        companyName,
        categoryId,
        contactPerson,
        phone,
        mail,
        infoCollectionDate,
        expectedResult,
        startRequirements,
        courseDuration,
        courseAges,
        courseType,
        courseFormat,
        courseDesc,
        coursePrice,
        courseSchedule,
        courseTitle,
        centerDesc,
        centerAddress,
        centerInst,
        centerFacebook,
        centerWebsite,
        centerPhone,
        //centerMail,
        centerLogo,
        placementDate
    ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const updateOperationPersonal3Row = (request, response) => {
    const {
        id,
        companyName,
        categoryId,
        contactPerson,
        phone,
        mail,

        reportSendingDate,
        firstCallComments,
        secondCallComments,
        conclusionPaymentStatus,
        tariffPack,
        sendingInvoiceForPaymentStatus,
        paymentReminderComments,
        receivingPaymentStatus,
        providingAccessLKStatus,
        paymentDate
    } = request.body;

    pool.query('update crm set center_name=$2, center_category_id=$3, contact_name=$4, center_phone=$5, center_email=$6, report_send_date=$7, final_call_comment=$8, repeated_final_call_comment=$9, will_pay=$10, payment_invoice_sent=$12, tariff_id=$11, payment_reminder_comment=$13, payment_received=$14, account_provided=$15, payment_date=$16 where id=$1', [
        id,
        companyName,
        categoryId,
        contactPerson,
        phone,
        mail,

        reportSendingDate,
        firstCallComments,
        secondCallComments,
        conclusionPaymentStatus,
        tariffPack,
        sendingInvoiceForPaymentStatus,
        paymentReminderComments,
        receivingPaymentStatus,
        providingAccessLKStatus,
        paymentDate
    ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const deleteCourseCard = (request, response) => {
    const { courseCardId } = request.body;

    pool.query(`update subcourses set title='test' where id=$1`, [ courseCardId ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const deleteCourseTeacher = (request, response) => {
    const { teacherId } = request.body;

    pool.query(`update teachers set fullname='test' where id=$1`, [ teacherId ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const addCourseCard = (request, response) => {
    const {
        cardTitle,
        cardDescription,
        cardDirectionId,
        cardPrice,
        cardSchedule,
        cardAges,
        cardUnitOfTime,
        cardIsOnline,
        courseId
    } = request.body;

    pool.query(`insert into subcourses(title, description, category_id, price, schedule, ages, unit_of_time, isonline, format, approved, declined, currency, is_archived, course_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
            cardTitle,
            cardDescription,
            cardDirectionId,
            cardPrice,
            cardSchedule,
            cardAges,
            cardUnitOfTime,
            cardIsOnline,
            cardIsOnline === true ? 'Online' : 'Offline',
            true,
            false,
            'KZT',
            false,
            Number(courseId)
        ],
        (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const filterCallCenterRows = (request, response) => {
    let {
        centerTitleSearchText,
        directionId,
        firstCallDate,
        kpSendDate,
        secondCallDate,
        meetingDate,
        kpSend,
        meetingSet
    } = request.body;

    let queryText = "SELECT id, center_category_id, call_center_user_id, center_name, contact_name, center_phone, center_email, to_char( first_call_date , 'YYYY-mm-dd') as \"first_call_date\", first_call_time, first_call_comment, to_char( kp_send_date , \'YYYY-mm-dd\') as \"kp_send_date\", to_char( second_call_date , \'YYYY-mm-dd\') as \"second_call_date\", second_call_time, second_call_comment, to_char( meeting_date , 'YYYY-mm-dd') as \"meeting_date\", meeting_time, saller_user_id, meeting_comitted, meeting_comment, will_conclude_contract, to_char( contract_signing_start_date , \'YYYY-mm-dd\') as \"contract_signing_start_date\", to_char( data_collection_start_date , \'YYYY-mm-dd\') as \"data_collection_start_date\", contract_send_status, contract_send_comment, contract_agreed, contract_agreement_comment, contract_signed, contract_signed_comment, to_char( contract_sign_date , 'YYYY-mm-dd') as \"contract_sign_date\", operation_personal_user_id FROM public.crm";

    let whereAdded = false;

    if(centerTitleSearchText !== ''){
        centerTitleSearchText = centerTitleSearchText.toLowerCase();
        queryText += ` where (lower(center_name) like '${centerTitleSearchText}%' or lower(center_name) like '%${centerTitleSearchText}%' or lower(center_name) like '%${centerTitleSearchText}')`;
        whereAdded = true;
    }

    console.log("kpSend: " + kpSend);
    console.log("ТИП kpSend: " + typeof(kpSend));

    if(directionId !== '0'){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `center_category_id=${directionId}`;
    }

    if(firstCallDate !== null){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `first_call_date='${firstCallDate}'`;
    }

    if(kpSendDate !== null){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `kp_send_date='${kpSendDate}'`;
    }

    if(secondCallDate !== null){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `second_call_date='${secondCallDate}'`;
    }

    if(meetingDate !== null){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `meeting_date='${meetingDate}'`;
    }

    if(kpSend !== false){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `kp_send_date is not null`;
    }

    if(meetingSet !== false){
        if(whereAdded){
            queryText += ` and `;
        }else{
            queryText += ` where `;
        }

        queryText += `meeting_date is not null and meeting_time is not null`;
    }

    console.log("ЗАПРОС ДЛЯ ФИЛЬТРА КОЛЛ_ЦЕНТРА");
    console.log(queryText);

    pool.query(queryText, (error, results) => {
        if (error) {
            throw error
        }
        console.log("Result");
        console.log(results.rows);
        response.status(200).json({rows: results.rows, length: results.rows.length});
    })
}

const createCourseNotification = (request, response) => {
    const {
        center_id,
        message
    } = request.body

    pool.query('INSERT INTO center_account_notifications (center_id, message, checked, datetime) VALUES ($1, $2, $3, current_timestamp)', [center_id, message, false], (error, result) => {
        if (error) {
            throw error
        }
        response.status(201).send(`center_account_notifications added with ID: ${result.id}`)
    })
}

const getCourseNotification = (request, response) => {
    const {
        center_id
    } = request.body

    pool.query('SELECT id, center_id, message, checked, datetime, (select count(id) from center_Account_notifications where checked=false and center_id=$1) as "new_notifications_count" from center_account_notifications where center_id=$1 order by checked asc', [center_id], (error, result) => {
        if (error) {
            throw error
        }

        let new_notifications_count = 0;

        if(result.rows.length > 0) {
            new_notifications_count = result.rows[0].new_notifications_count;
        }

        response.status(200).json({data: result.rows, new_notifications_count: new_notifications_count});
    })
}

const checkCourseNotification = (request, response) => {
    const { notification_id } = request.body;

    pool.query(`update center_account_notifications set checked=true where id=$1`, [ notification_id ], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(true)
    })
}

const createTechSupportTicket = async (request, response) => {
    const {
        center_id,
        message,
        studentAccount,
        phone
    } = request.body;

    let nameForMindsales = `Обращение в тех. поддержку`;
    let phoneForMindsales = phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '');

    if(studentAccount){
        let mailMessage = `Студент с номером: ${phone}\nСообщение отправителя: ${message}`;
        await sendEmail(stuffEmails, 'Oilan. Обращение в тех. поддержку', mailMessage);
        nameForMindsales += ' от студента. Сообщение: ' + message;
        createDealInMindsales(nameForMindsales, phoneForMindsales);
    }else{
        pool.query(`INSERT INTO public.tech_support_tickets(center_id, message, datetime) VALUES ($1, $2, current_timestamp)`, [ center_id, message ], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(true)
        })

        await pool.query(`select * from courses where id=${center_id}`, async (error, results) => {
            if (error) {
                throw error
            }
            let centerTitle = results.rows[0].title;
            let mailMessage = `Центр: ${centerTitle}\nСообщение отправителя: ${message}`;
            await sendEmail(stuffEmails, 'Oilan. Обращение в тех. поддержку', mailMessage);

            nameForMindsales += ` от центра ${centerTitle}. Сообщение: ` + message;
            createDealInMindsales(nameForMindsales, phoneForMindsales);
        })
    }
}

const sendEmail = async (emailsTo, title, message) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // can try 25 for better performance
        secure: true,
        pool: true,
        auth: {
            user: 'oilanedu@gmail.com',
            pass: 'dyvldkxooosevhon'
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
}

async function getCenterSubscriptionInfo(center_id){
    await pool.query(`select last_payment_date, next_payment_date from courses where id=$1`, [center_id], (error, result) => {
        let lastPaymentDate = new Date(result.rows[0].last_payment_date);
        let nextPaymentDate = new Date(result.rows[0].next_payment_date);
        let currentDate = new Date(Date.now());

        if(currentDate > lastPaymentDate && currentDate < nextPaymentDate){
            return {permitted: true};
        }else{
            return {permitted: false, nextPaymentDate: nextPaymentDate};
        }
    })
}

const createCourseSearchTicket = async (request, response) => {
    const {
        city_id,
        direction_id,
        isOnline,
        name,
        age,
        phone,
        email,
        message,
        role_id,
        course_id,
        promocode,
        price
    } = request.body;

    console.log(request.body);

    let uuidString = uuidv4();

    if(course_id == 0){
        await pool.query(role_id == 4 ? 'select course_id from subcourses where category_id=$1 group by course_id order by course_id' : 'select tutor_id as "course_id" from tutor_coursecards where category_id=$1 group by tutor_id order by tutor_id', [direction_id], async (error, result) => {
            if(error){
                throw error;
            }else{
                for(let i = 0; i < result.rows.length; i++){
                    await pool.query(`INSERT INTO public.course_search_tickets(city_id, direction_id, is_online, name, age, phone, email, message, datetime, is_active, uuid_string, course_id, role_id, promocode, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, true, $9, $10, $11, $12, $13)`,
                        [
                            city_id,
                            direction_id,
                            isOnline,
                            name,
                            age,
                            phone,
                            email,
                            message,
                            uuidString,
                            result.rows[i].course_id,
                            role_id,
                            promocode,
                            price
                        ],
                        async (insertError, results) => {
                            if (insertError) {
                                throw insertError
                            }

                            await pool.query('SELECT id FROM public.course_search_tickets order by id desc limit 1', (error, idRes)=>{
                                axios.get(`https://${TELEGRAM_NGROK_HOST}/sendTickets?ticket_id=${idRes.rows[0].id}`)
                                    .then(function (response) {
                                        console.log(`${idRes.rows[0].id} course search ticket sent to telegram`);
                                    })
                                    .catch(function (error) {
                                        console.log(`${idRes.rows[0].id} course search ticket sending to telegram error`);
                                        console.log(error);
                                    });
                            });
                        });
                }
            }
        });
    }else{
        await pool.query(`INSERT INTO public.course_search_tickets(city_id, direction_id, is_online, name, age, phone, email, message, datetime, is_active, uuid_string, course_id, role_id, promocode, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, true, $9, $10, $11, $12, $13)`,
            [
                city_id,
                direction_id,
                isOnline,
                name,
                age,
                phone,
                email,
                message,
                uuidString,
                course_id,
                role_id,
                promocode, 
                price
            ],
            async (insertError, results) => {
                if (insertError) {
                    throw insertError
                }

                await pool.query('SELECT id FROM public.course_search_tickets order by id desc limit 1', (error, idRes)=>{
                    axios.get(`https://${TELEGRAM_NGROK_HOST}/sendTickets?ticket_id=${idRes.rows[0].id}`)
                        .then(function (response) {
                            console.log(`${idRes.rows[0].id} course search ticket sent to telegram`);
                        })
                        .catch(function (error) {
                            console.log(`${idRes.rows[0].id} course search ticket sending to telegram error`);
                            console.log(error);
                        });
                });
            });
    }

    let directionName = "";

    await pool.query(`select name from course_categories where id=${direction_id}`,
        async (error, categoriesResult) => {
            if (error) {
                throw error
            }
            directionName = categoriesResult.rows[0].name;
            let courseTitleQuery = role_id === 4 ? (`select title from courses where id=${course_id}`) : (`select fullname from tutors where id=${course_id}`);

            console.debug('COURSE TITLE QUERY');
            console.debug(courseTitleQuery);

            await pool.query(courseTitleQuery,
                async (error, courseTitleResult) => {
                    if (error) {

                        throw error
                    }else{
                        let studentEmailMessage = `${name}, вы оставили заявку на поиск курса на платформе Oilan!
    Ваша заявка отправлена ${(course_id == 0 && role_id == 4) ? 'всем центрам': ''} ${(course_id != 0 && role_id == 4) ? `центру ${courseTitleResult.rows[0].title}`: ''} ${(course_id != 0 && role_id == 6) ?`репетитору ${courseTitleResult.rows[0].fullname}` : ''} ${(course_id == 0 && role_id == 6) ?`всем репетиторам` : ''}!
    Вы можете зайти в свой личный кабинет, и посмотреть статус ваших заявок. Для этого на сайте oilan.io нажмите Войти -> Я студент -> Введите Ваш номер, который Вы указывали при отправке заявки!
    С уважением, команда Oilan!
`
                        sendEmail([email], `Oilan. Ваша заявка на поиск курса!`, studentEmailMessage);

                        let mailMessageForSubscribed = `Имя пользователя: ${name}.\nТелефон: ${phone}.\nВыбранное направление: ${directionName}\nПромокод:${promocode === undefined ? 'нет промокода' : promocode}\n${(role_id == 4 && course_id != 0) ? `Центр: ${courseTitleResult.rows[0].title}` : ''} ${(role_id == 6 && course_id != 0) ?`Репетитор: ${courseTitleResult.rows[0].fullname}` : ''} ${(course_id == 0 && role_id == 4) ? 'Все центры' : ''} ${(course_id == 0 && role_id == 6) ? 'Все репетиторы' : ''}\nСообщение: ${message}`;
                        let mailMessageForNotSubscribed = `Имя пользователя: ${name}.\nСообщение: ${message}`;
                        sendEmail(stuffEmails, `Oilan. Новая заявка на поиск ${role_id === 4 ? 'курса' : 'репетитора'}!`, mailMessageForSubscribed);
                    }
                }
            )
        }
    )

    let nameForMindsales = `Заявка на поиск курса. ${name}`;
    let phoneForMindsales = phone.replace(/[(]/, '').replace(/[)]/, '').replace(/-/g, '');

    createDealInMindsales(nameForMindsales, phoneForMindsales);

    response.status(200).json({uuid: uuidString});
}

const courseCardsWithPagination = async (request, response) => {
    const {
        currentPage,
        cardsNum
    } = request.body;

    pool.query(`SELECT subcourses.id, subcourses.isonline, subcourses.title, courses.website_url, subcourses.currency, subcourses.unit_of_time, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, courses.id as "course_id", courses.title as "course_title", courses.phones, courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id where subcourses.approved=true order by order_coefficient desc limit ${Number(cardsNum)} offset ${Number(currentPage * cardsNum)}`, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const archiveCard = (request, response) => {
    const {
        card_id
    } = request.body;

    pool.query(`update subcourses set is_archived=true where id=${card_id}`, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(`card id ${card_id} archived!`);
    })
}

const unarchiveCard = (request, response) => {
    const {
        card_id
    } = request.body;

    pool.query(`update subcourses set is_archived=false where id=${card_id}`, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(`card id ${card_id} unarchived!`);
    })
}

// const createAccountForAllCenters = () => {
//     pool.query(`select id, url from courses`, (error, results) => {
//         if (error) {
//             throw error
//         }
//         let courses = results.rows;
//
//         for(let i = 0; i < courses.length; i++){
//             let newLoginPassword = courses[i].url + "123";
//             let centerId = Number(courses[i].id);
//
//             if(centerId !== 26 && centerId !== 10 && centerId !== 2 && centerId !== 19 && centerId !== 38 && centerId !== 46 && centerId !== 44 && centerId !== 39){
//                 pool.query(`insert into users(login, password, role_id, center_id) values($1, $2, $3, $4)`, [newLoginPassword, newLoginPassword, 4, centerId], (error, results) => {
//                     if (error) {
//                         throw error
//                     }
//                     console.log("account created " + newLoginPassword)
//                 })
//             }
//         }
//     })
// }

const getCourseSearchApplications = (request, response) => {
    const {
        course_id,
        role_id
    } = request.body;

    let query = `select * from course_search_tickets where course_id in (0, ${course_id}) and role_id=${role_id} order by datetime desc`;
    console.log("loading applications: ");
    console.log(query);
    pool.query(query, [], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows);
    })
}

const getCourseSearchApplication = (request, response) => {
    const {
        uuid_string
    } = request.body;

    console.log("uuid:" + uuid_string)

    pool.query(`select * from course_search_tickets where uuid_string=$1`, [uuid_string.toString()], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows[0]);
    })
}

const responseToSearchApplication = async (request, response) => {
    const {
        application_id,
        subcourse_id,
        center_name,
        center_id
    } = request.body;

    await pool.query(`insert into application_responses(application_id, subcourse_id, center_name, accepted, center_id) values($1, $2, $3, $4, $5)`,
        [
            application_id,
            subcourse_id,
            center_name,
            false,
            center_id
        ],
        async (error, results) => {
        if (error) {
            throw error
        }
        console.log(`application response created by center ${center_name} to application id: ${application_id}`);

        await pool.query(`select * from course_search_tickets where id=${application_id}`,
            async (error, results) => {
                if (error) {
                    throw error
                }
                let studentEmail = results.rows[0].email;
                let studentName = results.rows[0].name;
                let applicationUuid = results.rows[0].uuid_string;
                let applicationLink = `https://oilan.io/application/${applicationUuid}`;

                let message = `${studentName}, на вашу заявку только что откликнулся образовательный центр!
Перейдите по ссылке ниже, чтобы ознакомитсья с предложением:
${applicationLink}

С уважением, команда Oilan!`;

                await sendEmail([studentEmail], 'Центр отликнулся на вашу заявку!', message)
                response.status(201).json(true);
            })
    })
}

const getApplicationResponses = (request, response) => {
    const {
        application_id
    } = request.body;

    console.log("application id: " + application_id);

    let query = `select * from application_responses where application_id=${application_id}`
    console.log(query);

    pool.query(query, (error, results) => {
        if (error) {
            throw error
        }
        let applicationResponses = results.rows;
        let cardsIds = [];

        applicationResponses.map(item => {
            cardsIds.push(item.subcourse_id);
        })

        let cardsFetchQuery = '';

        if(cardsIds.length > 0){
            let cardsIdsString = cardsIds.join(',');
            cardsFetchQuery = `SELECT subcourses.id, subcourses.isonline, subcourses.title, courses.website_url, subcourses.currency, subcourses.unit_of_time, subcourses.description, subcourses.ages, subcourses.type, subcourses.format, subcourses.price, subcourses.schedule, subcourses.expected_result, subcourses.start_requirements, subcourses.duration, subcourses.rating, courses.id as "course_id", courses.title as "course_title", courses.phones, courses.instagram, courses.latitude, courses.longitude, courses.url, courses.img_src, courses.background_image_url from subcourses inner join courses on subcourses.course_id = courses.id where subcourses.id in (${cardsIdsString}) and subcourses.approved=true and subcourses.is_archived=false order by order_coefficient asc`;
            console.log('cards fetching:\n' + cardsFetchQuery);
            pool.query(cardsFetchQuery, (error, cardsResults) => {
                if (error) {
                    throw error
                }
                console.log(cardsResults.rows)
                response.status(200).json(cardsResults.rows);
            })
        }else{
            response.status(200).json([]);
        }


    })
}

const deactivateSearchApplication = (request, response) => {
    const {
        application_id
    } = request.body;

    pool.query(`update course_search_tickets set is_active=false, deactivated_date=current_timestamp where id=${application_id}`, (error, cardsResults) => {
        if (error) {
            throw error
        }
        console.log(`search application ${application_id} deactivated`);
        response.status(200).json(true);
    })
}

const saveCenterInfoChanges = (request, response) => {
    const {
        center_title,
        description,
        city,
        address,
        instagram,
        center_id
    } = request.body;

    pool.query(`update courses set title=$1, description=$2, city_id=$3, addresses=$4, instagram=$5 where id=$6`,
        [
            center_title,
            description,
            city,
            address,
            instagram,
            center_id
        ],
        (error, cardsResults) => {
        if (error) {
            throw error
        }
        console.log(`center (id ${center_id}) changed info`);
        response.status(200).json(true);
    })
}

const createCabinet = (request, response) => {
    const {
        title,
        img_src,
        rating,
        subtitle,
        website_url,
        addresses,
        phones,
        description,
        course_category_id,
        city_id,
        url,
        background_image_url,
        hasTeachersInfo,
        latitude,
        longitude,
        instagram,
        email,
        is_personal_bank_account,
    } = request.body;


}

const getCourseSearchApplicationStatistics = (request, response) => {
    pool.query(`
            SELECT (select count(distinct application_responses.subcourse_id) 
        \t\tfrom application_responses 
        \t\twhere application_responses.application_id=course_search_tickets.id)
        \t\tas "responses_count",
        (select count(distinct courses.id) from subcourses join courses on courses.id = subcourses.course_id where category_id=course_search_tickets.direction_id and subcourses.title!='test' and courses.title!='test') as "centers_count",
        (select count(distinct telegram_bot_users.course_id) from subcourses join telegram_bot_users on telegram_bot_users.course_id = subcourses.course_id where subcourses.category_id=course_search_tickets.direction_id and subcourses.title!='test') as "telegram_count",
        course_search_tickets.id, deactivated_date, city_id, 
        direction_id, course_search_tickets.name, phone, message, 
        datetime, is_active, is_online, age, email, uuid_string, course_id, role_id, 
        course_categories.name as "direction_name" 
        FROM public.course_search_tickets 
        join course_categories on course_categories.id = course_search_tickets.direction_id 
        order by course_search_tickets.id
    `, (error, courseSearchTicketsResult) => {
        if (error) {
            throw error
        }

        pool.query(`select * from application_responses`, (error, applicationResponsesResult) => {
            if (error) {
                throw error
            }
            response.status(200).json({applications: courseSearchTicketsResult.rows, responses: applicationResponsesResult.rows});
        })
    })
}

const getTelegramUsersCenters = (request, response) => {
    pool.query(`SELECT chat_id, first_name, telegram_bot_users.role_id, username, course_id, courses.title, courses.last_login_datetime, users.login, users.password FROM public.telegram_bot_users  join courses on telegram_bot_users.course_id = courses.id join users on courses.id = users.center_id where telegram_bot_users.role_id = 4 and users.role_id = 4`, (error, telegramUsersResult) => {
        if (error) {
            throw error
        }
        response.status(200).json(telegramUsersResult.rows);
    })
}

const getTelegramUsersTutors = (request, response) => {
    pool.query(`SELECT chat_id, first_name, username, course_id, tutors.fullname, users.login, users.password FROM public.telegram_bot_users join tutors on telegram_bot_users.course_id = tutors.id join users on tutors.id = users.center_id where telegram_bot_users.role_id = 6 and users.role_id = 6`, (error, telegramUsersResult) => {
        if (error) {
            throw error
        }
        response.status(200).json(telegramUsersResult.rows);
    })
}

const loadDirectionPromotions = (request, response) => {
    const {
        direction_id
    } = request.body;
    pool.query(`select text, center_id, courses.title, courses.promocode, courses.url, subcourses.id as "subcourse_id" from promotions join subcourses on subcourses.id = promotions.subcourse_id join courses on courses.id=subcourses.course_id where promotions.category_id=$1`, [direction_id], (error, result) => {
        if (error) {
            response.status(500).json('error');
        }else{
            response.status(200).json(result.rows);
        }
    })
}

const loadCenterPromotions = (request, response) => {
    const {
        center_id
    } = request.body;
    pool.query(`select text, courses.title, courses.url, subcourses.id as "subcourse_id" from promotions join subcourses on subcourses.id = promotions.subcourse_id join courses on courses.id=subcourses.course_id where promotions.center_id=$1`, [direction_id], (error, result) => {
        if (error) {
            response.status(500).json('error');
        }else{
            response.status(200).json(result.rows);
        }
    })
}

const createAccountTest = (request, response) => {
    const {
        email,
        password,
        fullName
    } = request.body;
    pool.query(`insert into test_accounts(email, password, full_name) values($1, $2, $3)`, [email, password, fullName], (error, result) => {
        if (error) {
            response.status(500).json('error');
        }else{
            response.status(200).json('Пользователь успешно создан!');
        }
    })
}

const getAccountsTest = (request, response) => {
    pool.query(`select * from test_accounts`, (error, result) => {
        response.status(200).json(result.rows);
    })
}

const createCenter = (request, response) => {
    const {
        title,
        img_src,
        subtitle,
        website_url,
        addresses,
        phones,
        description,
        city_id,
        url,
        background_image_url,
        hasTeachersInfo,
        latitude,
        longitude,
        instagram,
        email,
        is_personal_bank_account,
        twogis_link
    } = request.body;

    pool.query(`insert into courses(
        title,
        img_src,
        subtitle,
        website_url,
        addresses,
        phones,
        description,
        city_id,
        url,
        background_image_url,
        has_teachers_info,
        latitude,
        longitude,
        instagram,
        email,
        is_personal_bank_account,
        last_payment_date,
        next_payment_date,
        twogis_link
        ) values(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, current_date, current_date + interval '30 days', $17)`,
        [
            title,
            img_src,
            subtitle,
            website_url,
            addresses,
            phones,
            description,
            city_id,
            url,
            background_image_url,
            hasTeachersInfo,
            latitude,
            longitude,
            instagram,
            email,
            is_personal_bank_account,
            twogis_link
        ], (error, result) => {
            if (error) {
                throw error
            }
            console.log(result);
            response.status(200).json('Центр успешно создан!');
    })
}

const createCenterAccount = (request, response) => {
    const {
        login,
        password,
        role_id,
        center_id
    } = request.body;
    pool.query(`insert into users(login, password, role_id, center_id) values($1, $2, $3, $4)`, [login, password, role_id, center_id], (error, result) => {
        if (error) {
            response.status(500).json('error');
        }else{
            response.status(200).json('Пользователь успешно создан!');
        }
    })
}

const approveEditCard = (request, response) => {
    const {
        cardId
    } = request.body;

    console.log('approved edit card with id: ' + cardId);

    pool.query(`select * from editing_coursecards where subcourse_id=$1 order by id asc`, [cardId], (error, result) => {
        if (error) {
            console.log(error)
            response.status(500).json('error');
        }else{
            let editingCard = result.rows[0];

            console.log('editing card:');
            console.log(editingCard)

            pool.query(`update subcourses set title=$1, description=$2, price=$3, schedule=$4, duration=$5, category_id=$6, ages=$7, format=$8, expected_result=$9, start_requirements=$10, type=$11, isonline=$12, approved=$13, declined=$14, currency=$15, unit_of_time=$16, course_id=$17 where id=$18`, [
                editingCard.title,
                editingCard.description,
                editingCard.price,
                editingCard.schedule,
                editingCard.duration,
                editingCard.category_id,
                editingCard.ages,
                editingCard.format,
                editingCard.expected_result,
                editingCard.start_requirements,
                editingCard.type,
                editingCard.isonline,
                true,
                false,
                editingCard.currency,
                editingCard.unit_of_time,
                editingCard.course_id,
                cardId
            ], (error, result) => {
                if (error) {
                    console.log(error)
                    response.status(500).json('error');
                }else{
                    pool.query(`delete from editing_coursecards where subcourse_id=$1`, [cardId], (error, result) => {
                        if (error) {
                            console.log(error)
                            response.status(500).json('error');
                        }else{
                            response.status(200).json('ok');
                        }
                    })
                }
            });


        }
    })
}

const getApplicationResponsePermission = (request, response) => {
    const {
        center_id
    } = request.body;

    pool.query(`select last_payment_date, next_payment_date from courses where id=$1`, [center_id], (error, result) => {
        if(error){
            response.status(500).json('Что-то пошло нетак!')
        }

        if(result.rows.length <= 0){
            response.status(500).json('Что-то пошло нетак!')
        }else{
            let lastPaymentDate = new Date(result.rows[0].last_payment_date);
            let nextPaymentDate = new Date(result.rows[0].next_payment_date);
            let currentDate = new Date(Date.now());

            if(currentDate > lastPaymentDate && currentDate < nextPaymentDate){
                response.status(200).json({permitted: true});
            }else{
                response.status(200).json({permitted: false, nextPaymentDate: nextPaymentDate});
            }
        }
    })
}

const subcoursesByCategory = (request, response) => {
    const {
        categoryId
    } = request.body;

    pool.query(`select subcourses.id, subcourses.title as "subcourse_title", courses.title as "center_title" from subcourses join courses on courses.id = subcourses.course_id where category_id=$1`, [categoryId], (error, result) => {
        response.status(200).json(result.rows)
    })
}

const createPromotion = (request, response) => {
    const {
        selectedSubcourseId,
        selectedCategoryId,
        promotionText,
        promotionDateTill
    } = request.body;
    pool.query(`insert into promotions(category_id, text, img_src, subcourse_id, date_till) values ($1, $2, $3, $4, $5)`,
        [
            selectedCategoryId,
            promotionText,
            '',
            selectedSubcourseId,
            promotionDateTill
        ],
        (error, result) => {
            if(error){
                console.log(error);
                response.status(500).json('error');
            }else{
                response.status(201).json('ok')
            }
        }
    )
}

const getDirectionActiveCards = (request, response) => {
    pool.query(`select name, (select count(id) 
from subcourses 
where category_id = course_categories.id 
\tand approved=true 
\tand declined=false 
\tand is_archived=false 
\tand title!='test')
from course_categories where name != 'test'`,
        (error, result) => {
            if(error){
                console.log(error);
                response.status(500).json('error');
            }else{
                response.status(201).json(result.rows)
            }
        }
    )
}

const getTutorsActiveCards = (request, response) => {
    pool.query(`select name, (select count(id) 
from tutor_coursecards 
where category_id = course_categories.id 
\tand title!='test')
from course_categories where name != 'test'`,
        (error, result) => {
            if(error){
                console.log(error);
                response.status(500).json('error');
            }else{
                response.status(201).json(result.rows)
            }
        }
    )
}

const getTutorInfo = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM tutors WHERE id = $1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error')
        }else {
            response.status(200).json(results.rows[0])
        }
    })
}

const getTutorCourse = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM tutor_coursecards WHERE id = $1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error')
        }else {
            response.status(200).json(results.rows[0])
        }
    })
}

const getTutorSertificate = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM tutor_sertificates WHERE tutor_id = $1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error')
        }else {
            response.status(200).json(results.rows[0])
        }
    })
}

const updateTutorInfo = (request, response) => {
    const {
        fullname,
        imgSrc,
        description,
        canWorkOffline,
        canWorkOnline,
        canWorkOnDeparture,
        phoneNumber,
        address,
        cityId,
        teachingLanguage,
        id
    } = request.body;

    pool.query('UPDATE public.tutors SET fullname=$1, img_src=$2, description=$3, can_work_online=$4, can_work_offline=$5, phone_number=$6, can_work_on_departure=$7, address=$8, city_id=$9, teaching_language=$10 WHERE id=$11',
        [
            fullname,
            imgSrc,
            description,
            canWorkOnline,
            canWorkOffline,
            phoneNumber,
            canWorkOnDeparture,
            address,
            cityId,
            teachingLanguage,
            id
        ],
        (error, results) => {
        if (error) {
            response.status(500).json('error');
           console.log("Error", error);
        }else {
            response.status(200).json(results.rows[0])
        }
    })
}

const createTutorCourseCard = (request, response) => {
    const {
        title,
        categoryId,
        minAge,
        maxAge,
        startRequirements,
        expectingResults,
        durationValue,
        price,
        unitOfTime,
        schedule,
        durationWord,
        tutorId,
        currency
    } = request.body;

    pool.query('INSERT INTO public.tutor_coursecards(\n' +
        '\ttitle, category_id, min_age, max_age, start_requirements, expecting_results, \n' +
        '\tduration_value, price, unit_of_time, schedule, duration_word, tutor_id, currency)\n' +
        '\tVALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [
            title,
            categoryId,
            minAge,
            maxAge,
            startRequirements,
            expectingResults,
            durationValue,
            price,
            unitOfTime,
            schedule,
            durationWord,
            tutorId,
            currency
        ],
        (error, results) => {
            if (error) {
                response.status(500).json('error');
                console.error(error);
            }else {
                response.status(201).json('ok');
            }
        })
}

const createTutorSertificate = (request, response) => {
    const {
        id, title, tutor_id, img_src
    } = request.body;

    pool.query('INSERT INTO public.tutor_sertificates (id, title, tutor_id, img_src) VALUES ($1, $2, $3, $4)', [id, title, tutor_id, img_src], (error, result) => {
        if (error) {
            response.status(500).send("error");
        }else{
            response.status(200).send(`Sertificate added`)
        }
    })
}

const createTutor = (request, response) => {
    const {
        fullname,
        img_src,
        description,
        canWorkOnline,
        canWorkOffline,
        phone,
        cityId,
        canWorkOnDeparture,
        teachingLanguage,
        workingAddress
    } = request.body;

    pool.query('INSERT INTO public.tutors(\n' +
        '\tfullname, img_src, description, can_work_online, can_work_offline, phone_number, city_id, can_work_on_departure, teaching_language, address, last_payment_date, next_payment_date)\n' +
        '\tVALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, current_date, \'2021-12-31\')',
        [
            fullname,
            img_src,
            description,
            canWorkOnline,
            canWorkOffline,
            phone,
            cityId,
            canWorkOnDeparture,
            teachingLanguage,
            workingAddress
        ], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
        }else {
            response.status(201).json('ok')
        }
    })
}

const getTutors = (request, response) => {
    pool.query('SELECT * FROM tutors order by id desc', (error, results) => {
        if (error) {
            response.status(500).json('error')
        }else {
            response.status(200).json(results.rows)
        }
    })
}

const getTutorsWithPhoto = (request, response) => {
    const str = 'realibi'
    pool.query('SELECT tutors.id, tutors.fullname, tutors.img_src, tutors.city_id, cities.name as "city_name" FROM tutors join cities on tutors.city_id = cities.id order by img_src asc', (error, results) => {
        if (error) {
            response.status(500).json('error')
        }else {
            response.status(200).json(results.rows)
        }
    })
}

const createTutorAccount = (request, response) => {
    const {
        login,
        password,
        selectedTutorId
    } = request.body;

    pool.query('INSERT INTO public.users(\n' +
        '\tlogin, password, role_id, center_id)\n' +
        '\tVALUES ($1, $2, $3, $4);',
        [
            login,
            password,
            6,
            selectedTutorId
        ],
        (error, results) => {
        if (error) {
            response.status(500).json('error')
            console.error(error)
        }else {
            response.status(201).json('ok')
        }
    })
}

const getTutorsCourseCardsById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('select * from tutor_coursecards where tutor_id=$1', [id], (error, results) => {
        if (error) {
            response.status(500).json('error')
            console.error(error)
        }else {
            response.status(200).json(results.rows)
        }
    })
}

const getTutorApplications = (request, response) => {
    const tutorId = parseInt(request.params.tutorId)

    pool.query('SELECT course_search_tickets.id, course_search_tickets.name, course_search_tickets.message, phone, \n' +
        'direction_id, course_categories.name as "direction_name",\n' +
        'course_search_tickets.deactivated_date, course_search_tickets.datetime,\n' +
        'course_search_tickets.is_online \n' +
        'FROM public.course_search_tickets \n' +
        'join course_categories on course_categories.id = course_search_tickets.direction_id\n' +
        'where course_id=$1 and role_id=6' +
        'order by course_search_tickets.is_active desc', [tutorId], (error, results) => {
        if (error) {
            response.status(500).json('error');
            console.error(error);
        }else {
            response.status(200).json(results.rows);
        }
    })
}

const updateTutorCourseCard = (request, response) => {
    const {
        title,
        categoryId,
        minAge,
        maxAge,
        startRequirements,
        expectingResults,
        durationWord,
        durationValue,
        schedule,
        price,
        currency,
        unitOfTime,
        tutorId,
        cardId
    } = request.body;

    pool.query('UPDATE public.tutor_coursecards\n' +
        '\tSET title=$1, category_id=$2, min_age=$3, max_age=$4, start_requirements=$5, ' +
        'expecting_results=$6, duration_word=$7, duration_value=$8, schedule=$9, price=$10, ' +
        'currency=$11, unit_of_time=$12, tutor_id=$13\n' +
        '\tWHERE id=$14',
        [
            title,
            categoryId,
            minAge,
            maxAge,
            startRequirements,
            expectingResults,
            durationWord,
            durationValue,
            schedule,
            price,
            currency,
            unitOfTime,
            tutorId,
            cardId
        ],
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json('ok')
            }
        })
}

const deleteTutorCourseCard = (request, response) => {
    const {
        id
    } = request.body;

    pool.query('delete from tutor_coursecards where id=$1', [id],
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json('ok')
            }
        })
}

const getTelegramFeedbacksCenters = (request, response) => {
    pool.query('SELECT ticket_id, course_id, answer, ' +
        'trial_lesson_date, count_reminders, role_id, ' +
        'courses.title FROM public.course_search_application_feedbacks ' +
        'join courses on courses.id = course_id where role_id = 4',
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json(results.rows)
            }
        }
    )
}

const getTelegramFeedbacksTutors = (request, response) => {
    pool.query('SELECT ticket_id, course_id, answer, trial_lesson_date, count_reminders, role_id, tutors.fullname \n' +
        'FROM public.course_search_application_feedbacks \n' +
        'join tutors on tutors.id = course_id \n' +
        'where role_id = 6',
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json(results.rows)
            }
        }
    )
}

const getRegions = (request, response) => {
    pool.query('select * from regions',
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json(results.rows)
            }
        }
    )
}

const getStudentApplications = (request, response) => {
    const {
        phone
    } = request.body;

    pool.query("SELECT course_search_tickets.id, course_search_tickets.city_id,\n" +
        "        direction_id, course_search_tickets.name as \"student_name\", phone,\n" +
        "        message, datetime, is_active, is_online, age,\n" +
        "        course_search_tickets.email as \"student_email\", uuid_string, deactivated_date,\n" +
        "        course_id, role_id, courses.title as \"center_title\", tutors.fullname as \"tutor_fullname\", courses.url as \"url\", course_categories.name as \"category_name\"\n" +
        "        FROM public.course_search_tickets\n" +
        "        left join courses on courses.id = course_search_tickets.course_id\n" +
        "        join course_categories on course_categories.id = course_search_tickets.direction_id\n" +
        "        left join tutors on tutors.id = course_search_tickets.course_id\n" +
        "        where course_search_tickets.phone = $1 order by id desc", [phone],
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json(results.rows)
            }
        }
    )
}

const getImagesBase = (request, response) => {
    pool.query('select * from images_base',
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                response.status(200).json(results.rows)
            }
        }
    )
}

const studentLogin = (request, response) => {
    const {
        phone
    } = request.body;

    pool.query('SELECT id, name, phone, email\n' +
        '\tFROM public.course_search_tickets where phone=$1\n' +
        '\torder by id desc limit 1', [phone],
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            }else {
                console.log(results.rows);
                if(results.rows.length > 0){
                    response.status(200).json(results.rows[0]);
                }else{
                    response.status(403).json(false);
                }
            }
        }
    )
}

const getPartners = (request, response) => {
    pool.query('SELECT partners_block.id, partners_block.square_form, center_id, subcourse_id, courses.img_src as "logo", courses.url\n' +
        '\tFROM partners_block\n' +
        '\tjoin courses on courses.id = partners_block.center_id', (error, result) => {
        if(error){
            response.status(500).send('error');
        }else{
            response.status(200).json(result.rows);
        }
    });
}

const deleteTutorSertificate = (request, response) => {
    const {
        id
    } = request.body;

    pool.query('delete from tutor_sertificates where id=$1', [id],
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            } else {
                response.status(200).json('ok')
            }
        }
    );
};

const editTutorSertificateTitle = (request, response) => {
    const {
        id, 
        title
    } = request.body;

    pool.query('UPDATE public.tutor_sertificates SET title=$2 WHERE id=$1', 
        [
            id,
            title
        ],
        (error, results) => {
            if (error) {
                response.status(500).json('error')
                console.error(error)
            } else {
                response.status(200).json('ok')
            }
        }
    );
};


export default {
    getPartners,
    getFilteredCategories,
    studentLogin,
    getImagesBase,
    getStudentApplications,
    getRegions,
    getTelegramFeedbacksTutors,
    getTelegramFeedbacksCenters,
    deleteTutorCourseCard,
    updateTutorCourseCard,
    getTutorApplications,
    getTutorsCourseCardsById,
    createTutorAccount,
    getTutors,
    createTutor,
    createTutorCourseCard,
    updateTutorInfo,
    getTutorCourse,
    getTutorInfo,
    getDirectionActiveCards,
    createPromotion,
    subcoursesByCategory,
    getApplicationResponsePermission,
    approveEditCard,
    createCenterAccount,
    createCenter,
    getAccountsTest,
    createAccountTest,
    loadDirectionPromotions,
    loadCenterPromotions,
    getTelegramUsersCenters,
    getTelegramUsersTutors,
    getCourseSearchApplicationStatistics,
    createCabinet,
    newSession,
    saveCenterInfoChanges,
    deactivateSearchApplication,
    getTutorCourseCardsFilter,
    getTutorSertificate,
    getApplicationResponses,
    responseToSearchApplication,
    getCourseSearchApplication,
    getCourseSearchApplications,
    unarchiveCard,
    archiveCard,
    courseCardsWithPagination,
    createCourseSearchTicket,
    createTechSupportTicket,
    checkCourseNotification,
    getCourseNotification,
    createCourseNotification,
    createTutorSertificate,
    filterCallCenterRows,
    deleteCourseTeacher,
    deleteCourseCard,
    addCourseCard,
    updateOperationPersonal1Row,
    updateOperationPersonal2Row,
    updateOperationPersonal3Row,
    callCenterAddCenter,
    updateCallCenterRow,
    updateSellerRow,
    loadSallerInfo,
    loadOperationPersonal1Info,
    loadOperationPersonal2Info,
    loadOperationPersonal3Info,
    loadCallCenterInfo,
    cardCreationPermission,
    getClickStatistics,
    getTutorsActiveCards,
    getTutorsWithPhoto,
    getTutorCoursecards,
    getEditCards,
    sendEditCard,
    getCourseCategories,
    getCourseCategory,
    getCrmCourseCategories,
    registerTelegramUser,
    getFilters,
    createCourseTeacher,
    getCabinetCourseTeachers,
    createCourseCard,
    getCabinetCourseCards,
    approveTeacher,
    declineTeacher,
    approveCard,
    declineCard,
    getAdminCards,
    setVerificated,
    updateSubcourseTitle,
    updateSubcourseLogo,
    updateCourseAddresses,
    updateSubcourseSchedule,
    updateSubcoursePrice,
    updateSubcourseCategory,
    getSertificates,
    updateSubcourseFormat,
    updateSubcourseAges,
    updateSubcourseType,
    updateSubcourseDescription,
    updateCourseDescription,
    getAdminTeachers,
    getCabinetInfo,
    login,
    handleNewStudent,
    logUserClick,
    courseCardsFilter,
    tutorCourseCardsFilter,
    createCallRequest,
    createHelpRequest,
    getCourseCards,
    getVerificatedCourseCards,
    getNotVerificatedCourseCards,
    getCourseCardsByCenterId,
    getCourseCardById,
    getCourseCardsByCategoryId,
    getFeedbacks,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getCourses,
    getCourseById,
    getCoursesByCategory,
    createCourse,
    updateCourse,
    deleteCourse,
    getSubcourses,
    getSubcourseById,
    getCourseSubcourses,
    createSubcourse,
    updateSubcourse,
    deleteSubcourse,
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    getPartnershipRequests,
    getPartnershipRequestById,
    createPartnershipRequest,
    updatePartnershipRequest,
    deletePartnershipRequest,
    getTeachers,
    getCourseTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    handlePayment,
    handlePaymentPost,
    getVerificatedTutorCoursecards,
    getNotVerificatedTutorCoursecards,
    getTutorCourseCardsByTutorId,
    setTutorCourseCardVerificated,
    setTutorCourseTitle,
    updateTutorCourseSchedule,
    updateTutorCoursePrice,
    updateTutorCourseCategory,
    updateTutorsTeachingLanguage,
    updateTutorCourseMinMaxAges,
    setTutorCourseIsOnline,
    updateTutorsStartRequirements,
    updateTutorCourseExpectingResults,
    updateTutorDescription,
    updateCourseInfo,
    deleteTutorSertificate,
    editTutorSertificateTitle
}
