import Visitor from "../../database/model/Visitor";
import Visit from "../../database/model/Visit";
import dbConnect from "../../database/dbConnect";
import Province from "../../database/model/Province";
import CityMunicipality from "../../database/model/CityMunicipality";
var ObjectId = require("mongodb").ObjectId;

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;

        switch (mode) {
          case "fetch-all": {
            const { startDate, endDate, filters } = req.query;
            const { dateRegistered, gender, age, address } =
              JSON.parse(filters);
            let query = [
              {
                $lookup: {
                  from: "items",
                  localField: "_id",
                  foreignField: "ownerId",
                  as: "items",
                },
              },
              {
                $lookup: {
                  from: "regions",
                  localField: "regionId",
                  foreignField: "_id",
                  as: "regionId",
                },
              },
              {
                $unwind: "$regionId",
              },
              {
                $lookup: {
                  from: "provinces",
                  localField: "provinceId",
                  foreignField: "_id",
                  as: "provinceId",
                },
              },
              {
                $unwind: "$provinceId",
              },
              {
                $lookup: {
                  from: "citymunicipalities",
                  localField: "cityId",
                  foreignField: "_id",
                  as: "cityId",
                },
              },
              {
                $unwind: "$cityId",
              },
              {
                $addFields: {
                  objectDate: {
                    $dateFromString: {
                      dateString: "$dateOfBirth",
                    },
                  },
                },
              },
              {
                $addFields: {
                  age: {
                    $dateDiff: {
                      startDate: "$objectDate",
                      endDate: "$$NOW",
                      unit: "year",
                    },
                  },
                },
              },
              {
                $match: {
                  age: {
                    $gte: parseInt(age.min),
                    $lte: parseInt(age.max),
                  },
                },
              },
            ];

            if (startDate != undefined && endDate != undefined)
              query.unshift({
                $match: {
                  createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                  },
                },
              });

            if (
              Object.values(address).filter((e) => e != null && e != "")
                .length != 0
            ) {
              let _ = [];
              if (address?.regionId)
                _.push({ regionId: ObjectId(address.regionId) });
              if (address?.provinceId)
                _.push({ provinceId: ObjectId(address.provinceId) });
              if (address?.cityId) _.push({ cityId: ObjectId(address.cityId) });
              if (address?.barangay != "")
                _.push({ barangay: address.barangay });
              query.unshift({
                $match: {
                  $and: _,
                },
              });
            }

            if (gender != "") {
              query.unshift({
                $match: {
                  gender,
                },
              });
            }

            if (dateRegistered?.from != null && dateRegistered?.to != null) {
              query.unshift({
                $match: {
                  createdAt: {
                    $gte: new Date(dateRegistered?.from),
                    $lte: new Date(dateRegistered?.to),
                  },
                },
              });
            } else {
              if (dateRegistered?.from != null) {
                query.unshift({
                  $match: {
                    createdAt: {
                      $gte: new Date(dateRegistered?.from),
                    },
                  },
                });
              } else if (dateRegistered?.to != null) {
                query.unshift({
                  $match: {
                    createdAt: {
                      $lte: new Date(dateRegistered?.to),
                    },
                  },
                });
              }
            }

            return await Visitor.aggregate(query).then((e) => {
              console.log(e.length);
              res.json({
                status: 200,
                message: "Successfully fetched the data",
                visitor: e,
              });
              resolve();
            });
          }
          case "search-visitor": {
            const { searchKeyword } = req.query;
            var re = new RegExp(searchKeyword.trim(), "i");

            return await Visitor.find({
              $or: [
                { lastname: { $regex: re } },
                { name: { $regex: re } },
                { middlename: { $regex: re } },
              ],
            })
              .populate("regionId provinceId cityId")
              .collation({ locale: "en" })
              .sort({ name: 1 })
              .then((e) => {
                console.log(e);
                res.json({ status: 200, searchData: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }

          case "get-visitor": {
            const { id } = req.query;

            return await Visitor.aggregate([
              { $match: { _id: ObjectId(id) } },
              {
                $lookup: {
                  from: "regions",
                  localField: "regionId",
                  foreignField: "_id",
                  as: "region",
                },
              },
              {
                $unwind: "$region",
              },
              {
                $lookup: {
                  from: "provinces",
                  localField: "provinceId",
                  foreignField: "_id",
                  as: "province",
                },
              },
              {
                $unwind: "$province",
              },
              {
                $lookup: {
                  from: "citymunicipalities",
                  localField: "cityId",
                  foreignField: "_id",
                  as: "citymunicipalities",
                },
              },
              {
                $unwind: "$citymunicipalities",
              },
            ])
              .then((e) => {
                res.json({ status: 200, message: "Success", data: e[0] });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "check-isTimeIn": {
            const { id } = req.query;
            return await Visit.find({ visitorId: id })
              .then((e) => {
                let timeOut = true;

                e.forEach((e) => {
                  timeOut = e.timeOutDone;
                });
                res.json({
                  status: 200,
                  message: "Success",
                  data: { timeOut },
                });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "remove": {
            const { id } = req.query;

            return await Visitor.findOneAndDelete({ _id: id })
              .then(async () => {
                await Visit.deleteMany({ visitorId: id }).catch((err) => {
                  res
                    .status(500)
                    .json({ success: false, message: "Error: " + err });
                });
                res.json({ status: 200, message: "Removed successfully" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "check-validity": {
            const { userId, qrId } = req.query;

            return await Visitor.findOne({ _id: userId }).then((doc) => {
              if (!doc) res.json({ status: 201, message: "Invalid QR Code" });
              if (doc?.qr[doc?.qr.length - 1].id == qrId)
                res.json({ status: 200 });
              else
                res.json({
                  status: 201,
                  message:
                    "QR code is already expired. Please generate a new one in the system.",
                });
            });
          }

          case "check-inactive-visitor": {
            let visitors = await Visitor.find();
            let mappedVisitors = visitors
              ?.filter((e) => moment(e?.lastVisit).isSameOrAfter(moment()))
              .map((e) => e._id);
            await Visitor.updateMany(
              { _id: { $in: mappedVisitors } },
              { $set: { status: "INACTIVE" } }
            )
              .then(() => true)
              .catch(() => false);
          }
        }
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { mode } = req.body.payload;

        switch (mode) {
          case "add-visitor": {
            let newVisitor = Visitor(req.body.payload.visitor);

            return await newVisitor
              .save()
              .then(() => {
                res.json({ status: 200, message: "Successfully Added" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "update-visitor": {
            const { id } = req.body.payload;

            delete req.body.payload.data._id;
            delete req.body.payload.data.createdAt;
            delete req.body.payload.data.updatedAt;
            delete req.body.payload.data.__v;

            return await Visitor.findOneAndUpdate(
              { _id: id },
              { $set: { ...req.body.payload.data } }
            )
              .then(() => {
                res.json({ status: 200, message: "Successfully updated" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }

          case "new-qr-key": {
            const { data, id } = req.body.payload;

            return await Visitor.findOneAndUpdate(
              { _id: id },
              { $push: { qr: data } }
            )
              .then(() => {
                res.json({
                  status: 200,
                  data: data.id,
                  message: "Successfully generated new QR",
                });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
        }
      });
    }
    default:
      res.status(400).json({ success: false });
  }
}
