var controllers = angular.module('controllers', []);


controllers.controller('LoginController',
		['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
			$scope.login = function () {
                var isFormInvalid = false;

                //check is form valid
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
                }

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
                                $location.path('/main/logged_in');
                            },
                            function (error) {
                                //Kinvey login finished with error
                                $scope.submittedError = true;
                                $scope.errorDescription = error.description;
                                console.log("Error login " + error.description);//
                            }
                        );
			}
			$scope.loginFacebook = function () {

                //Kinvey Facebook login starts
		        var promise = $kinvey.Social.connect(null, 'facebook', {
		            create: 'true'
		        });
		        promise.then(
		            function () {
                        //Kinvey Facebook login finished with success
		                console.log("social login Facebook success");
		                $location.path('/main/logged_in');
                        $scope.submittedFacebookError = false;
		            },
		            function (error) {
                        //Kinvey Facebook login finished with error
                        $scope.submittedFacebookError = true;
                        $scope.errorDescription = error.description;
		                console.log("social login Facebook error: " + error.description + " json: " + JSON.stringify(error));
		            }
		        );
		    }

            //Kinvey Twitter login starts
		    $scope.loginTwitter = function () {
		        var promise = $kinvey.Social.connect(null, 'twitter', {
		            create: 'true'
		        });
		        promise.then(
		            function () {
                        //Kinvey Twitter login finished with success
                        $scope.submittedTwitterError = false;
		                console.log("social login Twitter success");
		                $location.path('/main/logged_in');
		            },
		            function (error) {
                        //Kinvey Twitter login finished with error
                        $scope.submittedTwitterError = true;
                        $scope.errorDescription = error.description;
		                console.log("social login Twitter error: " + error.description + " json: " + JSON.stringify(error));
		            }
		        );
		    }
		    $scope.forgetPassword = function () {
		        console.log("forgetPassword");
		        $location.path("main/password_reset");
		    }
		    $scope.signUp = function () {
		        console.log("signUp");
		        $location.path("main/sign_up");
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
                $location.path("main/login");
            }
		}]);
controllers.controller('SignUpController', 
		['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
			$scope.signUp = function () {
				console.log("signup");
                var isFormInvalid = false;

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
                }

                //Kinvey signup starts
				var promise = $kinvey.User.signup({
                     fullname: $scope.fullname,
		             username: $scope.email,
		             password: $scope.password,
		             email: $scope.email
		         });
				console.log("signup promise");
				promise.then(
						function () {
                            //Kinvey signup finished with success
                            $scope.submittedError = false;
							console.log("signup success");
							$location.path("main/first_time");
						}, 
						function(error) {
                            //Kinvey signup finished with error
                            $scope.submittedError = true;
                            $scope.errorDescription = error.description;
							console.log("signup error: " + error.description);
						}
				);
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
                        $location.path("main/login");
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
    ['$scope', '$kinvey', "$location","sharedBooks","bookManager", function($scope, $kinvey, $location, sharedBooks,bookManager) {

        $scope.shardBooks = sharedBooks;
        $scope.bookManager = bookManager;
        $scope.searchInput = '';
        $scope.bookManager.init();
        $scope.searchInsideBook = function (book) {
            delete book.$$hashKey;
            this.sharedBooks.setBook(book);
            $location.path("main/searchInside");
        }
    }]);
controllers.controller('firstTimeWizard',
    ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
        var _wizard = {
            steps: [true,false],
            index : 0,
            next : function(call){
                if( this.index <  this.steps.length-1){
                    this.steps[this.index]= false;
                    this.steps[++this.index] = true;
                    if(call) call();
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
            }
        };
        $scope.r = {
            books : 0,
            communities: 1
        };
        $scope.wizard = _wizard;

    }]);

controllers.controller('communitySubscription',
    ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {

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
            var fetchingMyCommunities = $kinvey.DataStore.find("comuns",query);
            fetchingMyCommunities.then(function(response){
                console.log("we got in here at least");
                for(i in response) {
                    delete response[i].member;
                    _this.myCommunities.push(response[i]);
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
        joinCommunity: function(secretCode,_index){
           var index = _index || this.selected_community;
           var community = this.list_of_communities[index];
           if(secretCode == community.code){

               var _comun = {
                   username: this.current_user.username,
                   member: this.current_user,
                   name: community.name,
                   icon: community.icon,
                   type: community.type,
                   description: community.description
               }
               var _this = this;
               var joinRequest= $kinvey.DataStore.save('comuns',_comun,{
                   success:function(response){
                       _this.myCommunities.push(_this.list_of_communities.splice(index,1)[0]);
                       return true;
                   },error:function(error){
                       return false;
                   }
               });
               return joinRequest;

           }else{
               return false;
           }
        }
    };
    $scope.communities = _communities;
    $scope.communities.onLoad();
    $scope.secretcode = '';
    $scope.status = {
        secret_code: {
            error: false,
            description: ''
        }
    };
    $scope.chose = function(index){
        $scope.communities.selected_community = index;
    }
    $scope.validate = function() {
        var validated = $scope.communities.joinCommunity($scope.secretcode);
        //this
        // $scope.status.secret_code.description = (($scope.status.secret_code.error=!validated)? "invalid secret code":"Congratulations you just joined the Group");
        // is the same as this
        if (validated != true) {
            $scope.status.secret_code.error = true;
            $scope.status.secret_code.description = "invalid secret code";
        } else {
            $scope.status.secret_code.error = false;
            $scope.status.secret_code.description = "Congratulations you just joined the Group";
        }
        alert($scope.status.secret_code.description);
    }

}]);
/*
app.factory("wizard", function(){
    var states = {};
    var sharedData = {};
    var commonAction;
    var myWizard;
    myWizard.setState= function(stateID, stateValue){
        states[state]=stateID;
    }
    myWizard.getState   = function(state){
        return states[state];
    }
    myWizard.addData = function(dataName, data) {
        sharedData[dataName]=data;
    };
    myWizard.getData  = function(dataName){
        return sharedData[dataName];
    }
    return myWizard;

});*/
controllers.controller('searchInside',
    ['$scope', '$kinvey', "$location","sharedBooks", function($scope, $kinvey, $location, sharedBooks){
        $scope.book = sharedBooks.getBook();
        $scope.submittedError = false;
        $scope.errorDescription = '';
        $scope.searchResults =null;

        $scope.searchInsideBook = function(){
            var _query = $scope.searchInput;
            var _identifier = $scope.book.ISBN_13;

            var search_request = $kinvey.execute("insearch",{query:_query,id:_identifier});
            search_request.then(function(response){
                if(response.error){
                    $scope.submittedError = true;
                    $scope.errorDescription =response.error;
                }else{
                    $scope.searchResults = response;
                }
            });
        }
    }]);