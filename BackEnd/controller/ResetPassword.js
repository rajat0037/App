const User = require("../model/User");
const mailSender = require("../utils/MailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// for sending link to resetPassword and creating token 
exports.resetPasswordToken = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}

        // creating token so i can add in url so that i can become a differating factor in url link for differnt user
        // randomBytes method of crypto is used to create random bytes
		const token = crypto.randomBytes(20).toString("hex");

        // update user by adding token and expiration time
        // find user on the basis of email and update
		const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);
		console.log("DETAILS", updatedDetails);

        // create url and send email
        // frontend link
        // token is differentating string for differnt user
		const url = `http://localhost:3000/update-password/${token}`;

		await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

		res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
	}
};

// for actually reset the password and store in db
exports.resetPassword = async (req, res) => {
	try {
        // yeh to password hai vo new password hai jo user ne daal hai 
		const { password, confirmPassword, token } = req.body;

		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}

        // here is where the actuall use of token come
        // db mei user ka password save karna pardega
        // or user nikalega token ke basis par
		const userDetails = await User.findOne({ token: token });
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
        // jo user ne new password dala hai usko hash kar ke db mei daal do
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);
		res.json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};