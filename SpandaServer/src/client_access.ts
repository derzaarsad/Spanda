import * as mongoose from "mongoose";

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

export { ClientAccessModel }