let mongoose = require("mongoose");

let VisitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    middlename: {
      type: String,
    },
    lastname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
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
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "CityMunicipality",
    },
    barangay: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    qr: {
      type: Array,
    },
    lastVisit: {
      type: Date,
    },
    status: {
      type: String,
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Visitor ||
  mongoose.model("Visitor", VisitorSchema);
