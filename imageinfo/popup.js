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



var bg = chrome.extension.getBackgroundPage()

document.addEventListener('DOMContentLoaded', function() {
  var config = bg.configGif;
  var needCliImages = config.needCliImages; //存放生产GIF的图片
  var cliTmpImages = config.cliTmpImages; //存放裁切图片
  var INTERVAL_TIME=config.INTERVAL_TIME; //GIF播放速度
  var text = config.text;
  var Width =config.Width;
  var Height=config.Height;

  needCliImages=bg.getImages();
  function gifShot(images,interval){
    gifshot.createGIF({
      gifWidth: Width,
      gifHeight:Height,
      images:images,
      text:text,
      fontSize: '12px',
      fontFamily: 'Times New Roman',
      interval: interval
    }, function (obj) {
      if (!obj.error) {
        var image = obj.image, animatedImage = document.createElement('img');
        animatedImage.src = image;
        $(".previewgif").html(animatedImage);
        $('#qrcode').empty();

        $('#qrcode').qrcode({width: 64,height: 64,text: "https://www.baidu.com/img/baidu_jgylogo3.gif"});
      }
    });
  }

  $('.fileupload').change(function(){
    var f = $(".fileupload")[0].files[0];
    //var src = window.URL.createObjectURL(f);//生成base64
    var reader = new FileReader();
    reader.onload = function(){
      bg.setImage(this.result);
      startDoing();
      $(".imageList .img").click();
    }
    reader.readAsDataURL(f);
    //needCliImages.push(src);
  });

  $(".range_02").ionRangeSlider({
    min: 0.1,
    max: 1,
    step: 0.01,
    from: INTERVAL_TIME,
    onFinish: function (data) {
      INTERVAL_TIME = data.from;
      config.INTERVAL_TIME = INTERVAL_TIME;
      doMarkGif();
    },
  });
  $(".range_w").ionRangeSlider({
    min: 1,
    max: 300,
    step: 1,
    from: Width,
    onFinish: function (data) {
      Width = data.from;
      config.Width=Width;
      window.clipArea.resetSize([Width,Height])
      doMarkGif();
    },
  });
  $(".range_h").ionRangeSlider({
    min: 1,
    max: 300,
    step: 1,
    from: Height,
    onFinish: function (data) {
      Height = data.from;
      config.Height=Height;
      window.clipArea.resetSize([Width,Height])
      doMarkGif();
    },
  });

  if(needCliImages.length>0){
    startDoing();
    $(".imageList .img").click();
  }

  function startDoing(){
    //生成图片数组
    $(".imageList").empty();
    needCliImages=bg.getImages();
    for(var i =0;i<needCliImages.length;i++){
      //append到页面上
      cliTmpImages[i]=needCliImages[i];
      $(".imageList").append("<div class='img' data-index='"+i+"' ><img  src='"+needCliImages[i]+"' /></div>");
    }
      doMarkGif();
      $(".imageList").delegate('.img','click',function(){
        var index = $(this).data("index");
        $("#clipArea").empty();$(".view").empty();
        window.clipArea = new bjj.PhotoClip("#clipArea", {
          size: [100, 100], // 截取框的宽和高组成的数组。默认值为[260,260]
          outputSize: [640, 640], // 输出图像的宽和高组成的数组。默认值为[0,0]，表示输出图像原始大小
          outputType: "png", // 指定输出图片的类型，可选 "jpg" 和 "png" 两种种类型，默认为 "jpg"
          source: needCliImages[index], // 需要裁剪图片的url地址。该参数表示当前立即开始裁剪的图片，不需要使用file控件获取。注意，该参数不支持跨域图片。
          view: "#view", // 显示截取后图像的容器的选择器或者DOM对象
          ok: "#clipBtn", // 确认截图按钮的选择器或者DOM对象
          loadStart: function(file) {}, // 开始加载的回调函数。this指向 fileReader 对象，并将正在加载的 file 对象作为参数传入
          loadComplete: function(src) {
            console.log("===>>>");
            $("#view").html("<img  src='"+src+"' width='100%' height='100%' />");
          }, // 加载完成的回调函数。this指向图片对象，并将图片地址作为参数传入
          loadError: function(event) {}, // 加载失败的回调函数。this指向 fileReader 对象，并将错误事件的 event 对象作为参数传入
          clipFinish: function(dataURL) {
            //console.log(dataURL);
            //var pos = this.tellScaled();
            $("#view").empty();
            text[index] = $(".text").val();
            config.text[index] = $(".text").val();
            cliTmpImages[index] = dataURL;
            doMarkGif(index);
          }, // 裁剪完成的回调函数。this指向图片对象，会将裁剪出的图像数据DataURL作为参数传入
        });
    });
    //绑定click事件，确定编辑
    //裁切
    //裁切完成以后重新生成GIF
  }

  function doMarkGif(index){
    var tmpImg = [];
    for(var i in cliTmpImages){
        tmpImg.push(cliTmpImages[i]);
    }
    tmpImg.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFHRFWHRDcmVhdGlvbiBUaW1lADkvNy8xMHWd+WMAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAA+VBMVEX///8AAACxsbGZmZmZmZmxsbGZmZn///9/f39YWFgwrP/X19fw+f/A5v8nJycQn/8+mdVQuf9paWmg2f+w3//BwcHt7e09PT1As/+ZmZkAmf8gpv8mmWWAm4zg8/+rq6uVlZWAzP/Q7P/39/dwxv+HrMWVmZUdmYwNmcyDsqmKt9WeqrOQ0/8amZmbm5szmTNamcOCn7OsrKyPmY9vmW9tmW2nrrNymbODn7KampqBtNVkqNVIndVbpNW3v8WBmowDmfKcs8MQmb+QmZBurNXFxcV0mbITmbKCqcNomYMwmT8HBwcRERGBnZ+Dg4OQkJBYmcWfn595ppmiMPhZAAAAB3RSTlMAAMoQ0MnAqg3WOgAAAVBJREFUeF7l0dWSgzAYgNF2LYK71N113d193/9hNlQWlgDhuv2GycDFgfwhsyJls06aNjZ9cAzYOdOtIGhMkmsQ4ATB5FCW5bPTk2737lymeziiwJfrKjyYpblU40kUwPpCgKJms0HOtm0M/vIepQTQuwcRFXOx4MAHfUUjQCDpdSkNsN0cD6qsGXoXM8ALFW8Xkp3ulCSXCuuAVH2KAnRSXSiCWdfpAAYkvlJR8DgWSFqVF5Sl+PsZ8YAc0GL6PmYNPU8RFkJnAqp1AFftm0Ern8+PgpHn1uCxTYP355dRQnuFMCjsj9YQNG/9dqmal2HQ+UmuEwbMKFAKA65GgAljgWoipBochDVkAahyoFRCCIjQUGE0EDlILtNbRCAiCCAkN5CDnJgEymXRtF6BBY0lKCMrEvjVjDf20M4w0MfnMKp/YHuaou8AyO44acqsSL+8rbidddnFogAAAABJRU5ErkJggg==");
    gifShot(tmpImg,INTERVAL_TIME);
  }

});
