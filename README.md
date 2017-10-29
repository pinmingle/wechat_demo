
# 微信组件说明
由于项目中使用到的微信网页授权，微信网页签名，微信卡券等业务较为频繁； 所以对这块业务做了一些封装，已提高项目的开发效率，及公众号平台的统一管理。
封装的类库有wechat.js和member.js。<br>
wechat.js 基于JQuery类库和微信网页开发工具包（微信JS-SDK）封装了授权，分享，拉起卡券等方法；
 * 提供微信网页授权，微信网页签名，微信卡券等功能
 * 依赖于JQuery类库，JQuery.cookie,crypto.js和JSSDK类库；
详见[微信JS-SDK说明文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)

member.js 基于JQuery类库，和CCE.Wehcat类库，封装了针对美宝莲微信会员卡的判定和领取操作
 * 提供 获取会员信息，非会员自动领卡，会员卡激活 等功能
 * 依赖于 cce.wechat 的授权和JSSDK类库；微信原生JSSDK类库

## wechat.js的配置参数说明

```javascript
 var opts = {
        debug:true,                                                    // Debug为true时，会开启CCE的Debug模式和
        appid:'wxe83ff6a0b1fae2ef',                                     // 公众号APPID（根据平台信息获取）
        oauth:{
            auto:true,                          // 是否自动授权，指 new $.cce.wechat({}); 之后即可执行，false时可 主动执行 oauth()方法
            wechatOauthUrl:'https://px02331.wetalk.im/connect/oauth2/authorize2',   // 微信官方授权URL（有类似wetalk代理时，设置为代理的URL）      
            cceOauthUrl:'http://proxy.maybellinechina.com/sns/oauth2/shortcut/mbl/', 
            // CCE授权一级回调URL（根据平台信息获取）
            redirect_uri:window.location.href,                                      // 设置授权成功后的自定义回调URL，一般为当前页（可带参数）            
            redirect_uri_query:{'source':'share'},                                                  // 对象会以参数形式追加到 redirect_uri上，设置后如果与URL中已有参数重复，会进行覆盖，并在授权成功后回传            
            validateQueryKey:'k',                                                   // 重要！！！用于授权回调时与Cookie中的参数校验，确保非伪造回调，注意不要与其他参数名重复，重复会覆盖同名参数          
            scope:'snsapi_userinfo',                                                    // snsapi_base/snsapi_userinfo，微信授权参数snsapi_base为静默授权只获取openid（推荐），snsapi_userinfo可获取用户信息          
            sharp:'wechat_redirect',                                                // 微信授权参数，遵循微信官方标准            
            beforeRedirect:null,                                                   // 授权跳转之前事件，回传即将跳转的URL，return false可终止跳转动作          
            callback:null                                                         // 授权回调之后事件 function(oauthObj)，授权回调后解析的对象 oauthObj = {openid:'',user:{},state:null/{}}           
        },       
        jssdk: {
            auto:true,
            signature: {
                url: "http://wxproxy-maybelline.comeyes.com:8105/sns/sign/jssdk/mbl/",
                retryTime: 3,
                autoConfig: true
            },
            jsApiList: [
                "checkJsApi",
                "onMenuShareTimeline",
                "onMenuShareAppMessage",
                "onMenuShareQQ",
                "closeWindow",
                "addCard",
                "chooseCard",
                "openCard"
            ]
        },
        share:{
            desc: '美宝莲预约服务',
            title: '美宝莲纽约',
            link: 'http://member.maybellinechina.com/appointment2017/index.html',
            imgUrl: 'http://member.maybellinechina.com/member_redemption_201609/img/icon.png',
            type: '',
            dataUrl: '',
            success: function () { },
            cancel: function () { }
        },
        card:{
            signature:{
                async:true,                            // 是否需要同步获取，默认为异步
                url:'http://wxproxy-maybelline.comeyes.com:8105/sns/sign/card/mbl/',                                 // 获取签名信息的API（根据平台信息获取）
                retryTime:3,                            // 获取签名失败后最大重试次数
                beforeSend:null,                       // 获取签名请求发送之前事件
                success:null,                          // 获取签名请求成功后事件function(data){}，返回签名成功对象（在wx.config前回调），autoConfig设置为false时，可通过此事件，自定义wx.config
                error:null,                             // 获取签名失败回调事件
                complete:null                           // 请求完成事件
            },
            cardId:'p5Ph1jp6Dnyjo1ViYBdMWDpULdXI',      // 领取卡券的ID
            cardOuterId:'',                             // 卡券签名时的outerId
            cardSuccessRefresh:false,					// 卡券领取成功后，是否刷新获取会员信息
            cardSuccess:null,                          // 卡券领取成功事件
            cardCancel:null,                           // 卡券取消领取事件
            cardError:null                             // 卡券设置错误

        }
    }
```

## 授权
  ### 自动授权
  ```javascript
  在oauth中的auto中配置为true;
  然后  var wechat = new $.cce.wechat(opts);
  在oauth中的callback方法中获取授权信息
  ```
  ### 手动授权
  ```javascript
  在oauth中的auto中配置为false(默认为false);
  然后  var wechat = new $.cce.wechat(opts);
            wechat.oauth();
  在oauth中的callback方法中获取授权信息;
  在wechat.oauth();中也会返回授权信息;
  ```
  
## jssdk签名
  ### 自动签名
  ```javascript
  在jssdk中的auto中配置为true;
  然后  var wechat = new $.cce.wechat(opts);
  ```
  ### 手动签名
  ```javascript
  在jssdk中的auto中配置为false;(默认为false);
  然后  var wechat = new $.cce.wechat(opts);
            wechat.jssdkConfig();
  ```
## 拉起卡券
  ```javascript
  if(wx && wx.addCard){
      wx.ready(function(){
          new $.cce.addCard(opts);
      })
  }
  ```
## member.js的配置参数说明
```javascript
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
        }
 ```
