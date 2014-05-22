var controllers = angular.module('controllers', []);
function handleError(Description){
    $scope.submittedError = true;
    $scope.errorDescription = Description;
}
controllers.controller('header',   ['$scope', '$kinvey', "$location","redriss", function($scope, $kinvey, $location,redriss) {
    window.setInterval(function(){$scope.visible = redriss.get('header_visible');},300);


}]);
controllers.controller('LoginController',

		['$scope', '$kinvey', "$location","redriss", function($scope, $kinvey, $location,redriss) {
            console.log("looool");
            $scope.visible = redriss.set('header_visible',false);

            $scope.login = function () {
                var isFormInvalid = false;

                //check is form valid
                        /*
                        if ($scope.loginForm.email.$error.email || $scope.loginForm.email.$error.required) {
                            $scope.submittedEmail = true;
                            isFormInvalid = true;
                        } else {
                            $scope.submittedEmail = false;
                        }
                        if ($scope.loginForm.password.$error.required) {
                            $scope.submittedPassword = true;
                            isFormInvalid = true;
                        } else {
                            $scope.submittedPassword = false;
                        }
                        if (isFormInvalid) {
                            return;
                        }*/

                console.log("call login");
                //Kinvey login starts
                        var promise = $kinvey.User.login({
                            username: $scope.username,
                            password: $scope.password
                        });
                        promise.then(
                            function (response) {
                                //Kinvey login finished with success
                                $scope.submittedError = false;
                                $location.path("/main/addBook");
                                $scope.visible = redriss.set('header_visible',true);
                            },
                            function (error) {
                                //Kinvey login finished with error
                                $scope.submittedError = true;
                                $scope.errorDescription = error.description;
                                console.log("Error login " + error.description);//
                            }
                        );
			}
		    $scope.forgetPassword = function () {
		        console.log("forgetPassword");
		        $location.path("main/password_reset");
		    }
		    $scope.goToSignUp = function () {
		        console.log("signUp");
                redriss.set('header_visible',false);
		        $location.path("/main/signup");
		    }
		}]);
controllers.controller('ResetPasswordController', 
		['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
            $scope.resetPassword = function () {
                //check are form fields correct
                if ($scope.resetPasswordForm.email.$error.email || $scope.resetPasswordForm.email.$error.required) {
                    $scope.submitted = true;
                    return;
                }else{
                    $scope.submitted = false;
                }
                //Kinvey reset password starts
                var promise = $kinvey.User.resetPassword($scope.email);
                promise.then(
                    function () {
                        //Kinvey reset password finished with success
                        console.log("resetPassword");
                        $location.path("main/login");
                    });
            }

            $scope.logIn = function () {
                console.log("logIn");
                $location.path("/main/login");
            }
		}]);
controllers.controller('SignUpController', 
		['$scope', '$kinvey', "$location","redriss", function($scope, $kinvey, $location,redriss) {

			$scope.signUp = function () {

				console.log("signup");
                var isFormInvalid = false;
               /*
                //check is form valid
                if ($scope.registrationForm.email.$error.email || $scope.registrationForm.email.$error.required) {
                    $scope.submittedEmail = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedEmail = false;
                }
                if ($scope.registrationForm.password.$error.required) {
                    $scope.submittedPassword = true;
                    isFormInvalid = true;
                } else {
                    $scope.submittedPassword = false;
                }
                if (isFormInvalid) {
                    return;
                }*/

                //Kinvey signup starts
				var promise = $kinvey.User.signup({
                     fullname: $scope.fullname,
		             username: $scope.email,
		             password: $scope.password,
		             email: $scope.email,
                     first_time : 1
		         });
				console.log("signup promise");
				promise.then(
						followSignup,
                    failedSignup
				);
			};
            function followSignup(response){
                //Kinvey signup finished with success
                $scope.submittedError = false;
                console.log("signup success");
                $location.path("/main/first_time");
            }
            function failedSignup(error){
                $scope.submittedError = true;
                $scope.errorDescription = error.description;
                console.log("signup error: " + error.description);
            }
           $scope.goToSignIn = function(){
               console.log(redriss);
               redriss.set('header_visible',false);
               $location.path('/main/signin');
           }
		}]);
