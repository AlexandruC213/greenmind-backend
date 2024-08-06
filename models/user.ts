import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  name: string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export default model<IUser>("User", userSchema);
