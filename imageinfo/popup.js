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
  var needCliImages = config.needCliImages; //�������GIF��ͼƬ
  var cliTmpImages = config.cliTmpImages; //��Ų���ͼƬ
  var INTERVAL_TIME=config.INTERVAL_TIME; //GIF�����ٶ�
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
    //var src = window.URL.createObjectURL(f);//����base64
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
    //����ͼƬ����
    $(".imageList").empty();
    needCliImages=bg.getImages();
    for(var i =0;i<needCliImages.length;i++){
      //append��ҳ����
      cliTmpImages[i]=needCliImages[i];
      $(".imageList").append("<div class='img' data-index='"+i+"' ><img  src='"+needCliImages[i]+"' /></div>");
    }
      doMarkGif();
      $(".imageList").delegate('.img','click',function(){
        var index = $(this).data("index");
        $("#clipArea").empty();$(".view").empty();
        window.clipArea = new bjj.PhotoClip("#clipArea", {
          size: [100, 100], // ��ȡ��Ŀ�͸���ɵ����顣Ĭ��ֵΪ[260,260]
          outputSize: [640, 640], // ���ͼ��Ŀ�͸���ɵ����顣Ĭ��ֵΪ[0,0]����ʾ���ͼ��ԭʼ��С
          outputType: "png", // ָ�����ͼƬ�����ͣ���ѡ "jpg" �� "png" ���������ͣ�Ĭ��Ϊ "jpg"
          source: needCliImages[index], // ��Ҫ�ü�ͼƬ��url��ַ���ò�����ʾ��ǰ������ʼ�ü���ͼƬ������Ҫʹ��file�ؼ���ȡ��ע�⣬�ò�����֧�ֿ���ͼƬ��
          view: "#view", // ��ʾ��ȡ��ͼ���������ѡ��������DOM����
          ok: "#clipBtn", // ȷ�Ͻ�ͼ��ť��ѡ��������DOM����
          loadStart: function(file) {}, // ��ʼ���صĻص�������thisָ�� fileReader ���󣬲������ڼ��ص� file ������Ϊ��������
          loadComplete: function(src) {
            console.log("===>>>");
            $("#view").html("<img  src='"+src+"' width='100%' height='100%' />");
          }, // ������ɵĻص�������thisָ��ͼƬ���󣬲���ͼƬ��ַ��Ϊ��������
          loadError: function(event) {}, // ����ʧ�ܵĻص�������thisָ�� fileReader ���󣬲��������¼��� event ������Ϊ��������
          clipFinish: function(dataURL) {
            //console.log(dataURL);
            //var pos = this.tellScaled();
            $("#view").empty();
            text[index] = $(".text").val();
            config.text[index] = $(".text").val();
            cliTmpImages[index] = dataURL;
            doMarkGif(index);
          }, // �ü���ɵĻص�������thisָ��ͼƬ���󣬻Ὣ�ü�����ͼ������DataURL��Ϊ��������
        });
    });
    //��click�¼���ȷ���༭
    //����
    //��������Ժ���������GIF
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
