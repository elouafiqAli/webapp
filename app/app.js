var app = angular.module('bobox-webapp', [ 'kinvey', 'ngRoute', 'controllers' ,'ngFacebook','angularMoment']);

 //inject Providers into config block
app.constant('angularMomentConfig', {
    preprocess: 'unix', // optional
    timezone: 'Europe/London' // optional
});
app.config(['$routeProvider','$facebookProvider', function($routeProvider,$facebookProvider) {
	$routeProvider.when('/main/searchInside/:ISBN',{
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
	when('/main/signup', {
		templateUrl: 'main/Signup.html',
		controller: 'SignUpController'
	}).
    when('/main/signin',{
            templateUrl: 'main/login.html',
            controller: 'LoginController'
    }).
	when('/main/first_time', {
		templateUrl: 'main/firstTimeWizard.html',
		controller: 'firstTimeWizard'
	}).
    when('/main/community/:community_name', {
            templateUrl: 'main/community.html',
            controller: 'community'
        }).
	otherwise({
		 //redirectTo: '/main/signin'
	});

    $facebookProvider.setAppId('600246116738644');
}]);
//inject instances (not Providers) into run blocks
app.run(['$location', '$kinvey', '$rootScope','$facebook','redriss', function($location, $kinvey, $rootScope, $facebook,redriss) {
    redriss.set('header_visible',true);
    // Load the facebook SDK asynchronously
    (function(){
        // If we've already installed the SDK, we're done
        if (document.getElementById('facebook-jssdk')) {return;}

        // Get the first script element, which we'll use to find the parent node
        var firstScriptElement = document.getElementsByTagName('script')[0];

        // Create a new script element and set its id
        var facebookJS = document.createElement('script');
        facebookJS.id = 'facebook-jssdk';

        // Set the new script's source to the source of the Facebook JS SDK
        facebookJS.src = '//connect.facebook.net/en_US/all.js';

        // Insert the Facebook JS SDK into the DOM
        firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());
    // Kinvey initialization start
	var promise = $kinvey.init({
		appKey : 'kid_TeM8TGI1oq',
		appSecret : '828527a891af4953adad8b14087976e6',
        sync      : { enable: true }
	});
	promise.then(function() {
        // Kinvey initialization finished with success
		console.log("Kinvey init with success");
        redriss.set('header_visible',true);
		determineBehavior($kinvey, $location, $rootScope);
	}, function(errorCallback) {
        // Kinvey initialization finished with error
		console.log("Kinvey init with error: " + JSON.stringify(errorCallback));
        redriss.set('header_visible',true);
		determineBehavior($kinvey, $location, $rootScope);
	});
}]);


//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $location, $rootScope) {
	var activeUser = $kinvey.getActiveUser();
	console.log("$location.$$url: " + $location.$$url);

	if (activeUser != null) {
		console.log("activeUser not null determine behavior");
        console.log(activeUser.first_time);
        if(activeUser.first_time){
            $location.path('/main/first_time');
        }else{
            $location.path($location.$$url);
        }
	} else if(window.location.href.split('/')[3].indexOf('welcome.html') == 0) {

	}else{
        console.log("activeUser null redirecting");
        if ($location.$$url != '/main/signin') {
            $location.path('/main/signin');
        }
    }
}

app.factory("redriss", function(){
    var keyValueStore = {};
    var _redriss = {};
    _redriss.set = function(key,value){
        return keyValueStore[key]=value;
    };
    _redriss.get = function(key) {
        return keyValueStore[key];
    };
    _redriss.remove= function(key) {
        delete keyValueStore[key];
    };
    return _redriss;

});
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