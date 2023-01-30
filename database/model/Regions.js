const mongoose = require("mongoose");
const RegionsSchema = new mongoose.Schema(
  {
    photo: {
      type: Object,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    island: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Regions ||
  mongoose.model("Regions", RegionsSchema);
