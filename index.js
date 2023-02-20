import express from 'express';
import bodyParser from 'body-parser'
const app = express()
import ACTIONS from './actions.js'
import db from './queries.js'
import db_classroom from './queries-classroom.js';
import cors from 'cors'
import fs from "fs";
import path from "path";
import multer from "multer";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import roleMiddleware from './middleware/roleMiddleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors())

let whitelist = ['http://localhost:3000', 'https://www.oilan.io', 'https://www.oilan-classroom.com']
let corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/feedbacks/:subcourseId', db.getFeedbacks)
//app.get('/feedbacks/:id', db.getFeedbackById)
app.post('/feedbacks', db.createFeedback)
app.put('/feedbacks/:id', db.updateFeedback)
app.delete('/feedbacks/:id', db.deleteFeedback)
app.get('/courses', db.getCourses)
app.get('/courses/:id', db.getCourseById)
//app.get('/courses/:categoryId', db.getCoursesByCategory)
app.post('/courses/register', db.createCourse)
app.put('/courses/:id', db.updateCourse)
app.delete('/courses/:id', db.deleteCourse)
app.get('/subcourses', db.getSubcourses)
app.get('/subcourses/:id', db.getSubcourseById)
app.post('/subcourses/:courseId', db.getCourseSubcourses)
app.post('/subcoursesByCategory', db.subcoursesByCategory)
app.post('/subcourses', db.createSubcourse)
app.put('/subcourses/:id', db.updateSubcourse)
app.delete('/subcourses/:id', db.deleteSubcourse)
app.get('/clients', db.getClients)
app.get('/clients/:id', db.getClientById)
app.post('/clients', db.createClient)
app.put('/clients/:id', db.updateClient)
app.delete('/clients/:id', db.deleteClient)
app.get('/teachers', db.getTeachers)
app.get('/teachers/:id', db.getTeacherById)
app.get('/getCities', db.getCities)
app.post('/teachers', db.createTeacher)
app.post('/teachers/:id', db.getCourseTeachers)
app.post('/createTutorSertificate', db.createTutorSertificate)
app.get('/getTutorSertificate', db.getTutorSertificate)
app.get('/getSertificates', db.getSertificates)
app.put('/teachers/:id', db.updateTeacher)
app.delete('/teachers/:id', db.deleteTeacher)
app.get('/partnershipRequests', db.getPartnershipRequests)
app.get('/partnershipRequests/:id', db.getPartnershipRequestById)
app.post('/partnershipRequests', db.createPartnershipRequest)
app.post('/setVerificated', db.setVerificated)
app.post('/newSession', db.newSession)
app.post('/updateSubcourseTitle', db.updateSubcourseTitle)
app.post('/updateSubcourseLogo', db.updateSubcourseLogo)
app.post('/updateCourseAddresses', db.updateCourseAddresses)
app.post('/updateSubcourseSchedule', db.updateSubcourseSchedule)
app.post('/updateSubcoursePrice', db.updateSubcoursePrice)
app.post('/updateSubcourseCategory', db.updateSubcourseCategory)
app.post('/updateSubcourseFormat', db.updateSubcourseFormat)
app.post('/updateSubcourseAges', db.updateSubcourseAges)
app.post('/updateSubcourseType', db.updateSubcourseType)
app.post('/updateSubcourseDescription', db.updateSubcourseDescription)
app.post('/updateCourseDescription', db.updateCourseDescription)
app.put('/partnershipRequests/:id', db.updatePartnershipRequest)
app.delete('/partnershipRequests/:id', db.deletePartnershipRequest)
app.get('/courseCards/:categoryId', db.getCourseCardsByCategoryId)
app.post('/courseCards/:subcourseId', db.getCourseCardById)
app.get('/courseCards', db.getCourseCards)
app.get('/getCourseCardsWithArchivedCards', db.getCourseCardsWithArchivedCards)
app.get('/verificatedCourseCards', db.getVerificatedCourseCards)
app.get('/notVerificatedCourseCards', db.getNotVerificatedCourseCards)
app.get('/courseCardsByCenterId/:centerId', db.getCourseCardsByCenterId)
app.post('/callRequest', db.createCallRequest)
app.post('/helpRequest', db.createHelpRequest)
app.get('/handlePayment', db.handlePayment)
app.post('/handlePayment', db.handlePaymentPost)
app.post('/courseCardsFilter', db.courseCardsFilter)
app.post('/feedbacksByCourseId', db.getFeedbacksByCourseId)
app.get('/getTutorCourseCardsFilter', db.getTutorCourseCardsFilter)
app.post('/tutorCourseCardsFilter', db.tutorCourseCardsFilter)
app.post('/logUserClick', db.logUserClick)
app.post('/newStudent', db.handleNewStudent)
app.get('/cabinetInfo', roleMiddleware([4 || "4", 1 || "1"]), db.getCabinetInfo);
app.get('/adminCards', roleMiddleware([1]), db.getAdminCards);
app.get('/adminTeachers', roleMiddleware([1]), db.getAdminTeachers);
app.post('/login', db.login)
app.post('/approveCard', roleMiddleware([1 || "1"]), db.approveCard)
app.post('/declineCard', roleMiddleware([1 || "1"]), db.declineCard)
app.post('/approveTeacher', roleMiddleware([1 || "1"]), db.approveTeacher)
app.post('/declineTeacher', roleMiddleware([1 || "1"]), db.declineTeacher)
app.post('/cabinetCourseCards', roleMiddleware([4 || "4", 1 || "1"]), db.getCabinetCourseCards)
app.post('/cabinetCourseTeachers', roleMiddleware([4 || "4", 1 || "1"]), db.getCabinetCourseTeachers)
app.post('/createCourseCard', roleMiddleware([4 || "4", 1 || "1"]), db.createCourseCard)
app.post('/createCourseTeacher', roleMiddleware([4 || "4", 1 || "1"]), db.createCourseTeacher)
app.get('/filters', db.getFilters);
app.post('/getFilteredCategories', db.getFilteredCategories);
app.post('/registerTelegramUser', db.registerTelegramUser)
app.get('/getCourseCategories', db.getCourseCategories);
app.post('/courseCategories', db.courseCategories);
app.post('/courseCategory', db.getCourseCategory);
app.post('/crmCourseCategories', db.getCrmCourseCategories);
app.post('/sendEditCard', roleMiddleware([4, 1]), db.sendEditCard)
app.get('/editCards', roleMiddleware([4 || "4", 1 || "1"]), db.getEditCards)
app.post('/getClickStatistics', db.getClickStatistics)
app.get('/cardCreationPermission/:centerId', db.cardCreationPermission)
app.post('/loadCallCenterInfo', roleMiddleware([1, 2]), db.loadCallCenterInfo)
app.get('/loadSallerInfo', roleMiddleware([5, 1]), db.loadSallerInfo)
app.get('/loadOperationPersonal1Info', roleMiddleware([3, 1]), db.loadOperationPersonal1Info)
app.get('/loadOperationPersonal2Info', roleMiddleware([3, 1]), db.loadOperationPersonal2Info)
app.get('/loadOperationPersonal3Info', roleMiddleware([3, 1]), db.loadOperationPersonal3Info)
app.post('/updateCallCenterRow', roleMiddleware([2, 1]), db.updateCallCenterRow)
app.post('/updateSellerRow', roleMiddleware([5, 1]), db.updateSellerRow)
app.post('/updateOperationPersonal1Row', roleMiddleware([3, 1]), db.updateOperationPersonal1Row)
app.post('/updateOperationPersonal2Row', roleMiddleware([3, 1]), db.updateOperationPersonal2Row)
app.post('/updateOperationPersonal3Row', roleMiddleware([3, 1]), db.updateOperationPersonal3Row)
app.post('/callCenterAddCenter', roleMiddleware([2 || "2", 1 || "1"]), db.callCenterAddCenter)
app.post('/deleteCourseCard', roleMiddleware([4 , 1]), db.deleteCourseCard)
app.post('/addCourseCard', db.addCourseCard)
app.post('/deleteCourseTeacher', db.deleteCourseTeacher)
app.post('/filterCallCenterRows', roleMiddleware([2 , 1]), db.filterCallCenterRows)
app.post('/createCourseNotification', roleMiddleware([1, 2]), db.createCourseNotification)
app.post('/getCourseNotification', roleMiddleware([1, 4]), db.getCourseNotification)
app.post('/checkCourseNotification', roleMiddleware([1, 4]), db.checkCourseNotification)
app.post('/createTechSupportTicket', db.createTechSupportTicket)
app.post('/createCourseSearchTicket', db.createCourseSearchTicket)
app.post('/courseCardsWithPagination', db.courseCardsWithPagination)
app.post('/archiveCard', roleMiddleware([1, 4]), db.archiveCard)
app.post('/unarchiveCard', roleMiddleware([1, 4]), db.unarchiveCard)
app.post('/getCourseSearchApplications', roleMiddleware([1, 4]), db.getCourseSearchApplications)
app.post('/getCourseSearchApplication', db.getCourseSearchApplication)
app.post('/responseToSearchApplication', roleMiddleware([1, 4]), db.responseToSearchApplication)
app.post('/getApplicationResponses', db.getApplicationResponses)
app.post('/deactivateSearchApplication', db.deactivateSearchApplication)
app.post('/saveCenterInfoChanges', roleMiddleware([1, 4]), db.saveCenterInfoChanges)
app.post('/createCabinet', db.createCabinet)
app.post('/getCourseSearchApplicationStatistics', roleMiddleware([1, 4]), db.getCourseSearchApplicationStatistics)
app.post('/getTelegramUsersCenters', roleMiddleware([1]), db.getTelegramUsersCenters)
app.post('/getTelegramUsersTutors', roleMiddleware([1]), db.getTelegramUsersTutors)
app.post('/loadDirectionPromotions', db.loadDirectionPromotions)
app.post('/loadCenterPromotions', db.loadCenterPromotions)
app.post('/createCenter', db.createCenter)
app.post('/createCenterAccount', db.createCenterAccount)
app.post('/approveEditCard', roleMiddleware([1]), db.approveEditCard)
app.post('/getApplicationResponsePermission', db.getApplicationResponsePermission)
app.post('/createPromotion', db.createPromotion)
app.post('/getDirectionActiveCards', db.getDirectionActiveCards)
app.post('/getTutorsActiveCards', db.getTutorsActiveCards)
app.get('/tutors/:id', db.getTutorInfo)
app.post('/setTutorCourseCardVerificated', db.setTutorCourseCardVerificated)
app.post('/setTutorCourseTitle', db.setTutorCourseTitle)
app.post('/updateTutorCourseSchedule', db.updateTutorCourseSchedule)
app.post('/updateTutorCoursePrice', db.updateTutorCoursePrice)
app.post('/updateTutorCourseCategory', db.updateTutorCourseCategory)
app.post('/updateTutorsTeachingLanguage', db.updateTutorsTeachingLanguage)
app.post('/updateTutorCourseMinMaxAges', db.updateTutorCourseMinMaxAges)
app.post('/setTutorCourseIsOnline', db.setTutorCourseIsOnline)
app.post('/updateTutorCourseStartRequirements', db.updateTutorsStartRequirements)
app.post('/updateTutorCourseExpectingResults', db.updateTutorCourseExpectingResults)
app.post('/updateTutorDescription', db.updateTutorDescription)
app.get('/tutorCourseCardsByTutorId/:tutorId', db.getTutorCourseCardsByTutorId)
app.get('/tutorCourseCards', db.getTutorCoursecards)
app.get('/getTutorCoursecardsWithArchivedCards', db.getTutorCoursecardsWithArchivedCards)
app.get('/getVerificatedTutorCourseCards', db.getVerificatedTutorCoursecards)
app.get('/notVerificatedTutorCourseCards', db.getNotVerificatedTutorCoursecards)
app.get('/tutors/course/:id', db.getTutorCourse)
app.post('/updateTutorInfo', db.updateTutorInfo)
app.post('/createTutorCourseCard', db.createTutorCourseCard)
app.post('/createTutor', db.createTutor)
app.post('/createTutorAccount', db.createTutorAccount)
app.get('/tutors', db.getTutors)
app.get('/getTutorsWithPhoto', db.getTutorsWithPhoto)
app.get('/tutorsCourseCards/:id', db.getTutorsCourseCardsById)
app.get('/tutorApplications/:tutorId', db.getTutorApplications)
app.post('/updateTutorCourseCard', db.updateTutorCourseCard)
app.post('/deleteTutorCourseCard', db.deleteTutorCourseCard)
app.post('/getStudentApplications', db.getStudentApplications)
app.get('/imagesBase', db.getImagesBase)
app.get('/partners_block', db.getPartners)
app.post('/studentLogin', db.studentLogin)
app.post('/updateCourseInfo', db.updateCourseInfo)
app.post('/deleteTutorSertificate', db.deleteTutorSertificate)
app.post('/editTutorSertificateTitle', db.editTutorSertificateTitle)
app.post('/editTeacherInfo', db.editTeacherInfo)
app.post('/createAccountTest', db.createAccountTest)
app.get('/getAccountsTest', db.getAccountsTest)

