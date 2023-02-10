const express = require("express");
const departmentController = require("../controllers/departmentController");
const { protect } = require("../shared/middlewares/protectMiddleware");
const { restrictTo } = require("../shared/middlewares/restrictMiddleware");
const router = express.Router();

router
  .route("/")
  .get(
    protect,
    restrictTo("department admin", "faculty admin"),
    departmentController.getAllDepartments
  )
  .post(
    protect,
    restrictTo("department admin"),
    departmentController.createDepartment
  );

router
  .route("/:id")
  .get(
    protect,
    restrictTo("department admin"),
    departmentController.getDepartment
  )
  .patch(
    protect,
    restrictTo("department admin"),
    departmentController.updateDepartment
  )
  .delete(
    protect,
    restrictTo("department admin"),
    departmentController.deleteDepartment
  );

module.exports = router;
