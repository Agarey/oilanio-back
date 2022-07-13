import express from 'express';
import bodyParser from 'body-parser'
const app = express()
import db from './queries.js'
import cors from 'cors'
import fs from"fs";
import path from"path";
import multer from "multer";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import roleMiddleware from'./middleware/roleMiddleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors())

let whitelist = ['http://localhost:3000', 'https://www.oilan.io']
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
app.get('/verificatedCourseCards', db.getVerificatedCourseCards)
app.get('/notVerificatedCourseCards', db.getNotVerificatedCourseCards)
app.get('/courseCardsByCenterId/:centerId', db.getCourseCardsByCenterId)
app.post('/callRequest', db.createCallRequest)
app.post('/helpRequest', db.createHelpRequest)
app.get('/handlePayment', db.handlePayment)
app.post('/handlePayment', db.handlePaymentPost)
app.post('/courseCardsFilter', db.courseCardsFilter)
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
app.post('/courseCategories', db.getCourseCategories);
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
app.post('/deleteCourseTeacher', roleMiddleware([4 , 1]), db.deleteCourseTeacher)
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

app.post('/createAccountTest', db.createAccountTest)
app.get('/getAccountsTest', db.getAccountsTest)

app.get('/getTelegramFeedbacksCenters', db.getTelegramFeedbacksCenters)
app.get('/getTelegramFeedbacksTutors', db.getTelegramFeedbacksTutors)
app.get('/getRegions', db.getRegions)

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



let port = 3030;

app.listen(port, () => {
    console.log(`Goco backend running on port ${port}.`)
})
