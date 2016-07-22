
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Returns a handler which will open a new window when activated.
 */
var imageArr = []
function getClickHandler() {
  return function(info, tab) {
    var url =info.srcUrl;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = "blob";
    xhr.onload = function() {
      if (this.status == 200) {
        var blob = this.response;
        imageArr.push(window.URL.createObjectURL(blob));
      }
    }
    xhr.send();
  };
};

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
  "title" : "Get image",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : getClickHandler()
});

function getImages(){
  return  imageArr;
}

function setImage(image){
  imageArr.push(image);
}

/**
 * ���ò������´�����ʱ
 * @type {{needCliImages: Array, cliTmpImages: {}, INTERVAL_TIME: number, Width: number, Height: number}}
 */
var configGif = {
 needCliImages : [], //�������GIF��ͼƬ
 cliTmpImages : {}, //��Ų���ͼƬ
 text:{},
 INTERVAL_TIME:0.5, //GIF�����ٶ�
 Width :200,
 Height:200
}

/**
 * ע���ǩҳ����ʱ���¼�
 * ���������initialize()�¼�����func.jsע�뵱ǰ��ǩҳ��
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  initialize(tabId);
});

/**
 * ע���л���ǩҳʱ���¼�
 * ���������initialize()�¼�����func.jsע�뵱ǰ��ǩҳ��
 */
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  initialize(tabId);
});

/**
 * ��ʼ������ ��ע��func.js�¼�
 * @param {Object} tabId
 */
function initialize(tabId){
  chrome.tabs.executeScript(tabId, {file: "jquery.js", allFrames: true});
}