app.get('/getTelegramFeedbacksCenters', db.getTelegramFeedbacksCenters)
app.get('/getTelegramFeedbacksTutors', db.getTelegramFeedbacksTutors)
app.get('/getRegions', db.getRegions)
app.get('/getCenterStatus', db.getCenterStatus)
app.get('/getSessionCourse', db.getSessionCourse)
app.get('/getCourseApplicationCount', db.getCourseApplicationCount)
app.post('/changeStatusToHold', db.changeStatusToHold)
app.post('/createCourseSearchLowTicket', db.createCourseSearchLowTicket)
app.get('/getCities', db.getCities)
app.post('/createDetailTickets', db.createDetailTickets)
app.get('/getTicketId', db.getTicketId)
app.get('/tutorCourses/:id', db.getTutorCourseById)
app.post('/tutorSubcourses/:tutorId', db.getTutorSubcourses)
app.post('/tutorSertificates/:tutorId', db.getTutorSertificatesByTutorId)
app.post('/getFilteredCities/:cityId', db.getFilteredCities)
app.post('/tutorCourseCards/:subcourseId', db.getTutorCourseCardById)
app.get('/getPromotionBySubcourse/:subcourseId', db.getPromotionBySubcourse)
app.post('/courseCardsFilterByCategory', db.courseCardsFilterByCategory)
app.post('/tutorCourseCardsFilterByCategory', db.tutorCourseCardsFilterByCategory)

