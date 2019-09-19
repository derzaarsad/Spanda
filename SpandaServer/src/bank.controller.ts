import { GetClientAccess, GetClientToken } from "./client_access";
import { Controller, Route, Get, Post, BodyProp, Put, Delete, Header } from "tsoa";
import * as https from "https";
import { GetUserByUsername } from "./model/user.model";
import { BankConnectionModel } from "./model/bankConnection.model";

@Route('spanda')
export class BankController extends Controller {
    private bankPerPage = "2";

    @Get('/banks/{blz}')
    public async getBankByBLZ(blz: string): Promise<any> {
        
        return new Promise((resolve, reject) => {

            GetClientAccess().then((clientAccess) => {

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
            }).catch((err) => {
                reject(err);
            });
        });

    }

    @Post('/bankConnections/import')
    public async getWebformId(@Header('Authorization') authorization: string, @BodyProp() bankId: number) : Promise<any> {
        return new Promise((resolve, reject) => {this.connectToBank(authorization, bankId).then((fromConnectToBank) => {
            if(!fromConnectToBank) {
                console.log('backend failure!');
                resolve(undefined);
            }

            let webId = fromConnectToBank[0]["errors"][0]["message"];
            console.log(webId);

            // Set the headers
            const headers = {
                'Authorization': authorization
            };
            
        
            // Configure the request
            const options = {
                host: fromConnectToBank[1].replace('https://',''),
                port: 443, // standard port of https
                path: "/api/v1/webForms/" + webId,
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
                        console.log(e);
                        resolve(undefined);
                    }
                    this.setStatus(res.statusCode);
                    if(res.statusCode === 200) {
                        console.log(body);

                        resolve([body,fromConnectToBank[1]]);
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
            req.end();

        });
    });
    }

    @Get('/webForms/{webId}')
    public async fetchWebformInfo(webId: string,@Header('Username') username, @Header('Authorization') authorization: string, @Header('Content-Type') contentType: string) : Promise<any> {
        return new Promise((resolve, reject) => {

            GetClientAccess().then((clientAccess) => {

                // Set the headers
            const headers = {
                'Authorization': authorization,
                'Content-Type': contentType
            };
            
        
            // Configure the request
            const options = {
                host: clientAccess.server_url.replace('https://',''),
                port: 443, // standard port of https
                path: "/api/v1/webForms/" + webId,
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
                        console.log(e);
                        reject(undefined);
                    }
                    this.setStatus(res.statusCode);
                    if(res.statusCode === 200) {
                        console.log(body);

                        GetUserByUsername(username).then((user) => {
                            if(!user) {
                                reject("user not found");
                                return;
                            }

                            if(body['serviceResponseCode'] === 201) {
                                let serviceResponseBody = JSON.parse(body['serviceResponseBody']);

                                BankConnectionModel.create({ id: serviceResponseBody['id'],
                                bankId: serviceResponseBody['bankId'], bankAccounts: serviceResponseBody['accountIds'] }, function (err, bankConnection) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        user.bankConnections.push(bankConnection.id);
                                        user.save();
                                        
                                        resolve(body);
                                    }
                                });
                            }
                            else {
                                reject(undefined);
                            }
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                    else {
                        reject(undefined);
                    }
                });
            });
            
            // reject on request error
            req.on('error', (err) => {
                // This is not a "Second reject", just a different sort of failure
                console.log(err);
                reject(undefined);
            });
            
            // IMPORTANT
            req.end();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    @Get('/allowance')
    public async getAllowance(@Header('Username') username, @Header('Authorization') authorization: string, @Header('Content-Type') contentType: string) : Promise<any> {
        return new Promise((resolve, reject) => {

            GetUserByUsername(username).then((user) => {

                if(!user) {
                    reject("user not found");
                    return;
                }

                GetClientAccess().then((clientAccess) => {
                    // TODO
                    resolve("{\"allowance\":" + user.allowance.toString() + "}");
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err)=> {
                reject(err);
            });
        });
    }

    private connectToBank(authorization: string, bankId: number) : Promise<any> {
        return new Promise((resolve, reject) => {
            GetClientAccess().then((clientAccess) => {

            // Set the headers
            const headers = {
                'Authorization': authorization,
                'Content-Type': 'application/json'
            };

            var postData = JSON.stringify({
                'bankId' : bankId
            });
            
        
            // Configure the request
            const options = {
                host: clientAccess.server_url.replace('https://',''),
                port: 443, // standard port of https
                path: '/api/v1/bankConnections/import',
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
                    this.setStatus(res.statusCode);
                    // It has to be an error (code 451), because we want to open the Web Form
                    if(res.statusCode === 451) {
                        console.log(body);
                        
                        resolve([body,clientAccess.server_url]);
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

        }).catch((err) => {
            reject(err);
        });
    });
    }
}