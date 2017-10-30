/**
 * Created by kimi.xin on 2016/7/15.
 * 基于JQuery类库，封装了针对CCE平台微信相关开放API的前端调用类
 * 结合微信提供的JSSDK，提供 授权、JSSDK签名、卡券签名 等API调用功能
 */
(function($){
    $.cce = {
        // wechat对象默认参数
        wechatDefaultOptions:{
            debug:false,                    // Debug为true时，会开启CCE的Debug模式和 微信官方类库的Debug模式；上线时切记关闭
            appid:'',                        // 公众号APPID（根据平台信息获取）
            // 授权相关参数对象
            oauth:{
                auto:false,                 // 是否自动授权，指 new $.cce.wechat({}); 之后即可执行，false时可 主动执行 oauth()方法
                //method:'wetalk',           // 授权方式 wetalk/cce；wetalk方式会经过CCE封装的代理授权，再经过wetalk的代理跳转到微信授权页（巴黎欧莱雅美丽殿堂和美宝莲服务号使用）；cce方式即通过CCE封装的代理授权方式直接与微信交互
                wechatOauthUrl:'https://open.weixin.qq.com/connect/oauth2/authorize',   // 微信官方授权URL（有类似wetalk代理时，设置为代理的URL）
                //wetalkOauthUrl:'https://px02331.wetalk.im/connect/oauth2/authorize2', //wetalk授权URL
                cceOauthUrl:'',                                                         // CCE授权一级回调URL（根据平台信息获取）
                redirect_uri:'',                                                        // 设置授权成功后的自定义回调URL，一般为当前页（可带参数）
                redirect_uri_query:{},                                                  // 对象会以参数形式追加到 redirect_uri上，设置后如果与URL中已有参数重复，会进行覆盖，并在授权成功后回传
                validateQueryKey:'k',                                                   // 重要！！！用于授权回调时与Cookie中的参数校验，确保非伪造回调，注意不要与其他参数名重复，重复会覆盖同名参数
                state:'',                                                               // 微信授权参数，可在回调时传回，注意：state参数在urlencode之后不能超过128字节
                response_type:'code',                                                   // 微信授权参数，遵循微信官方标准
                scope:'snsapi_base',                                                    // snsapi_base/snsapi_userinfo，微信授权参数snsapi_base为静默授权只获取openid（推荐），snsapi_userinfo可获取用户信息
                sharp:'wechat_redirect',                                                // 微信授权参数，遵循微信官方标准
                beforeRedirect:null,                                                   // 授权跳转之前事件，回传即将跳转的URL，return false可终止跳转动作
                callback:null,                                                         // 授权回调之后事件 function(oauthObj)，授权回调后解析的对象 oauthObj = {openid:'',user:{},state:null/{}}
                // 客户端存储配置，默认启用cookie存储，使用 jquery.cookie插件
                storge:{
                    validateKey:'wechat_oauth_validate',                                // 用于存储的验证参数key（一般为cookie的key值）【建议以campaignkey结尾，防止同域名cookie覆盖！！！】
                    userDataKey:'wechat_oauth_user',                                    // 用于存储授权后用户信息的key（一般为cookie的key值）【建议以campaignkey结尾，防止同域名cookie覆盖！！！】
                    desKey:'ccegroup',                                                  // 用于存储敏感信息的加密DES KEY，为null或空不加密
                    setData:function(key,data){                                       // 存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie存储，也可以使用API方式在服务端存储
                        return $.cookie(key, data);
                    },
                    getData:function(key){                                            // 获取存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie获取，也可以使用API方式在服务端获取
                        return $.cookie(key);
                    },
                    delData:function(key){                                            // 删除指定存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie获取，也可以使用API方式在服务端删除
                        $.cookie(key, null);
                    }
                }
            },
            // JSSDK相关参数，执行jssdkConfig后会自动获取签名，并执行wx.config，之后的操作可在 wx.ready中执行，wx.error中捕获错误
            jssdk:{
                auto:false,                                // 是否自动获取签名，指 new $.cce.wechat({}); 之后即可执行，false时可 主动执行 jssdkConfig()方法
                // 获取签名相关参数
                signature:{
                    async:true,                            // 是否需要同步获取，默认为异步
                    url:'',                                 // 获取签名信息的API（根据平台信息获取）
                    retryTime:3,                            // 获取签名失败后最大重试次数
                    autoConfig:true,                       // 获取签名成功后，是否自动进行wx.config
                    beforeSend:null,                       // 获取签名请求发送之前事件
                    success:null,                          // 获取签名请求成功后事件function(data){}，返回签名成功对象（在wx.config前回调），autoConfig设置为false时，可通过此事件，自定义wx.config
                    error:null                             // 获取签名失败回调事件
                },
                // 需要使用的微信JSSDK API集合，参考：http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html#.E9.99.84.E5.BD.952-.E6.89.80.E6.9C.89JS.E6.8E.A5.E5.8F.A3.E5.88.97.E8.A1.A8
                // 建议只设定需要的API，提高加载速度
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'hideMenuItems',
                    'showMenuItems',
                    'hideAllNonBaseMenuItem',
                    'showAllNonBaseMenuItem',
                    'translateVoice',
                    'startRecord',
                    'stopRecord',
                    'onVoiceRecordEnd',
                    'playVoice',
                    'onVoicePlayEnd',
                    'pauseVoice',
                    'stopVoice',
                    'uploadVoice',
                    'downloadVoice',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'downloadImage',
                    'getNetworkType',
                    'openLocation',
                    'getLocation',
                    'hideOptionMenu',
                    'showOptionMenu',
                    'closeWindow',
                    'scanQRCode',
                    'chooseWXPay',
                    'openProductSpecificView',
                    'addCard',
                    'chooseCard',
                    'openCard'
                ]
            },
            share:{
                desc:'',
                title:null,
                link:null,
                imgUrl:'',
                type:'',
                dataUrl:'',
                success:function(){},
                cancel:function(){}
            },
            card:{
                // 获取签名相关参数
                signature:{
                    async:true,                            // 是否需要同步获取，默认为异步
                    url:'',                                 // 获取签名信息的API（根据平台信息获取）
                    retryTime:3,                            // 获取签名失败后最大重试次数
                    beforeSend:null,                       // 获取签名请求发送之前事件
                    success:null,                          // 获取签名请求成功后事件function(data){}，返回签名成功对象（在wx.config前回调），autoConfig设置为false时，可通过此事件，自定义wx.config
                    error:null,                             // 获取签名失败回调事件
                    complete:null                           // 请求完成事件
                },
                cardId:'',      // 领取卡券的ID
                cardOuterId:'',                             // 卡券签名时的outerId
                cardSuccessRefresh:false,					// 卡券领取成功后，是否刷新获取会员信息
                cardSuccess:null,                          // 卡券领取成功事件
                cardCancel:null,                           // 卡券取消领取事件
                cardError:null,                             // 卡券设置错误
                storge:{
                    key:'mbl_membercard_callbackurl',                                   // 用于存储的callbackUrl的key
                    desKey:'',                                                          // 用于存储敏感信息的加密DES KEY，为null或空不加密
                    setData:function(key,data){                                       // 存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie存储，也可以使用API方式在服务端存储
                        var d = new Date();
                        d.setMinutes(d.getMinutes()+10);
                        return $.cookie(key, data,{expires :d});
                    },
                    getData:function(key){                                            // 获取存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie获取，也可以使用API方式在服务端获取
                        return $.cookie(key);
                    },
                    delData:function(key){                                            // 删除指定存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie获取，也可以使用API方式在服务端删除
                        $.cookie(key, null);
                    }
                }
            }
        },
        storgeDefaultOptions:{
            key:'storge',                           // 用于存储的验证参数key（一般为cookie的key值）
            desKey:'',                              // 用于存储敏感信息的加密DES KEY，为null或空不加密
            setData:function(key,data){            // 存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie存储，也可以使用API方式在服务端存储
                return $.cookie(key, data);
            },
            getData:function(key){                 // 获取存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie获取，也可以使用API方式在服务端获取
                return $.cookie(key);
            },
            delData:function(key){                 // 删除指定存储数据方法，默认在加载 jQuery.Cookie 后使用 cookie获取，也可以使用API方式在服务端删除
                $.cookie(key, null);
            }
        },
        ajaxExtraDefaultOptions:{
            errRetryLimit:0,
            errRetry:null,
            errLog:false,
            errLogFunc:function(req,status,err){
                console.log(err);
            },
            requestDataFormat:false,
            requestDataFormatFunc:function(_data){
                var _result;
                try{
                    _result = JSON.stringify(_data);
                }
                catch(e){
                    _result = _data;
                }
                return _result;
            },
            responseDataFormat:false,
            responseDataFormatFunc:function(_data){
                var _result;
                try{
                    _result = eval('[' + html_decode(_data) +']')[0];
                }
                catch(e){
                    _result = _data;
                }
                return _result;
            }
        },
        CONFIG:{
            debug:false
        },
        getOptions:function(options){
            return $.extend(true,$.cce.CONFIG,$.cce.wechatDefaultOptions,options || {});
        },
        extendOptions:function(key,opts){
            var r = $.extend(true,{},$.cce.wechatDefaultOptions[key] || {},$.cce.CONFIG[key] || {},opts || {});
            if(r.debug == undefined)
                r.debug = $.cce.CONFIG.debug;
            if(r.appid == undefined )
                r.appid = $.cce.CONFIG.appid;
            return r;
        },
        wechat:function(opts){
            var options = $.cce.getOptions(opts);
            this.jssdkConfig = $.cce.jssdkConfig;
            this.cardSignature = $.cce.cardSignature;
            this.wxShare = $.cce.wxShare;
            var oauth = new $.cce.oauth(options);
            this.oauth = oauth.oauth;
            if(options.oauth.auto == true){
                console.log("youmieyou");
                oauth.oauth();
            }

            if(options.jssdk.auto == true){
                this.jssdkConfig(options);
                this.wxShare(options);
            }
        },
        // 授权类库
        oauth:function(opts){

            var options =  opts;//$.cce.extendOptions('oauth',opts);
            var storge = new $.cce.storge({
                desKey:options.oauth.storge.desKey,
                setData:options.oauth.storge.setData,
                getData:options.oauth.storge.getData,
                delData:options.oauth.storge.delData
            });
            var currentURI = new $.cce.uri(window.location.href);

            // 验证回调校验值是否正确
            var validCallback = function(){
                var queryValidateKey = currentURI.getQueryString(options.oauth.validateQueryKey); //$.cce.getQueryString(options.oauth.validateQueryKey);
                return queryValidateKey == storge.getString(options.oauth.storge.validateKey);
            };

            // 通过参数获取用户信息
            var getUserInfo = function(){
                var userObj = {};
                var userStr = currentURI.getQueryString('user'); //$.cce.getQueryString('user');
                if(userStr && userStr.length>0){
                    try{
                        userObj = JSON.parse(decodeURIComponent(userStr));
                    }
                    catch(e){
                    }
                }
                return userObj;
            }

            // 判定是否已授权
            // 从存储中获取授权数据
            var isOauth = function(){
                var result = null;
                var userObj = storge.getJSON(options.oauth.storge.userDataKey);
                if(userObj && userObj.openid && userObj.openid.length>0){
                    result = userObj;
                }
                return result;
            }

            // 获取授权URL
            var getOauthUrl = function(ts){
                var callbackURI = new $.cce.uri(options.oauth.redirect_uri);
                callbackURI.extendQuery(options.oauth.redirect_uri_query);
                var tsQuery = {};
                tsQuery[options.oauth.validateQueryKey] = ts.toString();
                callbackURI.extendQuery(tsQuery);
                var callbackUrl = callbackURI.format();

                $.cce.debug('Oauth','Get Callback Url',callbackUrl,options.debug);

                var redirectURI = new $.cce.uri(options.oauth.wechatOauthUrl);
                var redirectQuery = {
                    appid:options.appid,
                    redirect_uri:encodeURIComponent(options.oauth.cceOauthUrl + '?link=' + encodeURIComponent(callbackUrl)),
                    response_type:options.oauth.response_type,
                    scope:options.oauth.scope,
                    state:options.oauth.state
                }
                redirectURI.extendQuery(redirectQuery);
                redirectURI.setExt(options.oauth.sharp);
                var redirectUrl = redirectURI.format();

                $.cce.debug('Oauth','Get Oauth Url',redirectUrl,options.debug);
                return redirectUrl;
            };

            // 是否授权回调
            // 如果是则返回回调对象{openId:'',user:{},state:{},query:{}}
            var isCallback = function(){
                var result = {
                    openid: currentURI.getQueryString('openid'), //$.cce.getQueryString('openid'),
                    user:getUserInfo(),
                    state: currentURI.getQueryString('state'), //$.cce.getQueryString('state'),
                    query: currentURI.uri.query//$.cce.getUriQuery(window.location.href)
                };

                if(validCallback()==true && result.openid && result.openid.length>0){
                    return result;
                }
                else
                    return null;
            }

            // 微信授权
            // 当未授权时自动跳转引导授权
            // 判定已授权时，返回用户信息对象
            // {openId:'',user:{},state:{},query:{}}
            var oauth = function(){
                // 获取当前授权信息
                var oauthData = isOauth();
                $.cce.debug('Oauth','Is Oauth',oauthData,options.debug);
                // 如果已存储授权信息，直接返回
                if(oauthData != null){
                    console.log("这是第二次");
                    if(typeof options.oauth.callback == 'function'){
                        options.oauth.callback(oauthData);
                    }
                    return oauthData;
                }

                // 获取回调信息
                var callbackObj = isCallback();
                $.cce.debug('Oauth','Is Callback',callbackObj,options.debug);

                // 如果存在回调信息，则进行存储
                if(callbackObj != null){
                    //callbackObj.user.openid = callbackObj.openid;
                    storge.setJSON(options.oauth.storge.userDataKey,callbackObj);
                    storge.del(options.oauth.storge.validateKey);
                    console.log("这是第一次");
                    if(typeof options.oauth.callback == 'function'){
                        options.oauth.callback(callbackObj);
                    }
                    return callbackObj;
                }

                // 未授权，未回调，获取授权URL，进行跳转
                var ts = Math.round(new Date().getTime()/1000);
                var oauthUrl = getOauthUrl(ts);
                if(typeof options.oauth.beforeRedirect == 'function'){
                    if(options.oauth.beforeRedirect(oauthUrl)===false)
                        return;
                }
                storge.setString(options.oauth.storge.validateKey,ts.toString());
                window.location.href = oauthUrl;
                return;
            };

            this.getOauthUrl = getOauthUrl;
            this.oauth = oauth;
        },
        // JSSDK类库
        jssdkConfig:function(opts){
            var options =   $.cce.extendOptions('jssdk',opts);
            $.cce.debug('Get JSSDK Signature','Begin Request',options.signature.url,options.debug);

            $.cce.ajax({
                url:options.signature.url,
                async:options.signature.async,
                type:'get',
                dataType:'json',
                data:{url:encodeURIComponent(window.location.href)},
                beforeSend:options.signature.beforeSend,
                success:function(data){
                    if(data.Code=='10000'){
                        $.cce.debug('Get JSSDK Signature','Request Success',data,options.debug);
                        if(typeof options.signature.success == 'function')
                            options.signature.success(data.Data);
                        if(options.signature.autoConfig == true){
                            $.cce.debug('Get JSSDK Signature','Begin Config',data.Data,options.debug);

                            if(wx && wx.config){
                                wx.config({
                                    debug: options.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                                    appId: options.appid, // 必填，公众号的唯一标识
                                    timestamp:data.Data.timestamp , // 必填，生成签名的时间戳
                                    nonceStr: data.Data.nonceStr, // 必填，生成签名的随机串
                                    signature: data.Data.signature,// 必填，签名，见附录1
                                    jsApiList: options.jsApiList // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                                });
                            }
                        }
                    }
                    else{
                        $.cce.debug('Get JSSDK Signature','Request Result Error',data,options.debug);
                        if(typeof options.signature.error == 'function')
                            options.signature.error(data);
                    }
                },
                error:function(req,status,err){
                    $.cce.debug('Get JSSDK Signature','Request Error',req,options.debug);
                }
            },{
                errRetryLimit:options.signature.retryTime,
                errRetry:function(req,status,err,retryCount){
                    $.cce.debug('Get CARD Signature','Request Retry '+ retryCount.toString(),req,options.debug);
                }
            });
        },
        // 微信分享设置
        wxShare:function(opts){
            var options =   $.cce.extendOptions('share',opts);
            wx.ready(function () {
                wx.onMenuShareAppMessage({
                    desc: options.desc, // 分享描述
                    title: options.title || document.title, // 分享标题
                    link: options.link || window.location.href, // 分享链接
                    imgUrl: options.imgUrl, // 分享图标
                    type: options.type, // 分享类型,music、video或link，不填默认为link
                    dataUrl: options.dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
                    success: options.success,
                    cancel: options.cancel
                });

                wx.onMenuShareTimeline({
                    title: options.desc, // 分享标题
                    link: options.link || window.location.href, // 分享链接
                    imgUrl: options.imgUrl, // 分享图标
                    success: options.success,
                    cancel: options.cancel
                });
            });
        },
        // JSSDK类库
        cardSignature:function(cardIds,opts){
            var options =   $.cce.extendOptions('card',opts);
            cardIds = cardIds || '';

            $.cce.debug('Get CARD Signature','Begin Request',options.signature.url,options.debug);
            $.cce.debug('Get CARD Signature','Request Retry '+ options.toString(),options.debug);
            $.cce.ajax({
                url:options.signature.url,
                async:options.signature.async,
                type:'get',
                dataType:'json',
                data:{cardId:cardIds.toString()},
                beforeSend:options.signature.beforeSend,
                success:function(data){
                    if(data.Code=='10000'){
                        $.cce.debug('Get CARD Signature','Request Success',data,options.debug);
                        if(typeof options.signature.success == 'function')
                            options.signature.success(data.Data);
                    }
                    else{
                        $.cce.debug('Get CARD Signature','Request Result Error',data,options.debug);
                        if(typeof options.signature.error == 'function')
                            options.signature.error(data.Data);
                    }
                },
                error:function(req,status,err){
                    $.cce.debug('Get CARD Signature','Request Error',req,options.debug);
                    if(typeof options.signature.error == 'function')
                        options.signature.error(req,status,err);
                },
                complete:options.signature.complete
            },{
                errRetryLimit:options.signature.retryTime,
                errRetry:function(req,status,err,retryCount){
                    $.cce.debug('Get CARD Signature','Request Retry '+ retryCount.toString(),req,options.debug);
                }
            });
        },
        addCard:function(opts){
            var options = $.cce.extendOptions('card',opts);
            // 注册签名成功事件，成功后设置微信卡券
            var _success = options.signature.success;
            options.signature.success = function(data){
                if(wx && wx.addCard){
                    $.cce.debug('Add Member Card','WX Add Card',options.debug);
                    wx.addCard({
                        cardList: [
                            {
                                cardId: data.card_id,
                                cardExt: '{"code": "", "openid": "", "timestamp": "' + data.timestamp + '", "nonce_str": "' + data.nonceStr + '", "signature":"' + data.signature + '","outer_id":"' + options.cardOuterId + '"}'
                            }
                        ],
                        success: function(){

                                if(typeof options.cardSuccess == 'function')
                                    options.cardSuccess();
                        },
                        cancel: options.cardCancel,
                        error: options.cardError
                    });
                }
                else{
                    $.cce.debug('Add Member Card','wx config not ready',options.debug);

                }

                if(typeof _success == 'function')
                    _success(data);
            }
			wx.ready(function(){
				$.cce.cardSignature(options.cardId,options);
			}); 
        },
        // 存储类库
        storge:function(opts){
            var options = $.extend(true,$.cce.storgeDefaultOptions,opts || {});
            var setStorgeData;
            var _setStorgeData = options.setData || function(k,d){};
            if(options.desKey && options.desKey.length > 0){
                setStorgeData = function(k,d){
                    d = $.cce.des().encrypte(options.desKey,d);
                    _setStorgeData(k,d);
                }
            }
            else
                setStorgeData = _setStorgeData;

            var getStorgeData;
            var _getStorgeData = options.getData || function(k){};
            if(options.desKey && options.desKey.length > 0){
                getStorgeData = function(k){
                    var v = _getStorgeData(k);
                    if(v && v.length>0)
                        v = $.cce.des().decrypte(options.desKey,v);
                    return v;
                }
            }
            else
                getStorgeData = _getStorgeData;

            var delStorgeData = options.delData || function(k){};

            this.getString = function(key){
                return  getStorgeData(key) || '';
            }

            this.setString = function(key,data){
                setStorgeData(key,data);
            }

            this.getJSON = function(key){
                var json = null;
                var str = getStorgeData(key);
                if(str && str.length > 0){
                    try{
                        json = JSON.parse(str);
                    }
                    catch(e){
                    }
                }
                return json;
            }

            this.setJSON = function(key,data){
                data = data || {};
                try{
                    var dataStr = JSON.stringify(data);
                    setStorgeData(key,dataStr);
                }
                catch(e){
                }
            }

            this.del = function(key){
                delStorgeData(key);
            }

            return this;
        },
        // Log函数
        log : function(obj){
            if(typeof console == 'object')
                console.log(obj);
            else
                alert(obj);
        },
        // Debug函数
        debug : function(category,action,obj,debug){
            if(debug==true){
                category = category || 'cce info';
                action = action || 'debug';
                $.cce.log('['+category+'] '+ action);
                $.cce.log(obj);
            }
        },
        // 指定参数名从当前URL获取值
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        // URI操作对象
        uri: function(urlStr){
            var uriObj = {};

            var search2query = function(search){
                var reg = /([^=&\s]+)[=\s]*([^=&\s]*)/g;
                var query = {};
                while(reg.exec(search)){
                    query[RegExp.$1] = RegExp.$2;
                }
                return query;
            }

            var query2search = function(query){
                var search = '';
                query = query || {};
                for(var k in query){
                    search += (k+'='+query[k]+'&');
                }
                if(search.length>0)
                    search = search.substr(0,search.length-1);
                return search;
            }

            var parse = function(url){
                var obj = {
                    path:'',
                    query:{},
                    search:'',
                    searchSplit:'?',
                    ext:'',
                    extSplit:'#',
                };
                if(url && url.length>0){
                    var _url = url;
                    var extIndex = url.indexOf(obj.extSplit);
                    if(extIndex>=0){
                        _url = url.substring(0,extIndex);
                        obj.ext = url.substring(extIndex+1,url.length);
                    }

                    var __url = _url;
                    var searchIndex = _url.indexOf(obj.searchSplit);
                    if(searchIndex>=0){
                        __url = _url.substring(0,searchIndex);
                        obj.search = _url.substring(searchIndex+1,_url.length);
                    }

                    obj.path = __url;
                    obj.query = search2query(obj.search);
                }
                return obj;
            }

            var format = function(){
                var search = uriObj.search;
                if(!search || search.length==0){
                    search = query2search(uriObj.query);
                }
                var url =  uriObj.path;
                if(search && search.length>0){
                    url += (uriObj.searchSplit + search);
                }
                if(uriObj.ext && uriObj.ext.length>0){
                    url += (uriObj.extSplit + uriObj.ext);
                }
                return url;
            }

            uriObj = parse(urlStr);

            this.uri = uriObj;

            this.getQueryString = function(k){
                return uriObj.query[k] || '';
            }

            this.parse = parse;

            this.format = format;

            this.extendQuery = function(query){
                uriObj.query = $.extend(true,uriObj.query,query || {});
                uriObj.search = query2search(uriObj.query);
            }

            this.setExt = function(ext){
                uriObj.ext = ext;
            }
        },
        // 自定义封装的AJAX，设置了错误重试功能
        ajax:function(ajaxOpts,extraOpts){
            ajaxOpts = ajaxOpts || {};
            extraOpts = $.extend(true,$.cce.ajaxExtraDefaultOptions,extraOpts || {});

            // 判定是否需要将 data 格式化
            if(ajaxOpts.data && extraOpts.requestDataFormat==true && typeof extraOpts.requestDataFormatFunc == 'function' ){
                ajaxOpts.data = extraOpts.requestDataFormatFunc(ajaxOpts.data);
            }

            // 保留原错误处理
            var _error = ajaxOpts.error;
            // 重试次数
            var retryCount = 0;
            // 重试函数
            var retry = function(req,status,err){
                if(retryCount < extraOpts.errRetryLimit){
                    if(typeof extraOpts.errRetry == 'function')
                        extraOpts.errRetry(req,status,err,retryCount+1);
                    retryCount++;
                    doAjax();
                }
                else{
                    if(typeof _error == 'function')
                        _error(req,status,err);
                }
            }

            ajaxOpts.error = function(req,status,err){
                if(extraOpts.errLog == true && typeof extraOpts.errLogFunc == 'function')
                    extraOpts.errLogFunc(req,status,err);

                retry(req,status,err);
            }

            // 执行AJAX请求
            var doAjax = function(){
                $.ajax(ajaxOpts);
            }

            doAjax();
        },
        // des 加密解密
        des:function(){
            this.encrypte = function (key, message) {
                if(CryptoJS){
                    var keyHex = CryptoJS.enc.Utf8.parse(key);
                    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
                        mode: CryptoJS.mode.ECB,
                        padding: CryptoJS.pad.Pkcs7
                    });
                    return encrypted.toString();
                }
                else{
                    return message;
                }
            }
            this.decrypte = function (key, ciphertext) {
                if(CryptoJS){
                    var keyHex = CryptoJS.enc.Utf8.parse(key);
                    // direct decrypt ciphertext
                    var decrypted = CryptoJS.DES.decrypt({
                        ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
                    }, keyHex, {
                        mode: CryptoJS.mode.ECB,
                        padding: CryptoJS.pad.Pkcs7
                    });
                    return decrypted.toString(CryptoJS.enc.Utf8);
                }
                else{
                    return ciphertext;
                }
            }
            return this;
        },
        html:function(){
            this.decode = function(str) {
                var s = "";
                if (!str || str.length == 0) return "";
                s = str.replace(/&gt;/g, "&");
                s = s.replace(/&lt;/g, "<");
                s = s.replace(/&gt;/g, ">");
                s = s.replace(/&nbsp;/g, " ");
                s = s.replace(/&#39;/g, "\'");
                s = s.replace(/&quot;/g, "\"");
                s = s.replace(/<br>/g, "\n");
                return s;
            }
            return this;
        },
        // 判定是否微信客户端
        isWXClient:function(){
            var ua = window.navigator.userAgent.toLowerCase();
            return ua.match(/MicroMessenger/i)=='micromessenger';
        },
        // 判定是否引用了微信JSSDK的JS，是否可使用wx对象
        isWXJsUsed:function(){
            return ((typeof wx)=='object' && (typeof wx.config)=='function');
        }
    };
})(jQuery);
