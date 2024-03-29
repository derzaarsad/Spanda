import { GetClientAccess, GetClientToken } from "./client_access";
import { GetUserByUsername, CreateUserInDB } from "./model/user.model";
import { Controller, Route, Get, Post, BodyProp, Put, Delete, Header } from "tsoa";
import * as https from "https";
import * as querystring from "querystring";

@Route('spanda')
export class AuthenticationController extends Controller {

    @Get('/users')
    public async isUserAuthenticated(@Header('Authorization') authorization: string): Promise<any> {
        
        return new Promise((resolve, reject) => {

            GetClientAccess().then((clientAccess) => {
                // Set the headers
                const headers = {
                    'Authorization': authorization,
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
            
                // Configure the request
                const options = {
                    host: clientAccess.server_url.replace('https://',''),
                    port: 443, // standard port of https
                    path: '/api/v1/users',
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
            }).catch((err) => {
                reject(err);
            });
        });

    }

    @Post('/users')
    public async register(@BodyProp() id: string, @BodyProp() password: string, @BodyProp() email: string, @BodyProp() phone: string, @BodyProp() isAutoUpdateEnabled: boolean) : Promise<any> {

        return new Promise((resolve, reject) => {

            GetUserByUsername(id).then((foundUser) => {

                if(foundUser) {
                    reject(new Error('User already exist!'));
                    return;
                }

                GetClientAccess().then((clientAccess) => {
                    GetClientToken().then((clientToken) => {
                        
                        if(!clientToken) {
                            reject("backend failure!");
                        }
    
                        // Set the headers
                        const headers = {
                            "Authorization": clientToken.TokenType + " " + clientToken.AccessToken,
                            'Content-Type': "application/json"
                        };
    
                        var postData = JSON.stringify({
                            'id' : id,
                            'password' : password,
                            'email' : email,
                            'phone' : phone,
                            'isAutoUpdateEnabled' : isAutoUpdateEnabled
                        });
    
                        // Configure the request
                        const options = {
                            host: clientAccess.server_url.replace('https://',''),
                            port: 443, // standard port of https
                            path: '/api/v1/users',
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
                                    reject(e);
                                }
                                this.setStatus(res.statusCode);
                                if(res.statusCode === 201) {
                                    CreateUserInDB(id, email, phone, isAutoUpdateEnabled).then((user) => {
                                        resolve(body);
                                    }).catch((err)=> {
                                        reject(err);
                                    });
                                }
                                else {
                                    reject(res.statusMessage);
                                }
                            });
                        });
                        
                        // reject on request error
                        req.on('error', (err) => {
                            // This is not a "Second reject", just a different sort of failure
                            reject(err);
                        });
                        
                        // IMPORTANT
                        req.write(postData);
                        req.end();
                    });
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    @Post('/oauth/login')
    public async authenticateAndSave(@BodyProp() username: string, @BodyProp() password: string) : Promise<any> {
        return new Promise((resolve, reject) => {
            
            GetClientAccess().then((clientAccess) => {
                // Set the headers
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };

                var postData = querystring.stringify({
                    'grant_type' : 'password',
                    'client_id' : clientAccess.client_id,
                    'client_secret' : clientAccess.client_secret,
                    'username': username,
                    'password': password
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
                        this.setStatus(res.statusCode);
                        if(res.statusCode === 200) {
                            console.log(body);

                            resolve(body);
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

    @Post('/oauth/token')
    public async setNewRefreshAndAccessToken(@BodyProp() refresh_token: string) : Promise<any> {
        return new Promise((resolve, reject) => {
            
            GetClientAccess().then((clientAccess) => {
                
                // Set the headers
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };

                var postData = querystring.stringify({
                    'grant_type' : 'refresh_token',
                    'client_id' : clientAccess.client_id,
                    'client_secret' : clientAccess.client_secret,
                    'refresh_token': refresh_token
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
                        this.setStatus(res.statusCode);
                        console.log(body);
                        if(res.statusCode === 200) {
                            resolve(body);
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