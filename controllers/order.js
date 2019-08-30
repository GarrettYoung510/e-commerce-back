const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

// sendgrid dependencies
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('SG.pUkng3dsa2NQdsfsdseUXSMdo9gvo7g.-mkH0Cdfs02l7egWVyP2R3KxmVEy7YpC6dsffrbxG8CFEHv4Z-4');

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      req.order = order;
      next();
    });
};

// exports.create = (req, res) => {
//   // console.log("CREATE ORDER: ", req.body);
//   req.body.order.user = req.profile;
//   const order = new Order(req.body.order);
//   order.save((error, data) => {
//     if (error) {
//       return res.status(400).json({
//         error: errorHandler(error)
//       });
//     }
//     res.json(data);
//   });
// };

// change email with your real email address
exports.create = (req, res) => {
  console.log('CREATE ORDER: ', req.body);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
      if (error) {
          return res.status(400).json({
              error: errorHandler(error)
          });
      }
      // send email alert to admin
      // order.address
      // order.products.length
      // order.amount
      const emailData = {
          to: 'birnadam26@gmail.com, garrettyoung510@gmail.com',
          from: 'noreply@ecommerce.com',
          subject: `A new order is received`,
          html: `
          <p>Customer name:</p>
          <p>Total products: ${order.products.length}</p>
          <p>Total cost: ${order.amount}</p>
          <p>Login to dashboard to the order in detail.</p>
      `
      };
      sgMail.send(emailData);
      res.json(data);
  });
};

// Listing orders with all the user's information
exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id, name, address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(orders);
    });
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(order);
    }
  );
};
