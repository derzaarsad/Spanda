import { AxiosInstance, AxiosRequestConfig } from "axios";

export class FirebaseMessaging {
    private http: AxiosInstance;
    private serverKey: string;

    constructor(http: AxiosInstance,serverKey: string) {
        this.http = http;
        this.serverKey = serverKey;

        console.log("Firebase push server key: " + this.serverKey);
    }
  
    async sendMessage(registrationToken: string, body: any, title: string) {
        const config = {
            headers: {
                Authorization: "key=" + this.serverKey,
                "Content-Type": "application/json"
            }
        };

        // convert message into firebase message
        const message = {
            notification: {
                title: title,
                body: body
            },
            to: registrationToken
        }

        return this.http.post("", message, config).then(response => response.data);
    }
}