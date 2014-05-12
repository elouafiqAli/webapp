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
app.factory('bookManager',
    ['$kinvey',"$location","sharedBooks", function( $kinvey, $location) {
        var book = {
            books: [],
            emptyList: true,
            shelve: [],
            shelve_books: [],
            handleError: function (Description) {
                this.submittedError = true;
                this.errorDescription = Description;
            },
            fetchBook: function (searchInput) {
                //Check Validity of input
                var inputISBN = searchInput;
                for (i in this.books) {
                    var book = this.books[i];
                    if (book.ISBN_10 == inputISBN || book.ISBN_13 == inputISBN) {
                        handleError("Book already added");
                        return;
                    }
                }
                /*for(i in this.shelve_books){var book = this.shelve_books[i].book;
                 if(book.ISBN_10 == inputISBN || book.ISBN_13 == inputISBN){
                 handleError("Book already added");
                 return;
                 }
                 }*/
                var _this = this;
                $kinvey.execute('bookSearch', {ISBN: inputISBN}).then(function (response) {
                        if (response.success) {
                            var _book = response.book;

                            // check if book already added to the list
                            for (i in _this.books) {
                                var book = _this.books[i];
                                console.log(book.ISBN_10 + ' ' + inputISBN);
                                if (book.ISBN_10 == _book.ISBN_10 || book.ISBN_13 == _book.ISBN_13) {
                                    handleError("Book already added to the list");
                                    return;
                                }
                            }
                            _this.books.push(_book);
                            if (_this.emptyList) _this.emptyList = false;

                        } else {
                            handleError("Couldn't find the book with the ISBN " + inputISBN);
                        }
                    }, function (error) {
                        handleError("Couldn't find the book with the ISBN " + inputISBN);
                    }
                );
            },
            removeBook: function (index) {
                this.books.splice(index, 1);
            },
            addBook: function (ISBN) {

                if (!this.emptyList) {
                    var bookList;
                    var shelve_name = "myCollection";
                    for (i in this.books) {
                        var _book = this.books[i];
                        delete _book.$$hashKey; //remove angular ng-repeat added attribute
                        var bookObject = {
                            book: _book,
                            shelve: shelve_name,
                            owner: $kinvey.getActiveUser()
                        }
                        $kinvey.DataStore.save('objects', bookObject, {
                            exclude: ['owner'],
                            relations: {
                                book: 'books',
                                owner: 'user'
                            }
                        }).then(function (response) {
                            var _user = $kinvey.getActiveUser();
                            var shelve = _user.shelve || {};
                            shelve.books = shelve.books || [];
                            shelve.owner = $kinvey.getActiveUser();
                            shelve.name = "myCollection" || shelve.name;
                            _book.ISBN_13 == undefined ? shelve.books.push(_book.ISBN_10) : shelve.books.push(_book.ISBN_13);
                            _user.shelve = shelve;
                            $kinvey.User.update(_user);
                            $kinvey.DataStore.save('shelves', shelve, {
                                exclude: ['owner'],
                                relations: {
                                    owner: 'user'
                                }
                            });
                        }, function (error) {
                            //show some error
                        });
                    }
                    for (i in this.books) {
                        var _book = this.books[i];
                        this.shelve_books.unshift({book: _book});
                    }
                    this.books = [];
                }
            },
            init: function () {
                var shelve_query = new $kinvey.Query();
                var _this = this;
                shelve_query.equalTo("owner._id", $kinvey.getActiveUser()._id).equalTo("shelve", "myCollection");
                $kinvey.DataStore.find('objects', shelve_query, {
                    relations: { owner: 'user', book: 'books'},
                    success: function (response) {
                        _this.shelve_books = response;
                    }
                });
            }
        }
        return book;

}]);
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
	otherwise({
		 redirectTo: '/main/first_time'
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
