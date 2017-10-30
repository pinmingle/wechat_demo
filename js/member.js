/**
 * Created by kimi.xin on 2016/7/15.
 * 基于JQuery类库，和CCE.Wehcat类库，封装了针对美宝莲微信会员卡的 判定和领取操作
 * 提供 获取会员信息，非会员自动领卡，会员卡激活 等功能
 * 依赖于 cce.wechat 的授权和JSSDK类库；微信原生JSSDK类库
 */
(function($){
    $.mbl_common = {
        // wechat对象默认参数
        defaultOptions:{
            debug:false,                    // Debug为true时，会开启Debug模式
            autoGetCard:true,               // 非会员时自动引导领卡
            memberInfo:{
                refresh:false,                            // 为false时，会先从存储中获取，存储中存在则不request，为true时跳过存储，直接request
                request:{
                    async:true,                           // 是否需要同步获取，默认为异步
                    url:'http://wxproxy-maybelline.comeyes.com:8105/api/member/mbl/',                                 // 获取签名信息的API（根据平台信息获取）
                    retryTime:3,                             // 获取签名失败后最大重试次数
                    beforeSend:null,                        // 获取签名请求发送之前事件
                    isMember:null,                          // 获取到是会员的情况 function(data,type){}，在存储完会员信息之后触发,type=0 表示从接口获取，1表示从缓存获取
                    nonMember:null,                         // 获取到非会员的情况，在自动申领卡的之前触发，function(){}，在函数内return false 可阻止自动申领
                    error:null,                             // 获取会员信息失败
                    complete:null                           // 完成事件
                },
                storge:{
                    key:'memberinfo_mbl_member',                                        // 用于存储的用户信息的key
                    desKey:'ccegroup',                                                  // 用于存储敏感信息的加密DES KEY，为null或空不加密
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
            },
            memberCard:{
                signature:{
                    async:true,                            // 是否需要同步获取，默认为异步
                    url:'http://wxproxy-maybelline.comeyes.com:8105/sns/sign/card/mbl/',    // 获取签名信息的API（根据平台信息获取）
                    retryTime:3,                             // 获取签名失败后最大重试次数
                    beforeSend:null,                        // 获取签名请求发送之前事件
                    success:null,                           // 获取签名成功事件
                    error:null,                             // 获取签名失败事件
                    complete:null                           // 完成事件
                },
                callbackUrl:'',                             // 卡券激活后跳转URL
                cardId:'p5Ph1jpuKbyOiU0btTKcb7d4-WSo',      // 领取卡券的ID
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
            },
            memberActive:{
                request:{
                    data:null,
                    async:true,                           // 是否需要同步获取，默认为异步
                    url:'/common/MemberCardServiceHandler.ashx?op=wechatapi&az=ViRDmss2Zu4pQUGQrvUh9w%3d%3d&pc=ZuqwyBLGNoUZEmpPVTM1%2fw%3d%3d',    // 激活API（根据平台信息获取）
                    retryTime:3,                             // 激活失败后最大重试次数
                    beforeSend:null,                        // 激活请求发送之前事件
                    successRedirect:true,                   // 激活成功自动处理跳转
                    success:null,                           // 激活成功
                    error:null,                             // 激活失败
                    complete:null                           // 完成事件
                },
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
            },
            improveMember:{
                request:{
                    data:null,
                    async:true,                           // 是否需要同步获取，默认为异步
                    url:'/common/MemberCardServiceHandler.ashx?op=wechatapi&az=ViRDmss2Zu4pQUGQrvUh9w%3d%3d&pc=CL4gwYMpIYklFx3Nk6huPw%3d%3d',    // 完善信息API（根据平台信息获取）
                    retryTime:3,                             // 完善信息后最大重试次数
                    beforeSend:null,                        // 完善信息请求发送之前事件
                    successRedirect:true,                   // 完善信息成功自动处理跳转
                    success:null,                           // 完善信息成功
                    error:null,                             // 完善信息失败
                    complete:null                           // 完成事件
                }
            },
            smsCode:{
                request:{
                    data:null,
                    async:true,                           // 是否需要同步获取，默认为异步
                    url:'/common/MemberCardServiceHandler.ashx?op=wechatapi&az=ViRDmss2Zu4pQUGQrvUh9w%3d%3d&pc=%2b%2biHZZnaONHT3462H3TDew%3d%3d',    // 发送短信API
                    retryTime:3,                             // 发送失败后最大重试次数
                    beforeSend:null,                        // 请求发送之前事件
                    success:null,                           // 发送成功事件
                    error:null,                             // 发送失败事件
                    complete:null                           // 完成事件
                },
                countDown:{
                    domEl:null,                             // 显示倒计时的dom元素
                    durationTxt:'{%s%}s',                     // 倒计时中的文本 {%s%} 代表倒计时动态描述
                    enableTxt:'获取验证码',                  // Dom解冻后的文本
                    duration:60,                              // 倒计时秒数
                    disableFunc:function(){
                        this.setAttribute("disabled","disabled");
                    },
                    enableFunc:function(){
                        this.removeAttribute("disabled");
                    }
                }

            }
        },
        CONFIG:{
            debug:false,
            member:{}
        },
        OAUTHINFO:{},
        MEMBERINFO:null,
        WECHAT:null,
        getOptions:function(opts){
            return $.extend(true,$.mbl_common.CONFIG,$.mbl_common.defaultOptions,opts || {});
        },
        extendOptions:function(key,opts){
            var r = $.extend(true,{},$.mbl_common.defaultOptions[key] || {},$.mbl_common.CONFIG[key] || {},opts || {});
            if(r.debug == undefined)
                r.debug = $.mbl_common.CONFIG.debug;
            return r;
        },
        getWechat:function(opts){
            /*
             * 创建经过CCE封装Wechat使用对象
             * 详情默认配置请在 wechat.js 中的 wechatDefaultOptions 对象查看
             * */
            var wechatOptions = {
                debug:opts.debug,                                            // Debug为true时，会开启CCE的Debug模式和 微信官方类库的Debug模式；上线时切记关闭
                appid:'wxe83ff6a0b1fae2ef',                                     // 公众号APPID（根据平台信息获取）
                // 授权相关参数对象
                oauth:{
                    wechatOauthUrl:'https://px02331.wetalk.im/connect/oauth2/authorize2',               // 微信官方授权URL（有类似wetalk代理时，设置为代理的URL）
                    cceOauthUrl:'http://proxy.maybellinechina.com/sns/oauth2/shortcut/mbl/',            // CCE授权一级回调URL（根据平台信息获取）
                    redirect_uri:window.location.href,                          // 设置授权成功后的自定义回调URL，一般为当前页（可带参数）
                    redirect_uri_query:{},                                      // 对象会以参数形式追加到 redirect_uri上，设置后如果与URL中已有参数重复，会进行覆盖，并在授权成功后回传
                    validateQueryKey:'k',                                       // 重要！！！用于授权回调时与Cookie中的参数校验，确保非伪造回调，注意不要与其他参数名重复，重复会覆盖同名参数
                    scope:'snsapi_base',                                    // 微信授权参数，可在回调时传回，注意：state参数在urlencode之后不能超过128字节
                    state:'',
                    // 客户端存储配置，默认启用cookie存储，使用 jquery.cookie插件
                    storge:{
                        validateKey:'wechat_oauth_validate_mbl_member',                                // 用于存储的验证参数key（一般为cookie的key值）【建议以campaignkey结尾，防止同域名cookie覆盖！！！】
                        userDataKey:'wechat_oauth_user_mbl_member',                                    // 用于存储授权后用户信息的key（一般为cookie的key值）【建议以campaignkey结尾，防止同域名cookie覆盖！！！】
                        desKey:'ccegroup'
                    }
                },
                // JSSDK相关参数，执行jssdkConfig后会自动获取签名，并执行wx.config，之后的操作可在 wx.ready中执行，wx.error中捕获错误
                jssdk:{
                    signature:{
                        url:'http://wxproxy-maybelline.comeyes.com:8105/sns/sign/jssdk/mbl/',          // 获取签名信息的API（根据平台信息获取）
                        retryTime:3,                                                        // 获取签名失败后最大重试次数
                        autoConfig:true                                                    // 获取签名成功后，是否自动进行wx.config
                    },
                    // 需要使用的微信JSSDK API集合，参考：http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html#.E9.99.84.E5.BD.952-.E6.89.80.E6.9C.89JS.E6.8E.A5.E5.8F.A3.E5.88.97.E8.A1.A8
                    // 建议只设定需要的API，提高加载速度
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'closeWindow',
                        'addCard',
                        'chooseCard',
                        'openCard'
                    ]
                },
                // 卡券签名相关参数，执行cardSignature后可在success事件中获取卡券签名数据（可在调用时覆盖）
                card: {
                    signature: {
                        url: 'http://wxproxy-maybelline.comeyes.com:8105/sns/sign/card/mbl/',   // 获取签名信息的API（根据平台信息获取）
                        retryTime: 3                                                         // 获取签名失败后最大重试次数
                    }
                },
                share:{
                    desc:'美宝莲纽约会员俱乐部火热招募中!',
                    title:'美宝莲纽约',
                    link:'http://member.maybellinechina.com/member/',
                    imgUrl:'http://member.maybellinechina.com/common/images/reg_share.png',
                    type:'',
                    dataUrl:'',
                    success:function(){},
                    cancel:function(){}
                }
            };
            $.extend(true,wechatOptions,opts);
            return new $.cce.wechat(wechatOptions);
        },
        memberFlow:function(opts){
            var options = $.mbl_common.getOptions(opts);
            var wechat = $.mbl_common.getWechat(options.wechatOptions||{});
            $.mbl_common.WECHAT = wechat;
            this.load = function(){
                /*
                 主动调用oauth方法
                 未授权时，会自动跳转授权
                 回调后会自动存储，并返回对象 oauthObj = {openid:'',user:{},state:'',query:{}}，其中user对象在 snsapi_userinfo时返回 微信官方数据
                 oauthObj.state 为 state参数回传（对象形式）
                 oauthObj.query 为 redirect_uri 中的参数回传，对象形式返回
                 */
                var oauthObj = wechat.oauth();
                if(oauthObj){
                    $.mbl_common.OAUTHINFO = oauthObj;
                    $.cce.debug('Oauth Success','OauthObj',oauthObj,options.debug);
                    options.memberInfo.debug = options.debug;

                    // 注册获取会员完成后事件（JSSDKCONFIG）
                    var _complete = options.memberInfo.request.complete;
                    options.memberInfo.request.complete = function(){
                        wechat.jssdkConfig();

                        if(typeof _complete == 'function'){
                            _complete();
                        }
                    };

                    // 如果需要在非会员时自动领卡，则注册事件
                    if(options.autoGetCard == true){
                        var _nonMember = options.memberInfo.request.nonMember;
                        options.memberInfo.request.nonMember = function(){
                            // 如果需要在非会员时自动领卡，在 wx.ready中实现
                            if(wx && wx.ready){
                                wx.ready(function(){
                                    //addCard();
                                    $.mbl_common.addMemberCard(options.memberCard)
                                });
                            }

                            if(typeof _nonMember == 'function'){
                                _nonMember();
                            }
                        };
                    }

                    // 执行获取是否会员
                    $.mbl_common.requestMemberInfo(oauthObj.openid,options.memberInfo);

                }
                else{
                    $.cce.debug('Oauth Info Missed','OauthObj',oauthObj,true);
                    wechat.jssdkConfig();
                    return;
                }
            }

            //this.addCard = addCard;

        },
        getMemberInfo:function(){
            return $.extend(true,{},$.mbl_common.MEMBERINFO);
        },
        setMemberInfo:function(data){
            $.mbl_common.MEMBERINFO = data;
        },
        requestMemberInfo:function(openid,opts){
            var options = $.mbl_common.extendOptions('memberInfo',opts);
            var storge = new $.cce.storge(options.storge);
            var memberInfo = storge.getJSON(options.storge.key);

            //  从存储获取用户信息
            if(memberInfo && memberInfo.MembershipNumber && memberInfo.MembershipNumber.length>0 && options.refresh !=true){
                $.cce.debug('Get Member Info','Catch From Storge',options.debug);
                $.mbl_common.setMemberInfo(memberInfo);
                if(typeof options.request.isMember == 'function')
                    options.request.isMember(memberInfo,1);
                if(typeof options.request.complete == 'function')
                    options.request.complete();
                return;
            }

            $.cce.debug('Get Member Info','Begin Request',options.debug);

            $.cce.ajax({
                url:options.request.url,
                async:options.request.async,
                type:'get',
                dataType:'json',
                data:{openid:openid},
                beforeSend:options.request.beforeSend,
                success:function(data){
                    $.cce.debug('Get Member Info','Request Success',data,options.debug);
                    // 是会员
                    if(data.Code=='10000'){
                        $.cce.debug('Get Member Info','Response IsNumber',data,options.debug);
                        var memberData = $.extend({},data.Data);
                        memberData.MembershipNumber = $.mbl_common.memberValueDecrypt(memberData.MembershipNumber || '') || '';
                        memberData.InitBonus = $.mbl_common.memberValueDecrypt(memberData.InitBonus || '') || '';
                        memberData.UserName = unescape($.mbl_common.memberValueDecrypt(memberData.UserName || '') || '');
                        memberData.Birthday = $.mbl_common.memberValueDecrypt(memberData.Birthday || '') || '';
                        memberData.HeaderImageURL = $.mbl_common.memberValueDecrypt(memberData.HeaderImageURL || '') || $.mbl_common.OAUTHINFO.user.headimgurl || '';
                        memberData.Mobile = $.mbl_common.memberValueDecrypt(memberData.Mobile || '') || '';
                        memberData.openid = openid;

                        storge.setJSON(options.storge.key,memberData);
                        $.mbl_common.setMemberInfo(memberData);
                        if(typeof options.request.isMember == 'function')
                            options.request.isMember(memberData,0);
                    }
                    // 非会员
                    else if(data.Code=='10002'){
                        $.cce.debug('Get Member Info','Response NonNumber',data,options.debug);
                        storge.del(options.storge.key)
                        if(typeof options.request.nonMember == 'function'){
                            if(options.request.nonMember()==false)
                                return false;
                        }
                    }
                    else{
                        $.cce.debug('Get Member Info','Response Error',data,options.debug);
                        storge.del(options.storge.key);
                        if(typeof options.request.error == 'function')
                            options.request.error(data);
                    }
                },
                error:function(req,status,err){
                    $.cce.debug('Get Member Info','Request Error',req,options.debug);
                    storge.del(options.storge.key);
                    if(typeof options.request.error == 'function')
                        options.request.error(req,status,err);
                },
                complete:options.request.complete
            },{
                errRetryLimit:options.request.retryTime,
                errRetry:function(req,status,err,retryCount){
                    $.cce.debug('Get Member Info','Request Retry '+ retryCount.toString(),req,options.debug);
                }
            });
        },
        addMemberCard:function(opts){
            var options = $.mbl_common.extendOptions('memberCard',opts);

            // 注册签名成功事件，成功后设置微信卡券
            var _success = options.signature.success;
            options.signature.success = function(data){
                if(wx && wx.addCard){
                    $.cce.debug('Add Member Card','WX Add Card',options.debug);

                    if(options.callbackUrl && options.callbackUrl.length>0){
                        var storge = new $.cce.storge(options.storge);
                        storge.setString(options.storge.key,options.callbackUrl);
                    }

                    wx.addCard({
                        cardList: [
                            {
                                cardId: data.card_id,
                                cardExt: '{"code": "", "openid": "", "timestamp": "' + data.timestamp + '", "nonce_str": "' + data.nonceStr + '", "signature":"' + data.signature + '","outer_id":"' + options.cardOuterId + '"}'
                            }
                        ],
                        success: function(){
                            if(options.cardSuccessRefresh == true){
                                $.mbl_common.requestMemberInfo($.mbl_common.OAUTHINFO.openid,{
                                    refresh:true,                              // 为false时，会先从存储中获取，存储中存在则不request，为true时跳过存储，直接request
                                    request:{
                                        async:true,                           // 是否需要同步获取，默认为异步
                                        retryTime:3,                             // 获取签名失败后最大重试次数
                                        isMember:function(_data){
                                            if(typeof options.cardSuccess == 'function')
                                                options.cardSuccess(_data);
                                        },                          // 获取到是会员的情况 function(data,type){}，在存储完会员信息之后触发,type=0 表示从接口获取，1表示从缓存获取
                                        nonMember:function(){
                                            if(typeof options.cardSuccess == 'function')
                                                options.cardSuccess(null);
                                        },                         // 获取到非会员的情况，在自动申领卡的之前触发，function(){}，在函数内return false 可阻止自动申领
                                        error:function(){
                                            if(typeof options.cardSuccess == 'function')
                                                options.cardSuccess(null);
                                        },                             // 获取会员信息失败
                                        complete:function(){}         // 完成事件
                                    }
                                });
                            }
                            else{
                                if(typeof options.cardSuccess == 'function')
                                    options.cardSuccess();
                            }
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
            $.cce.cardSignature(options.cardId,options);
        },
        sendSMSCode:function(opts){
            var options = $.mbl_common.extendOptions('smsCode',opts)
            var dataStr = '';
            try{
                dataStr = JSON.stringify(options.request.data);
            }
            catch(e){
                $.cce.debug('Send SMS','Data Error',e,options.debug);
                if(typeof options.request.error == 'function')
                    options.request.error(e);
            }

            $.cce.debug('Send SMS','Begin Request',options,options.debug);
            $.cce.ajax({
                url:options.request.url,
                async:options.request.async,
                type:'post',
                dataType:'json',
                data:dataStr,
                beforeSend:options.request.beforeSend,
                success:function(data){
                    $.cce.debug('Send SMS','Request Success',data,options.debug);

                    if (data.Code && data.Code == '10000') {
                        $.cce.debug('Send SMS','Response Success',data,options.debug);

                        if(typeof options.request.success == 'function')
                            options.request.success(data.Data);
                    }
                    else {
                        $.cce.debug('Send SMS','Response Error',data,options.debug);
                        var errMsg = '';
                        switch(data.Code){
                            case "10001":
                                errMsg = "发生了点异常情况，返回下重新点击发送试试";    //执行失败
                                break;
                            case "10002":
                                errMsg = "今天发送的次数有点多，明天再试下吧";
                                break;
                            default:
                                errMsg = "激活的人似乎有点多，请稍后再试下";
                                break;
                        }
                        if(typeof options.request.error == 'function')
                            options.request.error(errMsg);
                    }
                },
                error:function(req,status,err){
                    $.cce.debug('Send SMS','Request Error',req,options.debug);
                    if(typeof options.request.error == 'function')
                        options.request.error(req,status,err);
                },
                complete:options.request.complete
            },{
                errRetryLimit:options.request.retryTime,
                errRetry:function(req,status,err,retryCount){
                    $.cce.debug('Send SMS','Request Retry '+ retryCount.toString(),req,options.debug);
                }
            });
        },
        activeMember:function(opts){
            var options = $.mbl_common.extendOptions('memberActive',opts);
            $.cce.debug('Active Member','Begin Request',options,options.debug);

            var callback = function(){
                if(options.request.successRedirect == true){
                    var storge = new $.cce.storge(options.storge);
                    var callbackUrl = storge.getString(options.storge.key);

                    if(callbackUrl && callbackUrl.length>0){
                        storge.del(options.storge.key);
                        window.location.href = callbackUrl;
                    }
                }
            }

            $.cce.ajax({
                url:options.request.url,
                async:options.request.async,
                type:'post',
                dataType:'json',
                data:JSON.stringify(options.request.data),
                beforeSend:options.request.beforeSend,
                success:function(data){
                    if (data.Code && data.Code == '10000') {
                        $.cce.debug('Active Member','Response Success',data,options.debug);

                        callback();

                        if(typeof options.request.success == 'function')
                            options.request.success(data.Data);
                    }
                    else {
                        $.cce.debug('Active Member','Response Error',data,options.debug);
                        var errMsg = '';
                        switch(data.Code){
                            case "10001":
                                errMsg = "发生了点异常情况，返回下重新点击激活试试";    //执行失败
                                break;
                            case "10002":
                                errMsg = "有信息填写错误哦";
                                break;
                            case "10003":
                                errMsg = "验证码不对哦";
                                break;
                            case "10004":
                                errMsg = "操作时间有点长，验证码已过期啦，重新获取下试试";                           // 验证码已过期
                                break;
                            case "10005":
                                errMsg = "您已经是会员啦，清理下微信缓存试试";                 //已经是会员不可反复开卡
                                break;
                            case "10006":
                                errMsg = "激活的人似乎有点多，请稍后再试下";       //激活失败,请稍后再试
                                break;
                            case "10007":
                                errMsg = "发生了点异常情况，返回下重新点击激活试试";    //未能找到CardCode
                                break;
                            case "10008":
                                errMsg = "激活的人似乎有点多，请稍后再试下";    //服务器繁忙
                                break;
                            case "014":
                                errMsg = "这个微信账号已绑定过啦";
                                break;
                            case "015":
                                errMsg = "手机号已经绑定过啦，换一个吧";
                                break;
                            default:
                                errMsg = "激活的人似乎有点多，请稍后再试下";
                                break;
                        }
                        if(typeof options.request.error == 'function')
                            options.request.error(errMsg);
                    }
                },
                error:function(req,status,err){
                    $.cce.debug('Active Member','Request Error',req,options.debug);
                    if(typeof options.request.error == 'function')
                        options.request.error(req,status,err);
                },
                complete:options.request.complete
            },{
                errRetryLimit:options.request.retryTime,
                errRetry:function(req,status,err,retryCount){
                    $.cce.debug('Active Member','Request Retry '+ retryCount.toString(),req,options.debug);
                }
            });

        },
        improveMember:function(opts){
            var options = $.mbl_common.extendOptions('improveMember',opts);
            $.cce.debug('Improve Member','Begin Request',options,options.debug);

            $.cce.ajax({
                url:options.request.url,
                async:options.request.async,
                type:'post',
                dataType:'json',
                data:JSON.stringify(options.request.data),
                beforeSend:options.request.beforeSend,
                success:function(data){
                    if (data.Code && data.Code == '10000') {
                        $.cce.debug('Improve Member','Response Success',data,options.debug);

                        if(typeof options.request.success == 'function')
                            options.request.success(data.Data);
                    }
                    else {
                        $.cce.debug('Active Member','Response Error',data,options.debug);
                        var errMsg = '';
                        switch(data.Code){
                            case "10001":
                                errMsg = "发生了点异常情况，返回下重新点击激活试试";    //系统执行失败
                                break;
                            case "10002":
                                errMsg = "有信息填写错误哦";                            //参数解析失败
                                break;
                            case "10003":
                                errMsg = "发生了点异常情况，返回下重新点击激活试试";    //执行失败
                                break;
                            case "10004":
                                errMsg = "有信息填写错误哦";                            //有信息填写错误哦
                                break;
                            default:
                                errMsg = "激活的人似乎有点多，请稍后再试下";
                                break;
                        }
                        if(typeof options.request.error == 'function')
                            options.request.error(errMsg);
                    }
                },
                error:function(req,status,err){
                    $.cce.debug('Improve Member','Request Error',req,options.debug);
                    if(typeof options.request.error == 'function')
                        options.request.error(req,status,err);
                },
                complete:options.request.complete
            },{
                errRetryLimit:options.request.retryTime,
                errRetry:function(req,status,err,retryCount){
                    $.cce.debug('Improve Member','Request Retry '+ retryCount.toString(),req,options.debug);
                }
            });

        },
        memberValueDecrypt:function(str) {
            var pwd = "123";
            if (str == null || str.length < 8) {
                return;
            }
            if (pwd == null || pwd.length <= 0) {
                return;
            }
            var prand = "";
            for (var i = 0; i < pwd.length; i++) {
                prand += pwd.charCodeAt(i).toString();
            }
            var sPos = Math.floor(prand.length / 5);
            var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
            var incr = Math.round(pwd.length / 2);
            var modu = Math.pow(2, 31) - 1;
            var salt = parseInt(str.substring(str.length - 8, str.length), 16);
            str = str.substring(0, str.length - 8);
            prand += salt;
            while (prand.length > 10) {
                prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
            }
            prand = (mult * prand + incr) % modu;
            var enc_chr = "";
            var enc_str = "";
            for (var i = 0; i < str.length; i += 2) {
                enc_chr = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255));
                enc_str += String.fromCharCode(enc_chr);
                prand = (mult * prand + incr) % modu;
            }
            return enc_str;
        },
        smsCountDown:function(opts){
            var millisecond = opts.duration*1000;
            var ts = new Date().getTime();

            opts.domEl.disalbeFunc = opts.disableFunc;
            opts.domEl.enableFunc = opts.enableFunc;

            opts.domEl.disalbeFunc();
            setTimeout(function startCount(){
                var _time = millisecond-new Date().getTime()+ts;
                var s = parseInt(_time / 1000 );
                if(s<=0){
                    opts.domEl.enableFunc();
                    opts.domEl.innerHTML= opts.enableTxt;
                    return false;
                }else{
                    opts.domEl.innerHTML = opts.durationTxt.replace('{%s%}',s);
                    setTimeout(startCount,1000);
                }
            },1000);
        }
    };
})(jQuery);


