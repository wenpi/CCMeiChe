var db = require('../db');
var Model = require('./base');
var _ = require('underscore');
var Order = Model("order");
var async = require('async');

module.exports = Order;


db.bind('order', {
  confirm: function (id, callback) {
    var self = this;
    self.findById(id, function (err, order) {
      if (err || !order) {
        return callback(err);
      }

      if(order.processed){
        var error = new Error();
        error.name = "OrderProcessed";
        return callback(error);
      }

      var now = new Date();
      order.processed = true;
      order.status = "todo";
      order.order_time = new Date();
      self.updateById(id, order, function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, order);
      });
    });
  },
  // 超过十分钟取消订单
  cancelTimeout: function(){
    Order.find({
      "status":"preorder",
      "preorder_time": {
        $lt: new Date( +new Date() - 10 * 60 * 1000)
      }
    }).toArray(function(err,orders){
      if(err){
        return;
      }
      async.map(orders, function(order, done){
        Order.cancel(order._id, "timeout", done);
      });
    });
  },
  cancel: function(id, reason, callback){
    var self = this;
    var reasons = ["payment_cancel","payment_fail","preorder_cancel","order_cancel","timeout"];
    if(reasons.indexOf(reason) == -1){
      return callback("invalid reason:" + reason);
    }
    console.log("cancel order",id,reason);
    self.findById(id, function(err, order){
      if(order.status == "doing"){
        return next({
          code: 400,
          message: "工人已到达，不可取消"
        });
      }
      self.updateById(id, {
        $set: {
          "status": "cancel",
          "cancel_reason": reason,
          "cancel_time": new Date()
        }
      }, function(err){
        if(err){
          return callback(err);
        }
        self._adjustRests(order, callback);
      });
    });
  },
  _adjustRests: function(order, callback){

    var full_time = order.estimated_finish_time - new Date();
    Order.find({
      $and: [
        {
          "worker._id": order.worker._id
        },
        {
          $or: [
            {status:"preorder"},
            {status:"todo"}
          ]
        }
      ]
    }).toArray(function(err,orders){
      orders = orders.filter(function(doc){
        return doc.preorder_time > order.preorder_time
      });
      if(err){
        return callback(err);
      }
      async.map(orders,function(order,done){
        Order.updateById(order._id,{
          $set: {
            estimated_arrive_time: new Date(order.estimated_arrive_time - full_time),
            estimated_finish_time: new Date(order.estimated_finish_time - full_time)
          },
          $addToSet:{
            cancelled_former_order: _.pick(order,"_id")
          }
        }, done);
      }, callback);
    });
  }
});

// 每分钟检查一次超时订单
setInterval(function(){
  Order.cancelTimeout();
}, 60 * 1000);

Order.cancelTimeout();