// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}



var test = chrome.extension.getBackgroundPage()
//alert("dddddddddd"+test.account_list())
document.addEventListener('DOMContentLoaded', function() {
  var image = test.account_list();
  var images = [];
  var c=document.getElementById("myCanvas");
  var ctx=c.getContext("2d");
  var img = new Image();
  img.crossOrigin = "anonymous";
  for(var i =0;i<image.length;i++){
    $("#image-result").html("<img src='"+image[i]+"'/>");
    img.src = image[i];
    images.push(image[i]);
    gifShot(images,1);
  }



  $('#image-result img').Jcrop({
    onChange:function(){
      var pos = this.tellScaled();
      ctx.drawImage(img,pos.x,pos.y,pos.w,pos.h,0,0,pos.w,pos.h);
    },
    onSelect:function(){
      console.log( c.toDataURL("image/png"));
    }
  });
  function gifShot(images,interval){
    gifshot.createGIF({
      images:images,
      interval: interval
    }, function (obj) {
      if (!obj.error) {
        var image = obj.image, animatedImage = document.createElement('img');
        animatedImage.src = image;
        $(".previewgif").html(animatedImage);
        $('#qrcode').empty();
        $('#qrcode').qrcode("https://www.baidu.com/img/baidu_jgylogo3.gif");

      }
    });
  }

  $('.fileupload').change(function(){
    var f = $(".fileupload")[0].files[0];
    var src = window.URL.createObjectURL(f);
    $("#image-result").html("<img src='"+src+"'/>");
    images.push(src);

    gifShot(images,1);
    img.src = src;
    $('#image-result img').Jcrop({
      onChange:function(){
        var pos = this.tellScaled();
        ctx.drawImage(img,pos.x,pos.y,pos.w,pos.h,0,0,pos.w,pos.h);
      },
      onSelect:function(){
        console.log( c.toDataURL("image/png"));
      }
    });
  });


  $(".range_02").ionRangeSlider({
    min: 0.1,
    max: 1,
    step: 0.01,
    from: 0.5,
    onFinish: function (data) {
      console.log("onFinish",data);
      gifShot(images,data.from);
    },
  });

});
