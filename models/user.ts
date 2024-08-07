import { Schema, model, Document, ObjectId } from "mongoose";

interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  resetToken?: string;
  resetTokenExpiration?: number;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

export default model<IUser>("User", userSchema);
