import { model, Schema, Types } from "mongoose";
import { generateTokens } from "../utils/handleToken.js";

export const invitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    invitedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: { type: Date },
  },
  {
    timestamps: true,
    methods: {
      createInviteToken() {
        const { rawToken, hashedToken } = generateTokens();

        this.token = hashedToken;
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        return rawToken;
      },
    },
  },
);

invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const InvitationModel = model("Invitation", invitationSchema);

export default InvitationModel;
