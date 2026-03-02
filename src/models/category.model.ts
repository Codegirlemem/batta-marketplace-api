import { model, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, "Category name is required"],
      minLength: [5, "Category name must be atleast five characters"],
      maxLength: [20, "Category name must not exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [50, "Description must not exceed 50 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      unique: true,
      lowercase: true,
      minLength: [5, "Category name must be atleast five characters"],
      maxLength: [30, "Category name must not exceed 30 characters"],
      validate: {
        validator: function (val: string) {
          return /^[a-z0-9-]+$/.test(val);
        },
        message: () =>
          `Slug field can only have lowercase letters, numbers and dashes`,
      },
    },
  },
  { timestamps: true },
);

const CategoryModel = model("Category", categorySchema);

export default CategoryModel;
