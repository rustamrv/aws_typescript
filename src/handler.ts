import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda";
import { connectDb } from "./db";
import { UserModel } from "./models";
import * as bcrypt from "bcrypt";

const userCreate: Handler = async (
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
export { userCreate };
