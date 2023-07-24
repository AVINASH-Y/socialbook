const nodemailer = require("nodemailer");

// Exporting an asynchronous function that sends an email using Nodemailer
module.exports = async (email, subject, text) => {
	try {
		// Create a nodemailer transporter using the provided configuration
		const transporter = nodemailer.createTransport({
			host: process.env.HOST, // SMTP host
			service: process.env.SERVICE, // Email service (e.g., Gmail, Outlook)
			port: Number(process.env.EMAIL_PORT), // Port to use for the connection
			secure: Boolean(process.env.SECURE), // Use SSL/TLS for secure connection
			auth: {
				user: "technologykey03@gmail.com", // Your email address
				pass: "ctwfsanbojbibxew", // Your email password or an application-specific password
			},
		});

		// Send the email using the configured transporter
		await transporter.sendMail({
			from: process.env.USER, // Sender's email address (configured in environment variables)
			to: email, // Recipient's email address (passed as a function parameter)
			subject: subject, // Email subject (passed as a function parameter)
			text: text, // Email body (passed as a function parameter)
		});

		// If the email is sent successfully, log a success message
		console.log("Email sent successfully");
	} catch (error) {
		// If there is an error while sending the email, log an error message and return the error object
		console.log("Email not sent!");
		console.log(error);
		return error;
	}
};
