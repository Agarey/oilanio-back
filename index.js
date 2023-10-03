import express from 'express';
import bodyParser from 'body-parser'
const app = express()
import ACTIONS from './actions.js'
import db from './queries.js'
import db_classroom from './queries-classroom.js';
import db_corporate from './queries-corporate.js';
import cors from 'cors'
import fs from "fs";
import path from "path";
import multer from "multer";
import { dirname } from 'path';
import { fileURLToPath } from 'url'; 
import roleMiddleware from './middleware/roleMiddleware.js'
import archiver from 'archiver';
import tmp from 'tmp-promise';
import fetch from 'node-fetch';

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
app.post('/createNewProgram', db_classroom.createNewProgram)
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
app.post('/getGuideById/:id', db_classroom.getGuideById)
app.post('/getLessonByRoomKey/:key', db_classroom.getLessonByRoomKey)
app.post('/getStudentByLessonKey/:key', db_classroom.getStudentByLessonKey)
app.post('/getTeacherByLessonKey/:key', db_classroom.getTeacherByLessonKey)
app.post('/getProgramsByTeacherId/:id', db_classroom.getProgramsByTeacherId)
app.post('/getProgramsByStudentId/:id', db_classroom.getProgramsByStudentId)
app.post('/getProgramsByCourseId/:id', db_classroom.getProgramsByCourseId)
app.post('/getLessonsByProgramId/:id', db_classroom.getLessonsByProgramId)
app.post('/createEmptyProgram', db_classroom.createEmptyProgram)
app.post('/getStudentsByTeacherId', db_classroom.getStudentsByTeacherId)
app.post('/getGroupsByTeacherId', db_classroom.getGroupsByTeacherId)
app.post('/getAnswersStatistics', db_classroom.getAnswersStatistics)
app.post('/getAssignmentsByTeacherId', db_classroom.getAssignmentsByTeacherId)
app.post('/getStudentsGroupsByTeacherId', db_classroom.getStudentsGroupsByTeacherId)
app.post('/createStudentGroup', db_classroom.createStudentGroup)
app.post('/getExercisesByLessonId/:id', db_classroom.getExercisesByLessonId)
app.post('/getAnswersByStudExId', db_classroom.getAnswersByStudExId)
app.put('/updateStudentProgram', db_classroom.updateStudentProgram)
app.put('/updateStudentProgramStatus', db_classroom.updateStudentProgramStatus)
app.put('/updateStudentData', db_classroom.updateStudentData)
app.put('/updateProgramCourseAndTitle', db_classroom.updateProgramCourseAndTitle)
app.put('/updateNewProgram', db_classroom.updateNewProgram)
app.put('/updateProgramDuration', db_classroom.updateProgramDuration)
app.put('/updateCourse', db_classroom.updateCourse)
app.put('/updateNewCourse', db_classroom.updateNewCourse)
app.put('/updateLesson', db_classroom.updateLesson)
app.put('/updateNewLesson', db_classroom.updateNewLesson)
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
app.get('/getLessonInfo_v2', db_classroom.getLessonInfo_v2)
app.get('/getLessonInfo_new', db_classroom.getLessonInfo_new)
app.post('/getTeacherCommentsByStudExId', db_classroom.getTeacherCommentsByStudExId)
app.post('/createTeacherComment', db_classroom.createTeacherComment)
app.post('/getCourseCommentsWithCourseId', db_classroom.getCourseCommentsWithCourseId)
app.post('/getStudentById', db_classroom.getStudentById)
app.post('/getStudentByIdForLesson', db_classroom.getStudentByIdForLesson)
app.post('/getCourseById', db_classroom.getCourseById)
app.post('/getProgramById', db_classroom.getProgramById)
app.post('/getLessonById', db_classroom.getLessonById)
app.post('/getPassedStudents/:id', db_classroom.getPassedStudents)
app.post('/getAllStudents/:id', db_classroom.getAllStudents)
app.post('/getDatesForApplication/:id', db_classroom.getDatesForApplication)
app.post('/getDatesForApplicationSecond', db_classroom.getDatesForApplicationSecond)
app.delete('/deleteProgram', db_classroom.deleteProgram)
app.delete('/deleteCourse', db_classroom.deleteCourse)
app.post('/addStudentProgram', db_classroom.addStudentProgram)
app.post('/createStudentAndProgram', db_classroom.createStudentAndProgram)
app.post('/createGroup', db_classroom.createGroup)
app.get('/getServerTime', db_classroom.getServerTime)
app.post('/restorePassword', db_classroom.restorePassword)
app.put('/updatePassword', db_classroom.updatePassword)
app.post('/getCourseUrl', db_classroom.getCourseUrl)
app.put('/updateTeacherData/:id', db_classroom.updateTeacherData)
app.post('/getStudentByUrl', db_classroom.getStudentByUrl)
app.put('/updateStudentDataFromProfile', db_classroom.updateStudentDataFromProfile)
app.get('/getAllCoursesAndProgramsOfStudent', db_classroom.getAllCoursesAndProgramsOfStudent)
app.put('/updateUserLogin', db_classroom.updateUserLogin)
app.put('/updateUserPassword', db_classroom.updateUserPassword)
app.post('/createCourseAndProgram', db_classroom.createCourseAndProgram)
app.post('/createNewLessonAndExercises', db_classroom.createNewLessonAndExercises)
app.post('/getStudentsByGroupId/:id', db_classroom.getStudentsByGroupId)
app.put('/updateGroup', db_classroom.updateGroup)
app.put('/updateGroupMiddleware', db_classroom.updateGroupMiddleware)
app.post('/createGroupMiddleware', db_classroom.createGroupMiddleware)
app.delete('/deleteGroupMiddleware', db_classroom.deleteGroupMiddleware)
app.post('/getProgramsByStudentIdGroup/:id', db_classroom.getProgramsByStudentIdGroup)
app.post('/getStudentsByTeacherIdGroup', db_classroom.getStudentsByTeacherIdGroup)
app.post('/getStudentsInfoByRoom/:room', db_classroom.getStudentsInfoByRoom)