controllers.controller('LoggedInController', 
		['$scope', '$kinvey', '$location', function($scope, $kinvey, $location)  {
            $scope.logout = function () {
                console.log("logout");

                //Kinvey logout starts
                var promise = $kinvey.User.logout();
                promise.then(
                    function () {
                        //Kinvey logout finished with success
                        console.log("user logout");
                        $kinvey.setActiveUser(null);
                        $location.url("../#/main/first_time");
                    },
                    function (error) {
                        //Kinvey logout finished with error
                        alert("Error logout: " + JSON.stringify(error));
                    });
            }

			$scope.verifyEmail = function () {
			    var user = $kinvey.getActiveUser();

                //Kinvey verifying email starts
			    var promise = $kinvey.User.verifyEmail(user.username);
                promise.then(
			        function() {
                        //Kinvey verifying email finished with success
			            alert("Email was sent");
			        }
                );
			}
			$scope.username = $kinvey.getActiveUser().username;

            $scope.showEmailVerification = function () {
                var activeUser = $kinvey.getActiveUser();
                if (activeUser != null) {
                    //check is user confirmed email
                    var metadata = new $kinvey.Metadata(activeUser);
                    var status = metadata.getEmailVerification();
                    console.log("User email " + status + " " + activeUser.email);
                    if (status === "confirmed" || !(!!activeUser.email)) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        }]);

controllers.controller('addBooks',
    ['$scope', '$kinvey', "$location","sharedBooks", function($scope, $kinvey, $location, sharedBooks) {
    $scope.sharedBooks = sharedBooks;
    $scope.searchBooks = '';
    $scope.searchInput ='';
    $scope.books = [];
    $scope.emptyList = true;
    $scope.searchInput ='';
    $scope.shelve = [];
    $scope.shelve_books =[];

    var CHECK_BOOK_EXISTENCE= false;
    $scope.imageResizer = function(imageLink){
        var _image = imageLink.split('zoom=1');
        return _image[0].concat('zoom=2').concat(_image[1]);

    };
    $scope.searchInsideBook = function(book){
        delete book.$$hashKey;
        $scope.sharedBooks.setBook(book);
        $location.path("main/searchInside/"+book.ISBN_13);
    }
    function handleError(Description){
        console.log("handeling error "+Description);
        $scope.submittedError = true;
        $scope.errorDescription = Description;
    }
    $scope.fetchBook = function(){
        //Check Validity of input
        var inputTitle = $scope.searchInput;
        if(CHECK_BOOK_EXISTENCE){
            for(i in $scope.books){var book = $scope.books[i];
                //book.imageLinks.thumbnail=$scope.imageResizer(book.imageLinks.thumbnail);
                $scope.books[i] = book;
                if(book.ISBN_10 == inputISBN || book.ISBN_13 == inputISBN){
                    handleError("Book already added");
                    return;
                }
            }
        }
        $kinvey.execute('bookSearch',{inTitle: inputTitle}).then(function(response){
                if(response.success){
                    var _books = response.books;
                    $scope.searchResults = response.books;
                }else{
                    handleError("Couldn't find the book with the title "+inputISBN);
                }
            },function(error){
                handleError("Couldn't find the book with the ISBN "+inputISBN);
            }
        );
    }
    $scope.addBookToList = function(book){
        if(CHECK_BOOK_EXISTENCE) {
            for (i in $scope.books) {
                var _book = $scope.books[i];
                if (book.ISBN_10 == _book.ISBN_10 || book.ISBN_13 == _book.ISBN_13) {
                    handleError("Book already added to list");
                    return false;
                }
            }
        }
        $scope.books.push(book);

    };
    $scope.removeBook = function(index){
        $scope.books.splice(index,1);
    }
    $scope.addBook =  function(callback,wizard,bookshelve){
        if($scope.books.length < 5){
            console.log('doing callback with params '+ wizard);
            handleError("Please enter "+ (5-$scope.books.length) +" additional books");
        }else if($scope.books.length >= 5){
            console.log("I don't know how it got here "+$scope.books.length );
            var bookList;
            var shelve_name = bookshelve;
            for(i in $scope.books) { var _book = $scope.books[i];
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
                }).then(function(response){
                     var _user =$kinvey.getActiveUser();
                     var shelve = _user.shelve || {} ;
                         shelve.books = shelve.books  || [] ;
                         shelve.owner = $kinvey.getActiveUser();
                         shelve.name = bookshelve|| shelve.name;
                         _book.ISBN_13 == undefined ? shelve.books.push(_book.ISBN_10) : shelve.books.push(_book.ISBN_13);
                     _user.shelve = shelve;
                     $kinvey.User.update(_user);
                     $kinvey.DataStore.save('shelves',shelve,{
                         exclude: ['owner'],
                         relations: {
                             owner: 'user'
                         }
                     });
                 },function(error){
                 //show some error
                 });
            }
            for(i in $scope.books){ var _book = $scope.books[i];
                $scope.shelve_books.unshift({book: _book});
            }
            $scope.books = [];

            if(callback){
                // saying that the user has finished the ste[s
                var user = $kinvey.getActiveUser();
                console.log(user.username);
                user.first_time++;
                $kinvey.User.update(user);
                callback(wizard);
            }
        }
    }
    function onLoad(){
        handleError("please enter at least 5 books to your private library");
        var shelve_query= new $kinvey.Query();
        var user = $kinvey.getActiveUser();
        console.log(user);
        shelve_query.equalTo("owner._id",user._id).equalTo("shelve","myCollection");
        $kinvey.DataStore.find('objects',shelve_query,{
            relations: { owner:'user',book:'books'},
            success: function(response){
                if(response.length > 0){
                    for(i in response){var object = response[i];
                       // console.log(response[i]);

                        if(object.book.imageLinks!=undefined){
                            //console.log(object.book.imageLinks != undefined);
                           // book.imageLinks.thumbnail=$scope.imageResizer(book.imageLinks.thumbnail);
                            //console.log(book.imageLinks.thumbnail);
                            $scope.shelve_books.push(object);
                        }

                    }
                }

            }
        });
    }
    onLoad();
}]);
controllers.controller('firstTimeWizard',
    ['$scope', '$kinvey', "$location","redriss", function($scope, $kinvey, $location,redriss) {
        var _wizard = {
            steps: [true,false],
            index : 0,
            next : function(wizard){
                var _this = wizard;
                console.log(this);
                if( _this.index <  _this.steps.length-1){
                    _this.steps[_this.index]= false;
                    _this.steps[++_this.index] = true;
                    return true;
                }else{
                    return false;
                }
            },
            back : function(call){
                if( this.index > 0){
                    this.steps[this.index]= false;
                    this.steps[--this.index] = true;
                    if(call) call();
                    return true;
                }else{
                    return false;
                }
            },
            test : function(call){
                if(this.index == this.steps.length-1){
                    $scope.finalAction();
                }else{
                    return false;
                }
            }
        };
        $scope.finalAction =function(_communities){
          var promise = $kinvey.Social.connect(null, 'twitter', {
                success: function(response) {
                    console.log(response);
                }
            });
        };
        $scope.r = {
            books : 0,
            wishlist:1,
            communities: 2
        };
        $scope.wizard = _wizard;

    }]);

