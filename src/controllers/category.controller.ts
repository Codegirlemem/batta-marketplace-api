import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import {
  categorySlugZodSchema,
  createCategoryZodSchema,
} from "../zodSchemas/category.schema.js";
import CategoryModel from "../models/category.model.js";
import AppError from "../utils/appError.js";
import ProductModel from "../models/product.model.js";
import { TProductStatus } from "../types/index.types.js";

export const getAllCategories = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await CategoryModel.find().lean();

    return res.status(200).json({
      success: true,
      message: "Categories retrieved succesfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = categorySlugZodSchema.parse(req.params.slug);

    const category = await CategoryModel.findOne({
      slug,
    }).lean();

    if (!category) return next(new AppError("Category not found", 404));

    return res.status(200).json({
      success: true,
      message: "Category retrieved succesfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryData = createCategoryZodSchema.parse(req.body);

    const newCategory = new CategoryModel({
      ...categoryData,
      description: categoryData.description || undefined,
    });

    const category = await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateCategory = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = categorySlugZodSchema.parse(req.params.slug);
    const updates = createCategoryZodSchema.parse(req.body);

    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { slug },
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    if (!updatedCategory) {
      return next(new AppError(`Category with slug '${slug}' not found`, 404));
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = categorySlugZodSchema.parse(req.params.slug);
    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      return next(
        new AppError(`Category with slug '${slug}' does not exist`, 404),
      );
    }

    const hasProducts = await ProductModel.exists({
      category: category?._id,
      status: { $in: [TProductStatus.Active, TProductStatus.Disabled] },
    });

    if (hasProducts) {
      return next(
        new AppError(
          "Cannot delete category that has products linked to it",
          400,
        ),
      );
    }

    await CategoryModel.deleteOne({ _id: category._id });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
