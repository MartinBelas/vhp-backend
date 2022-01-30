'use strict';

const RegistrationsDao = require('./registrations-dao-mysql');
const { Registration, RegistrationBuilder, Sex } = require('./registration');
const { ResultBuilder } = require('../common/result');
const ApiKeyService = require('../common/ApiKeyService');
const NextYearService = require('../common/NextYearService');
const EmailService = require('../common/EmailService');
const AdminController = require('../auth/admin/admin-controller.js');

const registration_subject = "Registrace na VH pulmaraton"

function getRegistrationMailBody(newRegistration) {
    
    return `
        Jméno: ${newRegistration.firstName} 
        Příjmení: ${newRegistration.lastName} 
        E-mail: ${newRegistration.email} 
        Rok narození: ${newRegistration.birth} 
        Závod: ${newRegistration.race}

        Děkujeme za registraci a těšíme se na Vaši účast.
        Registraci prosím dokončete zaplacením registračního poplatku 400 Kč na účet 2200743991/2010, děkujeme.

        Pro případné dotazy nás neváhejte kontaktovat, viz www.vh-pulmaraton.cz/kontakty
        `;
}

module.exports = class RegistrationsController {

    static getAll = async function (req, res) {

        if (ApiKeyService.getApiKeyOk()) {

            const competition = req.params.competition;
            const nextYear = await NextYearService.getNextYear(competition)
                .catch(e => {
                    console.log('ERR Registration controller, gel all: ', "error when obtaining next year");
                    RegistrationsController.responseWithDbConnectionError(res);
                });

            if (nextYear) {

                const dao = new RegistrationsDao(nextYear);

                AdminController.authenticate(req, res)
                    .then(authenticationResult => {

                        dao.find(competition, true)
                            .then(data => {
                                res.status(200).json(data);
                            })
                            .catch(err => {
                                console.log('ERR Registration controller, gel all, processing data: ', err);
                                RegistrationsController.responseWithDbConnectionError(res);
                            })

                    })
                    .catch(authenticationFailure => {

                        dao.find(competition, true)
                            .then(data => {
                                data.forEach(element => {
                                    element.email = "";
                                    element.phone = "";
                                    element.birth = "";
                                });
                                res.status(200).json(data);
                            })
                            .catch(err => {
                                console.log('ERR Registration controller, gel all, processing data: ', err);
                                RegistrationsController.responseWithDbConnectionError(res);
                            })

                    });
            } else {
                console.log('ERR Registration controller, gel all - wrong next year: ', nextYear);
            }
        }
    };

    //TODO for adm only
    // static get = function (req, res) {
    //     dao.findById(competition, req.params.id)
    //         .then(result => {
    //             if (result.error) {
    //                 if (result.suggestedStatus) {
    //                     res.status(result.suggestedStatus);
    //                 }
    //                 res.json(result.error);
    //             } else {
    //                 res.status(200).json(result);
    //             }
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             RegistrationsController.responseWithDbConnectionError(res);
    //         })
    // };

    static create = async function (req, res) {

        const competition = req.params.competition;
        const nextYear = await NextYearService.getNextYear(competition)
            .catch(e => {
                console.log('ERR Registration controller, creat: ', "error when obtaining next year");
                RegistrationsController.responseWithDbConnectionError(res);
            });

        if (nextYear && (nextYear.length === 4)) {

            const dao = new RegistrationsDao(nextYear);

            // Validate request
            if (!req.body.registration.email) {
                res.status(400).send({ message: "Email can not be empty!" });
                return;
            }
            if (!req.body.registration.firstname) {
                res.status(400).send({ message: "First name can not be empty!" });
                return;
            }
            if (!req.body.registration.lastname) {
                res.status(400).send({ message: "Last name can not be empty!" });
                return;
            }
            if (!req.body.registration.birth) {
                res.status(400).send({ message: "Birth year can not be empty!" });
                return;
            }
            if (!req.body.registration.sex) {
                res.status(400).send({ message: "Sex can not be empty!" });
                return;
            }
            let sex = req.body.registration.sex;
            if (!(['M', 'F'].includes(sex))) {
                res.status(400).send({ message: "Sex must be 'M' or 'F' only!" });
                return;
            }
            sex = Sex[sex];
    
            if (!req.body.registration.race) {
                res.status(400).send({ message: "Race can not be empty!" });
                return;
            }
    
            let newRegistration;
            try {
                let registration = req.body.registration;
                newRegistration = new RegistrationBuilder()
                    .setEmail(registration.email)
                    .setFirstName(registration.firstname)
                    .setLastName(registration.lastname)
                    .setBirth(registration.birth)
                    .setSex(sex)
                    .setAddress(registration.home)
                    .setPhone(registration.phone)
                    .setClub(registration.club)
                    .setRace(registration.race)
                    .setComment(registration.notes)
                    .setPaid(false)
        
                    //TODO category, timeStamp
                    .build();
            } catch (err) {
                console.log('RegistrationsController create: ', err);
                res.status(422);
                res.send(err);
            }
    
    
            dao.create(req.params.competition, newRegistration)
                .then(data => {
                    EmailService.sendMail(newRegistration.email, registration_subject, getRegistrationMailBody(newRegistration));
                    const result = new ResultBuilder()
                        .setIsOk(true)
                        .build();
                    res.status(200).json(result);
                })
                .catch(err => {
                    let errMsg;
                    let suggestedStatus;
                    if (err.code === 'ER_DUP_ENTRY') {
                        errMsg = 'Email už v registracích existuje.';
                        suggestedStatus = 409;
                    } else {
                        errMsg = 'Chyba při ukládání registrace: ' + err.code;
                        suggestedStatus = 500;
                    }
                    const result = new ResultBuilder()
                        .setIsOk(false)
                        .setErrMessage(errMsg)
                        .build();
                    res.status(suggestedStatus).json(result);
                })
        } else {
            console.log('ERR Registration controller, create - wrong next year: ', nextYear);
        }
    };

    static update = async function (req, res) {

        if (!req.params.id) {
            res.status(400).send({ message: "Id can not be empty!" });
            return;
        }

        const competition = req.params.competition;
        const nextYear = await NextYearService.getNextYear(competition)
            .catch(e => {
                console.log('ERR Registration controller, update: ', "error when obtaining next year");
                RegistrationsController.responseWithDbConnectionError(res);
            });

        if (nextYear && (nextYear.length === 4)) {

            const dao = new RegistrationsDao(nextYear);
            
            //TODO user type Registration;
            let user = await dao.findById(competition, req.params.id);
            //if (req.body.paid) { user.updatePaid(req.body.registration.paid) };
            if (req.body.registration.paid !== undefined) {
                if (req.body.registration.paid === 'true' || req.body.registration.paid === true) {
                    user.paid = 1;
                }
                else {
                    user.paid = 0;
                }
            };
            
            dao.update(competition, user)
                .then(data => {
                    data = JSON.parse(JSON.stringify(data));
                    res.status(200).json(data);
                    // or res.status(204);
                })
                .catch(err => {
                    console.error(err);
                    res.send(err);
                });
        } else {
            console.log('ERR Registration controller, update - wrong next year: ', nextYear);
        }


    };

    // static delete = function (req, res) {
    //     if (!req.params.id) {
    //         res.status(400).send({ message: "Id can not be empty!" });
    //         return;
    //     }
    //     dao.remove(competition, req.params.id)
    //         .then(data => {
    //             console.log(data);
    //             res.json(data);
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             res.send(err);
    //         });
    // };

    // static responseWithDbConnectionError = function (res) {
    //     res.status(503);
    //     res.send({
    //         "message": "Error when connecting to db."
    //     });
    // };
}
