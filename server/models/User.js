import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseuid: { 
      type: String, 
      unique: true, 
      required: true,
      index: true 
    }, // Firebase UID
    firstName: { 
      type: String, 
      required: true,
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      unique: true, 
      required: true,
      trim: true,
      lowercase: true 
    },
    phone: { 
      type: String,
      trim: true 
    },
    address: { 
      type: String,
      trim: true 
    },
    city: { 
      type: String,
      trim: true 
    },
    zipCode: { 
      type: String,
      trim: true 
    },
  }, 
  { 
    timestamps: true 
  }
);

// Compound index for better query performance
userSchema.index({ firebaseuid: 1, email: 1 });

export default mongoose.model("User", userSchema);