import { Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
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
import {
  TCloudImage,
  TProductSchema,
  TProductStatus,
  TProductUpdateDoc,
} from "../types/index.types.js";
import {
  deleteCloudImage,
  productFilter,
  uploadToCloudinary,
} from "../utils/index.utils.js";

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
  let uploadedImages: TCloudImage[] | undefined;

  try {
    const productData = createProductSchema.parse(req.body);
    const productImages = req.files as Express.Multer.File[] | [];

    // Check that category is valid
    const category = await CategoryModel.exists({ _id: productData.category });

    if (!category) {
      return next(new AppError("Product must have a valid category", 400));
    }

    if (productImages.length > 0)
      uploadedImages = (await uploadToCloudinary(
        productImages.map((image) => image.path),
      )) as TCloudImage[];

    // Check if softdeleted or active product with the same name exist
    const existingProduct = await ProductModel.findOne({
      name: productData.name,
    });

    if (existingProduct) {
      // Restore and update soft deleted product
      if (existingProduct.status === TProductStatus.Deleted) {
        const update: TProductSchema = {
          ...productData,
          quantity: productData.quantity || 0,
          price: productData.price || 0,
          status: productData.status || TProductStatus.Active,
          images: uploadedImages?.length
            ? uploadedImages
            : (existingProduct.images as unknown as TCloudImage[]),
          deletedBy: null,
          deletedAt: null,
        };

        existingProduct.set(update);

        const activatedPdct = await existingProduct.save();

        return res.status(201).json({
          success: true,
          message: "Product created successfully",
          data: activatedPdct,
        });
      } else {
        return next(new AppError("Product with this name already exists", 400));
      }
    }

    // create new product if no soft deleted product
    const newProduct = new ProductModel({
      ...productData,
      images: uploadedImages?.length ? uploadedImages : [],
      description: productData.description || undefined,
    });

    const product = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    if (uploadedImages && uploadedImages.length > 0) {
      await Promise.all(
        uploadedImages.map((img) => cloudinary.uploader.destroy(img.public_id)),
      );
    }
    const err = duplicateError(error, "Product");

    next(err);
  }
};

export const updateProduct = async (
  req: UserRequest,
  res: Response,
  next: NextFunction,
) => {
  let uploadedImages: TCloudImage[] | undefined;

  try {
    const productId = objectIdSchema.parse(req.params.id);
    const productData = updateProductSchema.parse(req.body);
    const productImages = req.files as Express.Multer.File[] | [];

    if (productData.category) {
      // Validate category if it is part of the update
      const category = await CategoryModel.exists({
        _id: productData.category,
      });

      if (!category) {
        return next(new AppError("Product must have a valid category", 400));
      }
    }
    // upload image to cloudinary and get image url
    if (productImages.length > 0) {
      uploadedImages = (await uploadToCloudinary(
        productImages.map((image) => image.path),
      )) as TCloudImage[];
    }

    let updateData = {
      ...productData,
    } as TProductUpdateDoc;

    if (uploadedImages?.length) updateData.images = uploadedImages;

    // Update only products that have not been soft deleted
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId, ...productFilter },
      updateData,
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
    if (uploadedImages && uploadedImages.length > 0) {
      await Promise.all(
        uploadedImages.map((img) => deleteCloudImage(img.public_id)),
      );
    }
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
        deletedBy: req.user?._id,
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
