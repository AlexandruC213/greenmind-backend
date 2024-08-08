import { Schema, model, Document, ObjectId } from "mongoose";

interface IProduct extends Document {
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId: ObjectId;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export default model<IProduct>("Product", productSchema);