app.post('/register', db_classroom.registerUser)
app.post('/auth', db_classroom.loginUser)
app.post('/createTicket', db_classroom.createTicket)
app.post('/createMarathoneTicket', db_classroom.createMarathoneTicket);
app.get('/getCaptcha', db_classroom.getCaptcha)
app.get('/getAllCaptchaId', db_classroom.getAllCaptchaId)
app.post('/getCaptchaWithId/:id', db_classroom.getCaptchaWithId)
app.post('/getProgramsById/:id', db_classroom.getProgramsById)
app.post('/createTeacher', db_classroom.createTeacher)
app.post('/createCourse', db_classroom.createCourse)
app.post('/createCourseTarget', db_classroom.createCourseTarget)
app.post('/createCourseInfoBlock', db_classroom.createCourseInfoBlock)
app.post('/createSertificate', db_classroom.createSertificate)
app.post('/createCourseSkill', db_classroom.createCourseSkill)
app.post('/createCourseStage', db_classroom.createCourseStage)
app.post('/createUser', db_classroom.createUser)
app.post('/createStudent', db_classroom.createStudent)
app.post('/createLesson', db_classroom.createLesson)
app.post('/createAnswer', db_classroom.createAnswer)
app.post('/createExercise', db_classroom.createExercise)
app.post('/createCategory', db_classroom.createCategory)
app.post('/createSCM', db_classroom.createSCM)
app.post('/createProgram', db_classroom.createProgram)
app.get('/getTeachers', db_classroom.getTeachers)
app.get('/getCategories', db_classroom.getCategories)
app.get('/getCourses', db_classroom.getCourses)
app.post('/getCourseByProgramId', db_classroom.getCourseByProgramId)
app.get('/getPrograms', db_classroom.getPrograms)
app.get('/getLessons', db_classroom.getLessons)
app.get('/getStudents', db_classroom.getStudents)
app.get('/getRoles', db_classroom.getRoles)
app.post('/getMarathone/:title', db_classroom.getMarathone)
app.post('/getCourseOC/:title', db_classroom.getCourseOC)
app.post('/getCourseTargets/:id', db_classroom.getCourseTargets)
app.post('/getCourseInfoBlocks/:id', db_classroom.getCourseInfoBlocks)
app.post('/getCourseSkills/:id', db_classroom.getCourseSkills)
app.post('/getMarathoneSkills/:id', db_classroom.getMarathoneSkills)
app.post('/getCourseStages/:id', db_classroom.getCourseStages)
app.post('/getPrograms/:id', db_classroom.getPrograms)
app.post('/getTeacherByCourse/:id', db_classroom.getTeacherByCourse)
app.post('/getTeacherByUrl/:url', db_classroom.getTeacherByUrl)
app.post('/getLessonByRoomKey/:key', db_classroom.getLessonByRoomKey)
app.post('/getStudentByLessonKey/:key', db_classroom.getStudentByLessonKey)
app.post('/getTeacherByLessonKey/:key', db_classroom.getTeacherByLessonKey)
app.post('/getProgramsByTeacherId/:id', db_classroom.getProgramsByTeacherId)
app.post('/getProgramsByStudentId/:id', db_classroom.getProgramsByStudentId)
app.post('/getProgramsByCourseId/:id', db_classroom.getProgramsByCourseId)
app.post('/getLessonsByProgramId/:id', db_classroom.getLessonsByProgramId)
app.post('/createEmptyProgram', db_classroom.createEmptyProgram)
app.post('/getStudentsByTeacherId', db_classroom.getStudentsByTeacherId)
app.post('/getExercisesByLessonId/:id', db_classroom.getExercisesByLessonId)
app.post('/getAnswersByStudExId', db_classroom.getAnswersByStudExId)
app.put('/updateStudentProgram', db_classroom.updateStudentProgram)
app.put('/updateStudentProgramStatus', db_classroom.updateStudentProgramStatus)
app.put('/updateStudentData', db_classroom.updateStudentData)
app.put('/updateProgramCourseAndTitle', db_classroom.updateProgramCourseAndTitle)
app.put('/updateCourse', db_classroom.updateCourse)
app.put('/updateLesson', db_classroom.updateLesson)
app.delete('/deleteLesson', db_classroom.deleteLesson)
app.delete('/deleteStudentOneProgram', db_classroom.deleteStudentOneProgram)
app.delete('/deleteStudent', db_classroom.deleteStudent)
app.put('/updateExercise', db_classroom.updateExercise)
app.delete('/deleteExercise', db_classroom.deleteExercise)
app.post('/getCoursesByTeacherId/:id', db_classroom.getCoursesByTeacherId)
app.post('/getCoursePrices/:id', db_classroom.getCoursePrices)
app.post('/getCurrentProgram/:id', db_classroom.getCurrentProgram)
app.post('/getSertificateByTeacherId/:id', db_classroom.getSertificateByTeacherId)
app.post('/getStudentLessonsByProgramId', db_classroom.getStudentLessonsByProgramId)
app.put('/updateAnswerStatus', db_classroom.updateAnswerStatus)
app.put('/updateStudentAnswer', db_classroom.updateStudentAnswer)
app.put('/updateAnswerComment', db_classroom.updateAnswerComment)
app.post('/getScheduleByLessonIdAndCourseIdAndStudentId', db_classroom.getScheduleByLessonIdAndCourseIdAndStudentId)
app.post('/createSchedule', db_classroom.createSchedule)
app.put('/updateSchedule', db_classroom.updateSchedule)
app.put('/updateLessonNumber', db_classroom.updateLessonNumber)
app.put('/updateExerNumber', db_classroom.updateExerNumber)
app.put('/createPersonalRoom', db_classroom.createPersonalRoom)
app.put('/createDefaultRoom', db_classroom.createDefaultRoom)
app.get('/getStudentCourseInfo', db_classroom.getStudentCourseInfo)
app.get('/getStudentScores', db_classroom.getStudentScores)
app.get('/getLessonExercises', db_classroom.getLessonExercises)
app.get('/getLessonInfo', db_classroom.getLessonInfo)
app.post('/getTeacherCommentsByStudExId', db_classroom.getTeacherCommentsByStudExId)
app.post('/createTeacherComment', db_classroom.createTeacherComment)
app.post('/getCourseCommentsWithCourseId', db_classroom.getCourseCommentsWithCourseId)
app.post('/getStudentById', db_classroom.getStudentById)
app.post('/getStudentByIdForLesson', db_classroom.getStudentByIdForLesson)
app.post('/getCourseById', db_classroom.getCourseById)
app.post('/getPassedStudents/:id', db_classroom.getPassedStudents)
app.post('/getAllStudents/:id', db_classroom.getAllStudents)
app.post('/getDatesForApplication/:id', db_classroom.getDatesForApplication)
app.post('/getDatesForApplicationSecond', db_classroom.getDatesForApplicationSecond)
app.delete('/deleteProgram', db_classroom.deleteProgram)
app.delete('/deleteCourse', db_classroom.deleteCourse)
app.post('/addStudentProgram', db_classroom.addStudentProgram)
app.post('/createStudentAndProgram', db_classroom.createStudentAndProgram)
app.get('/getServerTime', db_classroom.getServerTime)

