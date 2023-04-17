const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HotlinesSchema = new Schema(
  {
    LGU: {
      type: String,
      default: "",
    },
    PNP: {
      type: String,
      default: "",
    },
    HOSPITAL: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const CityMunicipalitySchema = new mongoose.Schema(
  {
    photo: {
      type: Object,
      required: false,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Regions",
    },
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Province",
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    island: {
      type: String,
      required: true,
    },
    websites: {
      type: Array,
    },
    hotlines: HotlinesSchema,
    contactNumbers: {
      type: Array,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CityMunicipality ||
  mongoose.model("CityMunicipality", CityMunicipalitySchema);
