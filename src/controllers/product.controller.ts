import { Response, NextFunction } from "express";
import { UserRequest } from "../types/express.js";
import { categorySlugZodSchema } from "../zodSchemas/category.schema.js";
import CategoryModel from "../models/category.model.js";
import AppError, { duplicateError } from "../utils/appError.js";
import ProductModel from "../models/product.model.js";
import { objectIdSchema } from "../zodSchemas/users.schema.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../zodSchemas/product.schema.js";
import { TProductStatus } from "../types/index.types.js";

const productFilter = {
  status: { $in: [TProductStatus.Active, TProductStatus.Disabled] },
};
export const getAllProducts = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await ProductModel.find(productFilter)
      .populate({ path: "category", select: "name slug" })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Products retrieved succesfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
export const getProductsByCategory = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = categorySlugZodSchema.parse(req.params.slug);

    const category = await CategoryModel.findOne({
      slug,
    }).lean();

    if (!category) return next(new AppError("Category is not valid", 404));

    const products = await ProductModel.find({
      category: category._id,
      ...productFilter,
    })
      .populate({ path: "category", select: "name slug" })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Products retrieved succesfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = objectIdSchema.parse(req.params.id);

    const product = await ProductModel.findOne({
      _id: productId,
      ...productFilter,
    })
      .populate({ path: "category", select: "name slug" })
      .lean();

    if (!product) return next(new AppError("Product not found", 404));

    return res.status(200).json({
      success: true,
      message: "Product retrieved succesfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productData = createProductSchema.parse(req.body);

    console.log(productData);

    // Check that category is valid
    const category = await CategoryModel.exists({ _id: productData.category });

    if (!category) {
      return next(new AppError("Product must have a valid category", 400));
    }

    // Check if softdeleted or active product with the same name exist
    const existingProduct = await ProductModel.findOne({
      name: productData.name,
    });

    if (existingProduct) {
      console.log(existingProduct);

      // Restore and update if soft deleted product
      if (existingProduct.status === TProductStatus.Deleted) {
        existingProduct.set({
          ...productData,
          status: productData.status || TProductStatus.Active,
          deletedBy: undefined,
          deletedAt: undefined,
        });

        await existingProduct.save();
        return res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: existingProduct,
        });
      } else {
        return next(new AppError("Product with this name already exists", 400));
      }
    }

    const newProduct = new ProductModel({
      ...productData,
      description: productData.description || undefined,
    });

    const product = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    const err = duplicateError(error, "Product");

    next(err);
  }
};

export const updateProduct = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = objectIdSchema.parse(req.params.id);
    const productData = updateProductSchema.parse(req.body);

    if (productData.category) {
      // Validate category if it is part of the update
      const category = await CategoryModel.exists({
        _id: productData.category,
      });

      if (!category) {
        return next(new AppError("Product must have a valid category", 400));
      }
    }

    // Update only products that have not been soft deleted
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId, ...productFilter },
      productData,
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    if (!updatedProduct) {
      return next(new AppError("Product not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    const err = duplicateError(error, "Product");
    next(err);
  }
};

export const deleteProduct = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = objectIdSchema.parse(req.params.id);

    // Find and delete only products that have not been soft deleted already
    const deletedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId, ...productFilter },
      {
        status: TProductStatus.Deleted,
        deletedBy: req.user?.id,
        deletedAt: new Date(),
      },
    ).lean();

    if (!deletedProduct) {
      return next(new AppError("Product not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