controllers.controller('communitySubscription',
    ['$scope', '$kinvey', "$location",'redriss', function($scope, $kinvey, $location, redriss) {
    $scope.selected_community ={};
    var _communities = {
        selected_community: 0,
        current_user : {},
        list_of_communities : [],
        myCommunities : [],
        onLoad : function() {
            this.current_user = $kinvey.getActiveUser();
            var _this = this;
            var promise = $kinvey.DataStore.find("communities",null);
            promise.then(function (response) {

                _this.list_of_communities = response;

                }, function (error) {

                });

            var query= new $kinvey.Query();
            query.equalTo('username',_this.current_user.username);
            var fetchingMyCommunities = $kinvey.DataStore.find("comuns",query,{relations:{community:'communities'}});
            fetchingMyCommunities.then(function(response){
                console.log("we got in here at least");
                for(i in response) {
                    if(response[i].community != null)
                        _this.myCommunities.push(response[i].community);
                }
                _this.watch();
            });

        },
        watch:  function(){
            for(i in this.myCommunities){
                for(j in this.list_of_communities) {
                    if(this.myCommunities[i].name == this.list_of_communities[j].name) {
                        this.list_of_communities.splice(j,1);
                    }
                }
            }
        },
        joinCommunity: function(community, index){

           var community = community;

               var _comun = {
                   username: this.current_user.username,
                   member: this.current_user,
                   community: community
               };
               var _this = this;
               var joinRequest= $kinvey.DataStore.save('comuns',_comun,{
                   exclude: ['member','community'],
                   relations:{
                        member: 'user',
                        community: 'communities'
                   },
                   success:function(response){
                       _this.myCommunities.push(_this.list_of_communities.splice(index,1)[0]);
                       return true;
                   },error:function(error){
                       return false;
                   }
               });
               return joinRequest;
        }
    };
    redriss.set('_communities',_communities);
    $scope.communities = redriss.get('_communities',_communities);
    $scope.communities.onLoad();
    $scope.secretcode = '';
    $scope.status = {
        secret_code: {
            error: false,
            description: ''
        }
    };
        $scope.index = -1;

    $scope.chose = function(index){
        console.log(index);
        $scope.index = index;
        $scope.communities.selected_community = index;
        console.log($scope.communities.list_of_communities[index]);
        $scope.selected_community = $scope.communities.list_of_communities[index];
    }
    $scope.validate = function() {

        if ($scope.secretcode != $scope.selected_community.code) {
            $scope.status.secret_code.error = true;
            $scope.status.secret_code.description = "invalid secret code";
        } else {
            $scope.status.secret_code.error = false;
            $scope.status.secret_code.description = "Congratulations you just joined the Group";
        }
        var validated = $scope.communities.joinCommunity($scope.selected_community,$scope.index);
        //this
        // $scope.status.secret_code.description = (($scope.status.secret_code.error=!validated)? "invalid secret code":"Congratulations you just joined the Group");
        // is the same as this

        alert($scope.status.secret_code.description);
    };
    $scope.createCommuntiy = function(){
            console.log('lol');
            $location.path('/main/create_community');
    };

}]);
controllers.controller('searchInside',
    ['$scope', '$kinvey', "$location","sharedBooks","$routeParams", function($scope, $kinvey, $location, sharedBooks, $routeParams){
        $scope.ISBN = $routeParams.ISBN_13;
        $scope.book = sharedBooks.getBook();
        $scope.submittedError = false;
        $scope.errorDescription = '';
        $scope.searchResults =null;
        $scope.fetchBook = function(ISBN){
            //Check Validity of input
            var inputISBN = ISBN;

            $kinvey.execute('bookSearch',{ISBN: inputISBN}).then(function(response){
                    console.log(response);
                    if(response){
                        $scope.book = response.book;
                    }else{
                        console.log("Couldn't find the book with the ISBN "+inputISBN);
                    }
                },function(error){
                    console.log("Couldn't find the book with the ISBN "+inputISBN);
                }
            );
        };

        $scope.searchInsideBook = function(){
            var _query = $scope.searchInput;
            var _identifier = $scope.book.ISBN_13;
            var search_request = $kinvey.execute("insearch",{query:_query,id:_identifier});
            search_request.then(function(response){
                if(response.results){
                    console.log('in here '+response.results);
                    $scope.submittedError = false;
                    $scope.searchResults =response.results;
                }else{
                    console.log(response);
                    $scope.searchResults = response;
                }
            });
        };
        $scope.fetchBook($routeParams.ISBN);
    }]);
