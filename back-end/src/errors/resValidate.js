const validator = require("validator")


function resValidate(validationTarget) {

    return function (req, res, next){
        if(validationTarget === "reservation_date"){
            const reservationDate = new Date(`${req.body.data[validationTarget]}T${req.body.data.reservation_time}`);
            // select future date validation
            if (reservationDate < new Date()) return res.status(400).send({ error: 'reservation_date should be in the future' });      
            const theDate = new Date(req.body.data[validationTarget]).getUTCDay();
            // tuesday validation
            if(theDate===2) return res.status(400).send({ error: 'Business is closed on Tuesdays' });
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            // date f
            dateRegex.test(req.body.data[validationTarget]) ? next() : res.status(400).send({ error: 'reservation_date should be in correct format' })
        }

        if(validationTarget === "reservation_time"){
            const resTime = req.body.data[validationTarget]
            if(validator.isTime(resTime)){
                const timeArray = resTime.split(":");
                const timeNumber = Number(timeArray.join(''));
                // time slot validation
                if(timeNumber > 1030 && timeNumber < 2130)next();
                else return res.status(400).send({ error: 'reservation_time should be between 10:30am and 9:30pm' })  
                
            }
            // time format validation
            else return res.status(400).send({ error: 'reservation_time should be in correct format' }) 
        }

        if(validationTarget === "people") typeof req.body.data[validationTarget] === 'number' ? next() : next({status: 400, message: 'people field must be a number'})
        if(validationTarget === "status") req.body.data[validationTarget] === "booked" ? next() : next({status: 400, message: `${req.body.data[validationTarget]} is not a valid POST status`})
        
    }
}

module.exports = resValidate;