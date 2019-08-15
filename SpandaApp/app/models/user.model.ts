import { Token } from "~/models/token.model";

export class User {
    Username: string;
    Allowance: number;
    Email: string;
    Password: string;
    IsAutoUpdateEnabled: boolean;
    userToken: Token;
}