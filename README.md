
# 微信组件说明
由于项目中使用到的微信授权，微信分享，卡券等业务较为频繁； 所以对这块业务做了一些封住装，已提高项目的开发效率，及公众号平台的统一管理<br/>
wechat.js主要封装了授权，分享，拉起卡券等方法；

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
## 卡券
  ```javascript
  if(wx && wx.addCard){
      wx.ready(function(){
          new $.cce.addCard(opts);
      })
  }
  ```
