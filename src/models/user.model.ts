import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { TUserRoles } from "../types/user.types.js";
import { generateTokens } from "../utils/handleToken.js";

export const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      immutable: true,
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
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
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
