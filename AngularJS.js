
var app = angular.module("CostumeFinder", ['ngSanitize', 'ngAnimate'] );

app.filter('unique', function() {

  return function(items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function(item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function(item) {
        var isDuplicateOrBlank = false;
        //console.log(item+"; "+item[filterOn]+"; "+(item[filterOn]==''))

          
        if (item[filterOn]=="") isDuplicateOrBlank=true;  
          
        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicateOrBlank = true;
            break;
          }
        }
        if (!isDuplicateOrBlank) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});

app.filter('MatchingMediaType', function() {
    
   return function(costumes, mediatype) {
        var newList=[];
       
       angular.forEach(costumes, function(costume) {
          
           if (costume["mediatype"].toLowerCase()==mediatype) {
               newList.push(costume);
           }
           
           
       });
       
       
           return newList;
       
   };
});

app.filter('ApplyUserFilters', function() {

    return function(costumes, filters) {
       
        
       
            var newList = [];    
        
            angular.forEach(costumes, function(costume) {                
                
                
                    var addThisCostume = true;    

                    if (addThisCostume) {
                        angular.forEach(filters, function(filter, filtername) { 
                           if (filter!="" && costume[filtername]!=filter) {
                               addThisCostume = false;
                           }
                        });       
                }
                            
                if (addThisCostume) newList.push(costume);                 
            });                           
        
            return newList;        
        }
    
    });

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1) : '';
    }
});

app.filter('GetFilterLabels', function() {

    return function(filters) {
       
        
       
            var newList = [];    
        
            angular.forEach(filters, function(filter, filtername) {    
          
                
                var addThisFilter = (filter!="");  
                
                            
                    if (addThisFilter)
                    {
                        var newLabel=filter;
                        
                        switch(filtername) {
                            case "region":
                                newLabel="from "+filter+" media";
                                break;
                            case "bustsize":
                                newLabel="with "+filter+" bustline";
                                break;
                            case "haircolor":
                                newLabel="with "+filter+" hair";
                                break;
                            case "hairlength":
                                newLabel="with "+filter+" hair";
                                break;
                            case "eyecolor":
                                newLabel="with "+filter+" eyes";
                                break;
                            case "eyewear":
                                newLabel="who wears "+filter;
                                break;
                            default:
                                break;
                        }

                        newList.push(newLabel);             
                    }
            });                           
        
            return newList;        
        }
    
    });



