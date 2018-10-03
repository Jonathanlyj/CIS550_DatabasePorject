var app = angular.module('LondonTour',[]);

app.controller('nameController', function($scope, $http) {
	$scope.fieldTable1 = [{
    field: 0,
    title: "ID"
  }, {
    field: 1,
    title: "Precise Name"
  }];

	$scope.fieldTable2 = [{
		field: 0,
		title: "Transportation"
	}, {
		field: 1,
		title: "Restaurant"
	}];

	$scope.Submit = function(){
		var trans = $scope.myVar1 ? 1 : 0
		var res = $scope.myVar2 ? 1 : 0
		var hotel = $scope.myVar3 ? 1 : 0
	  var request = $http.get('/preciseSearch/'+  $scope.selected1.field + trans + res + hotel + $scope.name);
	  request.success(function(data) {
	      $scope.data = data;
				if(data.length == 0){
					alert("Not Found")
				}
	  });
		request.error(function(data){
		    console.log('err');
		});
	};
});

app.controller('filterController', function($scope, $http) {

	$scope.fieldTable = [{
    field: 0,
    title: "Whatever"
  }, {
    field: 3,
    title: "At least 4"
  }, {
    field: 9,
    title: "At least 10"
  }];

	$scope.fieldTable2 = [{
    field: 0,
    title: "Whatever"
  }, {
    field: 1,
    title: "Safe Place"
  }];

	$scope.Search = function(){
		var request = $http.get('/filterSearch/'+ $scope.selected1.field + $scope.selected2.field + $scope.selected3.field + $scope.selected4.field + $scope.name );
		request.success(function(data) {
				$scope.data = data;
				if(data.length == 0){
					alert("Not Found")
				}
		});
		request.error(function(data){
				console.log('err');
		});
	};

});

app.controller('SearchController', function($scope, $http) {
  $scope.lat = '';
  $scope.lng = '';
  $scope.clickMe = function(lat, lng) {
    //console.log($scope.PersonName);
    console.log(lat);
    console.log(lng);
    //console.log($scope.lat);
    //console.log($scope.lng);
    $scope.lat = lat;
    $scope.lng = lng;
    var request = $http.get('/searchPlace/'+$scope.lat + '&' + $scope.lng);
    // request.success(function(data){
    // 	$scope.data = data;
    //     if(data.length==0) {
    //         alert("No Result!")
    //         window.close();
    //     }
    // });
    // request.error(function(data){
    // 	console.log('err');
    // });
    request.success(function(data) {
        // $scope.message = "successful!";
        $scope.data = data;
        console.log(data);
        console.log('success!');
    });
    request.error(function(data){
        console.log('err');
    });
  }

});
