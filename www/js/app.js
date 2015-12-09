// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ui.router'])

.controller('LoginCtrl', function($scope, $state) {
   

 
  $scope.data = {};
 
  $scope.signupEmail = function(){
   
    //Create a new user on Parse
    var user = new Parse.User();
    user.set("username", $scope.data.username);
    user.set("password", $scope.data.password);
    user.set("email", $scope.data.email);
   
    // other fields can be set just like with Parse.Object
    user.set("somethingelse", "like this!");
   
    user.signUp(null, {
      success: function(user) {
        $state.go('user');
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
   
  };
 
  $scope.loginEmail = function(){
    Parse.User.logIn($scope.data.username, $scope.data.password, {
      success: function(user) {
        // Do stuff after successful login.
        console.log(user);
        $state.go('user');
        
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        alert("error!");
      }
    });
  };

  //LOGOUT
  $scope.logout = function() {
    console.log('logout button clicked');
    Parse.User.logOut( {
      success: function() {
        $state.go('login');
      },
      error: function(error) {
        alert('error');
      }
    });

  };
 
})
.controller('UserCtrl', function($scope, $state, $http, $timeout) {

  //FOR DELETING A POST

    $scope.data = {
      showDelete: false
    };
    
    $scope.edit = function(item) {
      alert('Edit Item: ' + item.id);
    };

    $scope.onItemDelete = function(post, $index) {
    $scope.posts.splice($scope.posts.indexOf(post), 1);
    var Post = Parse.Object.extend("Post");
    var query = new Parse.Query(Post);
    query.equalTo("objectId", post.id);
    query.find({
      success: function(post) {
        console.log('post to delete is', post);
        post[0].destroy({});
        // $scope.$apply(function () {
        //   $scope.posts.splice(index, 1);    
        // });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  };

   $scope.shouldShowDelete = false;
   $scope.shouldShowReorder = false;
   $scope.listCanSwipe = true;
  var currentUser = Parse.User.current();

  if (currentUser) {
      $scope.user = currentUser;
      console.log("current user is: ", currentUser);
  } else {
      // show the signup or login page
      
  }

  //VIEW POSTS
    $scope.posts = [];
    var Post = Parse.Object.extend("Post");
    var query = new Parse.Query(Post);
    query.equalTo("createdBy", Parse.User.current());
    query.find({
      success: function(results) {
        $scope.$apply(function () {
          for (var i = 0; i < results.length; i++) {
            var post = results[i];
            $scope.posts.unshift(post);
          }
            
        });
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });

    //TO UNWRAP PROMISES
    var promiseToArray = function (promise) {
            
            promise.then(function (data) {
              
              
                    console.log('data is: ', data);
                    return data;
                
            });
           
        };

    //MAKE A NEW POST
    $scope.giphyPost= false;
  $scope.data = {};
  $scope.newPost = function() {
    var Post = Parse.Object.extend("Post");
    var post = new Post();
    post.set("createdBy", Parse.User.current());
    post.set("content", $scope.data.content);
    post.save(null, {
      success: function(post) {
        $scope.$apply(function() {
          $scope.data = {};
          
          $scope.posts.unshift(post);
          $scope.giphy = $http.get('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=congratulations');
          
          console.log('$scope.giphy is: ', $scope.giphy);
          $scope.image = $scope.giphy.then(function(data) {
            $scope.giphyImage =  data.data.data.fixed_height_downsampled_url;
            
            
          });
            console.log("scope.image is: ", $scope.image);
        });
        $scope.giphyPost = true;
        $timeout(function() {
                $scope.giphyPost = false;
            }, 5000);
       
      },
      error: function(post, error) {
        alert('Failed to create new post, with error code: ' + error.message);
      }
    });

  };

    // DELETE A POST
    $scope.deletePost = function(post, index) {
          var Post = Parse.Object.extend("Post");
          var query = new Parse.Query(Post);
          query.equalTo("objectId", post.id);
          query.find({
            success: function(post) {
              console.log('post to delete is', post);
              post[0].destroy({});
              $scope.$apply(function () {
                $scope.posts.splice(index, 1);    
              });
            },
            error: function(error) {
              alert("Error: " + error.code + " " + error.message);
            }
          });
    };
    // var query = new Parse.Query("Post");
    // query.equalTo("createdBy", Parse.User.current());
    // console.log("query is: ", query);
    // $scope.postContent = query.get('content');
    // console.log("posts are: ", $scope.postContent);
    
})
// .controller('GiphyCtrl', function($scope, $http) {
//     if($scope.search === undefined){
//         $scope.search = "Sherlock Holmes";
//         fetch();
//       }

// })
.config(function($stateProvider, $urlRouterProvider) {
 
  $stateProvider
  .state('login', {
    url: '/',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'LoginCtrl'
  })
  .state('signin', {
    url: '/signin',
    templateUrl: 'templates/signin.html',
    controller: 'LoginCtrl'
  })
  .state('user', {
    url: '/user',
    templateUrl: 'templates/user-show.html',
    controller: 'UserCtrl'
  })
  .state('posts', {
    url: '/user/posts',
    templateUrl: 'templates/post-index.html',
    controller: 'UserCtrl'
  });
 
  $urlRouterProvider.otherwise("/");
 
})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  Parse.initialize("9Ny0fZjJ5t9FD8l5bMsXb1ZxqKtEw4dZPnoW90Vs", "5w700lCbL1XufUPR6d9Zt49d7fkU7wVZuw074e4B");
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    
  });
});


