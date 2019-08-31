import { ClientAccessModel, GetClientToken } from "./client_access";
import { Controller, Route, Get, Post, BodyProp, Put, Delete, Header } from "tsoa";
import * as https from "https";
import { Token } from "./token.model";
import * as querystring from "querystring";
import { resolve } from "url";
import { rejects } from "assert";

@Route('spanda')
export class BankController extends Controller {
    private bankPerPage = "2";

    @Get('/banks/{blz}')
    public async getBankByBLZ(blz: string): Promise<any> {
        
        return new Promise((resolve, reject) => {

            ClientAccessModel.findOne({ 'name': 'default_client' }, (err, clientAccess) => {

                if(err || !clientAccess) {
                    const errorMessage = { error: (err) ? err : 'client_not_found' };
                    resolve(errorMessage);
                    return;
                }

                GetClientToken().then((clientToken) => {
                    
                    if(!clientToken) {
                        reject("backend failure!");
                    }

                    // Set the headers
                    const headers = {
                        "Authorization": clientToken.TokenType + " " + clientToken.AccessToken,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    };

                    // Configure the request
                    const options = {
                        host: clientAccess.server_url.replace('https://',''),
                        port: 443, // standard port of https
                        path: "/api/v1/banks?search=" + blz + "&page=1&perPage=" + this.bankPerPage + "&order=id",
                        method: 'GET',
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
                                reject(e);
                            }
                            this.setStatus(res.statusCode);
                            resolve(body);
                        });
                    });
                    
                    // reject on request error
                    req.on('error', (err) => {
                        // This is not a "Second reject", just a different sort of failure
                        reject(err);
                    });
                    
                    // IMPORTANT
                    req.end();

                });
            });
        });

    }
}