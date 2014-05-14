var app = angular.module('SignIn-Angular', [ 'kinvey', 'ngRoute', 'controllers' ]);
app.factory("redriss", function(){
    var keyValueStore = {};
    var _redriss = {};
    _redriss.set = function(key,value){
        keyValueStore[key]=value;
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
		templateUrl: 'main/firstTimeWizard.html',
		controller: 'firstTimeWizard'
	}).
    when('/main/community/:community_name', {
            templateUrl: 'main/community.html',
            controller: 'community'
        }).
	otherwise({
		 redirectTo: '/main/first_time'
	});
}]);
//inject instances (not Providers) into run blocks
app.run(['$location', '$kinvey', '$rootScope','$facebook', function($location, $kinvey, $rootScope, $facebook) {
    console.log($facebook);
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
app.provider('$FB', function $FBProvider() {
    'use strict';

    /*
     * Options
     */

    var that = this,
        options = {
            // Default option values

            // FB.init params
            // https://developers.facebook.com/docs/javascript/reference/FB.init/
            appId: null,
            cookie: false,
            logging: true,
            status: true,
            xfbml: false,
            authResponse: void 0,
            frictionlessRequests: false,
            hideFlashCallback: null,

            // FB.login options
            // https://developers.facebook.com/docs/reference/javascript/FB.login
            scope: '',
            'enable_profile_selector': false,
            'profile_selector_ids': ''
        };

    function getSetOption(name, val) {
        if (val === void 0) {
            return options[name];
        }
        options[name] = val;
        return that;
    }

    angular.forEach([
        'appId',
        'cookie',
        'logging',
        'status',
        'xfbml',
        'authResponse',
        'frictionlessRequests',
        'hideFlashCallback',
        'scope',
        'enable_profile_selector',
        'profile_selector_ids'
    ], function (name) {
        that[name] = angular.bind(that, getSetOption, name);
    });

    this.option = function (name, val) {
        if (typeof name === 'object') {
            angular.extend(options, name);
            return that;
        }
        return getSetOption(name, val);
    };

    var FB, FBPromise, initPromise, $window, $timeout, $q;

    /*
     * Initialization
     */

    this.$get = [
        '$window', '$timeout', '$q',
        function ($$window, $$timeout, $$q) {
            $q = $$q;
            $window = $$window;
            $timeout = $$timeout;
            return that;
        }
    ];

    /*
     * Helpers
     */

    /* jshint validthis: true */
    function handleResponse(response) {
        if (!response || response.error) {
            this.reject(response && response.error || false);
        }
        else {
            this.resolve(response);
        }
    }

    function addCallbackToPromise(deferred, callback) {
        var promise = deferred.promise;
        if (typeof callback === 'function') {
            promise.then(callback);
        }
        return promise;
    }

    /*
     * Public APIs
     */

    this.load = function () {
        if (!FBPromise) {
            var window = $window,
                deferred = $q.defer();

            // https://developers.facebook.com/docs/javascript/quickstart
            window.fbAsyncInit = function () {
                FB = that.FB = window.FB;
                $timeout(function () {
                    deferred.resolve(FB);
                });
            };

            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = '//connect.facebook.net/en_US/all.js';
                fjs.parentNode.insertBefore(js, fjs);
            }(window.document, 'script', 'facebook-jssdk'));

            FBPromise = deferred.promise;
        }
        return FBPromise;
    };

    this.init = function (params) {
        if (!initPromise) {
            initPromise = that.load().then(function (FB) {
                params = angular.extend({
                    appId: options.appId,
                    cookie: options.cookie,
                    logging: options.logging,
                    status: options.status,
                    xfbml: options.xfbml,
                    authResponse: options.authResponse,
                    frictionlessRequests: options.frictionlessRequests,
                    hideFlashCallback: options.hideFlashCallback
                }, params);

                if (!params.appId) {
                    throw new Error('$FB: appId is not set!');
                }

                FB.init(params);
                return FB;
            });
        }
        return initPromise;
    };

    this.getLoginStatus = function (callback) {
        // https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
        return that.init().then(function (FB) {
            var deferred = $q.defer();

            FB.getLoginStatus(angular.bind(deferred, handleResponse));

            return addCallbackToPromise(deferred, callback);
        });
    };

    this.api = function () {
        var apiArgs = arguments;

        // https://developers.facebook.com/docs/javascript/reference/FB.api
        return that.init().then(function (FB) {
            var deferred = $q.defer(),
                args = Array.prototype.slice.call(apiArgs),
                callback;

            if (typeof args[args.length - 1] === 'function') {
                callback = args.pop();
            }

            args.push(angular.bind(deferred, handleResponse));

            FB.api.apply(FB, args);

            return addCallbackToPromise(deferred, callback);
        });
    };

    this.login = function (callback, opts) {
        // https://developers.facebook.com/docs/reference/javascript/FB.login
        return that.init().then(function (FB) {
            var deferred = $q.defer();

            if (typeof callback !== 'function') {
                callback = null;
                opts = callback;
            }

            function getOpt(name) {
                var val = opts && opts[name];
                return val === void 0 ? options[name] : val;
            }

            FB.login(angular.bind(deferred, handleResponse), {
                scope: getOpt('scope'),
                'enable_profile_selector': getOpt('enable_profile_selector'),
                'profile_selector_ids': getOpt('profile_selector_ids')
            });

            return addCallbackToPromise(deferred, callback);
        });
    };

    this.logout = function (callback) {
        // https://developers.facebook.com/docs/reference/javascript/FB.logout
        return that.getLoginStatus().then(function (response) {
            var deferred = $q.defer();

            if (response.authResponse) {
                FB.logout(angular.bind(deferred, handleResponse));
            }
            else {
                deferred.reject(response);
            }

            return addCallbackToPromise(deferred, callback);
        });

    };

    this.disconnect = function (callback) {
        // http://stackoverflow.com/questions/6634212/remove-the-application-from-a-user-using-graph-api/7741978#7741978
        return that.init().then(function (FB) {
            var deferred = $q.defer();

            FB.api('/me/permissions', 'DELETE', angular.bind(deferred, handleResponse));

            return addCallbackToPromise(deferred, callback);
        });
    };
});

