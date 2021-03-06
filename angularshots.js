if (Meteor.isClient) {
  var app = angular.module("flushotsapp", ['angular-meteor']);
  
  angular.module("flushotsapp").controller("FlushotsController", ['$scope','$meteor', function($scope, $meteor){
    $scope.hours = $meteor.collection(Hours);
    $scope.slots = $meteor.collection(Slots);
    $scope.employee = docCookies.getItem("SCRAPEMAIL");
    if(!$scope.employee){
      $scope.employee = "pbenetis@smithbucklin.com";
    }
    
    $scope.getSlot = function(id){
      $scope.slots.forEach(function(x,y){
         if(x._id == id){
           $scope.currentSlot = x;
         }
       });
      // $scope.currentSlot = $scope.slots.findOne(id);
      // console.log($scope.currentSlot);
    }
    
    $scope.getSlotName = function(id){
      var y = Slots.findOne({_id:id});
      return y.name;
    }
    
    $scope.getSlotCount = function(id){
      var y = Slots.findOne({_id:id});
      return 5 - y.employees.length;
    }
    
    $scope.slotAction = function(id){
      var y = Slots.findOne({_id:id,employees:$scope.employee});
      if(y){
        Meteor.call('removeEmployee', id, $scope.employee, function(err, response){
        });
      } else{
        Meteor.call('insertEmployee', id, $scope.employee, function(err, response){
  
        });
      }
    }
    
    $scope.ownSlot = function(id){
      var y = Slots.findOne({_id:id});
      return y.employees.indexOf($scope.employee) > -1;
    }
    
    $scope.testing = function(x){
      // console.log(x);
    }
  
    
    
  }]);
}

Slots = new Mongo.Collection("slots");
Hours = new Mongo.Collection("hours");


if (Meteor.isServer) {
//   Meteor.publish("slots",function(){
//   return Slots.find({});
// });
  
  Meteor.startup(function () {
    // code to run on server at startup
    
    if(Hours.find().count() === 0){
          if(Hours){
            var hours = [9,10,11,12,13];
            var slots = ["00","15","30","45"];
              
            hours.forEach(function(x,y){
              var h = {
                name: x,
                slots: []
              }
              
              var hourId = Hours.insert(h);
              
              slots.forEach(function(x,y){
                var s = {
                  name: x,
                  employees: []
                }
                var slotId = Slots.insert(s);
                var slot = Slots.findOne({_id:slotId});
                Hours.update({_id:hourId},{$push:{"slots":slotId}});
                console.log(Hours.findOne({_id:hourId}));
              });
            });
          }
        }
  });
  
  Meteor.methods({
    insertEmployee: function(slotId, employee){
      //remove the employee from their current slot
      Slots.update({employees:employee},{$pull:{employees:employee}});
      //add to the new slot
      Slots.update({_id:slotId},{$push:{employees:employee}});
    },
    removeEmployee: function(slotId, employee){
      //remove the employee from their current slot
      Slots.update({employees:employee},{$pull:{employees:employee}});
      //add to the new slot
      //Slots.update({_id:slotId},{$push:{employees:employee}});
    }
  });
}
