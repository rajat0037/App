const {contactUsEmail} = require("../mail/contactFormRes")
const mailSender = require("../utils/MailSender")

exports.contactUsController = async(req,res) => {
    const {
        email,
        firstname,
        lastname,
        message,
        phoneNo,
        countrycode} = req.body;
        console.log(req.body);
        try{
            const emailRes = await mailSender(
                email,
                "Your Data send Successfully",
                contactUsEmail(email,firstname, lastname, message, phoneNo, countrycode)
            )
            console.log("Email Res", emailRes)
            return res.json({
                success : true,
                message : "Email send successfully",
            })
        } catch(error){
            console.log(error);
            return res.status(500).json({
                success : false,
                message : "Cannot send email",
                error : error.message,
            })
        }
}