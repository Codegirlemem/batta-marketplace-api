import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { TUserRoles } from "../types/user.types.js";
import { generateTokens } from "../utils/handleToken.js";

const addressSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: [true, "Full name is required"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
    },
    street: {
      type: String,
      trim: true,
      required: [true, "Street is required"],
    },
    city: { type: String, trim: true, required: [true, "City is required"] },
    state: { type: String, trim: true, required: [true, "State is required"] },
    country: { type: String, trim: true, default: "Nigeria" },
    postalCode: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      select: false,
      minLength: [6, "password must be at least 6 characters"],
    },
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      minLength: [3, "Username must be atleast three characters"],
      maxLength: [20, "Username must not exceed 20 characters"],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(TUserRoles),
        message: `{VALUE} is not supported`,
      },
      default: TUserRoles.User,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: {
      type: [addressSchema],
      validate: {
        validator: function (val: any[]) {
          return val.length <= 5;
        },
        message: "Maximum of 5 addresses allowed",
      },
      default: () => [],
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,

    methods: {
      async comparePassword(enteredPassword: string) {
        return bcrypt.compare(enteredPassword, this.password);
      },

      createPasswordResetToken() {
        const { rawToken, hashedToken } = generateTokens();

        this.passwordResetToken = hashedToken;
        this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

        return rawToken;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const UserModel = model("User", userSchema);

export default UserModel;
