import * as admin from 'firebase-admin';

export class FirebaseMessaging {
  
    constructor(databaseurl: string) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: databaseurl
        });
    }
  
    async sendMessage(registrationToken: string, body: any): Promise<string> {
        // convert message into firebase message
        let message: admin.messaging.Message = {
            data: body,
            token: registrationToken
        };

        // Send a message to the device corresponding to the provided
        // registration token.
        return admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
            return response;
        });
    }
  }