let devPublicRoute = "dev\\goco-backend\\public";
let productionPublicRoute = "/root/goco-backend/public";

app.use(express.static(__dirname + productionPublicRoute))

const handleError = (err, res) => {
    res
        .status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};

const upload = multer({
    dest: "./tempFiles"
});

let devIndexRoute = "C:\\dev\\goco-backend\\public\\index.html";
let productionRoute = "/root/goco-backend/public/index.html";

app.get("/file", (request, response) => {
    response.sendFile(productionRoute)
});

app.get("/file/:filename", (req, res) => {
    let filename = req.params.filename;
    res.sendFile(path.join(__dirname, "./uploads/" + filename));
});

app.post(
    "/file/upload",
    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {
        const tempPath = req.file.path;

        let randomPostfix = (Math.floor(Math.random() * 1000000) + 1).toString();

        let targetPathWithoutExt = path.join(__dirname, `./uploads/${randomPostfix}`);
        let targetPath =  targetPathWithoutExt + path.extname(req.file.originalname);
        let fileName = `${randomPostfix}${path.extname(req.file.originalname)}`;
        fs.rename(tempPath, targetPath, err => {
            if (err) return handleError(err, res);

            res
                .status(200)
                .contentType("text/plain")
                .end('https://realibi.kz/file/' + fileName);

	    console.log("new uploaded file name: " + fileName);
        });
    }
);


let port = process.env.PORT || 3030;

app.listen(port, (err) => {
    if (err){
        throw Error(err);
    }
    console.log(`Goco backend running on port ${port}.`)
})
