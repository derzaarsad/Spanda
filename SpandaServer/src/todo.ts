import * as mongoose from "mongoose";

interface ITodo {
    _id: string;
    description: string;
}

interface ITodo_ extends mongoose.Document {
    description: string;
}

const TodoSchema = new mongoose.Schema({
    description: String
});

const TodoModel = mongoose.model<ITodo_>('Todo', TodoSchema);

export { TodoModel, ITodo }