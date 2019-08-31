import * as mongoose from "mongoose";
import * as https from "https";
import { Token } from "./token.model";
import * as querystring from "querystring";
import { resolve } from "url";
import { rejects } from "assert";

interface IClientAccess extends mongoose.Document {
    name: string,
    server_url: string,
    client_id: string,
    client_secret: string,
    ddk: string
}

const ClientAccessSchema = new mongoose.Schema({
    name: String,
    server_url: String,
    client_id: String,
    client_secret: String,
    ddk: String
});

const ClientAccessModel = mongoose.model<IClientAccess>('ClientAccess', ClientAccessSchema);

function GetClientToken() : Promise<Token> {
    return new Promise((resolve, reject) => {ClientAccessModel.findOne({ 'name': 'default_client' }).then((clientAccess) => {
        if(!clientAccess) {
            console.log('no clientAccess found!');
            resolve(undefined);
        }

        // Set the headers
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        var postData = querystring.stringify({
            'grant_type' : 'client_credentials',
            'client_id' : clientAccess.client_id,
            'client_secret' : clientAccess.client_secret
        });
        
    
        // Configure the request
        const options = {
            host: clientAccess.server_url.replace('https://',''),
            port: 443, // standard port of https
            path: '/oauth/token',
            method: 'POST',
            headers: headers
        };

        const req = https.request(options, (res) => {
                
            // accumulate data
            let body = [];
            res.on('data', (chunk) => {
                body.push(chunk);
            });
            
            // resolve on end
            res.on('end', () => {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                } catch(e) {
                    console.log(e);
                    resolve(undefined);
                }
                console.log("client access status code: " + res.statusCode);
                if(res.statusCode === 200) {
                    console.log(body);
                    let clientToken: Token = new Token(body['access_token'],body['refresh_token'],body['token_type']);
                    console.log(clientToken.AccessToken);
                    console.log(clientToken.RefreshToken);
                    console.log(clientToken.TokenType);

                    resolve(clientToken);
                }
                else {
                    resolve(undefined);
                }
            });
        });
        
        // reject on request error
        req.on('error', (err) => {
            // This is not a "Second reject", just a different sort of failure
            console.log(err);
            resolve(undefined);
        });
        
        // IMPORTANT
        req.write(postData);
        req.end();

    });
});
}

export { ClientAccessModel, GetClientToken }