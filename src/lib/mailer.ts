import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import prisma from '@/db';

export enum EmailType {
  VERIFY = 'VERIFY',
  RESET = 'RESET',
}

export const sendEmail = async ({
  email,
  emailType,
  userId,
}: {
  email: string;
  emailType: string;
  userId: string;
}) => {
  try {
    const hashedToken = await bcrypt.hash(userId, 10);
    if (emailType === EmailType.VERIFY) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          verifyToken: hashedToken,
          verifyTokenExpiry: new Date(Date.now() + 3600000),
        },
      });
    } else if (emailType === EmailType.RESET) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: new Date(Date.now() + 3600000),
        },
      });
    }
    var transport = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.NEXTNODEMAILER_USER,
        pass: process.env.NEXTNODEMAILER_PASSWORD,
      },
    });
    const mailOptions = {
      from: 'shrijanshreshth3@gmail.com',
      to: email,
      subject:
        EmailType.VERIFY === 'VERIFY'
          ? 'Verify your email'
          : 'Reset your password',
      html: `<table class="body-wrap" style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65; height: 100%; background: #efefef; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important;">
    <tbody>
      <tr style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65;">
        <td class="container" style="margin: 0 auto !important; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65; display: block !important; clear: both !important; max-width: 580px !important;"><!-- Message start -->
          <table style="margin: 0px; padding: 0px; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; line-height: 1.65; border-collapse: collapse; width: 100%; height: 200px;">
            <tbody>
              <tr style="margin: 0px; padding: 0px; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; line-height: 1.65; height: 136px;">
                <td class="masthead" style="margin: 0px; padding: 80px 0px; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; line-height: 1.65; background: #030014; color: white; height: 136px;" align="center">
                  <img src="https://res.cloudinary.com/dkcnv8vgt/image/upload/v1734589802/d6utgnk8dnsngv9ebde6.svg" alt="NoteFLow Logo" width="302" height="72"><h1>NoteFlow</h1>
                </td>
              </tr>
              <tr style="margin: 0px; padding: 0px; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; line-height: 1.65; height: 473px;">
                <td class="content" style="margin: 0px; padding: 30px 35px; font-size: 100%; line-height: 1.65; background: #030014; height: 473px;">
                  <h2 style="font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; margin: 0px 0px 20px; padding: 0px; font-size: 28px; line-height: 1.25;">
                    <span style="color: #b6b2ff;">Hi ${email},</span>
                  </h2>
                  <p>
                    <span style="color: #b6b2ff;">Thanks you for signing up with us! We're excited to have you as a part of our community.&nbsp; 
                      <br>
                      <br>By verifying your email, you'll gain full access to all the features and benefits of NoteFLow . If you did not create an account with us, please disregard this email. 
                      <br>
                    </span>
                  </p>
                  <table style="font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; line-height: 1.65; border-collapse: collapse; width: 98.2353%; height: 35px;">
                    <tbody>
                      <tr style="margin: 0px; padding: 0px; font-size: 100%; line-height: 1.65;">
                        <td style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65;" align="center">
                          <p style="margin: 0px 0px 20px; padding: 0px; font-size: 16px; line-height: 1.65;">
                            <a href="${process.env.NEXTAUTH_URL}/verifyemail?token=${hashedToken}" class="button" style="margin: 0px; padding: 0px; font-size: 100%; line-height: 1.65; color: white; display: inline-block; background: #7000FF; border-style: solid; border-color: #7000FF; border-image: initial; border-width: 10px 20px 8px; font-weight: bold; border-radius: 4px;">Click to Confirm Email</a>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p style="font-family: 'Avenir Next', 'Helvetica Neue', Helvetica, Helvetica, Arial, sans-serif; margin: 0px 0px 20px; padding: 0px; font-size: 16px; line-height: 1.65; font-weight: normal;">
                    <span style="color: #b6b2ff;">
                      <em style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65;">– Team NoteFLow</em>
                    </span>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65;">
        <td class="container" style="margin: 0 auto !important; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65; display: block !important; clear: both !important; max-width: 580px !important;">
          <span style="color: #b6b2ff;"><!-- Message start --></span>
          <table style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65; border-collapse: collapse; width: 100% !important;">
            <tbody>
              <tr style="margin: 0; padding: 0; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65;">
                <td class="content footer" style="margin: 0; padding: 30px 35px; font-size: 100%; font-family: 'Avenir Next', 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; line-height: 1.65; background: none;" align="center">Footer text</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>`,
    };
    const mailResponse = await transport.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else throw new Error('An unknown error occurred');
  }
};
