import Visit from "../../database/model/Visit";
import dbConnect from "../../database/dbConnect";
import moment from "moment";
import Item from "../../database/model/Item";
import Visitor from "../../database/model/Visitor";
var ObjectId = require("mongodb").ObjectId;

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;

        switch (mode) {
          case "get-visit-data": {
            const { id } = req.query;

            return await Visit.aggregate([
              {
                $match: { visitorId: ObjectId(id) },
              },
              {
                $lookup: {
                  from: "items",
                  localField: "_id",
                  foreignField: "visitId",
                  as: "depositItems",
                },
              },
            ])
              .sort({ createdAt: -1 })
              .then((e) => {
                res.json({ status: 200, data: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "fetch-recent": {
            return await Visit.aggregate([
              {
                $lookup: {
                  from: "items",
                  localField: "_id",
                  foreignField: "visitId",
                  as: "depositItems",
                },
              },
              {
                $lookup: {
                  from: "visitors",
                  localField: "visitorId",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $unwind: "$user",
              },
              // {
              //   $lookup: {
              //     from: "regions",
              //     localField: "user.regionId",
              //     foreignField: "_id",
              //     as: "user.regionId",
              //   },
              // },
              // {
              //   $unwind: "$user.regionId",
              // },
              // {
              //   $lookup: {
              //     from: "provinces",
              //     localField: "user.provinceId",
              //     foreignField: "_id",
              //     as: "user.provinceId",
              //   },
              // },
              // {
              //   $unwind: "$user.provinceId",
              // },
              // {
              //   $lookup: {
              //     from: "citymunicipalities",
              //     localField: "user.cityId",
              //     foreignField: "_id",
              //     as: "user.cityId",
              //   },
              // },
              // {
              //   $unwind: "$user.cityId",
              // },
            ])
              .sort({ createdAt: -1 })
              .then((e) => {
                res.json({ status: 200, data: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }

          case "visit-out": {
            return await Visit.findOneAndUpdate(
              { _id: req.query.id },
              {
                $set: {
                  timeOutDone: true,
                  timeOutTimeAfterDone: moment(),
                },
              }
            )
              .then((e) => {
                res.json({ status: 200 });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "visit-out-many": {
            return await Visit.updateMany(
              { _id: { $in: JSON.parse(req.query.ids) } },
              {
                $set: {
                  timeOutDone: true,
                  timeOutTimeAfterDone: moment(),
                },
              }
            )
              .then((e) => {
                res.json({ status: 200, message: "Checkout Succesfully" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "visit-with-timers": {
            return await Visit.find({
              timeOutDone: false,
              // timeOut: { $gte: moment() },
            })
              .populate("visitorId")
              .sort({ timeOut: -1 })
              .then((e) => {
                res.json({ status: 200, data: e });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "search-visit": {
            const { searchKeyword } = req.query;

            return await Visit.find({})
              .populate("visitorId")
              .collation({ locale: "en" })
              .sort({ name: 1 })
              .then((e) => {
                let filter = e.filter(
                  (_) =>
                    _.visitorId?.name?.search(searchKeyword) > -1 ||
                    _.visitorId?.middlename?.search(searchKeyword) > -1 ||
                    _.visitorId?.lastname?.search(searchKeyword) > -1
                );
                res.json({ status: 200, searchData: filter });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "filter-date": {
            const { startDate, endDate } = req.query;

            await Visit.find({
              timeIn: { $gte: startDate },
              timeOut: { $lte: endDate },
            })
              .populate("visitorId")
              .then((e) => {
                res.json({ status: 200, data: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "visitor-has-items": {
            const { id } = req.query;
            return await Item.find({
              ownerId: id,
              claimed: false,
              status: { $nin: ["DISPOSED"] },
            })
              .then((e) => {
                res.json({ status: 200, data: e });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
        }
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { mode } = req.body.payload;

        switch (mode) {
          case "new-visit": {
            let { items } = req.body.payload.data;
            let lastUniqueId = await Item.count();
            let newVisit = Visit(req.body.payload.data);
            items = items.map((e, i) => {
              return {
                ...e,
                uniqueId: lastUniqueId + i + 1,
                visitId: newVisit._id,
                depositDate: moment(),
              };
            });

            return await newVisit
              .save()
              .then(async () => {
                await Item.insertMany(items);
                await Visitor.findOneAndUpdate(
                  { _id: newVisit.visitorId },
                  { $set: { lastVisit: moment() } }
                );
                res.json({ status: 200, message: "Successfully Added" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "new-remarks": {
            let { id, title, hasViolation, description, type } =
              req.body.payload;
            return await Visit.findOneAndUpdate(
              { _id: id },
              { $push: { remarks: { title, description, hasViolation, type } } }
            )
              .then(() => {
                res.json({ status: 200, message: "Successfully Added" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
        }
      });
    }
    default:
      res.status(400).json({ success: false });
  }
}
