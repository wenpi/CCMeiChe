(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "ccmeiche@0.1.0/pages/addcar.js";
var _1 = "ccmeiche@0.1.0/pages/finishorder.js";
var _2 = "ccmeiche@0.1.0/pages/home.js";
var _3 = "ccmeiche@0.1.0/pages/login.js";
var _4 = "ccmeiche@0.1.0/pages/mod/autocomplete.js";
var _5 = "ccmeiche@0.1.0/pages/mod/countdown.js";
var _6 = "ccmeiche@0.1.0/pages/mod/multiselect.js";
var _7 = "ccmeiche@0.1.0/pages/mod/popmessage.js";
var _8 = "ccmeiche@0.1.0/pages/mod/popselect.js";
var _9 = "ccmeiche@0.1.0/pages/mod/singleselect.js";
var _10 = "ccmeiche@0.1.0/pages/mod/uploader.js";
var _11 = "ccmeiche@0.1.0/pages/myinfos.js";
var _12 = "ccmeiche@0.1.0/pages/myorders.js";
var _13 = "ccmeiche@0.1.0/pages/order.js";
var _14 = "ccmeiche@0.1.0/pages/preorder.js";
var _15 = "ccmeiche@0.1.0/pages/recharge.js";
var _16 = "ccmeiche@0.1.0/pages/tpl/addcar.html.js";
var _17 = "ccmeiche@0.1.0/pages/tpl/finishorder.html.js";
var _18 = "ccmeiche@0.1.0/pages/tpl/mixins.html.js";
var _19 = "ccmeiche@0.1.0/pages/tpl/preorder.html.js";
var _20 = "zepto@^1.1.3";
var _21 = "util@^1.0.4";
var _22 = "events@^1.0.5";
var entries = [_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_10,_11,_12,_13,_14,_15,_16,_17,_18,_19];
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_4, [_20,_21,_22], function(require, exports, module, __filename, __dirname) {
var $ = require("zepto");
var util = require("util");
var events = require("events");

function Autocomplete(input, pattern, parser){
  input = $(input);
  var self = this;
  var list = $("<ul class='autocomplete' />");
  this.list = list;
  input.after(list);
  var delay = 350;
  var timeout = null;
  parser = parser || function(item){return item;}
  input.on("keyup", function(){
    console.log("comming");
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      var value = input.val().trim();
      if(!value){return;}
      $.ajax({
        method: "GET",
        dataType: "json",
        url: pattern.replace("{q}",value)
      }).done(function(data){
        if(!data.length){return;}
        list.empty();
        data.map(parser).forEach(function(item,i){
          var li = $("<li>" + item + "</li>");
          li.on("touchend",function(){
            input.val(item);
            self.emit("select",data[i]);
            self.hide();
          });
          $(list).append(li);
        });
        var packup = $("<li class='packup'>收起</li>");
        packup.on("touchend",function(){
          self.hide();
        });
        list.append(packup);
        self.show();
      }).fail(function(){
        console.log("failed");
      });
    },delay);
  });
}

util.inherits(Autocomplete, events);

Autocomplete.prototype.show = function(){
  this.list.show();
}


Autocomplete.prototype.hide = function(){
  this.list.hide();
}


exports.init = function(input, parser){
  var pattern = input.attr("data-pattern");
  if(!pattern){return;}
  return new Autocomplete(input, pattern, parser);
}
}, {
    entries:entries,
    map:globalMap
});
})();