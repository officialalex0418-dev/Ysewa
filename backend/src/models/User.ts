import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: "SUPER_ADMIN" | "OPERATOR_OWNER" | "SYSTEM_EMPLOYEE" | "CUSTOMER";
  operatorId?: mongoose.Types.ObjectId;
  counterId?: mongoose.Types.ObjectId;
  is2faEnabled: boolean;
  totpSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "OPERATOR_OWNER", "SYSTEM_EMPLOYEE", "CUSTOMER"],
      default: "CUSTOMER"
    },
    operatorId: { type: Schema.Types.ObjectId, ref: "Operator" },
    counterId: { type: Schema.Types.ObjectId, ref: "Counter" },
    is2faEnabled: { type: Boolean, default: false },
    totpSecret: { type: String },
  },
  { timestamps: true }
);

// Ensure at least one of email or phone is provided
UserSchema.pre("save", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("Either email or phone is required"));
  }
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