controllers.controller('createCommunity',
    ['$scope', '$kinvey', '$location','redriss','$routeParams', function($scope, $kinvey, $location, redriss,$routeParams) {
        var community = {
           name: "",
           icon: "",
           description:"",
           city:"",
           country:"",
           expected:"",
           publicLink:"",
           groupLink:""
        };
        $scope.community = community;
        $scope.registerCommunity = function(community){
            console.log(community);
            community.creator = $kinvey.getActiveUser();
            $kinvey.DataStore.save('proposals',community,{
                exclude: ['creator'],
                relations:{
                    creator: 'user'
                }
            }).then(function(success){
                //alert('we have created your community with success');
            },function(error){
                //alert('naaaa '+error);
            });
        }
    }]);
controllers.controller('community',
    ['$scope', '$kinvey', '$location','redriss','$routeParams', function($scope, $kinvey, $location, redriss,$routeParams) {

    var _community = {
        members:[],
        library : [],
        searchResults : {},
        initFromName: function(name){
        },
        init : function(name){
            var _this= this;
            var _promiseStack = [];

            var findCommunityByName = new $kinvey.Query();
            findCommunityByName.equalTo('name',name);

            $kinvey.DataStore.find('communities',findCommunityByName).then(function(response){
                if(response.length == 0 ){

                }else{ _this.information = response[0];

                    var findCommunityMembers = new $kinvey.Query();
                    findCommunityMembers.equalTo('name',name);
                    var promise= $kinvey.DataStore.find('comuns',findCommunityMembers,{relations:{member:'users'}});
                    var __this = _this;
                    promise.then(function(response){
                        if(response.length == 0){

                        }else{
                            for(i in response){
                                _this.members.push(response[i].member);
                            }
                        }
                    }, function(error){

                    }).then(function(res) {

                            for (i in _this.members) {
                                var member = _this.members[i];
                                var findCommunityBooks = new $kinvey.Query();
                                findCommunityBooks.equalTo('owner._id', member._id);
                                var promise = $kinvey.DataStore.find('objects', findCommunityBooks, {relations: {book: 'books'}}).then(function (response) {
                                    if (response.length == 0) {
                                        // throw some error or warning message
                                    } else {

                                        for (i in response) {
                                            var _book = response[i]; __this.library.push(_book);
                                        }
                                    }
                                }, function (error) {
                                    // throw some error that the books collection was difficult to fetch
                                });
                                _promiseStack.push(promise);
                            }
                        }
                    );
                    //LOOL
                }
            }).then(function(){

            });



        }
    };
    $scope.community = _community;
    $scope.community.init($routeParams.community_name);
}]);
controllers.controller('test', function ($scope, $facebook,moment, $kinvey) {
        $scope.isLoggedIn = false;
        $scope.login = function() {
            $facebook.login().then(function(fbResponse) {
                var user = $kinvey.getActiveUser();
                user._socialIdentity = {
                    facebook:{
                        access_token: fbResponse.authResponse.accessToken,
                        expires: (moment().second() + fbResponse.authResponse.expiresIn)
                    }
                };
                $kinvey.User.update(user);
                refresh();
            });
        };
        function refresh() {
            $facebook.api("/me").then(
                function(response) {
                    $scope.welcomeMsg = "Welcome " + response.name;
                    $scope.isLoggedIn = true;
                },
                function(err) {
                    $scope.welcomeMsg = "Please log in";
                });
        }

        refresh();
}
);