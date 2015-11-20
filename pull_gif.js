//this project uses 2 API calls
//1. the first returns a list of all dates that landsat 8 took a picture at given coordinates 
//2. the second fetches the meta data of a given image (cloud score, URL etc) nearest a date/coordinate
//3. the URL from the second step has the actual img which must be curled onto our server and put into an array for gifshot.js to make a gif.
//4. gifshot appends the img to the html page.

//Ive put the functions roughly in order of execution.

//Step 1. take user input and format the query object used to create our URL requests.
var queryObj = {};
function createQueryObj() { //this function is called on html page, starts the whole chain of functions
  var begin = document.getElementById("begin").value;
  var end = document.getElementById("end").value;
  var latitude = document.getElementById("latitude").value;
  var longitude = document.getElementById("longitude").value;
      queryObj.date_start = begin;
      queryObj.date_end = end;
      queryObj.latitude = latitude;
      queryObj.longitude = longitude;
  document.getElementById("window").innerHTML = 'Query object created: ' + queryObj.date_start + ' to ' + queryObj.date_end + ' at '+ queryObj.latitude + ' and ' + queryObj.longitude + '<br>';
  document.getElementById
  
  setTimeout(function(){        //these 'setTimeout's are to let the DOM update and print out the progress log.
    getAssetList(queryObj)      //this begins Step 2.
    }, 200);      
}

//Step 2. make the first 'GET' call to see how many entries and on what dates NASA has pictures of our location.
function getAssetList(target) {
  var url = mkAssetStr(target);  //'make Asset String' formats the url for the get call
  
  setTimeout(function(){
    httpGetSync(url, getImgUrl)
    }, 200);
}

function getImgUrl(target) {  //getImgUrl is called back on the result of our first GET call        
  var resultList = orderResultList(toJSONObj(target).results);      //'target'contains property 'result' which is a list of all dates we have a picture at the requested location.
  var dateList = []; //used to check for duplicates                 //and orderResultList puts the dates in order latest to most recent.
  var urlList = []; //holds the URLs which contains the meta data of each image.          
    document.getElementById("window").innerHTML += '<br> Number of entries: ' + resultList.length;                    
      for (var i = 0; i < resultList.length; i++) {        //This cleans resultList by removing duplicate dates.
        if (dateList.indexOf(resultList[i].slice(0, 10)) == -1) {
          dateList.push(resultList[i].slice(0, 10));
          var imgUrl = (mkImgStr(queryObj, resultList[i].slice(0, 10))); //We take the date data and make another set of URL strings to get the the meta data on each image. (url, cloud_score)                   
          urlList.push(imgUrl);                                                     
        }
      }
  document.getElementById("window").innerHTML += '<br> Cleaned dates of each entry: ' + dateList.join(', ') + '<br>';
  document.getElementById("window").innerHTML += '<br> Checking cloud_scores...';
  $('#window').scrollTop(1000000);
  
  setTimeout(function(){
    compileImgUrls(urlList)   //begin Step 3.
    }, 200);      
}

//Step 3. Using urlList from step 2, make a GET call for the meta data on each img. This meta data will have the actual URL of the img we want to save.
function compileImgUrls(urlArray) {    //we compile a list of all suitable imgs we want to download.
  var finalImgList = [];
  var promises = [];
  for (var i = 0; i < urlArray.length; i++) {
    var request = $.ajax({
      method: 'get',
      url: urlArray[i],
      async: false,                      
      success: function(data) {
        if (data.cloud_score < .90) {       //cloud score is a metric supplied by NASA-- it measures cloud coverage in the photos. If its too high we don't take the img. 
          finalImgList.push(data.url);      //we push the final img URLs to finaImgList.
        }
      }
    });
  promises.push(request);     //we push all these get requests in a promise obj to resolve.
}

$.when.apply(null, promises)    //when the promise array resolves, we should have an array of img URLs we want to download.
.done(function() {
  document.getElementById("window").innerHTML += '<br> full list of imgs = ' + urlArray.length;
  document.getElementById("window").innerHTML += '<br> condensed list of imgs = ' + finalImgList.length;
  document.getElementById("window").innerHTML += '<br> cloud_score too high count: ' + (urlArray.length - finalImgList.length) + '<br>';
  $('#window').scrollTop(1000000);
  getBase64FromImageUrl(finalImgList);    //begin Step 4.
})
}

