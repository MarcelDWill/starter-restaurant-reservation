/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router.route("/search")
  .get(controller.search)
  .all(methodNotAllowed);

router.route("/:reservation_id/status")
  .put(controller.updateStatus)
  .all(methodNotAllowed);

router.route("/:reservation_id/edit")
  .put(controller.update)
  .all(methodNotAllowed);

module.exports = router;
