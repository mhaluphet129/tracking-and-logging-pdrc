import Visitor from "../../database/model/Visitor";
import Admin from "../../database/model/Admin";
import Regions from "../../database/model/Regions";
import dbConnect from "../../database/dbConnect";
import moment from "moment";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;
        switch (mode) {
          case "verify-name": {
            const { name, middlename, lastname } = req.query;
            let countName = 0,
              countMiddleName = 0,
              countLastname = 0,
              total = 0;
            try {
              countName = await Visitor.countDocuments({ name });
              if (middlename != "")
                countMiddleName = await Visitor.countDocuments({
                  middlename,
                });

              countLastname = await Visitor.countDocuments({ lastname });
              total = await Visitor.countDocuments();

              res.json({
                status: 200,
                message: "Success",
                data: { countName, countMiddleName, countLastname, total },
              });
            } catch (err) {
              res
                .status(500)
                .json({ success: false, message: "Error: " + err });
            }
            resolve();
          }

          case "check-admin-exist": {
            return await Admin.find({ role: "superadmin" })
              .then((data) => {
                res.json({ status: 200, message: "Fetch done.", data });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }

          case "update": {
            return await Admin.findOneAndUpdate(
              {},
              { $set: { ...req.query } },
              { returnOriginal: false }
            )
              .then((e) => {
                res.json({
                  status: 200,
                  data: e,
                  message: "System Settings Updated Successfully",
                });
                resolve();
              })
              .catch(() => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }

          case "get-region": {
            return await Regions.aggregate([
              {
                $lookup: {
                  from: "provinces",
                  let: { regionId: "$_id" },
                  pipeline: [
                    { $match: { $expr: { $eq: ["$regionId", "$$regionId"] } } },
                    {
                      $lookup: {
                        from: "citymunicipalities",
                        let: { provinceId: "$_id" },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $eq: ["$provinceId", "$$provinceId"],
                              },
                            },
                          },
                        ],
                        as: "citymunicipalities",
                      },
                    },
                  ],
                  as: "provinces",
                },
              },
              {
                $project: {
                  name: 1,
                  island: 1,
                  "provinces._id": 1,
                  "provinces.name": 1,
                  "provinces.citymunicipalities._id": 1,
                  "provinces.citymunicipalities.name": 1,
                },
              },
            ])
              .then((e) => res.json({ status: 200, data: e }))
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
        }
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { mode } = req.body.payload;
        switch (mode) {
          case "init": {
            let initAdmin = Admin({
              name: "PDRC",
              lastname: "ADMIN",
              email: "admin",
              role: "superadmin",
              password: "1234",
            });

            initAdmin
              .save()
              .then(() => {
                res.json({
                  status: 200,
                  message: "Init admin creation success",
                });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "change-password-admin": {
            const { password } = req.body.payload;
            return await Admin.findOneAndUpdate(
              {},
              {
                $set: {
                  password,
                },
              }
            )
              .then(() => {
                res.json({
                  status: 200,
                  message: "Successfully changed the password",
                });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "update-admin": {
            return await Admin.findOneAndUpdate(
              {},
              { $set: { ...req.body.payload } },
              { new: true }
            )
              .then((e) => {
                res.json({
                  status: 200,
                  data: e,
                  message: "Successfully update your credentials",
                });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "update-visit-time": {
            return await Admin.findOneAndUpdate(
              {},
              { $set: { visitLimit: req.body.payload.visitLimit } }
            )
              .then((e) => {
                res.json({
                  status: 200,
                  data: e,
                  message: "Successfully update the visit time limit",
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