app.controller('CostumeController',function ($http, $scope, $window, $rootScope, $compile, $timeout, $filter) {    
    
    var vm = this;
    
    vm.filteredCharacters={};

    vm.filters = {
        gender:"",
        age:"",
        skintone:"",
        height:"",
        weight:"",
        bustsize:"",
        haircolor:"",
        hairlength:"",
        eyecolor:"",
        eyewear:"",
        region:""
    };
        
    vm.selectedChar=null;
    vm.searchOpen=false;
    vm.searchTerms="";
    vm.hideSupport=false;
    vm.showSplash=true;
    vm.splashText="";
    vm.splashTextColor="#469dd0";
    vm.flippedCard={
        style:"",
        width:300,
        height:393,
        open:false,
        char:null,
        elem:null
    };
    vm.shadowbox=false;
    
    
      var url = 'https://spreadsheets.google.com/feeds/list/1Gg6EjQZdRwrz0-3kxYqteDAWuD8BxlgvFk2DPKJAI-0/od6/public/values?alt=json';
      var parse = function(entry) {
          var name = entry['gsx$name']['$t'];
          var mediatitle = entry['gsx$mediatitle']['$t'];
          var mediatype = entry['gsx$mediatype']['$t'].toLowerCase();
          var age = entry['gsx$age']['$t'].toLowerCase();
          var gender = entry['gsx$gender']['$t'].toLowerCase();
          var skintone = entry['gsx$skintone']['$t'].toLowerCase();
          var height = entry['gsx$height']['$t'].toLowerCase();
          var imageURL = entry['gsx$image']['$t'];
          var region = entry['gsx$region']['$t'];
          var weight = entry['gsx$weight']['$t'].toLowerCase();
          var bustsize = entry['gsx$bustsize']['$t'].toLowerCase();
          var haircolor = entry['gsx$haircolor']['$t'].toLowerCase();
          var hairlength = entry['gsx$hairlength']['$t'].toLowerCase();
          var eyecolor = entry['gsx$eyecolor']['$t'].toLowerCase();
          var eyewear = entry['gsx$eyewear']['$t'].toLowerCase();
          var suggestedretailer = entry['gsx$suggestedretailer']['$t'].toLowerCase();
          
          if (suggestedretailer.indexOf("http") == -1) suggestedretailer="http://"+suggestedretailer;
        
        
          return {
            name: name,
            mediatitle: mediatitle,
            mediatype: mediatype,
            gender: gender,
            age: age,
            skintone: skintone,
            height: height,
            weight: weight,
            bustsize: bustsize,
            haircolor: haircolor,
            hairlength: hairlength,
            eyecolor: eyecolor,
            eyewear: eyewear,
            imageURL: imageURL,
            region: region,
            suggestedretailer: suggestedretailer
          };
    }
    
    $http.get(url)
    .success(function(response) {
      var entries = response['feed']['entry'];
      vm.Costumes = [];
      for (key in entries) {
        var content = entries[key];
        vm.Costumes.push(parse(content));
      }
        vm.filteredCharacters=vm.Costumes;
    });
    
    
    
    vm.clearAllFilters = function () {
        
        angular.forEach(vm.filters, function(value, name) {
            vm.filters[name]="";   
        });
        
    };
    
    vm.NoFiltersCheck = function () {
        
        var noFilters=true;
        
        angular.forEach(vm.filters, function(value, name) {
            if (vm.filters[name]!="") noFilters=false;   
        });
        
        return noFilters;
        
    };
    
    vm.hideSplash = function() {
        vm.showSplash=false;
    }
  
    
    $scope.$watchCollection(function () {
          return vm.filters;
      }, function(current, original) {
          vm.filteredCharacters = $filter("ApplyUserFilters")(vm.Costumes, vm.filters);
      });
   
    
    vm.toggleSearch = function () {
        if (vm.searchOpen=!vm.searchOpen) {
            /*timeout defers the focus until after the search container is displayed*/
            $timeout(function() {
                $("#search-container input").focus();
            }, 0, false);
        }
    };
    
    
    vm.SelectCard = function(char, e) {
        
        var card = e.currentTarget;
        var rect = card.getBoundingClientRect();        
        var applyCSS=document.getElementById("charDetailCard");
        
        
        var el = $("#charDetailCard");
        var front = $("#frontOfCard");
        var back = $("#backOfCard");
        
        front.addClass("flip"); //triggers appearance change
        
       
        
        var fw = card.offsetWidth;
        var fh = card.offsetHeight;     
        
        var bw = parseInt(back.css("width"));
        var bh = parseInt(back.css("height"));
        
        var originx = rect.left+(rect.right-rect.left)/2;
        var originy = rect.top+(rect.bottom-rect.top)/2;        
        
        var x = originx-fw/2;
        var y = originy-fh/2;        
        
        el.css("transition","all 0s"); 
        front.css("width",fw+"px");
        front.css("height",fh+"px");     
        
        applyCSS.offsetHeight;    
        
        el.css("height",Math.max(fh, bh)+"px");
        el.css("width",Math.max(fw, bh)+"px");
        el.css("left",originx-parseInt(el.css("width"))/2+"px");
        el.css("top",originy-parseInt(el.css("height"))/2+"px");
        el.css("visibility","visible"); 
        el.css("transition","all 0s"); 
        el.css("position","fixed");    
        
        front.css("transition", "all 0.5s ease-in"); 
        
        back.css("transform","scaleY("+fh/bh+") rotateY(180deg)");
        back.css("visibility","visible");
        
        applyCSS.offsetHeight;          
        
        el.css("transition", "all 0.5s ease-in"); 
        el.css("left","50%");
        el.css("top","50%");
        el.css("transform","translate(-50%, -50%)");
        el.css("z-index","4");
        el.css("pointer-event","auto");
        front.css("transform","scale("+bh/fh+") rotateY(180deg)");
        front.css("pointer-events","all");
        back.css("transition", "all 0.5s ease-in"); 
        back.css("transform","scale(1) rotateY(0deg)");
        
        
        vm.flippedCard.elem = card;           
        vm.flippedCard.char=char;
        
        vm.shadowbox=true;
        $(vm.flippedCard.elem).addClass("hidden");
        
    };
    
    
    vm.deselectCard = function() {
        
        var el = $("#charDetailCard");
        var front = $("#frontOfCard");
        var back = $("#backOfCard");
        var card=vm.flippedCard.elem; 
        var applyCSS=document.getElementById("charDetailCard");      
        
        front.removeClass("flip"); //triggers appearance change
        
        var ew = el.css("width");
        var eh = el.css("height");
        var fw = parseInt(card.offsetWidth); //what the front card should be
        var fh = parseInt(card.offsetHeight);  
        var bw = parseInt(back.css("width")); //what the back card always is
        var bh = parseInt(back.css("height"));   
        var tw = Math.max(fw,bw); //entire card's target width and height
        var th = Math.max(fh,bh);
        
        //starting point in absolute space
        var startx = $("#charDetailCard").offset().left-parseInt($("#resultsPane").css("margin-left"));
        var starty = $("#charDetailCard").offset().top;
        
        //console.log(startx+" "+starty);
        //target point in absolute space
        var targetx = card.offsetLeft;
        var targety = card.offsetTop;
        //incorporate offset of entire card
        targetx = targetx-(tw-fw)/2;
        targety = targety-(th-fh)/2;
        
        el.css("transition","all 0s");
        el.css("position","absolute");
        el.css("left",startx+"px");
        el.css("top",starty+"px");
        el.css("transform","translate(0,0)");
        
        front.css("transform","scaleY("+(bh/fh)+")");
        front.css("height",fh+"px");        
        front.css("width",fw+"px");
       // front.css("pointer-events","none");
        
       //applies css
        applyCSS.offsetHeight;        
         
        el.css("width",tw+"px"); 
        el.css("height",th+"px"); 
        el.css("left",targetx+"px");
        el.css("top",targety+"px");
        el.css("transition","all 0.5s");
        el.css("z-index","0");
        el.css("visibility","collapse");
        el.css("transition","all 0.5s");
        front.css("transform","scaleY(1) rotate(0deg)");
        front.css("transition","all 0.5s");
        back.css("transform","scaleY("+(fh/bh)+") rotateY(180deg)");
        back.css("transition","all 0.5s");
         
        
        vm.shadowbox=false;        
        $(vm.flippedCard.elem).removeClass("hidden");          
        
    };
 
    
    vm.changeSplash = function() {
        
        switch (vm.splashText) {
            case "":
                vm.splashText="Halloween";
                $scope.$apply();
                clearInterval(vm.splashTimer);
                vm.splashTimer=setInterval(vm.changeSplash,1500);
                break;
            case "Halloween":
                vm.splashText="Dragon Con";
                vm.splashTextColor="#E48000";
                $scope.$apply();
                clearInterval(vm.splashTimer);
                vm.splashTimer=setInterval(vm.changeSplash,1200);
                break;
            case "Dragon Con":
                vm.splashText="Ren Fair";
                vm.splashTextColor="#469dd0";
                $scope.$apply();
                clearInterval(vm.splashTimer);
                vm.splashTimer=setInterval(vm.changeSplash,900);
                break;
            case "Ren Fair":
                vm.splashText="Carnival";
                vm.splashTextColor="#E48000";
                $scope.$apply();
                clearInterval(vm.splashTimer);
                vm.splashTimer=setInterval(vm.changeSplash,800);
                break;
            case "Carnival":
                vm.hideSplash();
                $scope.$apply();
                clearInterval(vm.splashTimer);
                break;
        }
        
    }
    
    vm.splashTimer=setInterval(vm.changeSplash,1000);
    
});


