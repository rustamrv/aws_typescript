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
import { env } from "node:process";

const register: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    await connectDb();
    if (event.body === null) {
      const response: APIGatewayProxyResult = {
        statusCode: 500,
        body: JSON.stringify({
          message: "User failed to create!",
        }),
      };
      return response;
    }

    const body = JSON.parse(event.body);

    const userModel = await UserModel();

    body.password = await bcrypt.hash(body.password, 10);

    const user = await userModel.create(body);

    const sns = new SNS();

    const params = {
      Message: JSON.stringify({email: user.email}),
      TopicArn: `arn:aws:sns:us-east-1:${env.ACCOUNT_ID}:sendVerifyAccount`
    };

    await sns.publish(params).promise();

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: JSON.stringify({
        user: user.toJSON(),
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

const sendVerifyAccount: Handler = async (
  event: SNSEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('there');
    
    // await connectDb();
    for (const record of event.Records) {
      const snsMessage = JSON.parse(record.Sns.Message);
 
      console.log("Email sent to:", snsMessage);
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

export { register, sendVerifyAccount };