var base64ImgSet = [];  //holds loaded images to be sent to gifshot.
function getBase64FromImageUrl(urlArray) {   //Step 4. This function is recursive. It downloads the first img in the passed array, pushes it to base64ImgSet,
  var img = new Image();                   //'shifts' the array and calls the function on the array. 
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = urlArray[0];
  img.onload = function() {
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);

    var dataURL = canvas.toDataURL("image/png");
    document.getElementById("window").innerHTML += '<br> Downloading... dataURL.length : ' + dataURL.length;
    $('#window').scrollTop(1000000);

    var image = new Image();
    image.src = dataURL;
    base64ImgSet.push(image);
    if (urlArray.length == 1) {             //if this is the last element in the array, create the gif next.
      document.getElementById("window").innerHTML += '<br> Creating gif...';
      $('#window').scrollTop(1000000);
      createGif(base64ImgSet);              //begin Step 5.
      return;
    }
    urlArray.shift();                      //if this isn't the last element, shift the array and call getBase64FromImageUrl on it.
    document.getElementById("window").innerHTML += '<br> resolved! number left: ' + urlArray.length;
    $('#window').scrollTop(1000000);
    getBase64FromImageUrl(urlArray);     
    };    
}

function createGif (imageArray) {   //Step 5. create a gif with the images from base64ImgSet and append it to the document.
gifshot.createGIF({
  'images': imageArray,
  'interval': 0.4,
  'gifWidth': 400,
  'gifHeight': 400,
  }, function(obj) {
    if(!obj.error) {
      var image = obj.image;
      animatedImage = document.createElement('img');    
      animatedImage.src = image;
      $('#image-container').prepend($('<img>',{id:'theImg',src:image}))
    }
    if(obj.error) {
      console.log('error at gifshot.error');
    }
  });
}

//*******************random formatting functions********************************

function httpGetSync(theUrl, callback) { 
  var xmlHttp = new XMLHttpRequest();   //this is synchronous because my async requests come back undefined (maybe too many requests?)
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
    }
  xmlHttp.open("GET", theUrl, false); // true for asynchronous
  xmlHttp.send(null);
}

function mkAssetStr(target) { //creates the first URL which we use to ask for assets, i.e. a list of all picture dates
  var assetStr = "https://api.nasa.gov/planetary/earth/assets?lon="
  + target.longitude
  + '&lat='
  + target.latitude
  + '&begin='
  + target.date_start
  + '&end='
  + target.date_end
  + '&api_key=xyLsMzpIVNFrPZhwcK2CEk30z0GhtitTEgynlqgs';
  document.getElementById("window").innerHTML += '<br> Requesting assets list from api...';
  return assetStr;
}

function mkImgStr(target, date) {  //creates the second URL which we use to ask for the img URLs
  var str = "https://api.nasa.gov/planetary/earth/imagery?lon="
  + target.longitude
  + '&lat='
  + target.latitude
  + '&date='
  + date
  + '&cloud_score=True'
  + '&api_key=xyLsMzpIVNFrPZhwcK2CEk30z0GhtitTEgynlqgs';
  return str;
}

function toJSONObj(target) {
  var parsedObj = JSON.parse(target);
  return parsedObj;
}

function orderResultList(target) {      //puts the dates from resultList in order oldest to newest
    var dateList = [];
    var orderedList = [];
    for (var i = 0; i < target.length; i++) {
        dateList.push(target[i].date);
    }
    for (var i = 0; i < dateList.length; i++) {
      var year = Number(dateList[i].slice(0, 4));
      var month = Number(dateList[i].slice(5, 7));
      var day = Number(dateList[i].slice(8, 10));
        if (orderedList.length == 0) {
          orderedList.push(dateList[i]);
          continue;
        }
      for (var t = 0; t <= orderedList.length; t++) {
        if (t == orderedList.length) {
          orderedList.push(dateList[i]);
          break;
        }
        if (year < Number(orderedList[t].slice(0, 4))) {
          orderedList.splice(t, 0, dateList[i]);
          break;
        }
        if (year == Number(orderedList[t].slice(0, 4))) {
           if (month < Number(orderedList[t].slice(5, 7))) {
              orderedList.splice(t, 0, dateList[i]);
              break;
           }
          if (month == Number(orderedList[t].slice(5, 7))) {
            if (day < Number(orderedList[t].slice(8, 10))) {
              orderedList.splice(t, 0, dateList[i]);
              break;
            }
          }
        }
      }
    }
    return orderedList;
}



