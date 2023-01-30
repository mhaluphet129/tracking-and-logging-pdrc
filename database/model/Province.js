const mongoose = require("mongoose");

const ProvinceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Regions",
    },
    photo: {
      type: Object,
      required: false,
    },
    island: {
      type: String,
      required: true,
    },
    websites: {
      type: Array,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Province ||
  mongoose.model("Province", ProvinceSchema);
