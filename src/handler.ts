import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
  SNSEvent,
} from "aws-lambda";
import { connectDb } from "./db";
import { UserModel } from "./models";
import * as bcrypt from "bcrypt";
import { SNS } from "aws-sdk";
import { EmailService } from "./services";
import {configService} from './config';

const register: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {

    if (event.body === null) {
      const response: APIGatewayProxyResult = {
        statusCode: 500,
        body: JSON.stringify({
          message: "User failed to create!",
        }),
      };
      return response;
    }
 
    await connectDb();

    const body = JSON.parse(event.body);
    
    const userModel = await UserModel();

    body.password = await bcrypt.hash(body.password, 10);
    try {
      const user = await userModel.create(body);
      console.log(user);
    } catch (error) {
      console.log('err user', error);
      const response: APIGatewayProxyResult = {
        statusCode: 500,
        body: JSON.stringify({
          message: "User failed to create!",
        }),
      };
      return response;
    }

    
    // const sns = new SNS();
    // console.log(sns);
    // const params = {
    //   Message: JSON.stringify({email: body.email}),
    //   TopicArn: `arn:aws:sns:us-east-1:${configService.get<string>('ACCOUNT_ID')}:SendVerifyTopic`
    // };
    // console.log(params);
    // await sns.publish(params).promise();

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({
        user: '',
      }),
    };
    return response;
  } catch (error: any) {
    console.log('err', error);
    
    const response: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
      }),
    };
    return response;
  }
};

const sendVerifyAccount: Handler = async (
  event: SNSEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const emailService = new EmailService()

    for (const record of event.Records) {
      const snsMessage = JSON.parse(record.Sns.Message);
 
      console.log("Email sent to:", snsMessage);
      await emailService.sendConfirmEmail(snsMessage.email, `https://${configService.get<string>('API_GATEWAY_ID')}.execute-api.${configService.get<string>('REGION')}.amazonaws.com/${configService.get<string>('STAGE')}>/api/confirm-email`)
    }

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Ok",
      }),
    };
    return response;
  } catch (error: any) {
    const response: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
      }),
    };
    return response;
  }
};

const confirmEmail: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters;
    const email = queryParams ? queryParams['email'] : null;

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'ok',
        queryParams,
        email: email
      }),
    };
    return response;
  } catch (error: any) {
    const response: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
      }),
    };
    return response;
  }
}

export { register, sendVerifyAccount, confirmEmail };