app.post('/createLocation', db_corporate.createLocation)
app.get('/getAllLocations', db_corporate.getAllLocations)
app.delete('/deleteLocation', db_corporate.deleteLocation)
app.post('/createDirector', db_corporate.createDirector)
app.get('/getAllDirectors', db_corporate.getAllDirectors)
app.delete('/deleteDirector', db_corporate.deleteDirector)
app.post('/createEnterpriseStatus', db_corporate.createEnterpriseStatus)
app.get('/getAllEnterpriseStatuses', db_corporate.getAllEnterpriseStatuses)
app.delete('/deleteEnterpriseStatus', db_corporate.deleteEnterpriseStatus)
app.post('/createLegalForm', db_corporate.createLegalForm)
app.get('/getAllLegalForms', db_corporate.getAllLegalForms)
app.delete('/deleteLegalForm', db_corporate.deleteLegalForm)
app.post('/createOwnershipForm', db_corporate.createOwnershipForm)
app.get('/getAllOwnershipForms', db_corporate.getAllOwnershipForms)
app.delete('/deleteOwnershipForm', db_corporate.deleteOwnershipForm)
app.post('/createActivityType', db_corporate.createActivityType)
app.get('/getAllActivityTypes', db_corporate.getAllActivityTypes)
app.delete('/deleteActivityType', db_corporate.deleteActivityType)
app.post('/createCompany', db_corporate.createCompany)
app.get('/getAllExistingCompanies', db_corporate.getAllExistingCompanies)
app.delete('/deleteCompany', db_corporate.deleteCompany)
app.post('/userLogin', db_corporate.loginUser)
app.get('/user', db_corporate.authenticateToken, db_corporate.getUser);
app.post('/getCompanyByUserLogin', db_corporate.getCompanyByUserLogin)
app.post('/getCompanyByPersonLogin', db_corporate.getCompanyByPersonLogin)
app.put('/updateCompanyLogo/:id', db_corporate.updateCompanyLogo)
app.put('/updateCompanyData/:id', db_corporate.updateCompanyData)
app.put('/changePassword/:login', db_corporate.changePassword)
app.put('/updateUserVerificationCode/:login', db_corporate.updateUserVerificationCode)
app.post('/getPlanByCompanyId', db_corporate.getPlanByCompanyId)
app.post('/getStudyCategoriesByCompanyId', db_corporate.getStudyCategoriesByCompanyId)
app.post('/createCompanyPlan', db_corporate.createCompanyPlan)
app.post('/getPlanData', db_corporate.getPlanData)
app.post('/updatePlan', db_corporate.updatePlan)
app.post('/getPlanCategories', db_corporate.getPlanCategories)
app.post('/createBranch', db_corporate.createBranch)
app.post('/getCompanyBranches', db_corporate.getCompanyBranches)
app.get('/getAllGenders', db_corporate.getAllGenders)
app.get('/getAllFamilyStatuses', db_corporate.getAllFamilyStatuses)
app.get('/getStudyCategoryTypes', db_corporate.getStudyCategoryTypes)
app.post('/getJobTitlesByCompanyId', db_corporate.getJobTitlesByCompanyId)
app.post('/createPerson', db_corporate.createPerson)
app.post('/addJobTitle', db_corporate.addJobTitle)
app.post('/getCompanyEmployees', db_corporate.getCompanyEmployees)
app.put('/updatePersonData/:id', db_corporate.updatePersonData)
app.put('/updatePersonStatus/:id', db_corporate.updatePersonStatus)
app.post('/getFilteredCompanyEmployees', db_corporate.getFilteredCompanyEmployees)
app.post('/getEdu', db_corporate.getEdu)
app.post('/getEduCourse', db_corporate.getEduCourse)
app.post('/getEduProgram', db_corporate.getEduProgram)
app.post('/getEduCompany', db_corporate.getEduCompany)
app.post('/getEduLessons', db_corporate.getEduLessons)
app.post('/createLessonEdu', db_corporate.createLessonEdu)
app.post('/updateLessonEdu', db_corporate.updateLessonEdu)
app.post('/deleteLessonEdu', db_corporate.deleteLessonEdu)
app.post('/addLessonMaterialEdu', db_corporate.addLessonMaterialEdu)
app.post('/getUsersWithPersonsByLoginEdu', db_corporate.getUsersWithPersonsByLoginEdu)
app.post('/getAttendanceControlByLoginEdu', db_corporate.getAttendanceControlByLoginEdu)
app.post('/createAttendanceControlEdu', db_corporate.createAttendanceControlEdu)
app.post('/createProgramEdu', db_corporate.createProgramEdu)
app.post('/createCertificateEdu', db_corporate.createCertificateEdu)
app.post('/issueCertificateEdu', db_corporate.issueCertificateEdu)
app.post('/createExerciseEdu', db_corporate.createExerciseEdu)
app.post('/getExercisesByLessonIdEdu', db_corporate.getExercisesByLessonIdEdu)
app.post('/updateExerciseByIdEdu', db_corporate.updateExerciseByIdEdu)
app.post('/deleteExerciseByIdEdu', db_corporate.deleteExerciseByIdEdu)
app.post('/getAnswersByLessonIdsEdu', db_corporate.getAnswersByLessonIdsEdu)
app.post('/updateAnswerIsCorrectEdu', db_corporate.updateAnswerIsCorrectEdu)
app.post('/createEduOrgTotal', db_corporate.createEduOrgTotal)
app.post('/getCompanyCourses', db_corporate.getCompanyCourses)
app.post('/getTotalDashboardInfo', db_corporate.getTotalDashboardInfo)
app.post('/getCompanyExpenses', db_corporate.getCompanyExpenses)
app.post('/getCompanyData', db_corporate.getCompanyData)
app.post('/checkBudgets', db_corporate.checkBudgets)
app.post('/getCourseAssignments', db_corporate.getCourseAssignments)
app.post('/getSelectedCourseInfo', db_corporate.getSelectedCourseInfo)
app.post('/editSelectedCourseInfo', db_corporate.editSelectedCourseInfo)
app.post('/getLessonMaterials', db_corporate.getLessonMaterials)
app.delete('/deleteVerificationCode/:login', db_corporate.deleteVerificationCode);
app.put('/updateCompanyEmail/:id', db_corporate.updateCompanyEmail)
app.put('/updateCompanyPhone/:id', db_corporate.updateCompanyPhone)
app.put('/updateCompanyLogin/:id', db_corporate.updateCompanyLogin)
app.put('/updateUserPassword/:login', db_corporate.updateUserPassword)
app.post('/checkVerificationCode', db_corporate.checkVerificationCode)
app.post('/getStudentCommentsByStudentIdAndExerciseIdEdu', db_corporate.getStudentCommentsByStudentIdAndExerciseIdEdu)
app.post('/getEduCommentsByStudentIdAndExerciseIdEdu', db_corporate.getEduCommentsByStudentIdAndExerciseIdEdu)
app.post('/createStudentCommentEdu', db_corporate.createStudentCommentEdu)
app.post('/createEduCommentEdu', db_corporate.createEduCommentEdu)
app.post('/StudentAllInfo', db_corporate.StudentAllInfo)
app.post('/getUserCoursesByLoginStudent', db_corporate.getUserCoursesByLoginStudent)
app.put('/updatePersonEmail/:id', db_corporate.updatePersonEmail)
app.put('/updatePersonPhone/:id', db_corporate.updatePersonPhone)
app.put('/updatePersonLogin/:id', db_corporate.updatePersonLogin)
app.put('/updateUserPassword/:login', db_corporate.updateUserPassword)
app.post('/checkVerificationCode', db_corporate.checkVerificationCode)
app.post('/updatePersonData2', db_corporate.updatePersonData2)
app.post('/createAnswerStudent', db_corporate.createAnswerStudent)

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
    upload.single("file"),
    async (req, res) => {
        const tempPath = req.file.path;

        let randomPostfix = (Math.floor(Math.random() * 1000000) + 1).toString();

        let targetPathWithoutExt = path.join(__dirname, `./uploads/${randomPostfix}`);
        let targetPath =  targetPathWithoutExt + path.extname(req.file.originalname);
        let fileName = `${randomPostfix}${path.extname(req.file.originalname)}`;

        console.log('Target Path:', targetPath);

        try {
            await fs.promises.rename(tempPath, targetPath);
            res
                .status(200)
                .contentType("text/plain")
                .end('https://realibi.kz/file/' + fileName);
            console.log("New uploaded file name: " + fileName);
        } catch (error) {
            console.error('Error during file moving:', error);
            res.status(500).send('Error during file processing.');
        }
    }
);

app.post(
  '/downloadArchive',
  bodyParser.json(),
  async (req, res) => {
    const { links, archiveName } = req.body;

    const { path: tmpFilePath, cleanup } = await tmp.file();
    const output = fs.createWriteStream(tmpFilePath);
    const archive = archiver('zip');
    archive.pipe(output);

    try {
      for (const link of links) {
        const response = await fetch(link);
        if (!response.ok) throw new Error(`Couldn't fetch ${link}`);

        const fileName = link.split('/').pop();
        archive.append(response.body, { name: fileName });
      }

      archive.finalize();

      output.on('close', () => {
        res.download(tmpFilePath, `${archiveName}.zip`, (err) => {
          if (err) {
            console.error('Error during file download:', err);
            res.status(500).send('Error during file download.');
          }

          cleanup();
        });
      });
    } catch (err) {
      console.error('Error during file archiving:', err);
      res.status(500).send('Error during file archiving.');

      cleanup();
    }
  }
);


let port = process.env.PORT || 3030;

app.listen(port, (err) => {
    if (err){
        throw Error(err);
    }
    console.log(`Goco backend running on port ${port}.`)
})