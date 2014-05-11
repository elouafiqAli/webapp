var app = angular.module('SignIn-Angular', [ 'kinvey', 'ngRoute', 'controllers' ]);
app.factory("sharedBooks", function(){
    var books = [];
    var mySharedBooks = {};
    var singleBook;
    mySharedBooks.setBook = function(book){
        singleBook = book;
    }
    mySharedBooks.getBook = function(){
        return singleBook;
    }
    mySharedBooks.addBook = function(book) {
        books.push(book);
    };
    mySharedBooks.removeBook = function(book) {
        var index = items.indexOf(book);
        books.splice(index, 1);
    };
    mySharedBooks.books = function() {
        return books;
    };
    return mySharedBooks;

});
 //inject Providers into config block
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/main/searchInside',{
        templateUrl:'main/searchInside.html',
        controller:'searchInside'
    }).
    when('/main/addBook',{
            templateUrl:'main/addBook.html',
            controller:'addBooks'
        }).
	when('/main/login', {
		templateUrl: 'main/login.html',
		controller: 'LoginController'
	}).
	when('/main/password_reset', {
		templateUrl: 'main/password_reset.html',
		controller: 'ResetPasswordController'
	}).
	when('/main/sign_up', {
		templateUrl: 'main/Signup.html',
		controller: 'SignUpController'
	}).
	when('/main/first_time', {
		templateUrl: 'main/addBook.html',
		controller: 'addBooks'
	}).
	otherwise({
		 redirectTo: '/main/dashboard'
	});
}]);
//inject instances (not Providers) into run blocks
app.run(['$location', '$kinvey', '$rootScope', function($location, $kinvey, $rootScope) {

    // Kinvey initialization starts
	var promise = $kinvey.init({
		appKey : 'kid_TeM8TGI1oq',
		appSecret : '828527a891af4953adad8b14087976e6',
        sync      : { enable: true }
	});
	promise.then(function() {
        // Kinvey initialization finished with success
		console.log("Kinvey init with success");
		determineBehavior($kinvey, $location, $rootScope);
	}, function(errorCallback) {
        // Kinvey initialization finished with error
		console.log("Kinvey init with error: " + JSON.stringify(errorCallback));
		determineBehavior($kinvey, $location, $rootScope);
	});
}]);


//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $location, $rootScope) {
	var activeUser = $kinvey.getActiveUser();
	console.log("$location.$$url: " + $location.$$url);
	if (activeUser != null) {
		console.log("activeUser not null determine behavior");
		if ($location.$$url != '/main/dashboard') {
			$location.path('/main/dashboard');
		}
	} else {
		console.log("activeUser null redirecting");
		if ($location.$$url != '/main/sign_up') {
			$location.path('/main/sign_up');
		}
	}
}
