import { createTransport } from 'nodemailer';
import {configService} from '../config';

export class EmailService {
    transport: any;
    constructor() {
        this.transport = createTransport({
            host: 'smtp.gmail.com',
            port: 465, 
            auth: {
                type: 'Login',
                user: configService.get<string>('USER_EMAIL'),
                pass: configService.get<string>('PASS_EMAIL'),
            },
        })
    }

    async sendConfirmEmail(email: string, url: string) {
        console.log(url);
        
        await this.transport.sendMail({
            from: `"App" <${configService.get<string>('USER_EMAIL')}>`,
            to: email,
            subject: 'Confirm email', 
            html:
                `Confirm your email ${url}/?email=${email}.`,
        });
    }
}