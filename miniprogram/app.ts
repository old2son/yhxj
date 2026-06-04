// app.ts
App<IAppOption>({
    globalData: {},
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);

        // 登录
        wx.login({
            success(loginRes) {
                wx.request({
                    url: 'https://o2s.fun/yhwxApi/login',
                    method: 'POST',
                    data: {
                        code: loginRes.code,
                    },
                    success(res) {
                        // 发送 res.code 到后台换取 openId, sessionKey, unionId
                        console.log(res.data);

                    },
                });
            },
        });
    },
});
